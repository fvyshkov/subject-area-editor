import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { ComponentConfig, ComponentType } from '../types';
import { componentConfigs, getComponentsByCategory } from '../utils/componentConfig';
import './ComponentPalette.css';

interface DraggableComponentProps {
  config: ComponentConfig;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ config }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${config.type}`,
    data: {
      type: config.type,
      fromPalette: true,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`palette-item ${isDragging ? 'dragging' : ''}`}
      data-testid={`palette-${config.type}`}
    >
      <span className="palette-item-icon">{config.icon}</span>
      <span className="palette-item-label">{config.label}</span>
    </div>
  );
};

export const ComponentPalette: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(() => {
    return localStorage.getItem('componentPaletteMinimized') === 'true';
  });

  const toggleMinimized = () => {
    const newValue = !isMinimized;
    setIsMinimized(newValue);
    localStorage.setItem('componentPaletteMinimized', String(newValue));
  };
  const inputComponents = getComponentsByCategory('input');
  const layoutComponents = getComponentsByCategory('layout');
  const staticComponents = getComponentsByCategory('static');

  return (
    <div className={`component-palette ${isMinimized ? 'minimized' : ''}`}>
      <div className="palette-header">
        <span className="palette-header-title">Components</span>
        <button
          className="palette-toggle-btn"
          onClick={toggleMinimized}
          title={isMinimized ? 'Expand' : 'Minimize'}
        >
          {isMinimized ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
        </button>
      </div>

      {!isMinimized && (
        <div className="palette-content">
          <div className="palette-section">
            <h4 className="palette-section-title">Input Fields</h4>
            <div className="palette-grid">
              {inputComponents.map((config) => (
                <DraggableComponent key={config.type} config={config} />
              ))}
            </div>
          </div>

          <div className="palette-section">
            <h4 className="palette-section-title">Layout</h4>
            <div className="palette-grid">
              {layoutComponents.map((config) => (
                <DraggableComponent key={config.type} config={config} />
              ))}
            </div>
          </div>

          <div className="palette-section">
            <h4 className="palette-section-title">Static</h4>
            <div className="palette-grid">
              {staticComponents.map((config) => (
                <DraggableComponent key={config.type} config={config} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
