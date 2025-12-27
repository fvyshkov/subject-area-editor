import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { FormComponent, FormSchema, ComponentType, TabItem } from '../types';

export type ViewMode = 'edit' | 'preview' | 'tree';

interface FormState {
  schema: FormSchema;
  currentFormId: string | null;
  selectedComponentId: string | null;
  isDragging: boolean;
  previewMode: boolean;
  viewMode: ViewMode;
  savedSchema: FormSchema | null;
  hasUnsavedChanges: boolean;
  formsVersion: number; // Incremented when forms list needs refresh

  // Actions
  setSchema: (schema: FormSchema, formId?: string | null) => void;
  triggerFormsRefresh: () => void;
  markAsSaved: () => void;
  addComponent: (type: ComponentType, index?: number) => void;
  addComponentToParent: (type: ComponentType, parentId: string) => void;
  addComponentToTab: (type: ComponentType, parentId: string, tabId: string) => void;
  updateComponent: (id: string, updates: Partial<FormComponent>) => void;
  removeComponent: (id: string) => void;
  moveComponent: (activeId: string, overId: string) => void;
  moveComponentInTree: (componentId: string, targetParentId: string | null, targetIndex?: number) => void;
  selectComponent: (id: string | null) => void;
  setDragging: (isDragging: boolean) => void;
  setPreviewMode: (previewMode: boolean) => void;
  setViewMode: (viewMode: ViewMode) => void;
  duplicateComponent: (id: string) => void;
  clearForm: () => void;
  exportSchema: () => string;
  importSchema: (json: string) => boolean;
  // Smart drop actions
  wrapInRow: (targetId: string, newComponentType: ComponentType, position: 'left' | 'right') => void;
  addSibling: (targetId: string, newComponentType: ComponentType, position: 'before' | 'after') => void;
}

const defaultSchema: FormSchema = {
  code: '',
  name: 'New Form',
  description: '',
  components: [],
  settings: {
    theme: 'light',
  },
};

const getDefaultProps = (type: ComponentType): FormComponent['props'] => {
  const baseProps: FormComponent['props'] = {
    label: '',
    placeholder: '',
    required: false,
    disabled: false,
  };

  switch (type) {
    case 'input':
      return { ...baseProps, label: 'Text Input', placeholder: 'Enter text...' };
    case 'textarea':
      return { ...baseProps, label: 'Text Area', placeholder: 'Enter long text...' };
    case 'select':
      return { ...baseProps, label: 'Select', options: [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }] };
    case 'checkbox':
      return { ...baseProps, label: 'Checkbox', text: 'Check this option' };
    case 'radio':
      return { ...baseProps, label: 'Radio Group', options: [{ label: 'Option A', value: 'a' }, { label: 'Option B', value: 'b' }] };
    case 'date':
      return { ...baseProps, label: 'Date Picker' };
    case 'number':
      return { ...baseProps, label: 'Number Input', placeholder: 'Enter number...' };
    case 'email':
      return { ...baseProps, label: 'Email', placeholder: 'Enter email...' };
    case 'password':
      return { ...baseProps, label: 'Password', placeholder: 'Enter password...' };
    case 'file':
      return { ...baseProps, label: 'File Upload' };
    case 'computed':
      return { ...baseProps, label: 'Computed Field', computeScript: '// get_field_by_name("field_name")\nreturn ""' };
    case 'button':
      return { buttonText: 'Submit', buttonType: 'submit' };
    case 'heading':
      return { text: 'Heading', headingLevel: 2 };
    case 'paragraph':
      return { text: 'This is a paragraph of text.' };
    case 'divider':
      return {};
    case 'container':
      return { direction: 'column', gap: 16 };
    case 'row':
      return { columns: 2, gap: 12 };
    case 'grid':
      return {
        label: 'Data Grid',
        gridColumns: [
          { id: 'col1', label: 'Column 1', type: 'text' },
          { id: 'col2', label: 'Column 2', type: 'text' },
        ],
        minRows: 0,
        maxRows: 10,
      };
    case 'tabs':
      return {
        tabs: [
          { id: uuidv4(), label: 'Tab 1', children: [] },
          { id: uuidv4(), label: 'Tab 2', children: [] },
        ],
      };
    default:
      return baseProps;
  }
};

