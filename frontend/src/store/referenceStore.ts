import { create } from 'zustand';
import { transliterate } from '../utils/transliterate';
import { API_URL } from '../config';

export interface ReferenceField {
  id: string;
  reference_id: string;
  code: string;
  name: string;
  ref_reference_id: string | null;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ReferenceData {
  id: string;
  reference_id: string;
  parent_id: string | null;
  data: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface Reference {
  id: string;
  code: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
  is_hierarchical: boolean;
  data_by_script: boolean;
  calculation_code?: string;
  fields?: ReferenceField[];
  dataRows?: ReferenceData[];
  created_at?: string;
  updated_at?: string;
}

interface ReferenceChange {
  id: string;
  code: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
  is_hierarchical: boolean;
  data_by_script: boolean;
  calculation_code?: string;
}

interface FieldChange {
  id: string;
  reference_id: string;
  code: string;
  name: string;
  ref_reference_id: string | null;
  sort_order: number;
}

interface DataChange {
  id: string;
  reference_id: string;
  parent_id: string | null;
  data: Record<string, any>;
}

interface ReferenceState {
  references: Reference[];
  selectedReferenceId: string | null;

  // Track local changes for references
  referencesToCreate: Map<string, ReferenceChange>;
  referencesToUpdate: Map<string, ReferenceChange>;
  referencesToDelete: Set<string>;
  originalReferences: Map<string, Reference>;

  // Track local changes for fields
  fieldsToCreate: Map<string, FieldChange>;
  fieldsToUpdate: Map<string, FieldChange>;
  fieldsToDelete: Map<string, string>; // fieldId -> referenceId

  // Track local changes for data
  dataToCreate: Map<string, DataChange>;
  dataToUpdate: Map<string, DataChange>;
  dataToDelete: Map<string, string>; // dataId -> referenceId

  // Actions
  loadReferences: () => Promise<void>;
  loadReferenceFields: (referenceId: string) => Promise<void>;
  loadReferenceData: (referenceId: string) => Promise<void>;
  selectReference: (id: string | null) => void;
  addReference: (parentId: string | null) => void;
  updateReference: (id: string, updates: Partial<Reference>) => void;
  deleteReference: (id: string) => void;
  addField: (referenceId: string) => void;
  updateField: (referenceId: string, fieldId: string, updates: Partial<ReferenceField>) => void;
  deleteField: (referenceId: string, fieldId: string) => void;
  addDataRow: (referenceId: string, parentId?: string | null) => void;
  updateDataRow: (referenceId: string, dataId: string, data: Record<string, any>) => void;
  deleteDataRow: (referenceId: string, dataId: string) => void;
  saveAllChanges: () => Promise<void>;
  hasChanges: () => boolean;
}

export const useReferenceStore = create<ReferenceState>((set, get) => ({
  references: [],
  selectedReferenceId: null,
  referencesToCreate: new Map(),
  referencesToUpdate: new Map(),
  referencesToDelete: new Set(),
  originalReferences: new Map(),
  fieldsToCreate: new Map(),
  fieldsToUpdate: new Map(),
  fieldsToDelete: new Map(),
  dataToCreate: new Map(),
  dataToUpdate: new Map(),
  dataToDelete: new Map(),

  loadReferences: async () => {
    try {
      const response = await fetch(`${API_URL}/api/references`);
      if (!response.ok) throw new Error('Failed to load references');
      const data = await response.json();

      // Store original references for comparison
      const originalMap = new Map<string, Reference>();
      data.forEach((ref: Reference) => {
        originalMap.set(ref.id, { ...ref });
      });

      set({
        references: data,
        originalReferences: originalMap,
        referencesToCreate: new Map(),
        referencesToUpdate: new Map(),
        referencesToDelete: new Set(),
      });
    } catch (error) {
      console.error('Failed to load references:', error);
    }
  },

  loadReferenceFields: async (referenceId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/references/${referenceId}/fields`);
      if (!response.ok) throw new Error('Failed to load reference fields');
      const fields = await response.json();

      set((state) => ({
        references: state.references.map((ref) =>
          ref.id === referenceId ? { ...ref, fields } : ref
        ),
      }));
    } catch (error) {
      console.error('Failed to load reference fields:', error);
    }
  },

  loadReferenceData: async (referenceId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/references/${referenceId}/data`);
      if (!response.ok) throw new Error('Failed to load reference data');
      const dataRows = await response.json();

      set((state) => ({
        references: state.references.map((ref) =>
          ref.id === referenceId ? { ...ref, dataRows } : ref
        ),
      }));
    } catch (error) {
      console.error('Failed to load reference data:', error);
    }
  },

  selectReference: (id) => {
    set({ selectedReferenceId: id });
    // Load fields and data when selecting a reference (if not already loaded and not a new reference)
    if (id && !get().referencesToCreate.has(id)) {
      const ref = get().references.find((r) => r.id === id);
      if (ref) {
        if (!ref.fields) {
          get().loadReferenceFields(id);
        }
        if (!ref.dataRows) {
          get().loadReferenceData(id);
        }
      }
    }
  },

  addReference: (parentId) => {
    const newId = `temp-${Date.now()}`;
    const newReference: Reference = {
      id: newId,
      code: '',
      name: 'New Reference',
      parent_id: parentId,
      sort_order: get().references.length,
      is_hierarchical: false,
      data_by_script: false,
      calculation_code: '',
      fields: [],
    };

    const change: ReferenceChange = {
      id: newId,
      code: newReference.code,
      name: newReference.name,
      parent_id: newReference.parent_id,
      sort_order: newReference.sort_order,
      is_hierarchical: newReference.is_hierarchical,
      data_by_script: newReference.data_by_script,
      calculation_code: newReference.calculation_code,
    };

    set((state) => ({
      references: [...state.references, newReference],
      referencesToCreate: new Map(state.referencesToCreate).set(newId, change),
      selectedReferenceId: newId,
    }));
  },

  updateReference: (id, updates) => {
    set((state) => {
      // Auto-generate code from name for new references
      const isNew = state.referencesToCreate.has(id);
      const finalUpdates = { ...updates };
      if (isNew && updates.name !== undefined && !updates.code) {
        finalUpdates.code = transliterate(updates.name);
      }

      const updatedReferences = state.references.map((ref) =>
        ref.id === id ? { ...ref, ...finalUpdates } : ref
      );

      const updatedRef = updatedReferences.find((r) => r.id === id);
      if (!updatedRef) return state;

      const change: ReferenceChange = {
        id: updatedRef.id,
        code: updatedRef.code,
        name: updatedRef.name,
        parent_id: updatedRef.parent_id,
        sort_order: updatedRef.sort_order,
        is_hierarchical: updatedRef.is_hierarchical,
        data_by_script: updatedRef.data_by_script,
        calculation_code: updatedRef.calculation_code,
      };

      const newToUpdate = new Map(state.referencesToUpdate);

      // If it's a new reference (being created), update in create map instead
      if (state.referencesToCreate.has(id)) {
        const newToCreate = new Map(state.referencesToCreate);
        newToCreate.set(id, change);
        return {
          references: updatedReferences,
          referencesToCreate: newToCreate,
        };
      }

      // Otherwise track as update
      newToUpdate.set(id, change);

      return {
        references: updatedReferences,
        referencesToUpdate: newToUpdate,
      };
    });
  },

  deleteReference: (id) => {
    set((state) => {
      const newToDelete = new Set(state.referencesToDelete);

      // If it's a new reference (not yet saved), just remove from create map
      if (state.referencesToCreate.has(id)) {
        const newToCreate = new Map(state.referencesToCreate);
        newToCreate.delete(id);
        return {
          references: state.references.filter((r) => r.id !== id),
          referencesToCreate: newToCreate,
          selectedReferenceId: state.selectedReferenceId === id ? null : state.selectedReferenceId,
        };
      }

      // Otherwise mark for deletion
      newToDelete.add(id);
      const newToUpdate = new Map(state.referencesToUpdate);
      newToUpdate.delete(id); // Remove from updates if it was there

      return {
        references: state.references.filter((r) => r.id !== id),
        referencesToDelete: newToDelete,
        referencesToUpdate: newToUpdate,
        selectedReferenceId: state.selectedReferenceId === id ? null : state.selectedReferenceId,
      };
    });
  },

  addField: (referenceId) => {
    const newId = `temp-field-${Date.now()}`;
    const ref = get().references.find((r) => r.id === referenceId);
    if (!ref) return;

    const newField: ReferenceField = {
      id: newId,
      reference_id: referenceId,
      code: '',
      name: 'New Field',
      ref_reference_id: null,
      sort_order: (ref.fields || []).length,
    };

    const change: FieldChange = {
      id: newId,
      reference_id: referenceId,
      code: newField.code,
      name: newField.name,
      ref_reference_id: newField.ref_reference_id,
      sort_order: newField.sort_order,
    };

    set((state) => ({
      references: state.references.map((r) =>
        r.id === referenceId
          ? { ...r, fields: [...(r.fields || []), newField] }
          : r
      ),
      fieldsToCreate: new Map(state.fieldsToCreate).set(newId, change),
    }));
  },

  updateField: (referenceId, fieldId, updates) => {
    set((state) => {
      // Auto-generate code from name for new fields
      const isNew = state.fieldsToCreate.has(fieldId);
      const finalUpdates = { ...updates };
      if (isNew && updates.name !== undefined && !updates.code) {
        finalUpdates.code = transliterate(updates.name);
      }

      const updatedReferences = state.references.map((ref) => {
        if (ref.id !== referenceId) return ref;
        return {
          ...ref,
          fields: (ref.fields || []).map((f) =>
            f.id === fieldId ? { ...f, ...finalUpdates } : f
          ),
        };
      });

      const ref = updatedReferences.find((r) => r.id === referenceId);
      const updatedField = ref?.fields?.find((f) => f.id === fieldId);
      if (!updatedField) return state;

      const change: FieldChange = {
        id: updatedField.id,
        reference_id: updatedField.reference_id,
        code: updatedField.code,
        name: updatedField.name,
        ref_reference_id: updatedField.ref_reference_id,
        sort_order: updatedField.sort_order,
      };

      const newToUpdate = new Map(state.fieldsToUpdate);

      // If it's a new field (being created), update in create map instead
      if (state.fieldsToCreate.has(fieldId)) {
        const newToCreate = new Map(state.fieldsToCreate);
        newToCreate.set(fieldId, change);
        return {
          references: updatedReferences,
          fieldsToCreate: newToCreate,
        };
      }

      // Otherwise track as update
      newToUpdate.set(fieldId, change);

      return {
        references: updatedReferences,
        fieldsToUpdate: newToUpdate,
      };
    });
  },

  deleteField: (referenceId, fieldId) => {
    set((state) => {
      const newToDelete = new Map(state.fieldsToDelete);

      // If it's a new field (not yet saved), just remove from create map
      if (state.fieldsToCreate.has(fieldId)) {
        const newToCreate = new Map(state.fieldsToCreate);
        newToCreate.delete(fieldId);
        return {
          references: state.references.map((r) =>
            r.id === referenceId
              ? { ...r, fields: (r.fields || []).filter((f) => f.id !== fieldId) }
              : r
          ),
          fieldsToCreate: newToCreate,
        };
      }

      // Otherwise mark for deletion with referenceId
      newToDelete.set(fieldId, referenceId);
      const newToUpdate = new Map(state.fieldsToUpdate);
      newToUpdate.delete(fieldId);

      return {
        references: state.references.map((r) =>
          r.id === referenceId
            ? { ...r, fields: (r.fields || []).filter((f) => f.id !== fieldId) }
            : r
        ),
        fieldsToDelete: newToDelete,
        fieldsToUpdate: newToUpdate,
      };
    });
  },

  addDataRow: (referenceId, parentId = null) => {
    const newId = `temp-data-${Date.now()}`;
    const ref = get().references.find((r) => r.id === referenceId);
    if (!ref) return;

    const newData: ReferenceData = {
      id: newId,
      reference_id: referenceId,
      parent_id: parentId,
      data: {},
    };

    const change: DataChange = {
      id: newId,
      reference_id: referenceId,
      parent_id: parentId,
      data: {},
    };

    set((state) => ({
      references: state.references.map((r) =>
        r.id === referenceId
          ? { ...r, dataRows: [...(r.dataRows || []), newData] }
          : r
      ),
      dataToCreate: new Map(state.dataToCreate).set(newId, change),
    }));
  },

  updateDataRow: (referenceId, dataId, data) => {
    set((state) => {
      const updatedReferences = state.references.map((ref) => {
        if (ref.id !== referenceId) return ref;
        return {
          ...ref,
          dataRows: (ref.dataRows || []).map((d) =>
            d.id === dataId ? { ...d, data } : d
          ),
        };
      });

      const ref = updatedReferences.find((r) => r.id === referenceId);
      const updatedData = ref?.dataRows?.find((d) => d.id === dataId);
      if (!updatedData) return state;

      const change: DataChange = {
        id: updatedData.id,
        reference_id: updatedData.reference_id,
        parent_id: updatedData.parent_id,
        data: updatedData.data,
      };

      const newToUpdate = new Map(state.dataToUpdate);

      // If it's a new data row (being created), update in create map instead
      if (state.dataToCreate.has(dataId)) {
        const newToCreate = new Map(state.dataToCreate);
        newToCreate.set(dataId, change);
        return {
          references: updatedReferences,
          dataToCreate: newToCreate,
        };
      }

      // Otherwise track as update
      newToUpdate.set(dataId, change);

      return {
        references: updatedReferences,
        dataToUpdate: newToUpdate,
      };
    });
  },

  deleteDataRow: (referenceId, dataId) => {
    set((state) => {
      const newToDelete = new Map(state.dataToDelete);

      // If it's a new data row (not yet saved), just remove from create map
      if (state.dataToCreate.has(dataId)) {
        const newToCreate = new Map(state.dataToCreate);
        newToCreate.delete(dataId);
        return {
          references: state.references.map((r) =>
            r.id === referenceId
              ? { ...r, dataRows: (r.dataRows || []).filter((d) => d.id !== dataId) }
              : r
          ),
          dataToCreate: newToCreate,
        };
      }

      // Otherwise mark for deletion with referenceId
      newToDelete.set(dataId, referenceId);
      const newToUpdate = new Map(state.dataToUpdate);
      newToUpdate.delete(dataId);

      return {
        references: state.references.map((r) =>
          r.id === referenceId
            ? { ...r, dataRows: (r.dataRows || []).filter((d) => d.id !== dataId) }
            : r
        ),
        dataToDelete: newToDelete,
        dataToUpdate: newToUpdate,
      };
    });
  },

  saveAllChanges: async () => {
    const state = get();

    try {
      // Create new references
      for (const [tempId, change] of state.referencesToCreate.entries()) {
        const response = await fetch(`${API_URL}/api/references`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change),
        });
        if (!response.ok) throw new Error('Failed to create reference');
      }

      // Update existing references
      for (const [id, change] of state.referencesToUpdate.entries()) {
        const response = await fetch(`${API_URL}/api/references/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change),
        });
        if (!response.ok) throw new Error('Failed to update reference');
      }

      // Delete references
      for (const id of state.referencesToDelete) {
        const response = await fetch(`${API_URL}/api/references/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete reference');
      }

      // Create new fields
      for (const [tempId, change] of state.fieldsToCreate.entries()) {
        const response = await fetch(`${API_URL}/api/references/${change.reference_id}/fields`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change),
        });
        if (!response.ok) throw new Error('Failed to create field');
      }

      // Update existing fields
      for (const [id, change] of state.fieldsToUpdate.entries()) {
        const response = await fetch(`${API_URL}/api/references/${change.reference_id}/fields/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change),
        });
        if (!response.ok) throw new Error('Failed to update field');
      }

      // Delete fields
      for (const [fieldId, referenceId] of state.fieldsToDelete) {
        const response = await fetch(`${API_URL}/api/references/${referenceId}/fields/${fieldId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete field');
      }

      // Create new data rows
      for (const [tempId, change] of state.dataToCreate.entries()) {
        const response = await fetch(`${API_URL}/api/references/${change.reference_id}/data`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change),
        });
        if (!response.ok) throw new Error('Failed to create data row');
      }

      // Update existing data rows
      for (const [id, change] of state.dataToUpdate.entries()) {
        const response = await fetch(`${API_URL}/api/references/${change.reference_id}/data/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change),
        });
        if (!response.ok) throw new Error('Failed to update data row');
      }

      // Delete data rows
      for (const [dataId, referenceId] of state.dataToDelete) {
        const response = await fetch(`${API_URL}/api/references/${referenceId}/data/${dataId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete data row');
      }

      // Reload from server to get fresh data
      const currentSelectedId = get().selectedReferenceId;
      await get().loadReferences();

      // Reload fields and data for currently selected reference
      if (currentSelectedId) {
        await get().loadReferenceFields(currentSelectedId);
        await get().loadReferenceData(currentSelectedId);
        // Re-select to maintain selection
        set({ selectedReferenceId: currentSelectedId });
      }

      // Clear all change tracking
      set({
        fieldsToCreate: new Map(),
        fieldsToUpdate: new Map(),
        fieldsToDelete: new Map(),
        dataToCreate: new Map(),
        dataToUpdate: new Map(),
        dataToDelete: new Map(),
      });
    } catch (error) {
      console.error('Failed to save changes:', error);
      throw error;
    }
  },

  hasChanges: () => {
    const state = get();
    return (
      state.referencesToCreate.size > 0 ||
      state.referencesToUpdate.size > 0 ||
      state.referencesToDelete.size > 0 ||
      state.fieldsToCreate.size > 0 ||
      state.fieldsToUpdate.size > 0 ||
      state.fieldsToDelete.size > 0 ||
      state.dataToCreate.size > 0 ||
      state.dataToUpdate.size > 0 ||
      state.dataToDelete.size > 0
    );
  },
}));
