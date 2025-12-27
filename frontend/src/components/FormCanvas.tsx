import React from 'react';
import {
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TextField from '@mui/material/TextField';
import { useFormStore } from '../store/formStore';
import { FormComponent, TabItem } from '../types';
import { getComponentConfig } from '../utils/componentConfig';
import { FormComponentRenderer } from './FormComponentRenderer';
import './FormCanvas.css';

interface SortableComponentProps {
  component: FormComponent;
  isSelected: boolean;
  onClick: () => void;
  onChildClick: (id: string) => void;
  selectedChildId: string | null;
}

interface RowDropZoneProps {
  parentId: string;
  children: FormComponent[];
  columns: number;
  gap: number;
  onChildClick: (id: string) => void;
  selectedChildId: string | null;
}

interface ContainerDropZoneProps {
  parentId: string;
  children: FormComponent[];
  direction: 'row' | 'column';
  gap: number;
  label?: string;
  width?: string;
  height?: string;
  fillSpace?: boolean;
  onChildClick: (id: string) => void;
  selectedChildId: string | null;
}

interface TabsDropZoneProps {
  parentId: string;
  tabs: TabItem[];
  onChildClick: (id: string) => void;
  selectedChildId: string | null;
  onTabsChange: (tabs: TabItem[]) => void;
}

// Helper to render nested child content
function renderNestedChild(
  child: FormComponent,
  onChildClick: (id: string) => void,
  selectedChildId: string | null
): React.ReactNode {
  if (child.type === 'container') {
    return (
      <ContainerDropZone
        parentId={child.id}
        children={child.children || []}
        direction={child.props.direction || 'column'}
        gap={child.props.gap || 16}
        label={child.props.label}
        width={child.props.width}
        height={child.props.height}
        fillSpace={child.props.fillSpace}
        onChildClick={onChildClick}
        selectedChildId={selectedChildId}
      />
    );
  }
  if (child.type === 'row') {
    return (
      <RowDropZone
        parentId={child.id}
        children={child.children || []}
        columns={child.props.columns || 2}
        gap={child.props.gap || 12}
        onChildClick={onChildClick}
        selectedChildId={selectedChildId}
      />
    );
  }
  if (child.type === 'tabs') {
    return (
      <TabsDropZone
        parentId={child.id}
        tabs={child.props.tabs || []}
        onChildClick={onChildClick}
        selectedChildId={selectedChildId}
        onTabsChange={() => {}}
      />
    );
  }
  return <FormComponentRenderer component={child} isPreview={false} />;
}

function RowDropZone({
  parentId,
  children,
  columns,
  gap,
  onChildClick,
  selectedChildId,
}: RowDropZoneProps) {
  const removeComponent = useFormStore((state) => state.removeComponent);
  const isDragging = useFormStore((state) => state.isDragging);
  const { setNodeRef, isOver } = useDroppable({
    id: `row-${parentId}`,
    data: { parentId, isRow: true },
  });

  const handleChildDelete = (e: React.MouseEvent, childId: string) => {
    e.stopPropagation();
    removeComponent(childId);
  };

  return (
    <div
      ref={setNodeRef}
      className={`row-drop-zone ${isOver ? 'drag-over' : ''}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gap,
        minHeight: 50,
      }}
    >
      {children.length > 0 ? (
        children.map((child) => {
          const childConfig = getComponentConfig(child.type);
          // Apply only layout-related styles (width, height) to the wrapper
          const sourceStyle = child.props.style || {};
          const wrapperStyle: React.CSSProperties = {};
          if (sourceStyle.width) wrapperStyle.width = sourceStyle.width;
          if (sourceStyle.height) wrapperStyle.height = sourceStyle.height;
          if (sourceStyle.minWidth) wrapperStyle.minWidth = sourceStyle.minWidth;
          if (sourceStyle.minHeight) wrapperStyle.minHeight = sourceStyle.minHeight;
          if (sourceStyle.maxWidth) wrapperStyle.maxWidth = sourceStyle.maxWidth;
          if (sourceStyle.maxHeight) wrapperStyle.maxHeight = sourceStyle.maxHeight;
          if (sourceStyle.flex) wrapperStyle.flex = sourceStyle.flex;
          return (
            <div
              key={child.id}
              className={`row-child-component ${selectedChildId === child.id ? 'selected' : ''} ${isDragging ? 'show-drop-zones' : ''}`}
              style={wrapperStyle}
              onClick={(e) => {
                e.stopPropagation();
                onChildClick(child.id);
              }}
            >
              {/* Smart drop zones for nested children */}
              <DropZoneIndicator id={`drop-left-${child.id}`} position="left" componentId={child.id} />
              <DropZoneIndicator id={`drop-right-${child.id}`} position="right" componentId={child.id} />
              <DropZoneIndicator id={`drop-top-${child.id}`} position="top" componentId={child.id} />
              <DropZoneIndicator id={`drop-bottom-${child.id}`} position="bottom" componentId={child.id} />

              {renderNestedChild(child, onChildClick, selectedChildId)}
              <div className="child-type-badge">
                {childConfig?.icon} {childConfig?.label}
              </div>
              <button
                className="child-delete-btn"
                onClick={(e) => handleChildDelete(e, child.id)}
                title="Delete"
              >
                ×
              </button>
            </div>
          );
        })
      ) : (
        <div className="row-placeholder" style={{ gridColumn: `1 / ${columns + 1}` }}>
          Drop components here
        </div>
      )}
    </div>
  );
}

function ContainerDropZone({
  parentId,
  children,
  direction,
  gap,
  label,
  width,
  height,
  fillSpace,
  onChildClick,
  selectedChildId,
}: ContainerDropZoneProps) {
  const removeComponent = useFormStore((state) => state.removeComponent);
  const isDragging = useFormStore((state) => state.isDragging);
  const { setNodeRef, isOver } = useDroppable({
    id: `container-${parentId}`,
    data: { parentId, isContainer: true },
  });

  const handleChildDelete = (e: React.MouseEvent, childId: string) => {
    e.stopPropagation();
    removeComponent(childId);
  };

  return (
    <div
      ref={setNodeRef}
      className={`container-drop-zone ${isOver ? 'drag-over' : ''} ${label ? 'has-label' : ''} ${fillSpace !== false ? 'fill-space' : ''}`}
      style={{
        display: 'flex',
        flexDirection: direction || 'column',
        gap: gap,
        minHeight: 50,
        width: width || undefined,
        height: height || undefined,
      }}
    >
      {label && <div className="container-label">{label}</div>}
      {children.length > 0 ? (
        children.map((child) => {
          const childConfig = getComponentConfig(child.type);
          // Apply only layout-related styles (width, height) to the wrapper
          const sourceStyle = child.props.style || {};
          const wrapperStyle: React.CSSProperties = {};
          if (sourceStyle.width) wrapperStyle.width = sourceStyle.width;
          if (sourceStyle.height) wrapperStyle.height = sourceStyle.height;
          if (sourceStyle.minWidth) wrapperStyle.minWidth = sourceStyle.minWidth;
          if (sourceStyle.minHeight) wrapperStyle.minHeight = sourceStyle.minHeight;
          if (sourceStyle.maxWidth) wrapperStyle.maxWidth = sourceStyle.maxWidth;
          if (sourceStyle.maxHeight) wrapperStyle.maxHeight = sourceStyle.maxHeight;
          if (sourceStyle.flex) wrapperStyle.flex = sourceStyle.flex;
          return (
            <div
              key={child.id}
              className={`container-child-component ${selectedChildId === child.id ? 'selected' : ''} ${isDragging ? 'show-drop-zones' : ''}`}
              style={wrapperStyle}
              onClick={(e) => {
                e.stopPropagation();
                onChildClick(child.id);
              }}
            >
              {/* Smart drop zones for nested children */}
              <DropZoneIndicator id={`drop-left-${child.id}`} position="left" componentId={child.id} />
              <DropZoneIndicator id={`drop-right-${child.id}`} position="right" componentId={child.id} />
              <DropZoneIndicator id={`drop-top-${child.id}`} position="top" componentId={child.id} />
              <DropZoneIndicator id={`drop-bottom-${child.id}`} position="bottom" componentId={child.id} />

              {renderNestedChild(child, onChildClick, selectedChildId)}
              <div className="child-type-badge">
                {childConfig?.icon} {childConfig?.label}
              </div>
              <button
                className="child-delete-btn"
                onClick={(e) => handleChildDelete(e, child.id)}
                title="Delete"
              >
                ×
              </button>
            </div>
          );
        })
      ) : (
        <div className="container-placeholder">
          Drop components here
        </div>
      )}
    </div>
  );
}

function TabsDropZone({
  parentId,
  tabs,
  onChildClick,
  selectedChildId,
  onTabsChange,
}: TabsDropZoneProps) {
  const [activeTabId, setActiveTabId] = React.useState(tabs[0]?.id || '');
  const removeComponent = useFormStore((state) => state.removeComponent);
  const isDragging = useFormStore((state) => state.isDragging);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];
  const activeTabChildren = activeTab?.children || [];

  const { setNodeRef, isOver } = useDroppable({
    id: `tabs-${parentId}-${activeTabId}`,
    data: { parentId, isTab: true, tabId: activeTabId },
  });

  const handleChildDelete = (e: React.MouseEvent, childId: string) => {
    e.stopPropagation();
    removeComponent(childId);
  };

  return (
    <div className="tabs-drop-zone">
      <div className="tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveTabId(tab.id);
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        ref={setNodeRef}
        className={`tab-content ${isOver ? 'drag-over' : ''}`}
      >
        {activeTabChildren.length > 0 ? (
          activeTabChildren.map((child) => {
            const childConfig = getComponentConfig(child.type);
            const sourceStyle = child.props.style || {};
            const wrapperStyle: React.CSSProperties = {};
            if (sourceStyle.width) wrapperStyle.width = sourceStyle.width;
            if (sourceStyle.height) wrapperStyle.height = sourceStyle.height;
            if (sourceStyle.minWidth) wrapperStyle.minWidth = sourceStyle.minWidth;
            if (sourceStyle.minHeight) wrapperStyle.minHeight = sourceStyle.minHeight;
            if (sourceStyle.maxWidth) wrapperStyle.maxWidth = sourceStyle.maxWidth;
            if (sourceStyle.maxHeight) wrapperStyle.maxHeight = sourceStyle.maxHeight;
            if (sourceStyle.flex) wrapperStyle.flex = sourceStyle.flex;
            return (
              <div
                key={child.id}
                className={`tab-child-component ${selectedChildId === child.id ? 'selected' : ''} ${isDragging ? 'show-drop-zones' : ''}`}
                style={wrapperStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  onChildClick(child.id);
                }}
              >
                {/* Smart drop zones for nested children */}
                <DropZoneIndicator id={`drop-left-${child.id}`} position="left" componentId={child.id} />
                <DropZoneIndicator id={`drop-right-${child.id}`} position="right" componentId={child.id} />
                <DropZoneIndicator id={`drop-top-${child.id}`} position="top" componentId={child.id} />
                <DropZoneIndicator id={`drop-bottom-${child.id}`} position="bottom" componentId={child.id} />

                {renderNestedChild(child, onChildClick, selectedChildId)}
                <div className="child-type-badge">
                  {childConfig?.icon} {childConfig?.label}
                </div>
                <button
                  className="child-delete-btn"
                  onClick={(e) => handleChildDelete(e, child.id)}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            );
          })
        ) : (
          <div className="tab-placeholder">
            Drop components here
          </div>
        )}
      </div>
    </div>
  );
}

// Drop zone indicator component
interface DropZoneIndicatorProps {
  id: string;
  position: 'left' | 'right' | 'top' | 'bottom';
  componentId: string;
}

const DropZoneIndicator: React.FC<DropZoneIndicatorProps> = ({ id, position, componentId }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      targetComponentId: componentId,
      dropPosition: position,
      isSmartDropZone: true,
    },
  });

  const isDragging = useFormStore((state) => state.isDragging);

  // Always render with dimensions, but hide visually when not dragging
  return (
    <div
      ref={setNodeRef}
      className={`smart-drop-zone smart-drop-zone-${position} ${isOver ? 'active' : ''}`}
      style={{
        opacity: isDragging ? 1 : 0,
        pointerEvents: isDragging ? 'auto' : 'none',
      }}
    />
  );
};

const SortableComponent: React.FC<SortableComponentProps> = ({
  component,
  isSelected,
  onClick,
  onChildClick,
  selectedChildId,
}) => {
  const removeComponent = useFormStore((state) => state.removeComponent);
  const isDragging = useFormStore((state) => state.isDragging);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isThisDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isThisDragging ? 0.5 : 1,
  };

  const config = getComponentConfig(component.type);
  const isLayoutComponent = component.type === 'row' || component.type === 'container' || component.type === 'tabs';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeComponent(component.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-component ${isSelected ? 'selected' : ''} ${isThisDragging ? 'dragging' : ''} ${isLayoutComponent ? 'layout-component' : ''} ${isDragging && !isThisDragging ? 'show-drop-zones' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Smart drop zones */}
      <DropZoneIndicator id={`drop-left-${component.id}`} position="left" componentId={component.id} />
      <DropZoneIndicator id={`drop-right-${component.id}`} position="right" componentId={component.id} />
      <DropZoneIndicator id={`drop-top-${component.id}`} position="top" componentId={component.id} />
      <DropZoneIndicator id={`drop-bottom-${component.id}`} position="bottom" componentId={component.id} />

      <div className="component-drag-handle" {...attributes} {...listeners}>
        <span className="drag-icon">⋮⋮</span>
      </div>
      <div className={`component-content ${isLayoutComponent ? 'layout-content' : ''}`}>
        {component.type === 'row' ? (
          <RowDropZone
            parentId={component.id}
            children={component.children || []}
            columns={component.props.columns || 2}
            gap={component.props.gap || 12}
            onChildClick={onChildClick}
            selectedChildId={selectedChildId}
          />
        ) : component.type === 'container' ? (
          <ContainerDropZone
            parentId={component.id}
            children={component.children || []}
            direction={component.props.direction || 'column'}
            gap={component.props.gap || 16}
            label={component.props.label}
            width={component.props.width}
            height={component.props.height}
            fillSpace={component.props.fillSpace}
            onChildClick={onChildClick}
            selectedChildId={selectedChildId}
          />
        ) : component.type === 'tabs' ? (
          <TabsDropZone
            parentId={component.id}
            tabs={component.props.tabs || []}
            onChildClick={onChildClick}
            selectedChildId={selectedChildId}
            onTabsChange={() => {}}
          />
        ) : (
          <FormComponentRenderer component={component} isPreview={false} />
        )}
      </div>
      <div className="component-type-badge">
        {config?.icon} {config?.label}
      </div>
      <button
        className="component-delete-btn"
        onClick={handleDelete}
        title="Delete"
      >
        ×
      </button>
    </div>
  );
};

interface FormCanvasProps {
  hideHeader?: boolean;
}

export const FormCanvas: React.FC<FormCanvasProps> = ({ hideHeader = false }) => {
  const { schema, selectedComponentId, selectComponent } =
    useFormStore();
  const setSchemaState = useFormStore((state) => state.setSchema);
  const savedSchema = useFormStore((state) => state.savedSchema);

  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas',
  });

  const handleCanvasClick = () => {
    selectComponent(null);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSchema = { ...schema, code: e.target.value };
    setSchemaState(newSchema);
    // Mark as changed by comparing with savedSchema
    useFormStore.setState({
      hasUnsavedChanges: JSON.stringify(newSchema) !== JSON.stringify(savedSchema)
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSchema = { ...schema, name: e.target.value };
    setSchemaState(newSchema);
    // Mark as changed by comparing with savedSchema
    useFormStore.setState({
      hasUnsavedChanges: JSON.stringify(newSchema) !== JSON.stringify(savedSchema)
    });
  };

  return (
    <div
      ref={setNodeRef}
      className={`form-canvas ${isOver ? 'drag-over' : ''}`}
      onClick={handleCanvasClick}
    >
      {!hideHeader && (
        <div className="canvas-header" onClick={(e) => e.stopPropagation()}>
          <div className="canvas-header-row">
            <TextField
              label="Code"
              value={schema.code || ''}
              onChange={handleCodeChange}
              size="small"
              className="canvas-code-input"
            />
            <TextField
              label="Name"
              value={schema.name || ''}
              onChange={handleNameChange}
              size="small"
              className="canvas-name-input"
            />
          </div>
        </div>
      )}

      {schema.components.length === 0 ? (
        <div className="canvas-empty">
          <div className="empty-icon">+</div>
          <p>Drag components here to build your form</p>
        </div>
      ) : (
        <SortableContext
          items={schema.components.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="canvas-components">
            {schema.components.map((component) => (
              <SortableComponent
                key={component.id}
                component={component}
                isSelected={selectedComponentId === component.id}
                onClick={() => selectComponent(component.id)}
                onChildClick={(id) => selectComponent(id)}
                selectedChildId={selectedComponentId}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
};
