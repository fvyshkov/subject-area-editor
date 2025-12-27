import React, { useState, useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { useReferenceStore, Reference, ReferenceField } from '../store/referenceStore';
import { FormComponent, SelectOption, GridColumn, FormSchema } from '../types';
import { getComponentConfig } from '../utils/componentConfig';
import { FormSelectDialog } from './FormSelectDialog';
import { API_URL } from '../config';
import './PropertiesPanel.css';

interface SavedForm {
  id: string;
  code: string | null;
  name: string;
  schema_json?: FormSchema;
}

interface PropertiesPanelProps {
  style?: React.CSSProperties;
}

type TabType = 'properties' | 'styles' | 'actions' | 'rules';

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ style }) => {
  const { schema, currentFormId, selectedComponentId, updateComponent, removeComponent, duplicateComponent, triggerFormsRefresh } =
    useFormStore();
  const { references, loadReferences } = useReferenceStore();
  const [availableForms, setAvailableForms] = useState<SavedForm[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('properties');
  const [referenceFields, setReferenceFields] = useState<Map<string, ReferenceField[]>>(new Map());
  const [rowEditorFormPickerOpen, setRowEditorFormPickerOpen] = useState(false);

  // Load references
  useEffect(() => {
    if (references.length === 0) {
      loadReferences();
    }
  }, []);

  // Helper to find component
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

  // Load reference fields when selected component has a reference
  useEffect(() => {
    if (!selectedComponentId) return;
    const comp = findComponentById(schema.components, selectedComponentId);
    const refId = comp?.props?.referenceId;
    if (refId && !referenceFields.has(refId)) {
      loadRefFields(refId);
    }
  }, [selectedComponentId, schema]);

  // Load reference fields when needed
  const loadRefFields = async (refId: string) => {
    if (referenceFields.has(refId)) return referenceFields.get(refId)!;
    try {
      const response = await fetch(`${API_URL}/api/references/${refId}/fields`);
      if (response.ok) {
        const fields = await response.json();
        setReferenceFields(prev => new Map(prev).set(refId, fields));
        return fields;
      }
    } catch (e) {
      console.error('Failed to load reference fields:', e);
    }
    return [];
  };

  // Get fields for a reference (load if not cached)
  const getRefFields = (refId: string): ReferenceField[] => {
    if (!refId) return [];
    if (!referenceFields.has(refId)) {
      loadRefFields(refId);
      return [];
    }
    return referenceFields.get(refId) || [];
  };

  // Load available forms for row editor selection (with full schema)
  // Reload when currentFormId changes to get fresh data
  useEffect(() => {
    const loadForms = async () => {
      try {
        const listRes = await fetch(`${API_URL}/api/forms`);
        if (!listRes.ok) return;
        const list = await listRes.json();

        // Fetch full details for each form to get schema_json
        const fullForms = await Promise.all(
          list.map(async (form: SavedForm) => {
            try {
              const res = await fetch(`${API_URL}/api/forms/${form.id}`);
              if (res.ok) return res.json();
              return form;
            } catch {
              return form;
            }
          })
        );
        setAvailableForms(fullForms);
      } catch {
        setAvailableForms([]);
      }
    };
    loadForms();
  }, [currentFormId]);

  // Get form fields for the selected row editor form
  const getFormFields = (formId: string | null): { id: string; label: string }[] => {
    if (!formId) return [];
    const form = availableForms.find(f => f.id === formId);
    if (!form?.schema_json?.components) return [];

    const fields: { id: string; label: string }[] = [];
    const extractFields = (components: FormComponent[]) => {
      components.forEach(comp => {
        // Skip non-input components
        if (['heading', 'paragraph', 'divider', 'button', 'container', 'row', 'grid'].includes(comp.type)) {
          if (comp.children) extractFields(comp.children);
          return;
        }
        fields.push({
          id: comp.id,
          label: comp.props.label || comp.id,
        });
      });
    };
    extractFields(form.schema_json.components);
    return fields;
  };

  const selectedComponent = selectedComponentId
    ? findComponentById(schema.components, selectedComponentId)
    : undefined;

  if (!selectedComponent) {
    return (
      <div className="properties-panel">
        <div className="properties-empty">
          <p>Select a component to edit its properties</p>
        </div>
      </div>
    );
  }

  const config = getComponentConfig(selectedComponent.type);

  const handlePropChange = (propName: string, value: any) => {
    updateComponent(selectedComponent.id, {
      props: { ...selectedComponent.props, [propName]: value },
    });
  };

  const handleOptionChange = (index: number, field: 'label' | 'value', newValue: string) => {
    const options = [...(selectedComponent.props.options || [])];
    options[index] = { ...options[index], [field]: newValue };
    handlePropChange('options', options);
  };

  const addOption = () => {
    const options = [...(selectedComponent.props.options || [])];
    options.push({ label: `Option ${options.length + 1}`, value: `option${options.length + 1}` });
    handlePropChange('options', options);
  };

  const removeOption = (index: number) => {
    const options = [...(selectedComponent.props.options || [])];
    options.splice(index, 1);
    handlePropChange('options', options);
  };

  // Normalize grid columns to ensure they have id, label, type
  const normalizeGridColumns = (cols: any[]): GridColumn[] => {
    return (cols || []).map((col: any, idx: number) => ({
      id: col.id || col.value || `col-${idx}`,
      label: col.label || '',
      type: col.type || 'text',
      options: col.options,
      computeScript: col.computeScript,
      iconSourceColumn: col.iconSourceColumn,
      iconMapping: col.iconMapping,
      width: col.width,
      wrap: col.wrap,
    }));
  };

  const renderPropertyEditor = () => {
    const { type, props } = selectedComponent;

    return (
      <>
        {/* Common properties for most input types */}
        {['input', 'textarea', 'number', 'email', 'password', 'date', 'select', 'radio', 'file', 'picture'].includes(type) && (
          <>
            <div className="property-group">
              <label className="property-label">Label</label>
              <input
                type="text"
                className="property-input"
                value={props.label || ''}
                onChange={(e) => handlePropChange('label', e.target.value)}
              />
            </div>
            <div className="property-group">
              <label className="property-label">
                <input
                  type="checkbox"
                  checked={props.required || false}
                  onChange={(e) => handlePropChange('required', e.target.checked)}
                />
                Required
              </label>
            </div>
            <div className="property-group">
              <label className="property-label">
                <input
                  type="checkbox"
                  checked={props.disabled || false}
                  onChange={(e) => handlePropChange('disabled', e.target.checked)}
                />
                Disabled
              </label>
            </div>
          </>
        )}

        {/* Placeholder for text inputs */}
        {['input', 'textarea', 'number', 'email', 'password'].includes(type) && (
          <div className="property-group">
            <label className="property-label">Placeholder</label>
            <input
              type="text"
              className="property-input"
              value={props.placeholder || ''}
              onChange={(e) => handlePropChange('placeholder', e.target.value)}
            />
          </div>
        )}

        {/* Default value for inputs */}
        {['input', 'textarea', 'number', 'email', 'password', 'date'].includes(type) && (
          <div className="property-group">
            <label className="property-label">Default Value</label>
            <input
              type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
              className="property-input"
              value={String(props.defaultValue ?? '')}
              onChange={(e) => handlePropChange('defaultValue', e.target.value)}
            />
          </div>
        )}

        {/* Reference picker settings for text inputs */}
        {['input', 'textarea'].includes(type) && (
          <>
            <div className="property-group">
              <label className="property-label">Reference</label>
              <select
                className="property-select"
                value={props.referenceId || ''}
                onChange={(e) => {
                  const newRefId = e.target.value || null;
                  handlePropChange('referenceId', newRefId);
                  // Clear field mappings when reference changes
                  if (newRefId !== props.referenceId) {
                    handlePropChange('referenceValueField', null);
                    handlePropChange('referenceDisplayField', null);
                    handlePropChange('referenceFieldMapping', {});
                  }
                  // Load fields for new reference
                  if (newRefId) {
                    loadRefFields(newRefId);
                  }
                }}
              >
                <option value="">None</option>
                {references.map((ref) => (
                  <option key={ref.id} value={ref.id}>{ref.name}</option>
                ))}
              </select>
            </div>
            {props.referenceId && (
              <>
                <div className="property-group">
                  <label className="property-label">Value Field</label>
                  <select
                    className="property-select"
                    value={props.referenceValueField || ''}
                    onChange={(e) => handlePropChange('referenceValueField', e.target.value || null)}
                  >
                    <option value="">Select field...</option>
                    {getRefFields(props.referenceId || '').map((field) => (
                      <option key={field.id} value={field.id}>{field.name}</option>
                    ))}
                  </select>
                  <p className="property-hint">Field value stored when selecting</p>
                </div>
                <div className="property-group">
                  <label className="property-label">Display Field</label>
                  <select
                    className="property-select"
                    value={props.referenceDisplayField || ''}
                    onChange={(e) => handlePropChange('referenceDisplayField', e.target.value || null)}
                  >
                    <option value="">Same as value</option>
                    {getRefFields(props.referenceId || '').map((field) => (
                      <option key={field.id} value={field.id}>{field.name}</option>
                    ))}
                  </select>
                  <p className="property-hint">Field shown in input (optional)</p>
                </div>
                <div className="property-group">
                  <label className="property-label">Auto-fill Mapping</label>
                  <div className="reference-mapping-list">
                    {schema.components.filter(c =>
                      ['input', 'textarea', 'number', 'email', 'select', 'date'].includes(c.type) &&
                      c.id !== selectedComponent.id
                    ).map((formField) => {
                      const currentMapping = (props.referenceFieldMapping as Record<string, string>) || {};
                      return (
                        <div key={formField.id} className="reference-mapping-row">
                          <span className="reference-mapping-label">{formField.props.label || formField.id}</span>
                          <span className="reference-mapping-arrow">←</span>
                          <select
                            className="property-select small"
                            value={currentMapping[formField.id] || ''}
                            onChange={(e) => {
                              const newMapping = { ...currentMapping };
                              if (e.target.value) {
                                newMapping[formField.id] = e.target.value;
                              } else {
                                delete newMapping[formField.id];
                              }
                              handlePropChange('referenceFieldMapping', newMapping);
                            }}
                          >
                            <option value="">-</option>
                            {getRefFields(props.referenceId || '').map((field) => (
                              <option key={field.id} value={field.id}>{field.name}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                  <p className="property-hint">Fill other form fields from reference</p>
                </div>
                <div className="property-group">
                  <label className="property-label">Filter Parameter</label>
                  <div className="filter-params-config">
                    <select
                      className="property-select"
                      value={(props.referenceFilterParams as any)?.[0]?.fieldCode || ''}
                      onChange={(e) => {
                        const fieldCode = e.target.value;
                        if (fieldCode) {
                          const currentParams = (props.referenceFilterParams as any) || [];
                          const newParams = [{
                            ...currentParams[0],
                            fieldCode,
                            sourceType: currentParams[0]?.sourceType || 'static',
                          }];
                          handlePropChange('referenceFilterParams', newParams);
                        } else {
                          handlePropChange('referenceFilterParams', null);
                        }
                      }}
                    >
                      <option value="">No filter</option>
                      {getRefFields(props.referenceId || '').map((field) => (
                        <option key={field.id} value={field.id}>{field.name}</option>
                      ))}
                    </select>
                    {(props.referenceFilterParams as any)?.[0]?.fieldCode && (
                      <>
                        <select
                          className="property-select"
                          value={(props.referenceFilterParams as any)?.[0]?.sourceType || 'static'}
                          onChange={(e) => {
                            const currentParams = (props.referenceFilterParams as any) || [];
                            const newParams = [{
                              ...currentParams[0],
                              sourceType: e.target.value,
                            }];
                            handlePropChange('referenceFilterParams', newParams);
                          }}
                        >
                          <option value="static">Static value</option>
                          <option value="context">From context (clientType)</option>
                          <option value="field">From form field</option>
                        </select>
                        {(props.referenceFilterParams as any)?.[0]?.sourceType === 'static' && (
                          <input
                            type="text"
                            className="property-input"
                            placeholder="Static value..."
                            value={(props.referenceFilterParams as any)?.[0]?.staticValue || ''}
                            onChange={(e) => {
                              const currentParams = (props.referenceFilterParams as any) || [];
                              const newParams = [{
                                ...currentParams[0],
                                staticValue: e.target.value,
                              }];
                              handlePropChange('referenceFilterParams', newParams);
                            }}
                          />
                        )}
                        {(props.referenceFilterParams as any)?.[0]?.sourceType === 'context' && (
                          <input
                            type="text"
                            className="property-input"
                            placeholder="Context key (e.g. clientType)"
                            value={(props.referenceFilterParams as any)?.[0]?.contextKey || 'clientType'}
                            onChange={(e) => {
                              const currentParams = (props.referenceFilterParams as any) || [];
                              const newParams = [{
                                ...currentParams[0],
                                contextKey: e.target.value,
                              }];
                              handlePropChange('referenceFilterParams', newParams);
                            }}
                          />
                        )}
                        {(props.referenceFilterParams as any)?.[0]?.sourceType === 'field' && (
                          <select
                            className="property-select"
                            value={(props.referenceFilterParams as any)?.[0]?.sourceFieldId || ''}
                            onChange={(e) => {
                              const currentParams = (props.referenceFilterParams as any) || [];
                              const newParams = [{
                                ...currentParams[0],
                                sourceFieldId: e.target.value,
                              }];
                              handlePropChange('referenceFilterParams', newParams);
                            }}
                          >
                            <option value="">Select field...</option>
                            {schema.components.filter(c =>
                              ['input', 'select', 'radio'].includes(c.type) &&
                              c.id !== selectedComponent.id
                            ).map((formField) => (
                              <option key={formField.id} value={formField.id}>
                                {formField.props.label || formField.id}
                              </option>
                            ))}
                          </select>
                        )}
                      </>
                    )}
                  </div>
                  <p className="property-hint">Filter reference data by parameter</p>
                </div>
              </>
            )}
          </>
        )}

        {/* Options for select/radio */}
        {['select', 'radio'].includes(type) && (
          <>
            <div className="property-group">
              <label className="property-label">Options</label>
              <div className="options-list">
                {props.options?.map((opt: SelectOption, idx: number) => (
                  <div key={idx} className="option-row">
                    <input
                      type="text"
                      className="property-input small"
                      placeholder="Label"
                      value={opt.label}
                      onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                    />
                    <input
                      type="text"
                      className="property-input small"
                      placeholder="Value"
                      value={opt.value}
                      onChange={(e) => handleOptionChange(idx, 'value', e.target.value)}
                    />
                    <button
                      type="button"
                      className="option-remove-btn"
                      onClick={() => removeOption(idx)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" className="add-option-btn" onClick={addOption}>
                  + Add Option
                </button>
              </div>
            </div>
            <div className="property-group">
              <label className="property-label">Default Value</label>
              <select
                className="property-select"
                value={String(props.defaultValue ?? '')}
                onChange={(e) => handlePropChange('defaultValue', e.target.value)}
              >
                <option value="">No default</option>
                {props.options?.map((opt: SelectOption, idx: number) => (
                  <option key={idx} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Picture properties */}
        {type === 'picture' && (
          <>
            <div className="property-group">
              <label className="property-label">Placeholder Text</label>
              <input
                type="text"
                className="property-input"
                placeholder="Click to upload"
                value={props.placeholderText || ''}
                onChange={(e) => handlePropChange('placeholderText', e.target.value)}
              />
            </div>
            <div className="property-group">
              <label className="property-label">Image Fit</label>
              <select
                className="property-select"
                value={props.objectFit || 'contain'}
                onChange={(e) => handlePropChange('objectFit', e.target.value)}
              >
                <option value="contain">Contain (fit inside)</option>
                <option value="cover">Cover (fill, may crop)</option>
                <option value="fill">Fill (stretch)</option>
                <option value="none">None (original size)</option>
                <option value="scale-down">Scale Down</option>
              </select>
            </div>
            <div className="property-group">
              <label className="property-label">Max Size (MB)</label>
              <input
                type="number"
                className="property-input"
                min={1}
                max={50}
                value={props.maxSize || 5}
                onChange={(e) => handlePropChange('maxSize', Number(e.target.value))}
              />
            </div>
          </>
        )}

        {/* Checkbox text */}
        {type === 'checkbox' && (
          <>
            <div className="property-group">
              <label className="property-label">Text</label>
              <input
                type="text"
                className="property-input"
                value={props.text || ''}
                onChange={(e) => handlePropChange('text', e.target.value)}
              />
            </div>
            <div className="property-group">
              <label className="property-label">
                <input
                  type="checkbox"
                  checked={Boolean(props.defaultValue)}
                  onChange={(e) => handlePropChange('defaultValue', e.target.checked)}
                />
                Checked by default
              </label>
            </div>
            <div className="property-group">
              <label className="property-label">
                <input
                  type="checkbox"
                  checked={props.required || false}
                  onChange={(e) => handlePropChange('required', e.target.checked)}
                />
                Required
              </label>
            </div>
          </>
        )}

        {/* Button properties */}
        {type === 'button' && (
          <>
            <div className="property-group">
              <label className="property-label">Button Text</label>
              <input
                type="text"
                className="property-input"
                value={props.buttonText || ''}
                onChange={(e) => handlePropChange('buttonText', e.target.value)}
              />
            </div>
            <div className="property-group">
              <label className="property-label">Type</label>
              <select
                className="property-select"
                value={props.buttonType || 'button'}
                onChange={(e) => handlePropChange('buttonType', e.target.value)}
              >
                <option value="button">Button</option>
                <option value="submit">Submit</option>
                <option value="reset">Reset</option>
              </select>
            </div>
          </>
        )}

        {/* Heading properties */}
        {type === 'heading' && (
          <>
            <div className="property-group">
              <label className="property-label">Text</label>
              <input
                type="text"
                className="property-input"
                value={props.text || ''}
                onChange={(e) => handlePropChange('text', e.target.value)}
              />
            </div>
            <div className="property-group">
              <label className="property-label">Level</label>
              <select
                className="property-select"
                value={props.headingLevel || 2}
                onChange={(e) => handlePropChange('headingLevel', Number(e.target.value))}
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
                <option value={5}>H5</option>
                <option value={6}>H6</option>
              </select>
            </div>
          </>
        )}

        {/* Paragraph properties */}
        {type === 'paragraph' && (
          <div className="property-group">
            <label className="property-label">Text</label>
            <textarea
              className="property-textarea"
              value={props.text || ''}
              onChange={(e) => handlePropChange('text', e.target.value)}
              rows={4}
            />
          </div>
        )}

        {/* Container properties */}
        {type === 'container' && (
          <>
            <div className="property-group">
              <label className="property-label">Label</label>
              <input
                type="text"
                className="property-input"
                placeholder="Container label..."
                value={props.label || ''}
                onChange={(e) => handlePropChange('label', e.target.value)}
              />
            </div>
            <div className="property-group">
              <label className="property-label">Direction</label>
              <select
                className="property-select"
                value={props.direction || 'column'}
                onChange={(e) => handlePropChange('direction', e.target.value)}
              >
                <option value="column">Vertical</option>
                <option value="row">Horizontal</option>
              </select>
            </div>
            <div className="property-group">
              <label className="property-label">Gap (px)</label>
              <input
                type="number"
                className="property-input"
                value={props.gap || 16}
                onChange={(e) => handlePropChange('gap', Number(e.target.value))}
              />
            </div>
            <div className="property-group">
              <label className="property-label">Width</label>
              <input
                type="text"
                className="property-input"
                placeholder="100%, 50%, auto..."
                value={props.width || ''}
                onChange={(e) => handlePropChange('width', e.target.value)}
              />
            </div>
            <div className="property-group">
              <label className="property-label">Height</label>
              <input
                type="text"
                className="property-input"
                placeholder="100%, 200px, auto..."
                value={props.height || ''}
                onChange={(e) => handlePropChange('height', e.target.value)}
              />
            </div>
            <div className="property-group">
              <label className="property-label">
                <input
                  type="checkbox"
                  checked={props.fillSpace !== false}
                  onChange={(e) => handlePropChange('fillSpace', e.target.checked)}
                />
                Fill available space
              </label>
            </div>
          </>
        )}

        {/* Row properties */}
        {type === 'row' && (
          <>
            <div className="property-group">
              <label className="property-label">Columns</label>
              <select
                className="property-select"
                value={props.columns || 2}
                onChange={(e) => handlePropChange('columns', Number(e.target.value))}
              >
                <option value={2}>2 columns</option>
                <option value={3}>3 columns</option>
                <option value={4}>4 columns</option>
              </select>
            </div>
            <div className="property-group">
              <label className="property-label">Gap (px)</label>
              <input
                type="number"
                className="property-input"
                value={props.gap || 12}
                onChange={(e) => handlePropChange('gap', Number(e.target.value))}
              />
            </div>
          </>
        )}

        {/* Tabs properties */}
        {type === 'tabs' && (
          <>
            <div className="property-group">
              <label className="property-label">Tabs</label>
              <div className="tabs-editor">
                {(props.tabs || []).map((tab: any, index: number) => (
                  <div key={tab.id} className="tab-editor-item">
                    <input
                      type="text"
                      className="property-input"
                      value={tab.label}
                      onChange={(e) => {
                        const newTabs = [...(props.tabs || [])];
                        newTabs[index] = { ...tab, label: e.target.value };
                        handlePropChange('tabs', newTabs);
                      }}
                    />
                    <button
                      className="tab-remove-btn"
                      onClick={() => {
                        const newTabs = (props.tabs || []).filter((_: any, i: number) => i !== index);
                        handlePropChange('tabs', newTabs);
                      }}
                      title="Remove tab"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  className="add-tab-btn"
                  onClick={() => {
                    const newTab = { id: `tab-${Date.now()}`, label: `Tab ${(props.tabs || []).length + 1}`, children: [] };
                    handlePropChange('tabs', [...(props.tabs || []), newTab]);
                  }}
                >
                  + Add Tab
                </button>
              </div>
            </div>
          </>
        )}

        {/* Computed field properties */}
        {type === 'computed' && (
          <>
            <div className="property-group">
              <label className="property-label">Label</label>
              <input
                type="text"
                className="property-input"
                value={props.label || ''}
                onChange={(e) => handlePropChange('label', e.target.value)}
              />
            </div>
            <div className="property-group">
              <label className="property-label">Compute Script</label>
              <textarea
                className="property-textarea"
                value={props.computeScript || ''}
                onChange={(e) => handlePropChange('computeScript', e.target.value)}
                rows={6}
                style={{ fontFamily: 'monospace', fontSize: '12px' }}
              />
              <p className="property-hint">
                JavaScript code. Use <code>get_field_by_name("id")</code> to read other fields.
                Return the computed value.
              </p>
            </div>
          </>
        )}

        {/* Grid properties */}
        {type === 'grid' && (
          <>
            <div className="property-group">
              <label className="property-label">Label</label>
              <input
                type="text"
                className="property-input"
                value={props.label || ''}
                onChange={(e) => handlePropChange('label', e.target.value)}
              />
            </div>
            <div className="property-group">
              <label className="property-label">Columns</label>
              <div className="grid-columns-list">
                {normalizeGridColumns(props.gridColumns as any[]).map((col: GridColumn, idx: number) => (
                  <div key={col.id} className="grid-column-item">
                    <div className="grid-column-row">
                      <input
                        type="text"
                        className="property-input small"
                        placeholder="Column name"
                        value={col.label}
                        onChange={(e) => {
                          const cols = normalizeGridColumns(props.gridColumns as any[]);
                          cols[idx] = { ...cols[idx], label: e.target.value };
                          handlePropChange('gridColumns', cols);
                        }}
                      />
                      <select
                        className="property-select small"
                        value={col.type || 'text'}
                        onChange={(e) => {
                          const cols = normalizeGridColumns(props.gridColumns as any[]);
                          const newType = e.target.value as GridColumn['type'];
                          cols[idx] = {
                            ...cols[idx],
                            type: newType,
                            options: newType === 'select' ? (cols[idx].options || []) : undefined,
                            computeScript: newType === 'computed' ? (cols[idx].computeScript || 'return ""') : undefined,
                            iconSourceColumn: newType === 'icon' ? (cols[idx].iconSourceColumn || '') : undefined,
                            iconMapping: newType === 'icon' ? (cols[idx].iconMapping || []) : undefined,
                          };
                          handlePropChange('gridColumns', cols);
                        }}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="time">Time</option>
                        <option value="select">Select</option>
                        <option value="boolean">Boolean</option>
                        <option value="icon">Icon</option>
                        <option value="computed">Computed</option>
                      </select>
                      <label className="wrap-checkbox" title="Wrap text">
                        <input
                          type="checkbox"
                          checked={col.wrap || false}
                          onChange={(e) => {
                            const cols = normalizeGridColumns(props.gridColumns as any[]);
                            cols[idx] = { ...cols[idx], wrap: e.target.checked };
                            handlePropChange('gridColumns', cols);
                          }}
                        />
                        <span>Wrap</span>
                      </label>
                      <button
                        type="button"
                        className="option-remove-btn"
                        onClick={() => {
                          const cols = normalizeGridColumns(props.gridColumns as any[]).filter((_, i) => i !== idx);
                          handlePropChange('gridColumns', cols);
                        }}
                        disabled={normalizeGridColumns(props.gridColumns as any[]).length <= 1}
                      >
                        ×
                      </button>
                    </div>
                    {col.type === 'select' && (
                      <div className="grid-column-options">
                        <label className="property-label-small">Options:</label>
                        {(col.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="grid-column-option-row">
                            <input
                              type="text"
                              className="property-input small"
                              placeholder="Label"
                              value={opt.label}
                              onChange={(e) => {
                                const cols = normalizeGridColumns(props.gridColumns as any[]);
                                const newOptions = [...(cols[idx].options || [])];
                                newOptions[optIdx] = { ...newOptions[optIdx], label: e.target.value };
                                cols[idx] = { ...cols[idx], options: newOptions };
                                handlePropChange('gridColumns', cols);
                              }}
                            />
                            <input
                              type="text"
                              className="property-input small"
                              placeholder="Value"
                              value={opt.value}
                              onChange={(e) => {
                                const cols = normalizeGridColumns(props.gridColumns as any[]);
                                const newOptions = [...(cols[idx].options || [])];
                                newOptions[optIdx] = { ...newOptions[optIdx], value: e.target.value };
                                cols[idx] = { ...cols[idx], options: newOptions };
                                handlePropChange('gridColumns', cols);
                              }}
                            />
                            <button
                              type="button"
                              className="option-remove-btn"
                              onClick={() => {
                                const cols = normalizeGridColumns(props.gridColumns as any[]);
                                const newOptions = (cols[idx].options || []).filter((_, i) => i !== optIdx);
                                cols[idx] = { ...cols[idx], options: newOptions };
                                handlePropChange('gridColumns', cols);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="add-option-btn small"
                          onClick={() => {
                            const cols = normalizeGridColumns(props.gridColumns as any[]);
                            const newOptions = [...(cols[idx].options || []), { label: '', value: '' }];
                            cols[idx] = { ...cols[idx], options: newOptions };
                            handlePropChange('gridColumns', cols);
                          }}
                        >
                          + Add Option
                        </button>
                        <label className="property-label-small" style={{ marginTop: '8px' }}>Icon Mapping (optional):</label>
                        {(col.iconMapping || []).map((mapping: any, mapIdx: number) => (
                          <div key={mapIdx} className="grid-column-option-row">
                            <select
                              className="property-select small"
                              value={mapping.value}
                              onChange={(e) => {
                                const cols = normalizeGridColumns(props.gridColumns as any[]);
                                const newMapping = [...(cols[idx].iconMapping || [])];
                                newMapping[mapIdx] = { ...newMapping[mapIdx], value: e.target.value };
                                cols[idx] = { ...cols[idx], iconMapping: newMapping };
                                handlePropChange('gridColumns', cols);
                              }}
                            >
                              <option value="">Select option...</option>
                              {(col.options || []).map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              className="property-input small"
                              placeholder="Icon"
                              value={mapping.icon}
                              style={{ width: '50px', textAlign: 'center' }}
                              onChange={(e) => {
                                const cols = normalizeGridColumns(props.gridColumns as any[]);
                                const newMapping = [...(cols[idx].iconMapping || [])];
                                newMapping[mapIdx] = { ...newMapping[mapIdx], icon: e.target.value };
                                cols[idx] = { ...cols[idx], iconMapping: newMapping };
                                handlePropChange('gridColumns', cols);
                              }}
                            />
                            <input
                              type="color"
                              value={mapping.color || '#000000'}
                              style={{ width: '30px', padding: '0', border: 'none' }}
                              onChange={(e) => {
                                const cols = normalizeGridColumns(props.gridColumns as any[]);
                                const newMapping = [...(cols[idx].iconMapping || [])];
                                newMapping[mapIdx] = { ...newMapping[mapIdx], color: e.target.value };
                                cols[idx] = { ...cols[idx], iconMapping: newMapping };
                                handlePropChange('gridColumns', cols);
                              }}
                            />
                            <button
                              type="button"
                              className="option-remove-btn"
                              onClick={() => {
                                const cols = normalizeGridColumns(props.gridColumns as any[]);
                                const newMapping = (cols[idx].iconMapping || []).filter((_: any, i: number) => i !== mapIdx);
                                cols[idx] = { ...cols[idx], iconMapping: newMapping };
                                handlePropChange('gridColumns', cols);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="add-option-btn small"
                          onClick={() => {
                            const cols = normalizeGridColumns(props.gridColumns as any[]);
                            const newMapping = [...(cols[idx].iconMapping || []), { value: '', icon: '●', color: '#000000' }];
                            cols[idx] = { ...cols[idx], iconMapping: newMapping };
                            handlePropChange('gridColumns', cols);
                          }}
                        >
                          + Add Icon
                        </button>
                        <p className="property-hint" style={{ fontSize: '10px' }}>
                          Map option values to icons (📧, 📞, ✓, etc.)
                        </p>
                      </div>
                    )}
                    {col.type === 'computed' && (
                      <div className="grid-column-options">
                        <label className="property-label-small">Script:</label>
                        <textarea
                          className="property-textarea"
                          value={col.computeScript || ''}
                          onChange={(e) => {
                            const cols = normalizeGridColumns(props.gridColumns as any[]);
                            cols[idx] = { ...cols[idx], computeScript: e.target.value };
                            handlePropChange('gridColumns', cols);
                          }}
                          rows={3}
                          style={{ fontFamily: 'monospace', fontSize: '11px' }}
                          placeholder='return get_field("field_id")'
                        />
                        <p className="property-hint" style={{ fontSize: '10px' }}>
                          Use get_field("id") to read row editor form fields.
                        </p>
                      </div>
                    )}
                    {col.type === 'icon' && (
                      <div className="grid-column-options">
                        <label className="property-label-small">Source Column:</label>
                        <select
                          className="property-select"
                          value={col.iconSourceColumn || ''}
                          onChange={(e) => {
                            const cols = normalizeGridColumns(props.gridColumns as any[]);
                            cols[idx] = { ...cols[idx], iconSourceColumn: e.target.value || undefined };
                            handlePropChange('gridColumns', cols);
                          }}
                        >
                          <option value="">This column</option>
                          {normalizeGridColumns(props.gridColumns as any[])
                            .filter((_, i) => i !== idx)
                            .map((c) => (
                              <option key={c.id} value={c.id}>{c.label || c.id}</option>
                            ))}
                        </select>
                        <label className="property-label-small" style={{ marginTop: '8px' }}>Icon Mapping:</label>
                        {(col.iconMapping || []).map((mapping: any, mapIdx: number) => (
                          <div key={mapIdx} className="grid-column-option-row">
                            <input
                              type="text"
                              className="property-input small"
                              placeholder="Value"
                              value={mapping.value}
                              onChange={(e) => {
                                const cols = normalizeGridColumns(props.gridColumns as any[]);
                                const newMapping = [...(cols[idx].iconMapping || [])];
                                newMapping[mapIdx] = { ...newMapping[mapIdx], value: e.target.value };
                                cols[idx] = { ...cols[idx], iconMapping: newMapping };
                                handlePropChange('gridColumns', cols);
                              }}
                            />
                            <input
                              type="text"
                              className="property-input small"
                              placeholder="Icon"
                              value={mapping.icon}
                              style={{ width: '50px', textAlign: 'center' }}
                              onChange={(e) => {
                                const cols = normalizeGridColumns(props.gridColumns as any[]);
                                const newMapping = [...(cols[idx].iconMapping || [])];
                                newMapping[mapIdx] = { ...newMapping[mapIdx], icon: e.target.value };
                                cols[idx] = { ...cols[idx], iconMapping: newMapping };
                                handlePropChange('gridColumns', cols);
                              }}
                            />
                            <input
                              type="color"
                              value={mapping.color || '#000000'}
                              style={{ width: '30px', padding: '0', border: 'none' }}
                              onChange={(e) => {
                                const cols = normalizeGridColumns(props.gridColumns as any[]);
                                const newMapping = [...(cols[idx].iconMapping || [])];
                                newMapping[mapIdx] = { ...newMapping[mapIdx], color: e.target.value };
                                cols[idx] = { ...cols[idx], iconMapping: newMapping };
                                handlePropChange('gridColumns', cols);
                              }}
                            />
                            <button
                              type="button"
                              className="option-remove-btn"
                              onClick={() => {
                                const cols = normalizeGridColumns(props.gridColumns as any[]);
                                const newMapping = (cols[idx].iconMapping || []).filter((_: any, i: number) => i !== mapIdx);
                                cols[idx] = { ...cols[idx], iconMapping: newMapping };
                                handlePropChange('gridColumns', cols);
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          className="add-option-btn small"
                          onClick={() => {
                            const cols = normalizeGridColumns(props.gridColumns as any[]);
                            const newMapping = [...(cols[idx].iconMapping || []), { value: '', icon: '●', color: '#000000' }];
                            cols[idx] = { ...cols[idx], iconMapping: newMapping };
                            handlePropChange('gridColumns', cols);
                          }}
                        >
                          + Add Mapping
                        </button>
                        <p className="property-hint" style={{ fontSize: '10px' }}>
                          Use emoji or symbols (●, ✓, ✗, ⚠, etc.)
                        </p>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="add-option-btn"
                  onClick={() => {
                    const cols = normalizeGridColumns(props.gridColumns as any[]);
                    cols.push({
                      id: `col${Date.now()}`,
                      label: `Column ${cols.length + 1}`,
                      type: 'text',
                    });
                    handlePropChange('gridColumns', cols);
                  }}
                >
                  + Add Column
                </button>
              </div>
            </div>
            <div className="property-group">
              <label className="property-label">Min Rows</label>
              <input
                type="number"
                className="property-input"
                min={0}
                value={props.minRows ?? 0}
                onChange={(e) => handlePropChange('minRows', Number(e.target.value))}
              />
            </div>
            <div className="property-group">
              <label className="property-label">Max Rows</label>
              <input
                type="number"
                className="property-input"
                min={1}
                value={props.maxRows || 100}
                onChange={(e) => handlePropChange('maxRows', Number(e.target.value))}
              />
            </div>
            <div className="property-group">
              <label className="property-label">Row Editor Form</label>
              <div className="row-editor-form-picker">
                <div className="row-editor-form-selected">
                  {props.rowEditorFormId ? (
                    <>
                      <span className="selected-form-name">
                        {availableForms.find(f => f.id === props.rowEditorFormId)?.name || 'Form'}
                      </span>
                      <button
                        type="button"
                        className="clear-form-btn"
                        onClick={() => {
                          updateComponent(selectedComponent.id, {
                            props: {
                              ...selectedComponent.props,
                              rowEditorFormId: null,
                              columnFieldMapping: {},
                            },
                          });
                        }}
                        title="Clear"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <span className="no-form-selected">None (inline editing)</span>
                  )}
                </div>
                <button
                  type="button"
                  className="browse-forms-btn"
                  onClick={() => setRowEditorFormPickerOpen(true)}
                >
                  Browse...
                </button>
              </div>
              <FormSelectDialog
                open={rowEditorFormPickerOpen}
                onClose={() => setRowEditorFormPickerOpen(false)}
                onSelect={async (action, formId, _formName) => {
                  setRowEditorFormPickerOpen(false);
                  let newFormId = formId;

                  if (action === 'new') {
                    // Create new form
                    try {
                      const response = await fetch(`${API_URL}/api/forms`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: 'Row Editor Form',
                          code: `row_editor_${Date.now()}`,
                          schema_json: { components: [] }
                        })
                      });
                      if (response.ok) {
                        const savedForm = await response.json();
                        newFormId = savedForm.id;
                        // Refresh forms list
                        const listRes = await fetch(`${API_URL}/api/forms`);
                        if (listRes.ok) {
                          const list = await listRes.json();
                          setAvailableForms(list);
                        }
                      }
                    } catch (error) {
                      console.error('Failed to create new form:', error);
                      return;
                    }
                  } else if (action === 'copy' && formId) {
                    // Copy existing form
                    try {
                      const originalRes = await fetch(`${API_URL}/api/forms/${formId}`);
                      if (originalRes.ok) {
                        const original = await originalRes.json();
                        const response = await fetch(`${API_URL}/api/forms`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            name: `${original.name} (Copy)`,
                            code: original.code ? `${original.code}_copy` : null,
                            schema_json: original.schema_json
                          })
                        });
                        if (response.ok) {
                          const savedForm = await response.json();
                          newFormId = savedForm.id;
                          // Refresh forms list
                          const listRes = await fetch(`${API_URL}/api/forms`);
                          if (listRes.ok) {
                            const list = await listRes.json();
                            setAvailableForms(list);
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Failed to copy form:', error);
                      return;
                    }
                  }

                  if (newFormId) {
                    updateComponent(selectedComponent.id, {
                      props: {
                        ...selectedComponent.props,
                        rowEditorFormId: newFormId,
                        columnFieldMapping: {},
                      },
                    });
                    // Trigger FormsPanel to refresh and show the new row editor form in tree
                    triggerFormsRefresh();
                  }
                }}
                forms={availableForms}
              />
            </div>
            {props.rowEditorFormId && (
              <div className="property-group">
                <label className="property-label">Column ↔ Field Mapping</label>
                <div className="column-mapping-list">
                  {normalizeGridColumns(props.gridColumns as any[]).map((col: GridColumn) => {
                    const formFields = getFormFields(props.rowEditorFormId as string);
                    const currentMapping = (props.columnFieldMapping as Record<string, string>) || {};
                    return (
                      <div key={col.id} className="column-mapping-row">
                        <span className="column-mapping-label">{col.label}</span>
                        <span className="column-mapping-arrow">→</span>
                        <select
                          className="property-select small"
                          value={currentMapping[col.id] || ''}
                          onChange={(e) => {
                            const newMapping = { ...currentMapping, [col.id]: e.target.value };
                            handlePropChange('columnFieldMapping', newMapping);
                          }}
                        >
                          <option value="">Not mapped</option>
                          {formFields.map((field) => (
                            <option key={field.id} value={field.id}>{field.label}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
                <p className="property-hint">
                  Map each grid column to a form field.
                </p>
              </div>
            )}
          </>
        )}
      </>
    );
  };

  const renderStylesEditor = () => {
    const { props } = selectedComponent;
    return (
      <>
        <div className="property-group">
          <label className="property-label">Width</label>
          <input
            type="text"
            className="property-input"
            placeholder="auto, 100%, 200px..."
            value={props.style?.width || ''}
            onChange={(e) => handlePropChange('style', { ...props.style, width: e.target.value || undefined })}
          />
        </div>
        <div className="property-group">
          <label className="property-label">Height</label>
          <input
            type="text"
            className="property-input"
            placeholder="auto, 100%, 200px..."
            value={props.style?.height || ''}
            onChange={(e) => handlePropChange('style', { ...props.style, height: e.target.value || undefined })}
          />
        </div>
        <div className="property-group">
          <label className="property-label">Margin</label>
          <input
            type="text"
            className="property-input"
            placeholder="0, 10px, 10px 20px..."
            value={props.style?.margin || ''}
            onChange={(e) => handlePropChange('style', { ...props.style, margin: e.target.value || undefined })}
          />
        </div>
        <div className="property-group">
          <label className="property-label">Padding</label>
          <input
            type="text"
            className="property-input"
            placeholder="0, 10px, 10px 20px..."
            value={props.style?.padding || ''}
            onChange={(e) => handlePropChange('style', { ...props.style, padding: e.target.value || undefined })}
          />
        </div>
        <div className="property-group">
          <label className="property-label">Background Color</label>
          <input
            type="text"
            className="property-input"
            placeholder="#ffffff, rgb(255,255,255)..."
            value={props.style?.backgroundColor || ''}
            onChange={(e) => handlePropChange('style', { ...props.style, backgroundColor: e.target.value || undefined })}
          />
        </div>
        <div className="property-group">
          <label className="property-label">Text Color</label>
          <input
            type="text"
            className="property-input"
            placeholder="#000000, rgb(0,0,0)..."
            value={props.style?.color || ''}
            onChange={(e) => handlePropChange('style', { ...props.style, color: e.target.value || undefined })}
          />
        </div>
        <div className="property-group">
          <label className="property-label">Font Size</label>
          <input
            type="text"
            className="property-input"
            placeholder="14px, 1rem..."
            value={props.style?.fontSize || ''}
            onChange={(e) => handlePropChange('style', { ...props.style, fontSize: e.target.value || undefined })}
          />
        </div>
        <div className="property-group">
          <label className="property-label">Border</label>
          <input
            type="text"
            className="property-input"
            placeholder="1px solid #ccc..."
            value={props.style?.border || ''}
            onChange={(e) => handlePropChange('style', { ...props.style, border: e.target.value || undefined })}
          />
        </div>
        <div className="property-group">
          <label className="property-label">Border Radius</label>
          <input
            type="text"
            className="property-input"
            placeholder="4px, 50%..."
            value={props.style?.borderRadius || ''}
            onChange={(e) => handlePropChange('style', { ...props.style, borderRadius: e.target.value || undefined })}
          />
        </div>
        <div className="property-group">
          <label className="property-label">Custom CSS Class</label>
          <input
            type="text"
            className="property-input"
            placeholder="my-class another-class"
            value={props.className || ''}
            onChange={(e) => handlePropChange('className', e.target.value || undefined)}
          />
        </div>
      </>
    );
  };

  const renderActionsEditor = () => {
    const { props } = selectedComponent;
    return (
      <>
        <div className="property-group">
          <label className="property-label">On Change</label>
          <textarea
            className="property-textarea"
            placeholder="JavaScript code to run when value changes..."
            value={props.onChange || ''}
            onChange={(e) => handlePropChange('onChange', e.target.value || undefined)}
            rows={3}
          />
        </div>
        <div className="property-group">
          <label className="property-label">On Focus</label>
          <textarea
            className="property-textarea"
            placeholder="JavaScript code to run on focus..."
            value={props.onFocus || ''}
            onChange={(e) => handlePropChange('onFocus', e.target.value || undefined)}
            rows={3}
          />
        </div>
        <div className="property-group">
          <label className="property-label">On Blur</label>
          <textarea
            className="property-textarea"
            placeholder="JavaScript code to run on blur..."
            value={props.onBlur || ''}
            onChange={(e) => handlePropChange('onBlur', e.target.value || undefined)}
            rows={3}
          />
        </div>
        {selectedComponent.type === 'button' && (
          <div className="property-group">
            <label className="property-label">On Click</label>
            <textarea
              className="property-textarea"
              placeholder="JavaScript code to run on click..."
              value={props.onClick || ''}
              onChange={(e) => handlePropChange('onClick', e.target.value || undefined)}
              rows={3}
            />
          </div>
        )}
        <p className="property-hint">
          Actions are executed in the context of the form. Use 'formData' to access current values.
        </p>
      </>
    );
  };

  const renderRulesEditor = () => {
    const { props } = selectedComponent;
    return (
      <>
        <div className="property-group">
          <label className="property-label">Visibility Condition</label>
          <textarea
            className="property-textarea"
            placeholder="e.g., formData.country === 'US'"
            value={props.visibilityCondition || ''}
            onChange={(e) => handlePropChange('visibilityCondition', e.target.value || undefined)}
            rows={2}
          />
          <p className="property-hint">
            Component is visible when this expression returns true.
          </p>
        </div>
        <div className="property-group">
          <label className="property-label">Enabled Condition</label>
          <textarea
            className="property-textarea"
            placeholder="e.g., formData.age >= 18"
            value={props.enabledCondition || ''}
            onChange={(e) => handlePropChange('enabledCondition', e.target.value || undefined)}
            rows={2}
          />
          <p className="property-hint">
            Component is enabled when this expression returns true.
          </p>
        </div>
        <div className="property-group">
          <label className="property-label">Required Condition</label>
          <textarea
            className="property-textarea"
            placeholder="e.g., formData.subscribe === true"
            value={props.requiredCondition || ''}
            onChange={(e) => handlePropChange('requiredCondition', e.target.value || undefined)}
            rows={2}
          />
          <p className="property-hint">
            Component is required when this expression returns true.
          </p>
        </div>
        <div className="property-group">
          <label className="property-label">Validation Rule</label>
          <textarea
            className="property-textarea"
            placeholder="e.g., value.length >= 5"
            value={props.validationRule || ''}
            onChange={(e) => handlePropChange('validationRule', e.target.value || undefined)}
            rows={2}
          />
        </div>
        <div className="property-group">
          <label className="property-label">Validation Message</label>
          <input
            type="text"
            className="property-input"
            placeholder="Custom error message"
            value={props.validationMessage || ''}
            onChange={(e) => handlePropChange('validationMessage', e.target.value || undefined)}
          />
        </div>
      </>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'properties':
        return renderPropertyEditor();
      case 'styles':
        return renderStylesEditor();
      case 'actions':
        return renderActionsEditor();
      case 'rules':
        return renderRulesEditor();
      default:
        return renderPropertyEditor();
    }
  };

  return (
    <div className="properties-panel" style={style}>
      <div className="properties-header">
        <span className="component-icon">{config?.icon}</span>
        <h3 className="properties-title">{config?.label}</h3>
      </div>

      <div className="properties-tabs">
        <button
          className={`properties-tab ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          Properties
        </button>
        <button
          className={`properties-tab ${activeTab === 'styles' ? 'active' : ''}`}
          onClick={() => setActiveTab('styles')}
        >
          Styles
        </button>
        <button
          className={`properties-tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Actions
        </button>
        <button
          className={`properties-tab ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          Rules
        </button>
      </div>

      <div className="properties-content">{renderTabContent()}</div>

      <div className="properties-actions">
        <button
          type="button"
          className="action-btn duplicate"
          onClick={() => duplicateComponent(selectedComponent.id)}
        >
          Duplicate
        </button>
        <button
          type="button"
          className="action-btn delete"
          onClick={() => removeComponent(selectedComponent.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};
