import React, { useState, useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { FormComponentRenderer } from './FormComponentRenderer';
import { FormData, FormSchema } from '../types';
import './FormPreview.css';

interface FormPreviewProps {
  schema?: FormSchema;
  initialData?: FormData;
  onDataChange?: (data: FormData) => void;
  onComponentFocus?: (componentId: string | null) => void;
  showSidebar?: boolean;
  showSubmit?: boolean;
  hideTitle?: boolean;
}

export const FormPreview: React.FC<FormPreviewProps> = ({
  schema: schemaProp,
  initialData,
  onDataChange,
  onComponentFocus,
  showSidebar = true,
  showSubmit = true,
  hideTitle = false,
}) => {
  const { schema: schemaFromStore } = useFormStore();
  const schema = schemaProp || schemaFromStore;
  const [formData, setFormData] = useState<FormData>(initialData || {});
  const [submitted, setSubmitted] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Notify parent of data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData);
    }
  }, [formData, onDataChange]);

  const getFieldKey = (componentId: string): string => {
    const component = schema.components.find(c => c.id === componentId);
    return component?.props?.fieldId || component?.props?.code || componentId;
  };

  const handleFieldChange = (componentId: string, value: any) => {
    const fieldKey = getFieldKey(componentId);
    setFormData((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    console.log('Form submitted:', formData);
  };

  const handleReset = () => {
    setFormData({});
    setSubmitted(false);
  };

  return (
    <div className="form-preview">
      <div className="preview-container">
        {!hideTitle && (
          <div className="preview-header">
            <h2 className="preview-title">{schema.name || 'Untitled Form'}</h2>
            {schema.description && (
              <p className="preview-description">{schema.description}</p>
            )}
          </div>
        )}

        {submitted && showSubmit ? (
          <div className="submission-result">
            <div className="success-icon">OK</div>
            <h3>Form Submitted Successfully!</h3>
            <p>Here's the data that would be sent:</p>
            <pre className="form-data-preview">
              {JSON.stringify(formData, null, 2)}
            </pre>
            <button className="reset-btn" onClick={handleReset}>
              Test Again
            </button>
          </div>
        ) : (
          <form className="preview-form" onSubmit={showSubmit ? handleSubmit : (e) => e.preventDefault()}>
            {schema.components.length === 0 ? (
              <div className="preview-empty">
                <p>No components in the form yet.</p>
                <p>Switch to Edit mode to add components.</p>
              </div>
            ) : (
              schema.components.map((component) => {
                const fieldKey = getFieldKey(component.id);
                return (
                  <div
                    key={component.id}
                    onFocus={() => onComponentFocus?.(component.id)}
                    onClick={() => onComponentFocus?.(component.id)}
                  >
                    <FormComponentRenderer
                      component={component}
                      isPreview={true}
                      value={formData[fieldKey]}
                      onChange={(value) => handleFieldChange(component.id, value)}
                      formData={formData}
                      onFieldChange={handleFieldChange}
                      formSchema={schema.components}
                    />
                  </div>
                );
              })
            )}
          </form>
        )}
      </div>

      {showSidebar && !submitted && schema.components.length > 0 && (
        <div className="preview-sidebar">
          <h3>Form Data (Live)</h3>
          <pre className="live-data">
            {JSON.stringify(formData, null, 2) || '{}'}
          </pre>
        </div>
      )}
    </div>
  );
};