export const useFormStore = create<FormState>((set, get) => ({
  schema: defaultSchema,
  currentFormId: null,
  selectedComponentId: null,
  isDragging: false,
  previewMode: false,
  viewMode: 'edit',
  savedSchema: null,
  hasUnsavedChanges: false,
  formsVersion: 0,

  triggerFormsRefresh: () => set((state) => ({ formsVersion: state.formsVersion + 1 })),

  setSchema: (schema, formId) => set({
    schema,
    currentFormId: formId !== undefined ? formId : get().currentFormId,
    savedSchema: JSON.parse(JSON.stringify(schema)),
    hasUnsavedChanges: false
  }),

  markAsSaved: () => set({
    savedSchema: JSON.parse(JSON.stringify(get().schema)),
    hasUnsavedChanges: false
  }),

  addComponent: (type, index) => {
    const newComponent: FormComponent = {
      id: uuidv4(),
      type,
      props: getDefaultProps(type),
      validation: [],
      children: (type === 'container' || type === 'row' || type === 'tabs') ? [] : undefined,
    };

    set((state) => {
      const components = [...state.schema.components];
      if (index !== undefined) {
        components.splice(index, 0, newComponent);
      } else {
        components.push(newComponent);
      }
      const newSchema = { ...state.schema, components };
      return {
        schema: newSchema,
        selectedComponentId: newComponent.id,
        hasUnsavedChanges: JSON.stringify(newSchema) !== JSON.stringify(state.savedSchema),
      };
    });
  },

  addComponentToParent: (type, parentId) => {
    const newComponent: FormComponent = {
      id: uuidv4(),
      type,
      props: getDefaultProps(type),
      validation: [],
      children: (type === 'container' || type === 'row' || type === 'tabs') ? [] : undefined,
    };

    set((state) => {
      const addToParent = (components: FormComponent[]): FormComponent[] => {
        return components.map((comp) => {
          if (comp.id === parentId) {
            return {
              ...comp,
              children: [...(comp.children || []), newComponent],
            };
          }
          if (comp.children) {
            return { ...comp, children: addToParent(comp.children) };
          }
          return comp;
        });
      };

      const newSchema = {
        ...state.schema,
        components: addToParent(state.schema.components),
      };

      return {
        schema: newSchema,
        selectedComponentId: newComponent.id,
        hasUnsavedChanges: JSON.stringify(newSchema) !== JSON.stringify(state.savedSchema),
      };
    });
  },

  addComponentToTab: (type, parentId, tabId) => {
    const newComponent: FormComponent = {
      id: uuidv4(),
      type,
      props: getDefaultProps(type),
      validation: [],
      children: (type === 'container' || type === 'row' || type === 'tabs') ? [] : undefined,
    };

    set((state) => {
      const addToTab = (components: FormComponent[]): FormComponent[] => {
        return components.map((comp) => {
          if (comp.id === parentId && comp.type === 'tabs' && comp.props.tabs) {
            const newTabs = comp.props.tabs.map((tab: TabItem) => {
              if (tab.id === tabId) {
                return {
                  ...tab,
                  children: [...(tab.children || []), newComponent],
                };
              }
              return tab;
            });
            return {
              ...comp,
              props: { ...comp.props, tabs: newTabs },
            };
          }
          if (comp.children) {
            return { ...comp, children: addToTab(comp.children) };
          }
          // Also check inside tabs
          if (comp.props.tabs) {
            const newTabs = comp.props.tabs.map((tab: TabItem) => ({
              ...tab,
              children: tab.children ? addToTab(tab.children) : [],
            }));
            return { ...comp, props: { ...comp.props, tabs: newTabs } };
          }
          return comp;
        });
      };

      const newSchema = {
        ...state.schema,
        components: addToTab(state.schema.components),
      };

      return {
        schema: newSchema,
        selectedComponentId: newComponent.id,
        hasUnsavedChanges: JSON.stringify(newSchema) !== JSON.stringify(state.savedSchema),
      };
    });
  },

  updateComponent: (id, updates) => {
    set((state) => {
      const updateInArray = (components: FormComponent[]): FormComponent[] => {
        return components.map((comp) => {
          if (comp.id === id) {
            return { ...comp, ...updates, props: { ...comp.props, ...updates.props } };
          }
          let updated = comp;
          if (comp.children) {
            updated = { ...updated, children: updateInArray(comp.children) };
          }
          // Also search inside tabs
          if (comp.props.tabs) {
            const newTabs = comp.props.tabs.map((tab: TabItem) => ({
              ...tab,
              children: tab.children ? updateInArray(tab.children) : [],
            }));
            updated = { ...updated, props: { ...updated.props, tabs: newTabs } };
          }
          return updated;
        });
      };

      const newSchema = {
        ...state.schema,
        components: updateInArray(state.schema.components),
      };

      return {
        schema: newSchema,
        hasUnsavedChanges: JSON.stringify(newSchema) !== JSON.stringify(state.savedSchema),
      };
    });
  },

  removeComponent: (id) => {
    set((state) => {
      const removeFromArray = (components: FormComponent[]): FormComponent[] => {
        return components
          .filter((comp) => comp.id !== id)
          .map((comp) => {
            let updated = comp;
            if (comp.children) {
              updated = { ...updated, children: removeFromArray(comp.children) };
            }
            // Also handle tabs
            if (comp.props.tabs) {
              const newTabs = comp.props.tabs.map((tab: TabItem) => ({
                ...tab,
                children: tab.children ? removeFromArray(tab.children) : [],
              }));
              updated = { ...updated, props: { ...updated.props, tabs: newTabs } };
            }
            return updated;
          });
      };

      const newSchema = {
        ...state.schema,
        components: removeFromArray(state.schema.components),
      };

      return {
        schema: newSchema,
        selectedComponentId: state.selectedComponentId === id ? null : state.selectedComponentId,
        hasUnsavedChanges: JSON.stringify(newSchema) !== JSON.stringify(state.savedSchema),
      };
    });
  },

  moveComponent: (activeId, overId) => {
    set((state) => {
      const components = [...state.schema.components];
      const activeIndex = components.findIndex((c) => c.id === activeId);
      const overIndex = components.findIndex((c) => c.id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        const [removed] = components.splice(activeIndex, 1);
        components.splice(overIndex, 0, removed);
      }

      const newSchema = { ...state.schema, components };

      return {
        schema: newSchema,
        hasUnsavedChanges: JSON.stringify(newSchema) !== JSON.stringify(state.savedSchema),
      };
    });
  },

  moveComponentInTree: (componentId, targetParentId, targetIndex) => {
    set((state) => {
      let movedComponent: FormComponent | null = null;

      // Helper to find and remove component from any location
      const removeComponent = (components: FormComponent[]): FormComponent[] => {
        const result: FormComponent[] = [];
        for (const comp of components) {
          if (comp.id === componentId) {
            movedComponent = comp;
            continue; // Skip this component (remove it)
          }
          let updated = { ...comp };
          if (comp.children) {
            updated.children = removeComponent(comp.children);
          }
          if (comp.props.tabs) {
            updated = {
              ...updated,
              props: {
                ...updated.props,
                tabs: comp.props.tabs.map((tab: TabItem) => ({
                  ...tab,
                  children: tab.children ? removeComponent(tab.children) : [],
                })),
              },
            };
          }
          result.push(updated);
        }
        return result;
      };

      // Helper to add component to target location
      const addToTarget = (components: FormComponent[], parentId: string | null, index?: number): FormComponent[] => {
        if (!movedComponent) return components;

        // Adding to root level
        if (parentId === null) {
          const result = [...components];
          if (index !== undefined) {
            result.splice(index, 0, movedComponent);
          } else {
            result.push(movedComponent);
          }
          return result;
        }

        // Adding to a container
        return components.map((comp) => {
          if (comp.id === parentId) {
            const children = [...(comp.children || [])];
            if (index !== undefined) {
              children.splice(index, 0, movedComponent!);
            } else {
              children.push(movedComponent!);
            }
            return { ...comp, children };
          }
          let updated = { ...comp };
          if (comp.children) {
            updated.children = addToTarget(comp.children, parentId, index);
          }
          if (comp.props.tabs) {
            updated = {
              ...updated,
              props: {
                ...updated.props,
                tabs: comp.props.tabs.map((tab: TabItem) => ({
                  ...tab,
                  children: tab.children ? addToTarget(tab.children, parentId, index) : [],
                })),
              },
            };
          }
          return updated;
        });
      };

      // First remove the component from its current location
      let newComponents = removeComponent(state.schema.components);

      // Then add it to the target location
      if (movedComponent) {
        newComponents = addToTarget(newComponents, targetParentId, targetIndex);
      }

      const newSchema = { ...state.schema, components: newComponents };

      return {
        schema: newSchema,
        hasUnsavedChanges: JSON.stringify(newSchema) !== JSON.stringify(state.savedSchema),
      };
    });
  },

  selectComponent: (id) => set({ selectedComponentId: id }),

  setDragging: (isDragging) => set({ isDragging }),

  setPreviewMode: (previewMode) => set({ previewMode, viewMode: previewMode ? 'preview' : 'edit', selectedComponentId: null }),
  setViewMode: (viewMode) => set({ viewMode, previewMode: viewMode === 'preview', selectedComponentId: null }),

  duplicateComponent: (id) => {
    set((state) => {
      const findAndDuplicate = (components: FormComponent[]): { components: FormComponent[], duplicatedId: string | null } => {
        for (let i = 0; i < components.length; i++) {
          if (components[i].id === id) {
            const duplicated: FormComponent = {
              ...JSON.parse(JSON.stringify(components[i])),
              id: uuidv4(),
            };
            // Regenerate IDs for all children too
            const regenerateIds = (comp: FormComponent): FormComponent => {
              return {
                ...comp,
                id: uuidv4(),
                children: comp.children?.map(regenerateIds),
              };
            };
            if (duplicated.children) {
              duplicated.children = duplicated.children.map(regenerateIds);
            }
            const newComponents = [...components];
            newComponents.splice(i + 1, 0, duplicated);
            return { components: newComponents, duplicatedId: duplicated.id };
          }
          if (components[i].children) {
            const result = findAndDuplicate(components[i].children!);
            if (result.duplicatedId) {
              const newComponents = [...components];
              newComponents[i] = { ...newComponents[i], children: result.components };
              return { components: newComponents, duplicatedId: result.duplicatedId };
            }
          }
        }
        return { components, duplicatedId: null };
      };

      const result = findAndDuplicate(state.schema.components);
      if (!result.duplicatedId) return state;

      return {
        schema: { ...state.schema, components: result.components },
        selectedComponentId: result.duplicatedId,
      };
    });
  },

  clearForm: () => set({ schema: defaultSchema, currentFormId: null, selectedComponentId: null }),

  exportSchema: () => {
    return JSON.stringify(get().schema, null, 2);
  },

  importSchema: (json) => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.components && Array.isArray(parsed.components)) {
        set({ schema: parsed, selectedComponentId: null });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  // Smart drop: wrap target component in Row and add new component
  // If target is already in a Row, add to that Row instead
  wrapInRow: (targetId, newComponentType, position) => {
    const newComponent: FormComponent = {
      id: uuidv4(),
      type: newComponentType,
      props: getDefaultProps(newComponentType),
      validation: [],
      children: (newComponentType === 'container' || newComponentType === 'row' || newComponentType === 'tabs') ? [] : undefined,
    };

    set((state) => {
      // First check if the target is inside a Row - if so, add to that Row
      const findParentRow = (components: FormComponent[], targetId: string, parent: FormComponent | null = null): FormComponent | null => {
        for (const comp of components) {
          if (comp.id === targetId) {
            return parent?.type === 'row' ? parent : null;
          }
          if (comp.children) {
            const result = findParentRow(comp.children, targetId, comp);
            if (result !== null) return result;
          }
          if (comp.props.tabs) {
            for (const tab of comp.props.tabs) {
              if (tab.children) {
                const result = findParentRow(tab.children, targetId, null);
                if (result !== null) return result;
              }
            }
          }
        }
        return null;
      };

      const parentRow = findParentRow(state.schema.components, targetId);

      if (parentRow) {
        // Target is inside a Row - add new component to that Row
        const addToRow = (components: FormComponent[]): FormComponent[] => {
          return components.map((comp) => {
            if (comp.id === parentRow.id && comp.type === 'row') {
              const children = [...(comp.children || [])];
              const targetIndex = children.findIndex(c => c.id === targetId);
              if (targetIndex !== -1) {
                const insertIndex = position === 'left' ? targetIndex : targetIndex + 1;
                children.splice(insertIndex, 0, newComponent);
              }
              return {
                ...comp,
                children,
                props: { ...comp.props, columns: children.length }
              };
            }
            if (comp.children) {
              return { ...comp, children: addToRow(comp.children) };
            }
            if (comp.props.tabs) {
              const newTabs = comp.props.tabs.map((tab: TabItem) => ({
                ...tab,
                children: tab.children ? addToRow(tab.children) : [],
              }));
              return { ...comp, props: { ...comp.props, tabs: newTabs } };
            }
            return comp;
          });
        };

        const newSchema = {
          ...state.schema,
          components: addToRow(state.schema.components),
        };

        return {
          schema: newSchema,
          selectedComponentId: newComponent.id,
          hasUnsavedChanges: JSON.stringify(newSchema) !== JSON.stringify(state.savedSchema),
        };
      }

      // Target is not in a Row - wrap it in a new Row
      const findAndWrap = (components: FormComponent[]): FormComponent[] => {
        return components.map((comp) => {
          if (comp.id === targetId) {
            // Create a new Row with target and new component
            const rowChildren = position === 'left'
              ? [newComponent, { ...comp }]
              : [{ ...comp }, newComponent];

            return {
              id: uuidv4(),
              type: 'row' as ComponentType,
              props: { columns: 2, gap: 12 },
              children: rowChildren,
            };
          }
          if (comp.children) {
            return { ...comp, children: findAndWrap(comp.children) };
          }
          if (comp.props.tabs) {
            const newTabs = comp.props.tabs.map((tab: TabItem) => ({
              ...tab,
              children: tab.children ? findAndWrap(tab.children) : [],
            }));
            return { ...comp, props: { ...comp.props, tabs: newTabs } };
          }
          return comp;
        });
      };

      const newSchema = {
        ...state.schema,
        components: findAndWrap(state.schema.components),
      };

      return {
        schema: newSchema,
        selectedComponentId: newComponent.id,
        hasUnsavedChanges: JSON.stringify(newSchema) !== JSON.stringify(state.savedSchema),
      };
    });
  },

  // Smart drop: add new component as sibling (before/after target)
  addSibling: (targetId, newComponentType, position) => {
    const newComponent: FormComponent = {
      id: uuidv4(),
      type: newComponentType,
      props: getDefaultProps(newComponentType),
      validation: [],
      children: (newComponentType === 'container' || newComponentType === 'row' || newComponentType === 'tabs') ? [] : undefined,
    };

    set((state) => {
      const insertSibling = (components: FormComponent[]): FormComponent[] => {
        const result: FormComponent[] = [];
        for (const comp of components) {
          if (comp.id === targetId) {
            if (position === 'before') {
              result.push(newComponent);
              result.push(comp);
            } else {
              result.push(comp);
              result.push(newComponent);
            }
          } else {
            let updated = comp;
            if (comp.children) {
              updated = { ...updated, children: insertSibling(comp.children) };
            }
            if (comp.props.tabs) {
              const newTabs = comp.props.tabs.map((tab: TabItem) => ({
                ...tab,
                children: tab.children ? insertSibling(tab.children) : [],
              }));
              updated = { ...updated, props: { ...updated.props, tabs: newTabs } };
            }
            result.push(updated);
          }
        }
        return result;
      };

      const newSchema = {
        ...state.schema,
        components: insertSibling(state.schema.components),
      };

      return {
        schema: newSchema,
        selectedComponentId: newComponent.id,
        hasUnsavedChanges: JSON.stringify(newSchema) !== JSON.stringify(state.savedSchema),
      };
    });
  },
}));
