import React, { useState } from 'react';
import { FormComponent, FormSchema, SelectOption, GridColumn } from '../types';
import { getComponentConfig } from '../utils/componentConfig';
import './PreviewRightPanel.css';

interface PreviewRightPanelProps {
  formData: Record<string, any>;
  schema: FormSchema;
  selectedComponentId: string | null;
  style?: React.CSSProperties;
}

type TabType = 'data' | 'properties' | 'styles' | 'actions' | 'rules';

export const PreviewRightPanel: React.FC<PreviewRightPanelProps> = ({
  formData,
  schema,
  selectedComponentId,
  style,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('data');

  const findComponentById = (components: FormComponent[], id: string): FormComponent | undefined => {
    for (const comp of components) {
      if (comp.id === id) return comp;
      if (comp.children) {
        const found = findComponentById(comp.children, id);
        if (found) return found;
      }
      // Also search inside tabs
      if (comp.props.tabs) {
        for (const tab of comp.props.tabs) {
          if (tab.children) {
            const found = findComponentById(tab.children, id);
            if (found) return found;
          }
        }
      }
    }
    return undefined;
  };

  const selectedComponent = selectedComponentId
    ? findComponentById(schema.components, selectedComponentId)
    : undefined;

  const config = selectedComponent ? getComponentConfig(selectedComponent.type) : null;

  const renderPropertyValue = (value: any): string => {
    if (value === undefined || value === null) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return JSON.stringify(value);
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const renderProperties = () => {
    if (!selectedComponent) {
      return (
        <div className="prp-empty">
          <p>Select a component to view its properties</p>
        </div>
      );
    }

    const { type, props } = selectedComponent;

    return (
      <div className="prp-property-list">
        {['input', 'textarea', 'number', 'email', 'password', 'date', 'select', 'radio', 'file'].includes(type) && (
          <>
            <div className="prp-property-row">
              <span className="prp-property-label">Label</span>
              <span className="prp-property-value">{props.label || '-'}</span>
            </div>
            <div className="prp-property-row">
              <span className="prp-property-label">Required</span>
              <span className="prp-property-value">{props.required ? 'Yes' : 'No'}</span>
            </div>
            <div className="prp-property-row">
              <span className="prp-property-label">Disabled</span>
              <span className="prp-property-value">{props.disabled ? 'Yes' : 'No'}</span>
            </div>
          </>
        )}

        {['input', 'textarea', 'number', 'email', 'password'].includes(type) && (
          <div className="prp-property-row">
            <span className="prp-property-label">Placeholder</span>
            <span className="prp-property-value">{props.placeholder || '-'}</span>
          </div>
        )}

        {['input', 'textarea', 'number', 'email', 'password', 'date'].includes(type) && (
          <div className="prp-property-row">
            <span className="prp-property-label">Default Value</span>
            <span className="prp-property-value">{renderPropertyValue(props.defaultValue)}</span>
          </div>
        )}

        {['select', 'radio'].includes(type) && (
          <>
            <div className="prp-property-row">
              <span className="prp-property-label">Options</span>
              <span className="prp-property-value">
                {(props.options || []).map((o: SelectOption) => o.label).join(', ') || '-'}
              </span>
            </div>
            <div className="prp-property-row">
              <span className="prp-property-label">Default Value</span>
              <span className="prp-property-value">{renderPropertyValue(props.defaultValue)}</span>
            </div>
          </>
        )}

        {type === 'checkbox' && (
          <>
            <div className="prp-property-row">
              <span className="prp-property-label">Text</span>
              <span className="prp-property-value">{props.text || '-'}</span>
            </div>
            <div className="prp-property-row">
              <span className="prp-property-label">Checked by default</span>
              <span className="prp-property-value">{props.defaultValue ? 'Yes' : 'No'}</span>
            </div>
            <div className="prp-property-row">
              <span className="prp-property-label">Required</span>
              <span className="prp-property-value">{props.required ? 'Yes' : 'No'}</span>
            </div>
          </>
        )}

        {type === 'button' && (
          <>
            <div className="prp-property-row">
              <span className="prp-property-label">Button Text</span>
              <span className="prp-property-value">{props.buttonText || '-'}</span>
            </div>
            <div className="prp-property-row">
              <span className="prp-property-label">Type</span>
              <span className="prp-property-value">{props.buttonType || 'button'}</span>
            </div>
          </>
        )}

        {type === 'heading' && (
          <>
            <div className="prp-property-row">
              <span className="prp-property-label">Text</span>
              <span className="prp-property-value">{props.text || '-'}</span>
            </div>
            <div className="prp-property-row">
              <span className="prp-property-label">Level</span>
              <span className="prp-property-value">H{props.headingLevel || 2}</span>
            </div>
          </>
        )}

        {type === 'paragraph' && (
          <div className="prp-property-row">
            <span className="prp-property-label">Text</span>
            <span className="prp-property-value">{props.text || '-'}</span>
          </div>
        )}

        {type === 'container' && (
          <>
            <div className="prp-property-row">
              <span className="prp-property-label">Direction</span>
              <span className="prp-property-value">{props.direction === 'row' ? 'Horizontal' : 'Vertical'}</span>
            </div>
            <div className="prp-property-row">
              <span className="prp-property-label">Gap</span>
              <span className="prp-property-value">{props.gap || 16}px</span>
            </div>
          </>
        )}

        {type === 'row' && (
          <>
            <div className="prp-property-row">
              <span className="prp-property-label">Columns</span>
              <span className="prp-property-value">{props.columns || 2}</span>
            </div>
            <div className="prp-property-row">
              <span className="prp-property-label">Gap</span>
              <span className="prp-property-value">{props.gap || 12}px</span>
            </div>
          </>
        )}

        {type === 'grid' && (
          <>
            <div className="prp-property-row">
              <span className="prp-property-label">Label</span>
              <span className="prp-property-value">{props.label || '-'}</span>
            </div>
            <div className="prp-property-row">
              <span className="prp-property-label">Columns</span>
              <span className="prp-property-value">
                {(props.gridColumns || []).map((c: GridColumn) => c.label).join(', ') || '-'}
              </span>
            </div>
            <div className="prp-property-row">
              <span className="prp-property-label">Min Rows</span>
              <span className="prp-property-value">{props.minRows || 1}</span>
            </div>
            <div className="prp-property-row">
              <span className="prp-property-label">Max Rows</span>
              <span className="prp-property-value">{props.maxRows || 100}</span>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderStyles = () => {
    if (!selectedComponent) {
      return (
        <div className="prp-empty">
          <p>Select a component to view its styles</p>
        </div>
      );
    }

    const { props } = selectedComponent;
    const style = props.style || {};

    return (
      <div className="prp-property-list">
        <div className="prp-property-row">
          <span className="prp-property-label">Width</span>
          <span className="prp-property-value">{style.width || 'auto'}</span>
        </div>
        <div className="prp-property-row">
          <span className="prp-property-label">Height</span>
          <span className="prp-property-value">{style.height || 'auto'}</span>
        </div>
        <div className="prp-property-row">
          <span className="prp-property-label">Margin</span>
          <span className="prp-property-value">{style.margin || '-'}</span>
        </div>
        <div className="prp-property-row">
          <span className="prp-property-label">Padding</span>
          <span className="prp-property-value">{style.padding || '-'}</span>
        </div>
        <div className="prp-property-row">
          <span className="prp-property-label">Background</span>
          <span className="prp-property-value">{style.backgroundColor || '-'}</span>
        </div>
        <div className="prp-property-row">
          <span className="prp-property-label">Text Color</span>
          <span className="prp-property-value">{style.color || '-'}</span>
        </div>
        <div className="prp-property-row">
          <span className="prp-property-label">Font Size</span>
          <span className="prp-property-value">{style.fontSize || '-'}</span>
        </div>
        <div className="prp-property-row">
          <span className="prp-property-label">Border</span>
          <span className="prp-property-value">{style.border || '-'}</span>
        </div>
        <div className="prp-property-row">
          <span className="prp-property-label">Border Radius</span>
          <span className="prp-property-value">{style.borderRadius || '-'}</span>
        </div>
        <div className="prp-property-row">
          <span className="prp-property-label">CSS Class</span>
          <span className="prp-property-value">{props.className || '-'}</span>
        </div>
      </div>
    );
  };

  const renderActions = () => {
    if (!selectedComponent) {
      return (
        <div className="prp-empty">
          <p>Select a component to view its actions</p>
        </div>
      );
    }

    const { props } = selectedComponent;

    return (
      <div className="prp-property-list">
        <div className="prp-property-row">
          <span className="prp-property-label">On Change</span>
          <span className="prp-property-value">{props.onChange ? 'Set' : '-'}</span>
        </div>
        <div className="prp-property-row">
          <span className="prp-property-label">On Focus</span>
          <span className="prp-property-value">{props.onFocus ? 'Set' : '-'}</span>
        </div>
        <div className="prp-property-row">
          <span className="prp-property-label">On Blur</span>
          <span className="prp-property-value">{props.onBlur ? 'Set' : '-'}</span>
        </div>
        {selectedComponent.type === 'button' && (
          <div className="prp-property-row">
            <span className="prp-property-label">On Click</span>
            <span className="prp-property-value">{props.onClick ? 'Set' : '-'}</span>
          </div>
        )}
      </div>
    );
  };

  const renderRules = () => {
    if (!selectedComponent) {
      return (
        <div className="prp-empty">
          <p>Select a component to view its rules</p>
        </div>
      );
    }

    const { props } = selectedComponent;

    return (
      <div className="prp-property-list">
        <div className="prp-property-row">
          <span className="prp-property-label">Visibility</span>
          <span className="prp-property-value">{props.visibilityCondition || '-'}</span>
        </div>
        <div className="prp-property-row">
          <span className="prp-property-label">Enabled</span>
          <span className="prp-property-value">{props.enabledCondition || '-'}</span>
        </div>
        <div className="prp-property-row">
          <span className="prp-property-label">Required</span>
          <span className="prp-property-value">{props.requiredCondition || '-'}</span>
        </div>
        <div className="prp-property-row">
          <span className="prp-property-label">Validation</span>
          <span className="prp-property-value">{props.validationRule || '-'}</span>
        </div>
        <div className="prp-property-row">
          <span className="prp-property-label">Error Message</span>
          <span className="prp-property-value">{props.validationMessage || '-'}</span>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'data':
        return (
          <div className="prp-form-data">
            <pre className="prp-json">
              {JSON.stringify(formData, null, 2) || '{}'}
            </pre>
          </div>
        );
      case 'properties':
        return renderProperties();
      case 'styles':
        return renderStyles();
      case 'actions':
        return renderActions();
      case 'rules':
        return renderRules();
      default:
        return null;
    }
  };

  return (
    <div className="preview-right-panel" style={style}>
      {selectedComponent && (
        <div className="prp-header">
          <span className="prp-component-icon">{config?.icon}</span>
          <span className="prp-component-type">{config?.label}</span>
        </div>
      )}

      <div className="prp-tabs">
        <button
          className={`prp-tab ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          Data
        </button>
        <button
          className={`prp-tab ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </button>
        <button
          className={`prp-tab ${activeTab === 'styles' ? 'active' : ''}`}
          onClick={() => setActiveTab('styles')}
        >
          Styles
        </button>
        <button
          className={`prp-tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Actions
        </button>
        <button
          className={`prp-tab ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          Rules
        </button>
      </div>

      <div className="prp-content">
        {renderTabContent()}
      </div>
    </div>
  );
};
