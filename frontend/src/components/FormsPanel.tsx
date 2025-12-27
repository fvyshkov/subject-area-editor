import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef, useMemo } from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import GridViewIcon from '@mui/icons-material/GridView';
import { useFormStore } from '../store/formStore';
import { useNotification } from './Notification';
import { ComponentPalette } from './ComponentPalette';
import { API_URL } from '../config';
import './FormsPanel.css';

interface SavedForm {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  schema_json: any;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
}

interface FormTreeNode extends SavedForm {
  children: FormTreeNode[];
  level: number;
  isRowEditor?: boolean;
  parentGridFormId?: string;
}

export interface FormsPanelRef {
  loadForms: () => Promise<void>;
  handleAddNew: () => Promise<void>;
  handleSaveForm: () => Promise<void>;
  handleAddChildForm: () => Promise<void>;
  getCount: () => number;
}

export const FormsPanel = forwardRef<FormsPanelRef>((props, ref) => {
  const [forms, setForms] = useState<SavedForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const { schema, currentFormId, setSchema, clearForm, markAsSaved, formsVersion, triggerFormsRefresh } = useFormStore();
  const { showNotification, showConfirm } = useNotification();

  // Drag & drop state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'inside' | 'root' | null>(null);
  const treeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadForms();
  }, []);

  // Reload forms when formsVersion changes (triggered by other components)
  useEffect(() => {
    if (formsVersion > 0) {
      loadForms();
    }
  }, [formsVersion]);

  const loadForms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/forms`);
      if (!response.ok) throw new Error('Failed to load forms');
      const data = await response.json();
      setForms(data);

      // Auto-focus first form if no form is currently selected
      if (!currentFormId && data.length > 0) {
        const firstForm = data[0];
        setSchema(firstForm.schema_json, firstForm.id);
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Auto-save current form before switching to another
  const saveCurrentForm = async () => {
    if (!currentFormId) return;
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
    } catch {
      // Silently fail - user can manually save
    }
  };

  const handleLoadForm = async (form: SavedForm) => {
    // Auto-save current form before switching
    if (currentFormId && currentFormId !== form.id) {
      await saveCurrentForm();
      await loadForms(); // Refresh list to show saved changes - await to ensure tree is rebuilt
    }
    setSchema(form.schema_json, form.id);
  };

  const handleDeleteForm = (id: string, name: string) => {
    showConfirm(`Delete "${name}"?`, async () => {
      try {
        const response = await fetch(`${API_URL}/api/forms/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete form');
        loadForms();
        showNotification('Form deleted', 'success');
      } catch {
        showNotification('Failed to delete form', 'error');
      }
    });
  };

  const handleAddNew = async () => {
    showConfirm('Create a new form? Current changes will be lost.', async () => {
      clearForm();
      // Save new form to database immediately
      try {
        const newSchema = {
          code: '',
          name: 'New Form',
          description: '',
          components: [],
          settings: { theme: 'light' as const },
        };
        const response = await fetch(`${API_URL}/api/forms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: newSchema.code,
            name: newSchema.name,
            description: newSchema.description,
            schema_json: newSchema,
            parent_id: null,
          }),
        });
        if (!response.ok) throw new Error('Failed to create form');
        const savedForm = await response.json();
        setSchema(newSchema, savedForm.id);
        loadForms();
        showNotification('New form created', 'success');
      } catch {
        showNotification('Failed to create form', 'error');
      }
    });
  };

  const handleAddChildForm = async () => {
    if (!currentFormId) {
      showNotification('Please select a form first', 'error');
      return;
    }
    showConfirm('Create a child form under the current form?', async () => {
      try {
        const newSchema = {
          code: '',
          name: 'New Child Form',
          description: '',
          components: [],
          settings: { theme: 'light' as const },
        };
        const response = await fetch(`${API_URL}/api/forms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: newSchema.code,
            name: newSchema.name,
            description: newSchema.description,
            schema_json: newSchema,
            parent_id: currentFormId,
          }),
        });
        if (!response.ok) throw new Error('Failed to create child form');
        const savedForm = await response.json();
        setExpandedNodes((prev) => new Set([...prev, currentFormId]));
        setSchema(newSchema, savedForm.id);
        loadForms();
        showNotification('Child form created', 'success');
      } catch {
        showNotification('Failed to create child form', 'error');
      }
    });
  };

  const handleSaveForm = async () => {
    try {
      // If we have a currentFormId, update existing form; otherwise create new
      const url = currentFormId
        ? `${API_URL}/api/forms/${currentFormId}`
        : `${API_URL}/api/forms`;
      const method = currentFormId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: schema.code,
          name: schema.name,
          description: schema.description,
          schema_json: schema,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');
      markAsSaved();
      showNotification('Form saved!', 'success');
      loadForms();
      triggerFormsRefresh(); // Notify other panels to refresh
    } catch {
      showNotification('Failed to save form', 'error');
    }
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

    setDropTargetId(nodeId);
    setDropPosition('inside');
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget?.closest('.tree-node-wrapper')) {
      setDropTargetId(null);
      setDropPosition(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedId || draggedId === targetId) {
      handleDragEnd();
      return;
    }

    // Check if trying to drop on own descendant
    if (targetId && isDescendant(targetId, draggedId)) {
      showNotification('Cannot move form into its own child', 'error');
      handleDragEnd();
      return;
    }

    // Update parent_id via API
    try {
      const response = await fetch(`${API_URL}/api/forms/${draggedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_id: targetId,
        }),
      });

      if (!response.ok) throw new Error('Failed to move form');

      // Expand target if dropping inside
      if (targetId) {
        setExpandedNodes(prev => new Set(prev).add(targetId));
      }

      showNotification('Form moved', 'success');
      loadForms();
    } catch {
      showNotification('Failed to move form', 'error');
    }

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
    if ((e.target as HTMLElement).classList.contains('forms-list')) {
      handleDrop(e, null);
    }
  };

  // Check if nodeId is a descendant of ancestorId
  const isDescendant = (nodeId: string, ancestorId: string): boolean => {
    const node = forms.find(f => f.id === nodeId);
    if (!node) return false;
    if (node.parent_id === ancestorId) return true;
    if (node.parent_id) return isDescendant(node.parent_id, ancestorId);
    return false;
  };

  // Get display name - use live schema name for currently loaded form
  const getDisplayName = (form: SavedForm) => {
    const name = form.id === currentFormId ? schema.name : form.name;
    return name;
  };

  // Find all row editor form IDs from a form's schema (searches recursively in children, tabs, etc.)
  const findRowEditorFormIds = (schemaJson: any): string[] => {
    const ids: string[] = [];
    const search = (components: any[]) => {
      if (!components || !Array.isArray(components)) return;
      components.forEach((comp) => {
        if (comp.type === 'grid' && comp.props?.rowEditorFormId) {
          ids.push(comp.props.rowEditorFormId);
        }
        // Search in children (for containers, rows, etc.)
        if (comp.children) {
          search(comp.children);
        }
        // Search inside tabs
        if (comp.props?.tabs) {
          comp.props.tabs.forEach((tab: any) => {
            if (tab.children) {
              search(tab.children);
            }
          });
        }
      });
    };
    search(schemaJson?.components || []);
    return ids;
  };

  // Get the effective schema for a form - use live schema for current form
  const getEffectiveSchema = (form: SavedForm): any => {
    if (form.id === currentFormId) {
      return schema; // Use live schema from formStore
    }
    return form.schema_json; // Use database version for other forms
  };

  // Build tree structure with row editor forms as virtual children
  const buildTree = (forms: SavedForm[]): FormTreeNode[] => {
    const formMap = new Map<string, FormTreeNode>();
    const rootNodes: FormTreeNode[] = [];
    const rowEditorFormIds = new Set<string>(); // Track all row editor forms

    // First pass: identify all row editor forms (using effective schema)
    forms.forEach((form) => {
      const effectiveSchema = getEffectiveSchema(form);
      const ids = findRowEditorFormIds(effectiveSchema);
      ids.forEach((id) => rowEditorFormIds.add(id));
    });

    // Create nodes
    forms.forEach((form) => {
      formMap.set(form.id, { ...form, children: [], level: 0 });
    });

    // Build hierarchy - skip row editor forms, they'll be added as virtual children
    forms.forEach((form) => {
      const node = formMap.get(form.id)!;
      if (rowEditorFormIds.has(form.id)) return;

      if (form.parent_id && formMap.has(form.parent_id)) {
        const parent = formMap.get(form.parent_id)!;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        rootNodes.push(node);
      }
    });

    // Add row editor forms as virtual children (recursively)
    // Track the current recursion path to prevent infinite loops (A->B->A)
    // but allow the same row editor to appear under multiple parents
    const addRowEditorChildren = (nodes: FormTreeNode[], ancestorPath: Set<string> = new Set()) => {
      nodes.forEach((node) => {
        // Skip if this node is in current ancestor path (prevents infinite loops)
        if (ancestorPath.has(node.id)) return;

        // Add current node to path for children processing
        const newPath = new Set(ancestorPath);
        newPath.add(node.id);

        // First process existing children (non-row-editor children)
        addRowEditorChildren(node.children, newPath);

        // Then find and add row editor forms for this node
        const effectiveSchema = getEffectiveSchema(node);
        const editorFormIds = findRowEditorFormIds(effectiveSchema);

        editorFormIds.forEach((editorFormId) => {
          const editorForm = formMap.get(editorFormId);
          // Only skip if the row editor would create a cycle (is an ancestor)
          if (editorForm && !newPath.has(editorFormId)) {
            const rowEditorNode: FormTreeNode = {
              ...editorForm,
              children: [],
              level: node.level + 1,
              isRowEditor: true,
              parentGridFormId: node.id,
            };
            node.children.push(rowEditorNode);

            // Also process the row editor form itself for its own row editor children
            addRowEditorChildren([rowEditorNode], newPath);
          }
        });
      });
    };

    addRowEditorChildren(rootNodes);

    return rootNodes;
  };

  // Filter tree with search
  const filterTree = (nodes: FormTreeNode[], query: string): FormTreeNode[] => {
    if (!query) return nodes;

    const matchesQuery = (node: FormTreeNode): boolean => {
      return getDisplayName(node).toLowerCase().includes(query.toLowerCase());
    };

    const filterNode = (node: FormTreeNode): FormTreeNode | null => {
      const matches = matchesQuery(node);
      const filteredChildren = node.children
        .map(filterNode)
        .filter((child): child is FormTreeNode => child !== null);

      if (matches || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    };

    return nodes
      .map(filterNode)
      .filter((node): node is FormTreeNode => node !== null);
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

  const handleAddChildToNode = async (parentId: string) => {
    try {
      const newSchema = {
        code: '',
        name: 'New Child Form',
        description: '',
        components: [],
        settings: { theme: 'light' as const },
      };
      const response = await fetch(`${API_URL}/api/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newSchema.code,
          name: newSchema.name,
          description: newSchema.description,
          schema_json: newSchema,
          parent_id: parentId,
        }),
      });
      if (!response.ok) throw new Error('Failed to create child form');
      const savedForm = await response.json();
      setExpandedNodes((prev) => new Set([...prev, parentId]));
      setSchema(newSchema, savedForm.id);
      loadForms();
      showNotification('Child form created', 'success');
    } catch {
      showNotification('Failed to create child form', 'error');
    }
  };

  const renderTreeNode = (node: FormTreeNode): React.ReactNode => {
    const isExpanded = effectiveExpandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isActive = node.id === currentFormId;
    const displayName = getDisplayName(node);
    const isDragging = draggedId === node.id;
    const isDropTarget = dropTargetId === node.id && dropPosition === 'inside';
    const isRowEditor = node.isRowEditor;

    return (
      <div
        key={node.id}
        className={`tree-node-wrapper ${isDragging ? 'dragging' : ''} ${isDropTarget ? 'drop-target' : ''} ${isRowEditor ? 'row-editor-node' : ''}`}
        draggable={!isRowEditor}
        onDragStart={(e) => !isRowEditor && handleDragStart(e, node.id)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => !isRowEditor && handleDragOver(e, node.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => !isRowEditor && handleDrop(e, node.id)}
      >
        <div
          className={`tree-node ${isActive ? 'active' : ''} ${isRowEditor ? 'row-editor' : ''}`}
          style={{ paddingLeft: `${node.level * 16 + 8}px` }}
        >
          <div className="tree-node-content">
            {!isRowEditor && (
              <span className="tree-drag-handle">
                <DragIndicatorIcon fontSize="small" />
              </span>
            )}
            {hasChildren ? (
              <button
                className="tree-expand-btn"
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
              <span className="tree-expand-spacer" />
            )}
            <div
              className="tree-node-label"
              onClick={() => handleLoadForm(node)}
              title={isRowEditor ? `Row Editor: ${displayName}` : displayName}
            >
              {isRowEditor && (
                <span className="tree-row-editor-icon">
                  <GridViewIcon fontSize="inherit" />
                </span>
              )}
              <span className="tree-node-text">{displayName}</span>
            </div>
            {isActive && !isRowEditor && (
              <button
                className="tree-node-add"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddChildToNode(node.id);
                }}
                title="Add child form"
              >
                <AddIcon fontSize="small" />
              </button>
            )}
            <button
              className="tree-node-delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteForm(node.id, node.name);
              }}
              title="Delete"
            >
              <DeleteIcon fontSize="small" />
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="tree-node-children">
            {node.children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(forms);
  const filteredTree = filterTree(tree, searchQuery);

  // Auto-expand nodes that have matching descendants when searching
  useEffect(() => {
    if (searchQuery) {
      const nodesToExpand = new Set<string>();
      const findMatchingPaths = (nodes: FormTreeNode[]) => {
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

  // Compute which nodes should be auto-expanded (have row editor children + their ancestors)
  const autoExpandedNodes = useMemo(() => {
    const result = new Set<string>();
    const formParentMap = new Map<string, string | null>();

    // Build parent map
    forms.forEach((form) => {
      formParentMap.set(form.id, form.parent_id);
    });

    // Find forms with row editor children and expand them + all ancestors
    forms.forEach((form) => {
      const effectiveSchema = getEffectiveSchema(form);
      const rowEditorFormIds = findRowEditorFormIds(effectiveSchema);
      if (rowEditorFormIds.length > 0) {
        // Expand this form
        result.add(form.id);
        // Expand all ancestors
        let parentId = form.parent_id;
        while (parentId) {
          result.add(parentId);
          parentId = formParentMap.get(parentId) || null;
        }
      }
    });
    return result;
  }, [forms, currentFormId, schema]);

  // Merge user-expanded nodes with auto-expanded nodes
  const effectiveExpandedNodes = useMemo(() => {
    const result = new Set(expandedNodes);
    autoExpandedNodes.forEach(id => result.add(id));
    return result;
  }, [expandedNodes, autoExpandedNodes]);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    loadForms,
    handleAddNew,
    handleSaveForm,
    handleAddChildForm,
    getCount: () => forms.length
  }));

  return (
    <div className="forms-panel">
      <div className="forms-panel-header">
        <input
          type="text"
          className="forms-search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className="forms-add-btn"
          onClick={handleAddNew}
          title="Add new form"
        >
          <AddIcon fontSize="small" />
        </button>
      </div>

      <div
        ref={treeContainerRef}
        className={`forms-list ${dropPosition === 'root' && draggedId ? 'drop-root' : ''}`}
        onDragOver={handleTreeDragOver}
        onDrop={handleTreeDrop}
      >
        {loading && <div className="forms-loading">Loading...</div>}
        {error && <div className="forms-error">{error}</div>}
        {!loading && !error && filteredTree.length === 0 && (
          <div className="forms-empty">No forms found</div>
        )}
        {!loading && !error && filteredTree.map((node) => renderTreeNode(node))}
      </div>

      <div className="forms-divider" />

      <ComponentPalette />
    </div>
  );
});

FormsPanel.displayName = 'FormsPanel';
