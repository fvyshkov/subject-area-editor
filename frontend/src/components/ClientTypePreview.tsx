import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FormPreview } from './FormPreview';
import { API_URL } from '../config';
import './ClientTypePreview.css';

interface ClientType {
  id: string;
  code: string;
  name: string;
  form_id: string | null;
  parent_id: string | null;
  caption: string | null;
  item_type: 'section' | 'form';
  combine_forms?: boolean;
  always_show?: boolean;
}

interface ClientTypeTreeNode extends ClientType {
  children: ClientTypeTreeNode[];
  level: number;
}

interface FormSchema {
  id: string;
  code: string | null;
  name: string;
  schema_json: any;
}

interface ClientTypePreviewProps {
  clientTypeId: string;
  onFormDataChange?: (data: Record<string, any>) => void;
}

export const ClientTypePreview: React.FC<ClientTypePreviewProps> = ({ clientTypeId, onFormDataChange }) => {
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [forms, setForms] = useState<Map<string, FormSchema>>(new Map());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [rootClientType, setRootClientType] = useState<ClientType | null>(null);
  const [treePanelWidth, setTreePanelWidth] = useState(280);
  const [isDragging, setIsDragging] = useState(false);
  const firstTerminalRef = useRef<string | null>(null);
  const formRefsMap = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const combinedFormsContainerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);

  // Splitter drag handlers
  const handleSplitterMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartWidth.current = treePanelWidth;
  }, [treePanelWidth]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      const newWidth = Math.max(150, Math.min(500, dragStartWidth.current + deltaX));
      setTreePanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  useEffect(() => {
    loadData();
  }, [clientTypeId]);

  const loadData = async () => {
    try {
      // Load all client types
      const typesResponse = await fetch(`${API_URL}/api/client-types`);
      if (!typesResponse.ok) throw new Error('Failed to load client types');
      const allTypesData = await typesResponse.json();

      // Filter to show only current client type and its descendants
      const currentType = allTypesData.find((t: ClientType) => t.id === clientTypeId);
      if (!currentType) {
        setLoading(false);
        return;
      }

      // Store the root client type to check combine_forms flag
      setRootClientType(currentType);

      // Collect children and their descendants
      const collectDescendants = (parentId: string, allTypes: ClientType[]): ClientType[] => {
        const children = allTypes.filter((t: ClientType) => t.parent_id === parentId);
        const descendants: ClientType[] = [];
        children.forEach(child => {
          descendants.push(child);
          descendants.push(...collectDescendants(child.id, allTypes));
        });
        return descendants;
      };

      const descendants = collectDescendants(clientTypeId, allTypesData);

      // Show only descendants - children of current type become root nodes
      // Update parent_id of direct children to null so they become roots
      const displayTypes = descendants.map(d =>
        d.parent_id === clientTypeId
          ? { ...d, parent_id: null }
          : d
      );

      // If no descendants, show just the current type itself (terminal node case)
      if (displayTypes.length === 0) {
        setClientTypes([{ ...currentType, parent_id: null }]);
      } else {
        setClientTypes(displayTypes);
      }

      // Build tree to find all nodes
      const typesToDisplay = displayTypes.length > 0 ? displayTypes : [{ ...currentType, parent_id: null }];
      const tree = buildTree(typesToDisplay);

      // Expand all nodes by default
      const allNodeIds = new Set<string>();
      const collectNodeIds = (nodes: ClientTypeTreeNode[]) => {
        nodes.forEach(node => {
          allNodeIds.add(node.id);
          collectNodeIds(node.children);
        });
      };
      collectNodeIds(tree);
      setExpandedNodes(allNodeIds);

      // Find first terminal node (leaf node)
      const findFirstTerminal = (nodes: ClientTypeTreeNode[]): string | null => {
        for (const node of nodes) {
          if (node.children.length === 0) {
            return node.id;
          }
          const terminal = findFirstTerminal(node.children);
          if (terminal) return terminal;
        }
        return null;
      };
      const firstTerminal = findFirstTerminal(tree);
      firstTerminalRef.current = firstTerminal;

      // Load all forms for nodes that have form_id
      const formIds = typesToDisplay
        .filter(t => t.form_id)
        .map(t => t.form_id as string);
      const uniqueFormIds = [...new Set(formIds)];

      await Promise.all(uniqueFormIds.map(formId => loadFormDirect(formId)));

      // Auto-select first terminal node
      if (firstTerminal) {
        setSelectedNodeId(firstTerminal);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load data:', error);
      setLoading(false);
    }
  };

  const loadFormDirect = async (formId: string): Promise<FormSchema | null> => {
    try {
      const response = await fetch(`${API_URL}/api/forms/${formId}`);
      if (!response.ok) throw new Error('Failed to load form');
      const formData = await response.json();
      setForms(prev => new Map(prev).set(formId, formData));
      return formData;
    } catch (error) {
      console.error('Failed to load form:', error);
      return null;
    }
  };

  const loadForm = async (formId: string) => {
    if (forms.has(formId)) return; // Already loaded
    await loadFormDirect(formId);
  };

  const buildTree = (types: ClientType[]): ClientTypeTreeNode[] => {
    const typeMap = new Map<string, ClientTypeTreeNode>();
    const rootNodes: ClientTypeTreeNode[] = [];

    // Create nodes
    types.forEach((type) => {
      typeMap.set(type.id, { ...type, children: [], level: 0 });
    });

    // Build hierarchy
    types.forEach((type) => {
      const node = typeMap.get(type.id)!;
      if (type.parent_id && typeMap.has(type.parent_id)) {
        const parent = typeMap.get(type.parent_id)!;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  // Collect all nodes with forms in tree order (depth-first)
  const collectFormsInOrder = useCallback((nodes: ClientTypeTreeNode[]): ClientTypeTreeNode[] => {
    const result: ClientTypeTreeNode[] = [];
    const traverse = (nodeList: ClientTypeTreeNode[]) => {
      for (const node of nodeList) {
        if (node.form_id) {
          result.push(node);
        }
        if (node.children.length > 0) {
          traverse(node.children);
        }
      }
    };
    traverse(nodes);
    return result;
  }, []);

  // Find first form node in a subtree (for section clicks in combine mode)
  const findFirstFormInSubtree = useCallback((node: ClientTypeTreeNode): ClientTypeTreeNode | null => {
    if (node.form_id) return node;
    for (const child of node.children) {
      const found = findFirstFormInSubtree(child);
      if (found) return found;
    }
    return null;
  }, []);

  const handleNodeClick = async (node: ClientTypeTreeNode) => {
    // In combine_forms mode, scroll to the form
    if (rootClientType?.combine_forms) {
      setSelectedNodeId(node.id);
      let targetNodeId = node.id;
      // If clicked on a section, find first form in that subtree
      if (!node.form_id && node.children.length > 0) {
        const firstForm = findFirstFormInSubtree(node);
        if (firstForm) {
          targetNodeId = firstForm.id;
        }
      }
      // Scroll to the form element with offset for caption
      setTimeout(() => {
        const formElement = formRefsMap.current.get(targetNodeId);
        if (formElement && combinedFormsContainerRef.current) {
          const container = combinedFormsContainerRef.current;
          const elementTop = formElement.offsetTop - container.offsetTop;
          // Offset by 20px to show the caption above the form
          container.scrollTo({ top: elementTop - 20, behavior: 'smooth' });
        }
      }, 50);
      return;
    }

    // Normal mode - if section, find first form in subtree
    let targetNode = node;
    if (!node.form_id && node.children.length > 0) {
      const firstForm = findFirstFormInSubtree(node);
      if (firstForm) {
        targetNode = firstForm;
      }
    }

    setSelectedNodeId(targetNode.id);

    // Load form if needed
    if (targetNode.form_id) {
      await loadForm(targetNode.form_id);
    }
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

  const handleFormDataChange = useCallback((nodeId: string, data: any) => {
    setFormData(prev => new Map(prev).set(nodeId, data));
  }, []);

  const handleSelectedFormDataChange = useCallback((data: any) => {
    if (selectedNodeId) {
      handleFormDataChange(selectedNodeId, data);
    }
  }, [selectedNodeId, handleFormDataChange]);

  const renderTreeNode = (node: ClientTypeTreeNode): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isActive = node.id === selectedNodeId;
    const isSection = node.item_type === 'section';
    // Show caption if exists, otherwise show node name
    const fullText = node.caption || node.name;

    return (
      <div key={node.id} className="ctp-tree-node-wrapper">
        <div
          className={`ctp-tree-node ${isActive ? 'active' : ''} ${isSection ? 'section-node' : 'form-node'}`}
          style={{ paddingLeft: `${node.level * 16 + 16}px` }}
          onClick={() => handleNodeClick(node)}
        >
          <div className="ctp-tree-node-content">
            <div className="ctp-tree-node-label" title={fullText}>
              {fullText}
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="ctp-tree-node-children">
            {node.children.map((child) => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(clientTypes);
  const selectedNode = clientTypes.find(t => t.id === selectedNodeId);
  const selectedForm = selectedNode?.form_id ? forms.get(selectedNode.form_id) : null;
  const isCombineMode = rootClientType?.combine_forms || false;
  const orderedFormNodes = useMemo(() => collectFormsInOrder(tree), [tree, collectFormsInOrder]);

  // Split forms into always_show and regular
  const alwaysShowNodes = useMemo(() =>
    orderedFormNodes.filter(node => node.always_show),
    [orderedFormNodes]
  );

  // Get currently selected form node (if it has a form and is not always_show)
  const currentNavigatedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = orderedFormNodes.find(n => n.id === selectedNodeId);
    // Only return if it has a form and is NOT always_show (to avoid duplication)
    if (node && node.form_id && !node.always_show) return node;
    return null;
  }, [selectedNodeId, orderedFormNodes]);

  // Build complete JSON from all form data
  const allFormData = useMemo(() => {
    const result: Record<string, any> = {};
    formData.forEach((data, nodeId) => {
      const node = clientTypes.find(t => t.id === nodeId);
      if (node) {
        const key = node.code || node.id;
        result[key] = data;
      }
    });
    return result;
  }, [formData, clientTypes]);

  // Notify parent about form data changes
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange(allFormData);
    }
  }, [allFormData, onFormDataChange]);

  // Handle form data change for specific node - memoize handlers per node
  const formDataHandlersRef = useRef<Map<string, (data: any) => void>>(new Map());

  const getFormDataHandler = useCallback((nodeId: string) => {
    if (!formDataHandlersRef.current.has(nodeId)) {
      formDataHandlersRef.current.set(nodeId, (data: any) => {
        setFormData(prev => new Map(prev).set(nodeId, data));
      });
    }
    return formDataHandlersRef.current.get(nodeId)!;
  }, []);

  if (loading) {
    return (
      <div className="client-type-preview-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="client-type-preview">
      <div className="ctp-content" ref={contentRef}>
        {/* Left Panel - Tree */}
        <div className="ctp-tree-panel" style={{ width: treePanelWidth, minWidth: treePanelWidth }}>
          <div className="ctp-tree">
            {tree.map((node) => renderTreeNode(node))}
          </div>
        </div>

        {/* Splitter */}
        <div
          className={`ctp-splitter ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleSplitterMouseDown}
        />

        {/* Form Preview */}
        <div className="ctp-form-panel">
          {/* Always show forms - fixed at top */}
          {alwaysShowNodes.length > 0 && (
            <div className="ctp-always-show-panel">
              {alwaysShowNodes.map((node) => {
                const form = node.form_id ? forms.get(node.form_id) : null;
                if (!form) return null;
                const caption = node.caption || node.name;
                return (
                  <div
                    key={node.id}
                    className="ctp-combined-form-item"
                    ref={(el) => { formRefsMap.current.set(node.id, el); }}
                  >
                    {caption && <div className="ctp-combined-form-label">{caption}</div>}
                    <FormPreview
                      schema={form.schema_json}
                      onDataChange={getFormDataHandler(node.id)}
                      showSidebar={false}
                      showSubmit={false}
                      hideTitle={true}
                    />
                  </div>
                );
              })}
            </div>
          )}
          {/* Scrollable area for navigated forms */}
          <div className="ctp-scrollable-forms" ref={combinedFormsContainerRef}>
            {isCombineMode ? (
              // Combined mode - show currently navigated form
              <>
                {currentNavigatedNode && (() => {
                  const form = currentNavigatedNode.form_id ? forms.get(currentNavigatedNode.form_id) : null;
                  if (!form) return null;
                  const caption = currentNavigatedNode.caption || currentNavigatedNode.name;
                  return (
                    <div
                      key={currentNavigatedNode.id}
                      className="ctp-combined-form-item"
                      ref={(el) => { formRefsMap.current.set(currentNavigatedNode.id, el); }}
                    >
                      {caption && <div className="ctp-combined-form-label">{caption}</div>}
                      <FormPreview
                        key={`form-${currentNavigatedNode.id}`}
                        schema={form.schema_json}
                        onDataChange={getFormDataHandler(currentNavigatedNode.id)}
                        showSidebar={false}
                        showSubmit={false}
                        hideTitle={true}
                      />
                    </div>
                  );
                })()}
                {alwaysShowNodes.length === 0 && !currentNavigatedNode && (
                  <div className="ctp-form-empty">Select a form from the tree</div>
                )}
              </>
            ) : (
              // Normal mode - show selected form (same style as combined)
              // Don't show if it's an always_show form (already shown above)
              selectedForm && !selectedNode?.always_show ? (
                <div className="ctp-combined-form-item" key={selectedNodeId}>
                  {(selectedNode?.caption || selectedNode?.name) && (
                    <div className="ctp-combined-form-label">{selectedNode?.caption || selectedNode?.name}</div>
                  )}
                  <FormPreview
                    key={`form-${selectedNodeId}`}
                    schema={selectedForm.schema_json}
                    onDataChange={handleSelectedFormDataChange}
                    showSidebar={false}
                    showSubmit={false}
                    hideTitle={true}
                  />
                </div>
              ) : !selectedNode?.always_show ? (
                <div className="ctp-form-empty">
                  {selectedNode ? 'No form assigned to this node' : 'Select a node'}
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
