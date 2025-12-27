import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useReferenceStore, Reference } from '../store/referenceStore';
import { useClientTypeStore } from '../store/clientTypeStore';
import { useNotification } from './Notification';
import './ReferencesPanel.css';

interface ReferenceTreeNode extends Reference {
  children: ReferenceTreeNode[];
  level: number;
}

export interface ReferencesPanelRef {
  loadReferences: () => Promise<void>;
}

export const ReferencesPanel = forwardRef<ReferencesPanelRef>((props, ref) => {
  const {
    references,
    selectedReferenceId,
    loadReferences,
    selectReference,
    addReference,
    updateReference,
    deleteReference,
  } = useReferenceStore();

  const { clearClientType } = useClientTypeStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const { showNotification, showConfirm } = useNotification();

  useEffect(() => {
    loadReferences();
  }, []);

  const handleSelectReference = (ref: Reference) => {
    // Clear client type selection when selecting a reference
    clearClientType();
    selectReference(ref.id);
  };

  const handleAddNew = () => {
    addReference(null);
  };

  const handleAddChild = (parentId: string) => {
    addReference(parentId);
    setExpandedNodes((prev) => new Set([...prev, parentId]));
  };

  const handleEdit = (ref: Reference) => {
    setEditingId(ref.id);
    setEditCode(ref.code);
    setEditName(ref.name);
  };

  const handleSaveEdit = () => {
    if (editingId) {
      updateReference(editingId, { code: editCode, name: editName });
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string) => {
    showConfirm(`Delete "${name}"?`, () => {
      deleteReference(id);
      showNotification('Reference marked for deletion', 'success');
    });
  };

  // Build tree structure
  const buildTree = (references: Reference[]): ReferenceTreeNode[] => {
    const refMap = new Map<string, ReferenceTreeNode>();
    const rootNodes: ReferenceTreeNode[] = [];

    references.forEach((ref) => {
      refMap.set(ref.id, { ...ref, children: [], level: 0 });
    });

    references.forEach((ref) => {
      const node = refMap.get(ref.id)!;
      if (ref.parent_id && refMap.has(ref.parent_id)) {
        const parent = refMap.get(ref.parent_id)!;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  // Filter tree with search
  const filterTree = (nodes: ReferenceTreeNode[], query: string): ReferenceTreeNode[] => {
    if (!query) return nodes;

    const matchesQuery = (node: ReferenceTreeNode): boolean => {
      return (
        node.code.toLowerCase().includes(query.toLowerCase()) ||
        node.name.toLowerCase().includes(query.toLowerCase())
      );
    };

    const filterNode = (node: ReferenceTreeNode): ReferenceTreeNode | null => {
      const matches = matchesQuery(node);
      const filteredChildren = node.children
        .map(filterNode)
        .filter((child): child is ReferenceTreeNode => child !== null);

      if (matches || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    };

    return nodes
      .map(filterNode)
      .filter((node): node is ReferenceTreeNode => node !== null);
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

  const renderTreeNode = (node: ReferenceTreeNode): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isActive = node.id === selectedReferenceId;
    const isEditing = editingId === node.id;
    const fullText = node.name;

    return (
      <div key={node.id} className="ref-tree-node-wrapper">
        <div
          className={`ref-tree-node ${isActive ? 'active' : ''}`}
          style={{ paddingLeft: `${node.level * 16 + 8}px` }}
        >
          <div className="ref-tree-node-content">
            {hasChildren ? (
              <button
                className="ref-tree-expand-btn"
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
              <span className="ref-tree-expand-spacer" />
            )}

            {isEditing ? (
              <div className="ref-tree-edit-form">
                <input
                  type="text"
                  className="ref-edit-input"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  placeholder="Code"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <input
                  type="text"
                  className="ref-edit-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Name"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <button className="ref-edit-save-btn" onClick={handleSaveEdit}>
                  ✓
                </button>
                <button className="ref-edit-cancel-btn" onClick={handleCancelEdit}>
                  ✕
                </button>
              </div>
            ) : (
              <>
                <div
                  className="ref-tree-node-label"
                  onClick={() => handleSelectReference(node)}
                  onDoubleClick={() => handleEdit(node)}
                  title={fullText}
                >
                  {node.name}
                </div>
                {isActive && (
                  <button
                    className="ref-tree-node-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddChild(node.id);
                    }}
                    title="Add child"
                  >
                    <AddIcon fontSize="small" />
                  </button>
                )}
                <button
                  className="ref-tree-node-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(node.id, node.name);
                  }}
                  title="Delete"
                >
                  <DeleteIcon fontSize="small" />
                </button>
              </>
            )}
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="ref-tree-node-children">
            {node.children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(references);
  const filteredTree = filterTree(tree, searchQuery);

  // Auto-expand nodes when searching
  useEffect(() => {
    if (searchQuery) {
      const nodesToExpand = new Set<string>();
      const findMatchingPaths = (nodes: ReferenceTreeNode[]) => {
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
    loadReferences,
  }));

  return (
    <div className="ref-panel">
      <div className="ref-panel-header">
        <input
          type="text"
          className="ref-search"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="ref-add-btn" onClick={handleAddNew} title="Add new reference">
          <AddIcon fontSize="small" />
        </button>
      </div>

      <div className="ref-list">
        {filteredTree.length === 0 && (
          <div className="ref-empty">No references found</div>
        )}
        {filteredTree.map((node) => renderTreeNode(node))}
      </div>
    </div>
  );
});

ReferencesPanel.displayName = 'ReferencesPanel';
