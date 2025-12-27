import { create } from 'zustand';
import { API_URL } from '../config';

export type ClientTypeItemType = 'section' | 'form';

export interface ClientType {
  id: string;
  code: string;
  name: string;
  form_id: string | null;
  parent_id: string | null;
  item_type: ClientTypeItemType;
  caption: string | null;
  combine_forms?: boolean; // For sections - show all descendant forms as one scrollable form
  always_show?: boolean; // For forms - always show at top in combined mode
  created_at?: string;
  updated_at?: string;
}

interface ClientTypeChange {
  id: string;
  code: string;
  name: string;
  form_id: string | null;
  parent_id: string | null;
  item_type: ClientTypeItemType;
  caption: string | null;
  combine_forms?: boolean;
  always_show?: boolean;
}

interface ClientTypeState {
  clientTypes: ClientType[];
  currentClientTypeId: string | null;
  previewMode: boolean;
  listMode: boolean;
  selectedClientId: string | null;

  // Track local changes
  clientTypesToCreate: Map<string, ClientTypeChange>;
  clientTypesToUpdate: Map<string, ClientTypeChange>;
  clientTypesToDelete: Set<string>;
  originalClientTypes: Map<string, ClientType>;

  // Actions
  loadClientTypes: () => Promise<void>;
  selectClientType: (id: string | null) => void;
  addClientType: (parentId: string | null, itemType: ClientTypeItemType) => void;
  updateClientType: (id: string, updates: Partial<ClientType>) => void;
  deleteClientType: (id: string) => void;
  saveAllChanges: () => Promise<void>;
  hasChanges: () => boolean;
  clearClientType: () => void;
  setPreviewMode: (preview: boolean) => void;
  setListMode: (list: boolean) => void;
  setSelectedClientId: (clientId: string | null) => void;
}

