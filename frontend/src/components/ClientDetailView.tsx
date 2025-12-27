import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { FormPreview } from './FormPreview';
import { API_URL } from '../config';
import './ClientDetailView.css';

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

interface ClientData {
  id: string;
  client_type_id: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface ClientDetailViewProps {
  clientTypeId: string;
  clientId: string;
  onBack: () => void;
  onSave?: () => void;
}

export const ClientDetailView: React.FC<ClientDetailViewProps> = ({
  clientTypeId,
  clientId,
  onBack,
  onSave,
}) => {
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [forms, setForms] = useState<Map<string, FormSchema>>(new Map());
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [formData, setFormData] = useState<Map<string, any>>(new Map());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [rootClientType, setRootClientType] = useState<ClientType | null>(null);
  const [treePanelWidth, setTreePanelWidth] = useState(280);
  const [isDragging, setIsDragging] = useState(false);
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState<null | HTMLElement>(null);
  const [topPanelCollapsed, setTopPanelCollapsed] = useState(false);
  const formRefsMap = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const combinedFormsContainerRef = useRef<HTMLDivElement | null>(null);
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
  }, [clientTypeId, clientId]);

  const loadData = async () => {
    try {
      // Load client types, client data, and forms in parallel
      const [typesResponse, clientResponse] = await Promise.all([
        fetch(`${API_URL}/api/client-types`),
        fetch(`${API_URL}/api/client-data/${clientTypeId}/${clientId}`),
      ]);

      if (!typesResponse.ok) throw new Error('Failed to load client types');
      if (!clientResponse.ok) throw new Error('Failed to load client');

      const allTypesData = await typesResponse.json();
      const clientDataRes = await clientResponse.json();

      setClientData(clientDataRes);

      // Find current client type
      const currentType = allTypesData.find((t: ClientType) => t.id === clientTypeId);
      if (!currentType) {
        setLoading(false);
        return;
      }

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
      const displayTypes = descendants.map(d =>
        d.parent_id === clientTypeId ? { ...d, parent_id: null } : d
      );

      if (displayTypes.length === 0) {
        setClientTypes([{ ...currentType, parent_id: null }]);
      } else {
        setClientTypes(displayTypes);
      }

      const typesToDisplay = displayTypes.length > 0 ? displayTypes : [{ ...currentType, parent_id: null }];
      const tree = buildTree(typesToDisplay);

      // Expand all nodes
      const allNodeIds = new Set<string>();
      const collectNodeIds = (nodes: ClientTypeTreeNode[]) => {
        nodes.forEach(node => {
          allNodeIds.add(node.id);
          collectNodeIds(node.children);
        });
      };
      collectNodeIds(tree);
      setExpandedNodes(allNodeIds);

      // Load all forms
      const formIds = typesToDisplay.filter(t => t.form_id).map(t => t.form_id as string);
      const uniqueFormIds = [...new Set(formIds)];

      await Promise.all(uniqueFormIds.map(formId => loadFormDirect(formId)));

      // Initialize form data from client data
      const initialFormData = new Map<string, any>();
      for (const typeItem of typesToDisplay) {
        if (typeItem.form_id && clientDataRes.data[typeItem.code]) {
          initialFormData.set(typeItem.id, clientDataRes.data[typeItem.code]);
        }
      }
      setFormData(initialFormData);

      // Find and select first terminal node
      const findFirstTerminal = (nodes: ClientTypeTreeNode[]): string | null => {
        for (const node of nodes) {
          if (node.children.length === 0) return node.id;
          const terminal = findFirstTerminal(node.children);
          if (terminal) return terminal;
        }
        return null;
      };
      const firstTerminal = findFirstTerminal(tree);
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
      const formDataRes = await response.json();
      setForms(prev => new Map(prev).set(formId, formDataRes));
      return formDataRes;
    } catch (error) {
      console.error('Failed to load form:', error);
      return null;
    }
  };

  const buildTree = (types: ClientType[]): ClientTypeTreeNode[] => {
    const typeMap = new Map<string, ClientTypeTreeNode>();
    const rootNodes: ClientTypeTreeNode[] = [];

    types.forEach((type) => {
      typeMap.set(type.id, { ...type, children: [], level: 0 });
    });

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

  const findFirstFormInSubtree = useCallback((node: ClientTypeTreeNode): ClientTypeTreeNode | null => {
    if (node.form_id) return node;
    for (const child of node.children) {
      const found = findFirstFormInSubtree(child);
      if (found) return found;
    }
    return null;
  }, []);

  const handleNodeClick = async (node: ClientTypeTreeNode) => {
    if (rootClientType?.combine_forms) {
      setSelectedNodeId(node.id);
      let targetNodeId = node.id;
      if (!node.form_id && node.children.length > 0) {
        const firstForm = findFirstFormInSubtree(node);
        if (firstForm) {
          targetNodeId = firstForm.id;
        }
      }
      setTimeout(() => {
        const formElement = formRefsMap.current.get(targetNodeId);
        if (formElement && combinedFormsContainerRef.current) {
          const container = combinedFormsContainerRef.current;
          const elementTop = formElement.offsetTop - container.offsetTop;
          container.scrollTo({ top: elementTop - 20, behavior: 'smooth' });
        }
      }, 50);
      return;
    }

    let targetNode = node;
    if (!node.form_id && node.children.length > 0) {
      const firstForm = findFirstFormInSubtree(node);
      if (firstForm) {
        targetNode = firstForm;
      }
    }

    setSelectedNodeId(targetNode.id);
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
    setHasChanges(true);
  }, []);

  const handleSave = async () => {
    if (!clientData) return;

    setSaving(true);
    try {
      // Build complete data object from all forms
      const completeData: Record<string, any> = { ...clientData.data };

      for (const typeItem of clientTypes) {
        if (typeItem.form_id && formData.has(typeItem.id)) {
          completeData[typeItem.code] = formData.get(typeItem.id);
        }
      }

      const response = await fetch(`${API_URL}/api/client-data/${clientTypeId}/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: completeData }),
      });

      if (!response.ok) throw new Error('Failed to save client');

      setHasChanges(false);
      onSave?.();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  // Form data handlers - memoized per node
  const formDataHandlersRef = useRef<Map<string, (data: any) => void>>(new Map());

  const getFormDataHandler = useCallback((nodeId: string) => {
    if (!formDataHandlersRef.current.has(nodeId)) {
      formDataHandlersRef.current.set(nodeId, (data: any) => {
        handleFormDataChange(nodeId, data);
      });
    }
    return formDataHandlersRef.current.get(nodeId)!;
  }, [handleFormDataChange]);

  const renderTreeNode = (node: ClientTypeTreeNode): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const isActive = node.id === selectedNodeId;
    const isSection = node.item_type === 'section';
    const fullText = node.caption || node.name;

    return (
      <div key={node.id} className="cdv-tree-node-wrapper">
        <div
          className={`cdv-tree-node ${isActive ? 'active' : ''} ${isSection ? 'section-node' : 'form-node'}`}
          style={{ paddingLeft: `${node.level * 16 + 16}px` }}
          onClick={() => handleNodeClick(node)}
        >
          <div className="cdv-tree-node-content">
            <div className="cdv-tree-node-label" title={fullText}>
              {fullText}
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="cdv-tree-node-children">
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

  const alwaysShowNodes = useMemo(() =>
    orderedFormNodes.filter(node => node.always_show),
    [orderedFormNodes]
  );

  const currentNavigatedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const node = orderedFormNodes.find(n => n.id === selectedNodeId);
    if (node && node.form_id && !node.always_show) return node;
    return null;
  }, [selectedNodeId, orderedFormNodes]);

  if (loading) {
    return (
      <div className="client-detail-loading">
        <CircularProgress size={40} />
        <span>Загрузка...</span>
      </div>
    );
  }

  return (
    <div className="client-detail-view">
      <div className="client-detail-header">
        <button
          className={`cdv-save-btn ${hasChanges ? 'has-changes' : ''}`}
          onClick={handleSave}
          disabled={!hasChanges || saving}
          title="Сохранить"
        >
          {saving ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <SaveIcon fontSize="small" />
          )}
        </button>
        <div className="cdv-header-spacer"></div>
        {alwaysShowNodes.length > 0 && (
          <button
            className={`cdv-collapse-btn ${topPanelCollapsed ? 'collapsed' : ''}`}
            onClick={() => setTopPanelCollapsed(!topPanelCollapsed)}
            title={topPanelCollapsed ? 'Развернуть' : 'Свернуть'}
          >
            <KeyboardArrowUpIcon fontSize="small" />
          </button>
        )}
        <button
          className="cdv-actions-btn"
          onClick={(e) => setActionsMenuAnchor(e.currentTarget)}
          title="Действия"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="4" r="1.5" />
            <circle cx="11" cy="4" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="11" cy="12" r="1.5" />
          </svg>
        </button>
        <Menu
          anchorEl={actionsMenuAnchor}
          open={Boolean(actionsMenuAnchor)}
          onClose={() => setActionsMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                minWidth: 260,
                boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
                borderRadius: '6px',
                mt: 0.5,
                py: 0.5
              }
            }
          }}
        >
          <MenuItem onClick={() => setActionsMenuAnchor(null)} sx={{ py: 0.75, fontSize: 13 }}>
            Изменить группу обслуживания
          </MenuItem>
          <MenuItem onClick={() => setActionsMenuAnchor(null)} sx={{ py: 0.75, fontSize: 13 }}>
            Коррекция классиф. атрибутов
          </MenuItem>
          <MenuItem onClick={() => setActionsMenuAnchor(null)} sx={{ py: 0.75, fontSize: 13 }}>
            Установить категорию «Самозанятый»
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => setActionsMenuAnchor(null)} sx={{ py: 0.75, fontSize: 13 }}>
            Оценка степени риска
          </MenuItem>
          <MenuItem onClick={() => setActionsMenuAnchor(null)} sx={{ py: 0.75, fontSize: 13 }}>
            Установка признаков подозрительности
          </MenuItem>
          <MenuItem onClick={() => setActionsMenuAnchor(null)} sx={{ py: 0.75, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
            AML статус
            <ChevronRightIcon fontSize="small" sx={{ color: '#bbb', ml: 2 }} />
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => setActionsMenuAnchor(null)} sx={{ py: 0.75, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
            Управление блокировками
            <ChevronRightIcon fontSize="small" sx={{ color: '#bbb', ml: 2 }} />
          </MenuItem>
          <MenuItem onClick={() => setActionsMenuAnchor(null)} sx={{ py: 0.75, fontSize: 13 }}>
            Установка защиты информации
          </MenuItem>
          <MenuItem onClick={() => setActionsMenuAnchor(null)} sx={{ py: 0.75, fontSize: 13 }}>
            Контроль карточки
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => { setActionsMenuAnchor(null); onBack(); }}
            sx={{ py: 0.75, fontSize: 13, color: '#d32f2f' }}
          >
            <CloseIcon sx={{ fontSize: 16, mr: 1 }} />
            Закрыть карточку
          </MenuItem>
        </Menu>
      </div>

      {/* Always show forms - full width panel with gray background */}
      {alwaysShowNodes.length > 0 && (
        <div className={`cdv-always-show-panel ${topPanelCollapsed ? 'collapsed' : ''}`}>
          {alwaysShowNodes.map((node) => {
            const form = node.form_id ? forms.get(node.form_id) : null;
            if (!form) return null;
            const initialData = formData.get(node.id) || clientData?.data[node.code] || {};
            return (
              <div
                key={node.id}
                className="cdv-combined-form-item"
                ref={(el) => { formRefsMap.current.set(node.id, el); }}
              >
                <FormPreview
                  schema={form.schema_json}
                  initialData={initialData}
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

      <div className="cdv-content">
        {/* Left Panel - Tree */}
        <div className="cdv-tree-panel" style={{ width: treePanelWidth, minWidth: treePanelWidth }}>
          <div className="cdv-tree">
            {tree.map((node) => renderTreeNode(node))}
          </div>
        </div>

        {/* Splitter */}
        <div
          className={`cdv-splitter ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleSplitterMouseDown}
        />

        {/* Form Panel */}
        <div className="cdv-form-panel">
          {/* Scrollable area for navigated forms */}
          <div className="cdv-scrollable-forms" ref={combinedFormsContainerRef}>
            {isCombineMode ? (
              <>
                {currentNavigatedNode && (() => {
                  const form = currentNavigatedNode.form_id ? forms.get(currentNavigatedNode.form_id) : null;
                  if (!form) return null;
                  const caption = currentNavigatedNode.caption || currentNavigatedNode.name;
                  const initialData = formData.get(currentNavigatedNode.id) || clientData?.data[currentNavigatedNode.code] || {};
                  return (
                    <div
                      key={currentNavigatedNode.id}
                      className="cdv-combined-form-item"
                      ref={(el) => { formRefsMap.current.set(currentNavigatedNode.id, el); }}
                    >
                      <FormPreview
                        key={`form-${currentNavigatedNode.id}`}
                        schema={form.schema_json}
                        initialData={initialData}
                        onDataChange={getFormDataHandler(currentNavigatedNode.id)}
                        showSidebar={false}
                        showSubmit={false}
                        hideTitle={true}
                      />
                    </div>
                  );
                })()}
                {alwaysShowNodes.length === 0 && !currentNavigatedNode && (
                  <div className="cdv-form-empty">Выберите форму из дерева</div>
                )}
              </>
            ) : (
              selectedForm && !selectedNode?.always_show ? (
                <div className="cdv-combined-form-item" key={selectedNodeId}>
                  <FormPreview
                    key={`form-${selectedNodeId}`}
                    schema={selectedForm.schema_json}
                    initialData={formData.get(selectedNodeId!) || clientData?.data[selectedNode?.code || ''] || {}}
                    onDataChange={getFormDataHandler(selectedNodeId!)}
                    showSidebar={false}
                    showSubmit={false}
                    hideTitle={true}
                  />
                </div>
              ) : !selectedNode?.always_show ? (
                <div className="cdv-form-empty">
                  {selectedNode ? 'Нет формы для этого узла' : 'Выберите узел'}
                </div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
