import React, { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { FormComponent, GridColumn, TabItem } from '../types';
import { EditableDataGrid } from './EditableDataGrid';
import { ReferencePickerPopup } from './ReferencePickerPopup';
import { ReferenceData } from '../store/referenceStore';
import './FormComponentRenderer.css';

// Separate component for tabs to use hooks properly
interface TabsRendererProps {
  tabs: TabItem[];
  isPreview: boolean;
  formData?: Record<string, any>;
  onFieldChange?: (componentId: string, value: any) => void;
  style?: React.CSSProperties;
  formSchema?: FormComponent[];
}

const TabsRenderer: React.FC<TabsRendererProps> = ({ tabs, isPreview, formData, onFieldChange, style, formSchema }) => {
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id || '');
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  return (
    <div className="form-field field-tabs" style={style}>
      <div className="tabs-header">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-button ${activeTabId === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTabId(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {activeTab?.children?.map((child) => (
          <FormComponentRenderer
            key={child.id}
            component={child}
            isPreview={isPreview}
            formData={formData}
            onFieldChange={onFieldChange}
            formSchema={formSchema}
          />
        ))}
        {(!activeTab?.children || activeTab.children.length === 0) && (
          <div className="tab-empty">No content in this tab</div>
        )}
      </div>
    </div>
  );
};

interface Props {
  component: FormComponent;
  isPreview: boolean;
  value?: any;
  onChange?: (value: any) => void;
  formData?: Record<string, any>;
  onFieldChange?: (componentId: string, value: any) => void;
  formSchema?: FormComponent[]; // For computed fields to search by label
  context?: Record<string, any>; // External context like clientType
}

export const FormComponentRenderer: React.FC<Props> = ({
  component,
  isPreview,
  value,
  onChange,
  formData,
  onFieldChange,
  formSchema,
  context,
}) => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [showReferencePicker, setShowReferencePicker] = useState(false);

  // Calculate filter params for reference picker
  const getReferenceFilter = (): { filterField?: string; filterValue?: string } => {
    const filterParams = component.props.referenceFilterParams;
    if (!filterParams || filterParams.length === 0) {
      return {};
    }
    // For now, only support first filter param
    const param = filterParams[0];
    let filterValue: string | undefined;

    switch (param.sourceType) {
      case 'static':
        filterValue = param.staticValue;
        break;
      case 'field':
        filterValue = param.sourceFieldId ? formData?.[param.sourceFieldId] : undefined;
        break;
      case 'context':
        filterValue = param.contextKey ? context?.[param.contextKey] : undefined;
        break;
    }

    if (filterValue !== undefined) {
      return { filterField: param.fieldCode, filterValue: String(filterValue) };
    }
    return {};
  };

  // Handle selection from reference picker
  const handleReferenceSelect = (record: ReferenceData) => {
    const { referenceValueField, referenceDisplayField, referenceFieldMapping } = component.props;

    // Set the main field value (use display field value for display, but store value field)
    const displayValue = referenceDisplayField ? record.data[referenceDisplayField] : '';
    const actualValue = referenceValueField ? record.data[referenceValueField] : '';

    // For display, we show the display field value, but we might want to store the value field
    // For now, let's store the display value since that's what the user sees
    handleChange(displayValue || actualValue);

    // Fill mapped fields if there's a mapping and formSchema
    if (referenceFieldMapping && formSchema && onFieldChange) {
      // Helper to find component by id recursively
      const findComponentById = (components: FormComponent[], id: string): FormComponent | undefined => {
        for (const comp of components) {
          if (comp.id === id) return comp;
          if (comp.children) {
            const found = findComponentById(comp.children, id);
            if (found) return found;
          }
          if (comp.props.tabs) {
            for (const tab of comp.props.tabs as TabItem[]) {
              if (tab.children) {
                const found = findComponentById(tab.children, id);
                if (found) return found;
              }
            }
          }
        }
        return undefined;
      };

      // Apply mapping: formFieldId -> referenceFieldCode
      Object.entries(referenceFieldMapping as Record<string, string>).forEach(([formFieldId, refFieldCode]) => {
        if (refFieldCode && record.data[refFieldCode] !== undefined) {
          onFieldChange(formFieldId, record.data[refFieldCode]);
        }
      });
    }
  };
  // Helper function to find component by label in the schema
  const findComponentByLabel = (components: FormComponent[], label: string): FormComponent | undefined => {
    for (const comp of components) {
      if (comp.props.label === label) return comp;
      if (comp.children) {
        const found = findComponentByLabel(comp.children, label);
        if (found) return found;
      }
      // Also check tabs
      if (comp.props.tabs) {
        for (const tab of comp.props.tabs as TabItem[]) {
          if (tab.children) {
            const found = findComponentByLabel(tab.children, label);
            if (found) return found;
          }
        }
      }
    }
    return undefined;
  };
  const { type, props } = component;

  // Get current value - either from direct prop or from formData for nested components
  const currentValue = value !== undefined ? value : formData?.[component.id];

  const handleChange = (newValue: any) => {
    if (onChange) {
      onChange(newValue);
    } else if (onFieldChange) {
      onFieldChange(component.id, newValue);
    }
  };

  const getInputValue = () => {
    if (isPreview) {
      return currentValue ?? props.defaultValue ?? '';
    }
    return props.defaultValue?.toString() ?? '';
  };

  const renderHeading = () => {
    const text = props.text || 'Heading';
    const level = props.headingLevel || 2;

    switch (level) {
      case 1: return <h1 className="field-heading">{text}</h1>;
      case 2: return <h2 className="field-heading">{text}</h2>;
      case 3: return <h3 className="field-heading">{text}</h3>;
      case 4: return <h4 className="field-heading">{text}</h4>;
      case 5: return <h5 className="field-heading">{text}</h5>;
      case 6: return <h6 className="field-heading">{text}</h6>;
      default: return <h2 className="field-heading">{text}</h2>;
    }
  };

  const inputValue = getInputValue();
  const hasValue = inputValue !== '' && inputValue !== undefined && inputValue !== null;

  // In edit mode, layout styles (width, height) are applied to wrapper in FormCanvas
  // So exclude them here to avoid double application
  const getFieldStyle = (): React.CSSProperties | undefined => {
    if (!props.style) return undefined;
    if (isPreview) return props.style;
    // In edit mode, exclude layout styles that are applied to wrapper
    const { width, height, minWidth, minHeight, maxWidth, maxHeight, flex, ...rest } = props.style as any;
    return Object.keys(rest).length > 0 ? rest : undefined;
  };
  const fieldStyle = getFieldStyle();

  switch (type) {
    case 'input': {
      const hasReference = isPreview && props.referenceId;
      return (
        <>
          <div className="form-field" style={fieldStyle}>
            <div className={`field-wrapper ${hasReference ? 'with-reference' : ''}`}>
              <input
                type="text"
                className={`field-input ${hasValue ? 'has-value' : ''}`}
                placeholder=" "
                disabled={props.disabled}
                value={inputValue}
                onChange={isPreview ? (e) => handleChange(e.target.value) : undefined}
                readOnly={!isPreview}
              />
              {props.label && (
                <label className="floating-label">
                  {props.label}{props.required && <span className="required">*</span>}
                </label>
              )}
              {hasReference && (
                <button
                  type="button"
                  className="reference-picker-btn"
                  onClick={() => setShowReferencePicker(true)}
                  title="Select from reference"
                >
                  <SearchIcon fontSize="small" />
                </button>
              )}
            </div>
          </div>
          {showReferencePicker && props.referenceId && (() => {
            const { filterField, filterValue } = getReferenceFilter();
            return (
              <ReferencePickerPopup
                referenceId={props.referenceId}
                onSelect={handleReferenceSelect}
                onClose={() => setShowReferencePicker(false)}
                filterField={filterField}
                filterValue={filterValue}
              />
            );
          })()}
        </>
      );
    }

    case 'textarea':
      return (
        <div className="form-field" style={fieldStyle}>
          <div className="field-wrapper textarea-wrapper">
            <textarea
              className={`field-textarea ${hasValue ? 'has-value' : ''}`}
              placeholder=" "
              disabled={props.disabled}
              rows={4}
              value={inputValue}
              onChange={isPreview ? (e) => handleChange(e.target.value) : undefined}
              readOnly={!isPreview}
            />
            {props.label && (
              <label className="floating-label">
                {props.label}{props.required && <span className="required">*</span>}
              </label>
            )}
          </div>
        </div>
      );

    case 'number':
      return (
        <div className="form-field" style={fieldStyle}>
          <div className="field-wrapper">
            <input
              type="number"
              className={`field-input ${hasValue ? 'has-value' : ''}`}
              placeholder=" "
              disabled={props.disabled}
              value={inputValue}
              onChange={isPreview ? (e) => handleChange(e.target.value) : undefined}
              readOnly={!isPreview}
            />
            {props.label && (
              <label className="floating-label">
                {props.label}{props.required && <span className="required">*</span>}
              </label>
            )}
          </div>
        </div>
      );

    case 'email':
      return (
        <div className="form-field" style={fieldStyle}>
          <div className="field-wrapper">
            <input
              type="email"
              className={`field-input ${hasValue ? 'has-value' : ''}`}
              placeholder=" "
              disabled={props.disabled}
              value={inputValue}
              onChange={isPreview ? (e) => handleChange(e.target.value) : undefined}
              readOnly={!isPreview}
            />
            {props.label && (
              <label className="floating-label">
                {props.label}{props.required && <span className="required">*</span>}
              </label>
            )}
          </div>
        </div>
      );

    case 'password':
      return (
        <div className="form-field" style={fieldStyle}>
          <div className="field-wrapper">
            <input
              type="password"
              className={`field-input ${hasValue ? 'has-value' : ''}`}
              placeholder=" "
              disabled={props.disabled}
              value={inputValue}
              onChange={isPreview ? (e) => handleChange(e.target.value) : undefined}
              readOnly={!isPreview}
            />
            {props.label && (
              <label className="floating-label">
                {props.label}{props.required && <span className="required">*</span>}
              </label>
            )}
          </div>
        </div>
      );

    case 'date':
      return (
        <div className="form-field" style={fieldStyle}>
          <div className="field-wrapper">
            <input
              type="date"
              className={`field-input ${hasValue ? 'has-value' : ''}`}
              disabled={props.disabled}
              value={inputValue}
              onChange={isPreview ? (e) => handleChange(e.target.value) : undefined}
              readOnly={!isPreview}
            />
            {props.label && (
              <label className="floating-label">
                {props.label}{props.required && <span className="required">*</span>}
              </label>
            )}
          </div>
        </div>
      );

    case 'time':
      return (
        <div className="form-field" style={fieldStyle}>
          <div className="field-wrapper">
            <input
              type="time"
              className={`field-input ${hasValue ? 'has-value' : ''}`}
              disabled={props.disabled}
              value={inputValue}
              onChange={isPreview ? (e) => handleChange(e.target.value) : undefined}
              readOnly={!isPreview}
            />
            {props.label && (
              <label className="floating-label">
                {props.label}{props.required && <span className="required">*</span>}
              </label>
            )}
          </div>
        </div>
      );

    case 'select': {
      const selectValue = isPreview ? (currentValue ?? props.defaultValue ?? '') : (props.defaultValue?.toString() ?? '');
      const options = props.options || [];
      const selectedOption = options.find(opt => opt.value === selectValue) || null;

      return (
        <div className="form-field" style={fieldStyle}>
          <Autocomplete
            value={selectedOption}
            onChange={(_, newValue) => {
              if (isPreview) {
                handleChange(newValue?.value || '');
              }
            }}
            options={options}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            disabled={props.disabled || !isPreview}
            size="small"
            renderInput={(params) => (
              <TextField
                {...params}
                label={props.label ? `${props.label}${props.required ? ' *' : ''}` : undefined}
                placeholder="Search..."
              />
            )}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
              },
            }}
          />
        </div>
      );
    }

    case 'checkbox':
      return (
        <div className="form-field" style={fieldStyle}>
          <label className="field-checkbox-label">
            <input
              type="checkbox"
              className="field-checkbox"
              disabled={props.disabled}
              checked={isPreview ? (currentValue ?? Boolean(props.defaultValue) ?? false) : (Boolean(props.defaultValue) ?? false)}
              onChange={isPreview ? (e) => handleChange(e.target.checked) : undefined}
            />
            <span>{props.text || props.label}{props.required && <span className="required">*</span>}</span>
          </label>
        </div>
      );

    case 'radio':
      return (
        <div className="form-field" style={fieldStyle}>
          {props.label && <label className="field-label">{props.label}{props.required && <span className="required">*</span>}</label>}
          <div className="radio-group">
            {props.options?.map((opt, idx) => (
              <label key={idx} className="radio-option">
                <input
                  type="radio"
                  name={component.id}
                  value={opt.value}
                  disabled={props.disabled}
                  checked={isPreview ? (currentValue ?? props.defaultValue) === opt.value : props.defaultValue === opt.value}
                  onChange={isPreview ? () => handleChange(opt.value) : undefined}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      );

    case 'file': {
      // Files stored as array: [{name: string, data: string (base64), type: string}]
      const rawValue = value || formData?.[component.id] || [];
      const files: Array<{name: string; data: string; type: string}> = Array.isArray(rawValue) ? rawValue : [];

      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (!selectedFiles || selectedFiles.length === 0) return;

        const newFiles = [...files];

        Array.from(selectedFiles).forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newFiles.push({
              name: file.name,
              data: reader.result as string,
              type: file.type
            });
            onFieldChange?.(component.id, [...newFiles]);
          };
          reader.readAsDataURL(file);
        });

        // Reset input
        e.target.value = '';
      };

      const handleRemoveFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        onFieldChange?.(component.id, newFiles);
      };

      const handleDownloadFile = (file: {name: string; data: string; type: string}) => {
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      return (
        <div className="form-field" style={fieldStyle}>
          {props.label && <label className="field-label">{props.label}{props.required && <span className="required">*</span>}</label>}
          <div className="field-file-area">
            {files.length > 0 && (
              <div className="field-file-list">
                {files.map((file, index) => (
                  <div key={index} className="field-file-item">
                    <span
                      className="field-file-name"
                      onClick={() => handleDownloadFile(file)}
                      title="Click to download"
                    >
                      {file.name}
                    </span>
                    {isPreview && !props.disabled && (
                      <button
                        type="button"
                        className="field-file-remove"
                        onClick={() => handleRemoveFile(index)}
                        title="Remove file"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {isPreview && !props.disabled && (
              <label className="field-file-add">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <span>+ Add files</span>
              </label>
            )}
            {!isPreview && files.length === 0 && (
              <div className="field-file-placeholder">No files</div>
            )}
          </div>
        </div>
      );
    }

    case 'picture': {
      const pictureValue = value || formData?.[component.id];
      const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          const maxSize = (props.maxSize || 5) * 1024 * 1024; // MB to bytes
          if (file.size > maxSize) {
            alert(`File size must be less than ${props.maxSize || 5}MB`);
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            onFieldChange?.(component.id, reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
      const handleRemovePicture = () => {
        onFieldChange?.(component.id, '');
      };
      return (
        <>
          <div className="form-field" style={fieldStyle}>
            {props.label && <label className="field-label">{props.label}{props.required && <span className="required">*</span>}</label>}
            <div className="field-picture">
              {pictureValue ? (
                <div className="picture-preview">
                  <img
                    src={pictureValue}
                    alt="Uploaded"
                    style={{ objectFit: props.objectFit || 'contain', cursor: 'pointer' }}
                    onClick={() => setLightboxImage(pictureValue)}
                    title="Click to enlarge"
                  />
                  {isPreview && (
                    <button type="button" className="picture-remove" onClick={handleRemovePicture}>×</button>
                  )}
                </div>
              ) : (
                <label className="picture-upload-area">
                  <input
                    type="file"
                    accept={props.accept || 'image/*'}
                    onChange={handlePictureChange}
                    disabled={props.disabled || !isPreview}
                    style={{ display: 'none' }}
                  />
                  <div className="picture-placeholder">
                    <svg className="picture-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <span>{props.placeholderText || 'Click to upload'}</span>
                  </div>
                </label>
              )}
            </div>
          </div>
          {/* Lightbox modal for enlarged image view */}
          {lightboxImage && (
            <div className="picture-lightbox" onClick={() => setLightboxImage(null)}>
              <img
                src={lightboxImage}
                alt="Enlarged view"
                onClick={(e) => e.stopPropagation()}
              />
              <button className="picture-lightbox-close" onClick={() => setLightboxImage(null)}>×</button>
            </div>
          )}
        </>
      );
    }

    case 'button':
      return (
        <div className="form-field" style={fieldStyle}>
          <button
            type={props.buttonType || 'button'}
            className="field-button"
            disabled={props.disabled}
          >
            {props.buttonText || 'Button'}
          </button>
        </div>
      );

    case 'heading':
      return (
        <div className="form-field" style={fieldStyle}>
          {renderHeading()}
        </div>
      );

    case 'paragraph':
      return (
        <div className="form-field" style={fieldStyle}>
          <p className="field-paragraph">{props.text || 'Paragraph text'}</p>
        </div>
      );

    case 'divider':
      return (
        <div className="form-field" style={fieldStyle}>
          <hr className="field-divider" />
        </div>
      );

    case 'container':
      return (
        <div
          className={`form-field field-container ${props.label ? 'has-label' : ''} ${props.fillSpace !== false ? 'fill-space' : ''}`}
          style={{
            ...props.style,
            flexDirection: props.direction || 'column',
            gap: props.gap || 16,
            width: props.width || props.style?.width || undefined,
            height: props.height || props.style?.height || undefined,
          }}
        >
          {props.label && <div className="container-field-label">{props.label}</div>}
          {component.children?.map((child) => (
            <FormComponentRenderer
              key={child.id}
              component={child}
              isPreview={isPreview}
              formData={formData}
              onFieldChange={onFieldChange}
              formSchema={formSchema}
            />
          ))}
          {(!component.children || component.children.length === 0) && (
            <div className="container-empty">Container (drop components here)</div>
          )}
        </div>
      );

    case 'row':
      return (
        <div
          className="form-field field-row"
          style={{
            ...props.style,
            gridTemplateColumns: `repeat(${props.columns || 2}, 1fr)`,
            gap: props.gap || 12,
          }}
        >
          {component.children?.map((child) => (
            <FormComponentRenderer
              key={child.id}
              component={child}
              isPreview={isPreview}
              formData={formData}
              onFieldChange={onFieldChange}
              formSchema={formSchema}
            />
          ))}
          {(!component.children || component.children.length === 0) && (
            <div className="row-empty">Row - {props.columns || 2} columns</div>
          )}
        </div>
      );

    case 'grid': {
      const gridRows = isPreview ? (currentValue || []) : [];
      return (
        <div className="form-field" style={fieldStyle}>
          <EditableDataGrid
            columns={(props.gridColumns as GridColumn[]) || []}
            value={gridRows}
            onChange={handleChange}
            minRows={props.minRows || 1}
            maxRows={props.maxRows || 100}
            disabled={!isPreview}
            label={props.label}
            rowEditorFormId={props.rowEditorFormId}
            columnFieldMapping={props.columnFieldMapping as Record<string, string>}
          />
        </div>
      );
    }

    case 'tabs': {
      const tabs = (props.tabs as TabItem[]) || [];
      return (
        <TabsRenderer
          tabs={tabs}
          isPreview={isPreview}
          formData={formData}
          onFieldChange={onFieldChange}
          style={fieldStyle}
          formSchema={formSchema}
        />
      );
    }

    case 'computed': {
      // Compute the value using the script
      let computedValue = '';
      if (isPreview && props.computeScript && formData) {
        try {
          // Create get_field_by_name function that searches by LABEL
          const get_field_by_name = (fieldLabel: string): any => {
            if (!formSchema) {
              // Fallback: try direct key match if no schema
              return formData[fieldLabel] ?? '';
            }

            // Find component by label in the schema
            const foundComponent = findComponentByLabel(formSchema, fieldLabel);
            if (!foundComponent) return '';

            // Get value from formData using component id
            const val = formData[foundComponent.id];

            // If value undefined or null, return empty string
            if (val === undefined || val === null || val === '') {
              return '';
            }

            // For select fields, return the label instead of value
            if (foundComponent.type === 'select' && foundComponent.props.options) {
              const option = foundComponent.props.options.find((opt: any) => opt.value === val);
              if (option) {
                return option.label;
              }
            }

            return val;
          };

          // Create a safe evaluation context - provide both function names
          const evalScript = new Function('get_field_by_name', 'get_field', 'formData', `
            "use strict";
            ${props.computeScript}
          `);
          const result = evalScript(get_field_by_name, get_field_by_name, formData);
          computedValue = result !== undefined && result !== null ? String(result) : '';
        } catch (e) {
          computedValue = `Error: ${e instanceof Error ? e.message : 'Script error'}`;
        }
      }
      const displayValue = isPreview ? computedValue : '(computed)';
      return (
        <div className="form-field" style={fieldStyle}>
          <div className="field-wrapper">
            <input
              type="text"
              className={`field-input has-value computed-field`}
              placeholder=" "
              disabled
              value={displayValue}
              readOnly
            />
            {props.label && (
              <label className="floating-label">
                {props.label}
              </label>
            )}
          </div>
        </div>
      );
    }

    default:
      return <div className="unknown-component">Unknown component: {type}</div>;
  }
};