export const useClientTypeStore = create<ClientTypeState>((set, get) => ({
  clientTypes: [],
  currentClientTypeId: null,
  previewMode: false,
  listMode: false,
  selectedClientId: null,

  clientTypesToCreate: new Map(),
  clientTypesToUpdate: new Map(),
  clientTypesToDelete: new Set(),
  originalClientTypes: new Map(),

  loadClientTypes: async () => {
    try {
      const response = await fetch(`${API_URL}/api/client-types`);
      if (!response.ok) throw new Error('Failed to load client types');
      const data = await response.json();

      set({
        clientTypes: data,
        originalClientTypes: new Map(data.map((ct: ClientType) => [ct.id, { ...ct }])),
      });
    } catch (error) {
      console.error('Failed to load client types:', error);
    }
  },

  selectClientType: (id) => set({ currentClientTypeId: id }),

  addClientType: (parentId, itemType) => {
    const newId = `temp_${Date.now()}_${Math.random()}`;
    const isForm = itemType === 'form';
    const isTopLevel = parentId === null;
    const newClientType: ClientTypeChange = {
      id: newId,
      code: isForm ? 'new_form' : (isTopLevel ? 'new_client_type' : 'new_section'),
      name: isForm ? 'New Form' : (isTopLevel ? 'New Client Type' : 'New Section'),
      form_id: null,
      parent_id: parentId,
      item_type: itemType,
      caption: null,
      combine_forms: false,
      always_show: false,
    };

    set((state) => ({
      clientTypes: [
        ...state.clientTypes,
        { ...newClientType, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ],
      clientTypesToCreate: new Map(state.clientTypesToCreate).set(newId, newClientType),
      currentClientTypeId: newId,
    }));
  },

  updateClientType: (id, updates) => {
    set((state) => {
      const updatedClientTypes = state.clientTypes.map((ct) =>
        ct.id === id ? { ...ct, ...updates } : ct
      );

      const clientTypesToUpdate = new Map(state.clientTypesToUpdate);
      const clientTypesToCreate = new Map(state.clientTypesToCreate);

      // If it's a new client type (being created), update in create map
      if (clientTypesToCreate.has(id)) {
        const existing = clientTypesToCreate.get(id)!;
        clientTypesToCreate.set(id, { ...existing, ...updates });
      } else {
        // Otherwise, track as update
        const current = updatedClientTypes.find((ct) => ct.id === id);
        if (current) {
          clientTypesToUpdate.set(id, {
            id: current.id,
            code: current.code,
            name: current.name,
            form_id: current.form_id,
            parent_id: current.parent_id,
            item_type: current.item_type,
            caption: current.caption,
            combine_forms: current.combine_forms,
            always_show: current.always_show,
          });
        }
      }

      return {
        clientTypes: updatedClientTypes,
        clientTypesToCreate,
        clientTypesToUpdate,
      };
    });
  },

  deleteClientType: (id) => {
    console.log('deleteClientType called with id:', id);
    set((state) => {
      const clientTypesToDelete = new Set(state.clientTypesToDelete);
      const clientTypesToCreate = new Map(state.clientTypesToCreate);
      const clientTypesToUpdate = new Map(state.clientTypesToUpdate);

      // Collect all descendant IDs
      const collectDescendants = (parentId: string): string[] => {
        const children = state.clientTypes.filter(ct => ct.parent_id === parentId);
        const descendants: string[] = [];
        children.forEach(child => {
          descendants.push(child.id);
          descendants.push(...collectDescendants(child.id));
        });
        return descendants;
      };

      const idsToDelete = [id, ...collectDescendants(id)];
      console.log('IDs to delete:', idsToDelete);

      // Process each ID for deletion
      idsToDelete.forEach(deleteId => {
        if (clientTypesToCreate.has(deleteId)) {
          // If it's a new client type, just remove from create map
          console.log('Removing from create map:', deleteId);
          clientTypesToCreate.delete(deleteId);
        } else {
          // Otherwise, mark for deletion
          console.log('Adding to delete set:', deleteId);
          clientTypesToDelete.add(deleteId);
          clientTypesToUpdate.delete(deleteId);
        }
      });

      console.log('clientTypesToDelete after:', Array.from(clientTypesToDelete));

      const updatedClientTypes = state.clientTypes.filter((ct) => !idsToDelete.includes(ct.id));

      return {
        clientTypes: updatedClientTypes,
        clientTypesToCreate,
        clientTypesToUpdate,
        clientTypesToDelete,
        currentClientTypeId: idsToDelete.includes(state.currentClientTypeId || '') ? null : state.currentClientTypeId,
      };
    });
  },

  saveAllChanges: async () => {
    const state = get();

    console.log('Saving changes:', {
      toDelete: Array.from(state.clientTypesToDelete),
      toCreate: Array.from(state.clientTypesToCreate.keys()),
      toUpdate: Array.from(state.clientTypesToUpdate.keys()),
    });

    try {
      // Delete client types - must delete children before parents
      // Sort by depth (deepest first) using originalClientTypes to determine parent relationships
      const idsToDelete = Array.from(state.clientTypesToDelete);
      const getDepth = (id: string, visited = new Set<string>()): number => {
        if (visited.has(id)) return 0;
        visited.add(id);
        const ct = state.originalClientTypes.get(id);
        if (!ct || !ct.parent_id) return 0;
        return 1 + getDepth(ct.parent_id, visited);
      };
      // Sort by depth descending (deepest first)
      idsToDelete.sort((a, b) => getDepth(b) - getDepth(a));

      console.log('Deleting IDs (sorted):', idsToDelete);
      for (const id of idsToDelete) {
        console.log('Deleting:', id);
        const response = await fetch(`${API_URL}/api/client-types/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          console.error(`Failed to delete client type ${id}:`, response.status, await response.text());
        } else {
          console.log('Deleted successfully:', id);
        }
      }

      // Create new client types
      const createdIdMap = new Map<string, string>(); // temp id -> real id
      for (const [tempId, clientType] of state.clientTypesToCreate) {
        const response = await fetch(`${API_URL}/api/client-types`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: clientType.code,
            name: clientType.name,
            form_id: clientType.form_id,
            parent_id: clientType.parent_id && createdIdMap.has(clientType.parent_id)
              ? createdIdMap.get(clientType.parent_id)
              : clientType.parent_id,
            item_type: clientType.item_type,
            caption: clientType.caption,
            combine_forms: clientType.combine_forms,
            always_show: clientType.always_show,
          }),
        });

        if (response.ok) {
          const created = await response.json();
          createdIdMap.set(tempId, created.id);
        }
      }

      // Update existing client types
      for (const [id, clientType] of state.clientTypesToUpdate) {
        await fetch(`${API_URL}/api/client-types/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: clientType.code,
            name: clientType.name,
            form_id: clientType.form_id,
            parent_id: clientType.parent_id,
            item_type: clientType.item_type,
            caption: clientType.caption,
            combine_forms: clientType.combine_forms,
            always_show: clientType.always_show,
          }),
        });
      }

      // Clear changes and reload
      set({
        clientTypesToCreate: new Map(),
        clientTypesToUpdate: new Map(),
        clientTypesToDelete: new Set(),
      });

      await get().loadClientTypes();
    } catch (error) {
      console.error('Failed to save client types:', error);
      throw error;
    }
  },

  hasChanges: () => {
    const state = get();
    return (
      state.clientTypesToCreate.size > 0 ||
      state.clientTypesToUpdate.size > 0 ||
      state.clientTypesToDelete.size > 0
    );
  },

  clearClientType: () =>
    set({
      currentClientTypeId: null,
      previewMode: false,
      listMode: false,
      selectedClientId: null,
    }),

  setPreviewMode: (preview) => set({ previewMode: preview, listMode: false, selectedClientId: null }),

  setListMode: (list) => set({ listMode: list, previewMode: false, selectedClientId: null }),

  setSelectedClientId: (clientId) => set({ selectedClientId: clientId }),
}));
