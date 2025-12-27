import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PersonIcon from '@mui/icons-material/Person';
import GridViewIcon from '@mui/icons-material/GridView';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useClientTypeStore, ClientType, ClientTypeItemType } from '../store/clientTypeStore';
import { useReferenceStore } from '../store/referenceStore';
import { useFormStore } from '../store/formStore';
import { useNotification } from './Notification';
import { ComponentPalette } from './ComponentPalette';
import { FormSelectDialog } from './FormSelectDialog';
import { API_URL } from '../config';
import './ClientTypesPanel.css';

interface ClientTypeTreeNode extends ClientType {
  children: ClientTypeTreeNode[];
  level: number;
  isRowEditorForm?: boolean;
  rowEditorFormId?: string;
  rowEditorFormName?: string;
}

interface SavedForm {
  id: string;
  code: string | null;
  name: string;
  schema_json: any;
}

export interface ClientTypesPanelRef {
  loadClientTypes: () => Promise<void>;
  handleSaveClientType: () => Promise<void>;
  getCount: () => number;
}

export const ClientTypesPanel = forwardRef<ClientTypesPanelRef>((props, ref) => {
  const {
    clientTypes,
    currentClientTypeId,
    loadClientTypes,
    selectClientType,
    addClientType,
    updateClientType,
    deleteClientType,
    saveAllChanges,
  } = useClientTypeStore();

  const [forms, setForms] = useState<SavedForm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const { selectReference } = useReferenceStore();
  const { setSchema, schema, currentFormId, formsVersion, hasUnsavedChanges } = useFormStore();
  const { showNotification, showConfirm } = useNotification();

  // Get current client type for checking item_type
  const currentClientType = clientTypes.find(ct => ct.id === currentClientTypeId);

  // Drag & drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'inside' | 'root' | null>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  // Add menu state
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
  const [addMenuParentId, setAddMenuParentId] = useState<string | null>(null);

  // Form select dialog state
  const [formSelectOpen, setFormSelectOpen] = useState(false);
  const [formSelectParentId, setFormSelectParentId] = useState<string | null>(null);

  useEffect(() => {
    loadClientTypes();
    loadForms();
  }, []);

  // Reload forms when formsVersion changes
  useEffect(() => {
    if (formsVersion > 0) {
      loadForms();
    }
  }, [formsVersion]);

  const loadForms = async () => {
    try {
      const response = await fetch(`${API_URL}/api/forms`);
      if (!response.ok) throw new Error('Failed to load forms');
      const data = await response.json();
      setForms(data);
    } catch {
      // Silently fail
    }
  };

  // Auto-save current form before switching (only if there are changes)
  const saveCurrentForm = async () => {
    if (!currentFormId || !schema || !hasUnsavedChanges) return;
    try {
      await fetch(`${API_URL}/api/forms/${currentFormId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: schema.name,
          description: schema.description,
          schema_json: schema,
        }),
      });
      await loadForms(); // Refresh forms list after save
    } catch {
      // Silently fail
    }
  };

  const handleSelectClientType = async (clientType: ClientType) => {
    // Clear reference selection when selecting a client type
    selectReference(null);
    selectClientType(clientType.id);

    // If this client type has a form, load it
    if (clientType.form_id) {
      // Auto-save current form before switching
      await saveCurrentForm();
      // Fetch and load the form
      try {
        const response = await fetch(`${API_URL}/api/forms/${clientType.form_id}`);
        if (response.ok) {
          const form = await response.json();
          setSchema(form.schema_json, form.id);
        }
      } catch {
        // Fallback to cached version
        const form = forms.find(f => f.id === clientType.form_id);
        if (form) {
          setSchema(form.schema_json, form.id);
        }
      }
    } else {
      // Section selected - clear form selection
      await saveCurrentForm();
      setSchema({ name: '', components: [], settings: {} }, null);
    }
  };

  const handleAddMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, parentId: string | null) => {
    event.stopPropagation();
    // At root level, just add a section directly without showing menu
    if (parentId === null) {
      selectReference(null);
      addClientType(null, 'section');
      return;
    }
    setAddMenuAnchor(event.currentTarget);
    setAddMenuParentId(parentId);
  };

  const handleAddMenuClose = () => {
    setAddMenuAnchor(null);
    setAddMenuParentId(null);
  };

  const handleAddSection = () => {
    selectReference(null);
    addClientType(addMenuParentId, 'section');
    if (addMenuParentId) {
      setExpandedNodes(prev => new Set(prev).add(addMenuParentId));
    }
    handleAddMenuClose();
  };

  const handleAddFormClick = () => {
    setFormSelectParentId(addMenuParentId);
    setFormSelectOpen(true);
    handleAddMenuClose();
  };

  const handleFormSelectClose = () => {
    setFormSelectOpen(false);
    setFormSelectParentId(null);
  };

  const handleFormSelected = async (action: 'new' | 'link' | 'copy', formId?: string, formName?: string) => {
    selectReference(null);
    addClientType(formSelectParentId, 'form');
    if (formSelectParentId) {
      setExpandedNodes(prev => new Set(prev).add(formSelectParentId));
    }

    const newClientTypeId = useClientTypeStore.getState().currentClientTypeId;

    if (action === 'new' && newClientTypeId) {
      // Create a new form in the database and link it
      try {
        const newFormData = {
          name: 'New Form',
          schema_json: { components: [] },
        };
        const response = await fetch(`${API_URL}/api/forms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newFormData),
        });
        if (response.ok) {
          const savedForm = await response.json();
          updateClientType(newClientTypeId, {
            form_id: savedForm.id,
            caption: 'New Form',
          });
          // Set the empty form schema immediately
          setSchema({ name: 'New Form', components: [], settings: {} }, savedForm.id);
          // Reload forms list
          loadForms();
        }
      } catch (error) {
        console.error('Failed to create new form:', error);
      }
    } else if (action === 'link' && formId && newClientTypeId) {
      // Link existing form
      updateClientType(newClientTypeId, {
        form_id: formId,
        caption: formName || null,
      });
    } else if (action === 'copy' && formId && newClientTypeId) {
      // Copy existing form - create a new form with copied content
      try {
        // Fetch original form
        const originalResponse = await fetch(`${API_URL}/api/forms/${formId}`);
        if (!originalResponse.ok) throw new Error('Failed to fetch original form');
        const originalForm = await originalResponse.json();

        // Create a copy with modified name
        const copyName = `${originalForm.name} (Copy)`;
        const copyFormData = {
          name: copyName,
          code: originalForm.code ? `${originalForm.code}_copy` : null,
          description: originalForm.description,
          schema_json: {
            ...originalForm.schema_json,
            name: copyName,
          },
        };

        const response = await fetch(`${API_URL}/api/forms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(copyFormData),
        });

        if (response.ok) {
          const savedForm = await response.json();
          updateClientType(newClientTypeId, {
            form_id: savedForm.id,
            caption: copyName,
          });
          // Set the copied form schema
          setSchema(savedForm.schema_json, savedForm.id);
          // Reload forms list
          loadForms();
        }
      } catch (error) {
        console.error('Failed to copy form:', error);
      }
    }
    handleFormSelectClose();
  };

  const handleSaveClientTypes = async () => {
    try {
      await saveAllChanges();
      showNotification('Client types saved!', 'success');
    } catch {
      showNotification('Failed to save client types', 'error');
    }
  };

  const handleDeleteClientType = (id: string, name: string) => {
    // Count descendants
    const countDescendants = (parentId: string): number => {
      const children = clientTypes.filter(ct => ct.parent_id === parentId);
      return children.reduce((sum, child) => sum + 1 + countDescendants(child.id), 0);
    };
    const childCount = countDescendants(id);
    const message = childCount > 0
      ? `Delete "${name}" and ${childCount} child item${childCount > 1 ? 's' : ''}?`
      : `Delete "${name}"?`;

    showConfirm(message, () => {
      deleteClientType(id);
      showNotification('Deleted (not saved yet)', 'info');
    });
  };

  // Drag & drop handlers
  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggedId(nodeId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', nodeId);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDropTargetId(null);
    setDropPosition(null);
  };

  const handleDragOver = (e: React.DragEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedId === nodeId) return;

    // Check if trying to drop on own descendant
    if (isDescendant(nodeId, draggedId!)) return;

    // Check if target is a form item (forms can't have children)
    const targetItem = clientTypes.find(ct => ct.id === nodeId);
    if (targetItem?.item_type === 'form') {
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    setDropTargetId(nodeId);
    setDropPosition('inside');
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only clear if leaving to outside
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget?.closest('.ct-tree-node-wrapper')) {
      setDropTargetId(null);
      setDropPosition(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedId || draggedId === targetId) {
      handleDragEnd();
      return;
    }

    // Check if trying to drop on own descendant
    if (targetId && isDescendant(targetId, draggedId)) {
      showNotification('Cannot move item into its own descendant', 'error');
      handleDragEnd();
      return;
    }

    // Check if trying to drop into a form item (forms can't have children)
    if (targetId) {
      const targetItem = clientTypes.find(ct => ct.id === targetId);
      if (targetItem?.item_type === 'form') {
        showNotification('Cannot add children to a form', 'error');
        handleDragEnd();
        return;
      }
    }

    // Update parent_id
    updateClientType(draggedId, { parent_id: targetId });

    // Expand target if dropping inside
    if (targetId) {
      setExpandedNodes(prev => new Set(prev).add(targetId));
    }

    showNotification('Item moved (not saved yet)', 'info');
    handleDragEnd();
  };

  const handleTreeDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedId) {
      setDropPosition('root');
      setDropTargetId(null);
    }
  };

  const handleTreeDrop = (e: React.DragEvent) => {
    // Drop on empty area = move to root
    if ((e.target as HTMLElement).classList.contains('ct-list')) {
      handleDrop(e, null);
    }
  };

  // Check if nodeId is a descendant of ancestorId
  const isDescendant = (nodeId: string, ancestorId: string): boolean => {
    const node = clientTypes.find(ct => ct.id === nodeId);
    if (!node) return false;
    if (node.parent_id === ancestorId) return true;
    if (node.parent_id) return isDescendant(node.parent_id, ancestorId);
    return false;
  };

  // Find all row editor form IDs from a form's schema
  const findRowEditorFormIds = (schemaJson: any): string[] => {
    const ids: string[] = [];
    const search = (components: any[]) => {
      if (!components || !Array.isArray(components)) return;
      components.forEach((comp) => {
        if (comp.type === 'grid' && comp.props?.rowEditorFormId) {
          ids.push(comp.props.rowEditorFormId);
        }
        if (comp.children) search(comp.children);
        if (comp.props?.tabs) {
          comp.props.tabs.forEach((tab: any) => {
            if (tab.children) search(tab.children);
          });
        }
      });
    };
    search(schemaJson?.components || []);
    return ids;
  };

  // Get effective schema for a form - use live schema for current form
  const getEffectiveSchema = (formId: string): any => {
    if (formId === currentFormId) {
      return schema; // Use live schema from formStore
    }
    const form = forms.find(f => f.id === formId);
    return form?.schema_json;
  };

  // Build tree structure with row editor forms as virtual children
  const buildTree = (clientTypes: ClientType[]): ClientTypeTreeNode[] => {
    const typeMap = new Map<string, ClientTypeTreeNode>();
    const rootNodes: ClientTypeTreeNode[] = [];
    const formMap = new Map<string, SavedForm>();

    // Build form lookup map
    forms.forEach((form) => {
      formMap.set(form.id, form);
    });

    clientTypes.forEach((ct) => {
      typeMap.set(ct.id, { ...ct, children: [], level: 0 });
    });

    clientTypes.forEach((ct) => {
      const node = typeMap.get(ct.id)!;
      if (ct.parent_id && typeMap.has(ct.parent_id)) {
        const parent = typeMap.get(ct.parent_id)!;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        rootNodes.push(node);
      }
    });

    // Add row editor forms as virtual children for form items
    const addRowEditorChildren = (nodes: ClientTypeTreeNode[], ancestorPath: Set<string> = new Set()) => {
      nodes.forEach((node) => {
        if (ancestorPath.has(node.id)) return;

        const newPath = new Set(ancestorPath);
        newPath.add(node.id);

        // First process existing children
        addRowEditorChildren(node.children, newPath);

        // For form items, find row editor forms
        if (node.item_type === 'form' && node.form_id) {
          const effectiveSchema = getEffectiveSchema(node.form_id);
          if (effectiveSchema) {
            const rowEditorFormIds = findRowEditorFormIds(effectiveSchema);
            rowEditorFormIds.forEach((editorFormId) => {
              const editorForm = formMap.get(editorFormId);
              if (editorForm && !newPath.has(editorFormId)) {
                // Create a virtual node for the row editor form
                const rowEditorNode: ClientTypeTreeNode = {
                  id: `row-editor-${node.id}-${editorFormId}`,
                  code: editorForm.code || '',
                  name: editorForm.name,
                  parent_id: node.id,
                  item_type: 'form',
                  form_id: editorFormId,
                  caption: null,
                  always_show: false,
                  children: [],
                  level: node.level + 1,
                  isRowEditorForm: true,
                  rowEditorFormId: editorFormId,
                  rowEditorFormName: editorForm.name,
                };
                node.children.push(rowEditorNode);
                // Don't recurse - only show direct row editors
              }
            });
          }
        }
      });
    };

    addRowEditorChildren(rootNodes);

    return rootNodes;
  };

  // Filter tree with search
  // When a node matches: show all its parents AND all its children
  const filterTree = (nodes: ClientTypeTreeNode[], query: string): ClientTypeTreeNode[] => {
    if (!query) return nodes;

    const queryLower = query.toLowerCase();

    const matchesQuery = (node: ClientTypeTreeNode): boolean => {
      return (
        node.code.toLowerCase().includes(queryLower) ||
        node.name.toLowerCase().includes(queryLower)
      );
    };

    // Check if node or any descendant matches
    const hasMatchingDescendant = (node: ClientTypeTreeNode): boolean => {
      if (matchesQuery(node)) return true;
      return node.children.some(child => hasMatchingDescendant(child));
    };

    const filterNode = (node: ClientTypeTreeNode): ClientTypeTreeNode | null => {
      const matches = matchesQuery(node);

      if (matches) {
        // If this node matches, show all its children (unfiltered)
        return { ...node };
      }

      // Check if any descendant matches
      const filteredChildren = node.children
        .map(filterNode)
        .filter((child): child is ClientTypeTreeNode => child !== null);

      if (filteredChildren.length > 0) {
        // Show this node as parent of matching descendants
        return { ...node, children: filteredChildren };
      }

      return null;
    };

    return nodes
      .map(filterNode)
      .filter((node): node is ClientTypeTreeNode => node !== null);
  };

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const getFormName = (formId: string | null): string | null => {
    if (!formId) return null;
    const form = forms.find(f => f.id === formId);
    if (!form) return null;
    return form.name;
  };

  const renderTreeNode = (node: ClientTypeTreeNode): React.ReactNode => {
    const isExpanded = effectiveExpandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const formName = getFormName(node.form_id);
    const isFormItem = node.item_type === 'form';
    const isRowEditor = node.isRowEditorForm;
    // Highlight based on which form is currently being edited
    // For row editors: check if this form is currently being edited
    // For form items: check if this form is currently being edited
    // For sections: check if this is the selected client type
    const isActive = isRowEditor
      ? node.form_id === currentFormId
      : isFormItem
        ? node.form_id === currentFormId
        : node.id === currentClientTypeId && !currentFormId;
    // For row editors: show form name
    // For forms: show caption if exists, otherwise form name
    // For sections: show node.name
    const displayName = isRowEditor
      ? node.rowEditorFormName || formName || 'Row Editor'
      : isFormItem
        ? (node.caption || formName || 'No form selected')
        : node.name;
    const fullText = isRowEditor
      ? `Row Editor: ${displayName}`
      : isFormItem
        ? `${displayName}${formName && node.caption ? ` (${formName})` : ''}`
        : node.name;
    const isDragging = draggedId === node.id;
    const isDropTarget = dropTargetId === node.id && dropPosition === 'inside';

    return (
      <div
        key={node.id}
        className={`ct-tree-node-wrapper ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''} ${isRowEditor ? 'row-editor-node' : ''}`}
        draggable={!isRowEditor}
        onDragStart={(e) => {
          if (isRowEditor) {
            e.preventDefault();
            e.stopPropagation();
          } else {
            handleDragStart(e, node.id);
          }
        }}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => {
          if (isRowEditor) {
            e.stopPropagation();
          } else {
            handleDragOver(e, node.id);
          }
        }}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          if (isRowEditor) {
            e.stopPropagation();
          } else {
            handleDrop(e, node.id);
          }
        }}
      >
        <div
          className={`ct-tree-node ${isActive ? 'active' : ''} ${isRowEditor ? 'row-editor' : ''}`}
          style={{ paddingLeft: `${node.level * 16 + 8}px` }}
        >
          <div className="ct-tree-node-content">
            {!isRowEditor && (
              <span className="ct-drag-handle">
                <DragIndicatorIcon fontSize="small" />
              </span>
            )}
            {hasChildren ? (
              <button
                className="ct-tree-expand-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
              >
                {isExpanded ? (
                  <ExpandMoreIcon fontSize="small" />
                ) : (
                  <ChevronRightIcon fontSize="small" />
                )}
              </button>
            ) : (
              <span className="ct-tree-expand-spacer" />
            )}
            <div
              className="ct-tree-node-label"
              onClick={async () => {
                if (isRowEditor && node.form_id) {
                  // Auto-save current form before switching to row editor
                  await saveCurrentForm();
                  // Fetch the row editor form directly from API (state might be stale)
                  try {
                    const response = await fetch(`${API_URL}/api/forms/${node.form_id}`);
                    if (response.ok) {
                      const form = await response.json();
                      setSchema(form.schema_json, form.id);
                    }
                  } catch {
                    // Fallback to cached version
                    const form = forms.find(f => f.id === node.form_id);
                    if (form) {
                      setSchema(form.schema_json, form.id);
                    }
                  }
                } else {
                  handleSelectClientType(node);
                }
              }}
              title={fullText}
            >
              <span className="ct-node-type-icon">
                {isRowEditor
                  ? <GridViewIcon fontSize="inherit" />
                  : isFormItem
                    ? <EditNoteIcon fontSize="inherit" />
                    : node.parent_id === null
                      ? <PersonIcon fontSize="inherit" />
                      : <AccountTreeIcon fontSize="inherit" />
                }
              </span>
              <span className="ct-node-text">
                {displayName}
              </span>
              {isFormItem && !isRowEditor && formName && node.caption && (
                <span className="ct-form-badge">({formName})</span>
              )}
            </div>
            {isActive && !isFormItem && !isRowEditor && (
              <button
                className="ct-tree-node-btn"
                onClick={(e) => handleAddMenuOpen(e, node.id)}
                title="Add child"
              >
                <AddIcon fontSize="small" />
              </button>
            )}
            {!isRowEditor && (
              <button
                className="ct-tree-node-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClientType(node.id, node.name);
                }}
                title="Delete"
              >
                <DeleteIcon fontSize="small" />
              </button>
            )}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="ct-tree-node-children">
            {node.children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(clientTypes);
  const filteredTree = filterTree(tree, searchQuery);

  // Auto-expand nodes that have row editor children
  const autoExpandedNodes = useMemo(() => {
    const result = new Set<string>();
    const findNodesWithRowEditors = (nodes: ClientTypeTreeNode[]) => {
      nodes.forEach((node) => {
        const hasRowEditorChild = node.children.some(c => c.isRowEditorForm);
        if (hasRowEditorChild) {
          result.add(node.id);
        }
        findNodesWithRowEditors(node.children);
      });
    };
    findNodesWithRowEditors(tree);
    return result;
  }, [tree]);

  // Merge user-expanded nodes with auto-expanded nodes
  const effectiveExpandedNodes = useMemo(() => {
    const result = new Set(expandedNodes);
    autoExpandedNodes.forEach(id => result.add(id));
    return result;
  }, [expandedNodes, autoExpandedNodes]);

  // Auto-expand nodes when searching
  useEffect(() => {
    if (searchQuery) {
      const nodesToExpand = new Set<string>();
      const findMatchingPaths = (nodes: ClientTypeTreeNode[]) => {
        nodes.forEach((node) => {
          if (node.children.length > 0) {
            nodesToExpand.add(node.id);
            findMatchingPaths(node.children);
          }
        });
      };
      findMatchingPaths(filteredTree);
      setExpandedNodes(nodesToExpand);
    }
  }, [searchQuery]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    loadClientTypes,
    handleSaveClientType: handleSaveClientTypes,
    getCount: () => clientTypes.filter(ct => ct.parent_id === null).length
  }));

  return (
    <div className="ct-panel">
      <div className="ct-panel-header">
        <input
          type="text"
          className="ct-search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="ct-add-btn"
          onClick={(e) => handleAddMenuOpen(e, null)}
          title="Add new item"
        >
          <AddIcon fontSize="small" />
        </button>
      </div>

      <div
        ref={treeContainerRef}
        className={`ct-list ${dropPosition === 'root' && draggedId ? 'drop-root' : ''}`}
        onDragOver={handleTreeDragOver}
        onDrop={handleTreeDrop}
      >
        {clientTypes.length === 0 && (
          <div className="ct-empty">No client types</div>
        )}
        {filteredTree.length === 0 && clientTypes.length > 0 && (
          <div className="ct-empty">No matches found</div>
        )}
        {filteredTree.map((node) => renderTreeNode(node))}
      </div>

      {/* Show component palette when a form item is selected */}
      {currentClientType?.item_type === 'form' && (
        <>
          <div className="forms-divider" />
          <ComponentPalette />
        </>
      )}

      {/* Add item menu */}
      <Menu
        anchorEl={addMenuAnchor}
        open={Boolean(addMenuAnchor)}
        onClose={handleAddMenuClose}
      >
        <MenuItem onClick={handleAddFormClick}>
          <ListItemIcon>
            <EditNoteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Form</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAddSection}>
          <ListItemIcon>
            <AccountTreeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add Section</ListItemText>
        </MenuItem>
      </Menu>

      {/* Form select dialog */}
      <FormSelectDialog
        open={formSelectOpen}
        onClose={handleFormSelectClose}
        onSelect={handleFormSelected}
        forms={forms}
      />
    </div>
  );
});

ClientTypesPanel.displayName = 'ClientTypesPanel';
