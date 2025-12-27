import React, { useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useFormStore } from '../store/formStore';
import { FormComponent } from '../types';
import { getComponentConfig } from '../utils/componentConfig';
import './ComponentTreeView.css';

interface TreeNodeProps {
  component: FormComponent;
  level: number;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  selectedId: string | null;
  parentId: string | null;
  index: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ component, level, onSelect, onDelete, selectedId, parentId, index }) => {
  const [expanded, setExpanded] = useState(true);
  const config = getComponentConfig(component.type);
  const isContainer = component.type === 'row' || component.type === 'container' || component.type === 'tabs';

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: `tree-${component.id}`,
    data: { component, parentId, index, type: 'tree-component', componentId: component.id },
  });

  // Drop zone ID format: tree-drop-{componentId}
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `tree-drop-${component.id}`,
    data: { component, parentId, isContainer, componentId: component.id },
  });

  const getChildren = (): FormComponent[] => {
    if (component.type === 'row' || component.type === 'container') {
      return component.children || [];
    }
    if (component.type === 'tabs' && component.props.tabs) {
      return component.props.tabs.flatMap((tab: any) => tab.children || []);
    }
    return [];
  };

  const children = getChildren();
  const hasChildren = children.length > 0 || isContainer;
  const isSelected = selectedId === component.id;
  const label = component.props.label || component.props.name || '';

  // For containers, wrap the entire node (row + children) with the drop zone
  if (isContainer) {
    return (
      <div
        className={`tree-node-wrapper ${isOver ? 'container-drop-target' : ''}`}
        ref={setDropRef}
      >
        <div
          ref={setDragRef}
          className={`tree-node ${isSelected ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => onSelect(component.id)}
          {...attributes}
          {...listeners}
        >
          <div className="tree-node-content">
            <div className="tree-drag-handle">
              <DragIndicatorIcon fontSize="small" />
            </div>
            <button
              className="tree-expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </button>
            <div className="tree-node-label">
              <span className="tree-node-icon">{config?.icon}</span>
              <span className="tree-node-text">{config?.label}</span>
              {label && <span className="tree-node-badge">{label}</span>}
            </div>
            <button
              className="tree-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(component.id);
              }}
              title="Delete"
            >
              <DeleteOutlineIcon fontSize="small" />
            </button>
          </div>
        </div>
        {expanded && (
          <div className="tree-node-children">
            {children.map((child, idx) => (
              <TreeNode
                key={child.id}
                component={child}
                level={level + 1}
                onSelect={onSelect}
                onDelete={onDelete}
                selectedId={selectedId}
                parentId={component.id}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Non-container nodes
  return (
    <div className="tree-node-wrapper" ref={setDropRef}>
      <div
        ref={setDragRef}
        className={`tree-node ${isSelected ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isOver ? 'drop-target' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(component.id)}
        {...attributes}
        {...listeners}
      >
        <div className="tree-node-content">
          <div className="tree-drag-handle">
            <DragIndicatorIcon fontSize="small" />
          </div>
          <span className="tree-expand-spacer" />
          <div className="tree-node-label">
            <span className="tree-node-icon">{config?.icon}</span>
            <span className="tree-node-text">{config?.label}</span>
            {label && <span className="tree-node-badge">{label}</span>}
          </div>
          <button
            className="tree-delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(component.id);
            }}
            title="Delete"
          >
            <DeleteOutlineIcon fontSize="small" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ComponentTreeView: React.FC = () => {
  const { schema, selectedComponentId, selectComponent, removeComponent } = useFormStore();

  // Root drop zone for empty tree
  const { setNodeRef: setRootDropRef, isOver: isOverRoot } = useDroppable({
    id: 'tree-drop-root',
    data: { isRoot: true, isContainer: true },
  });

  if (schema.components.length === 0) {
    return (
      <div className="component-tree-panel" ref={setRootDropRef}>
        <div className={`tree-empty ${isOverRoot ? 'drop-target' : ''}`}>
          Drop components here
        </div>
      </div>
    );
  }

  return (
    <div className="component-tree-panel">
      <div className="tree-list">
        {schema.components.map((component, index) => (
          <TreeNode
            key={component.id}
            component={component}
            level={0}
            onSelect={selectComponent}
            onDelete={removeComponent}
            selectedId={selectedComponentId}
            parentId={null}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};
