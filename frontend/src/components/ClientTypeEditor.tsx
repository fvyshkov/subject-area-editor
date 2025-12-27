import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { useClientTypeStore } from '../store/clientTypeStore';
import { useFormStore } from '../store/formStore';
import { transliterate } from '../utils/transliterate';
import { FormCanvas } from './FormCanvas';
import { API_URL } from '../config';
import './ClientTypeEditor.css';

interface SavedForm {
  id: string;
  code: string | null;
  name: string;
  schema_json: any;
}

export const ClientTypeEditor: React.FC = () => {
  const { clientTypes, currentClientTypeId, updateClientType, clientTypesToCreate } = useClientTypeStore();
  const { setSchema, currentFormId } = useFormStore();
  const [forms, setForms] = useState<SavedForm[]>([]);
  const [formsLoaded, setFormsLoaded] = useState(false);

  const currentClientType = clientTypes.find(ct => ct.id === currentClientTypeId);
  const isNewClientType = currentClientTypeId ? clientTypesToCreate.has(currentClientTypeId) : false;
  const isFormType = currentClientType?.item_type === 'form';

  // Find currently selected form - recalculate on each render to ensure fresh data
  const selectedForm = currentClientType?.form_id && forms.length > 0
    ? forms.find(f => f.id === currentClientType.form_id) ?? null
    : null;

  useEffect(() => {
    loadForms();
  }, []);

  // Reload forms when form_id changes but form not found (new form was created)
  useEffect(() => {
    if (currentClientType?.form_id && formsLoaded && !selectedForm) {
      loadForms();
    }
  }, [currentClientType?.form_id, formsLoaded]);

  // Load form schema when form_id changes
  useEffect(() => {
    if (selectedForm) {
      // Only load form if it's different from what's currently in the store
      // This prevents overwriting unsaved changes when component remounts
      if (currentFormId !== selectedForm.id) {
        setSchema(selectedForm.schema_json, selectedForm.id);
      }
    } else if (currentClientType?.form_id && formsLoaded) {
      // Form ID set but form not in list yet - will reload forms
    } else if (isFormType && !currentClientType?.form_id) {
      // No form selected - show empty canvas
      if (currentFormId !== null) {
        setSchema({ name: '', components: [], settings: {} }, null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedForm?.id, currentClientType?.form_id, formsLoaded, isFormType]);

  const loadForms = async () => {
    try {
      const response = await fetch(`${API_URL}/api/forms`);
      if (!response.ok) throw new Error('Failed to load forms');
      const data = await response.json();
      setForms(data);
      setFormsLoaded(true);
    } catch {
      setFormsLoaded(true); // Mark as loaded even on error
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentClientTypeId) return;
    const name = e.target.value;
    // Auto-generate code from name for new client types
    if (isNewClientType) {
      updateClientType(currentClientTypeId, { name, code: transliterate(name) });
    } else {
      updateClientType(currentClientTypeId, { name });
    }
  };

  const handleFormChange = (form: SavedForm | null) => {
    if (!currentClientTypeId) return;
    // When selecting a form, also set caption to form name if caption is empty
    const updates: Partial<{ form_id: string | null; caption: string | null }> = {
      form_id: form?.id || null
    };
    if (form && !currentClientType?.caption) {
      updates.caption = form.name;
    }
    updateClientType(currentClientTypeId, updates);
    if (form) {
      setSchema(form.schema_json, form.id);
    }
  };

  if (!currentClientType) {
    return (
      <div className="client-type-editor-empty">
        <p>Select a client type to edit</p>
      </div>
    );
  }

  // For form type items, show FormCanvas with a form selector header
  if (isFormType) {
    return (
      <div className="client-type-editor client-type-editor-form">
        <div className="cte-form-header">
          <TextField
            label="Caption"
            value={currentClientType.caption || ''}
            onChange={(e) => updateClientType(currentClientTypeId!, { caption: e.target.value || null })}
            size="small"
            className="cte-caption-input"
            placeholder="Display name in tree"
          />
          <Autocomplete
            options={forms}
            value={selectedForm}
            onChange={(_, newValue) => handleFormChange(newValue)}
            getOptionLabel={(option) => option?.name || ''}
            isOptionEqualToValue={(option, value) => option?.id === value?.id}
            loading={!formsLoaded}
            size="small"
            className="cte-form-autocomplete"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Form"
                placeholder={formsLoaded ? "Search forms..." : "Loading..."}
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <div>
                  <div>{option.name}</div>
                  {option.code && <div style={{ fontSize: '11px', color: '#888' }}>{option.code}</div>}
                </div>
              </li>
            )}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={currentClientType.always_show || false}
                onChange={(e) => updateClientType(currentClientTypeId!, { always_show: e.target.checked })}
                size="small"
              />
            }
            label="Always Show"
            title="Always show this form at top in combined mode"
            className="cte-always-show-checkbox"
          />
        </div>
        <div className="cte-form-canvas-wrapper">
          <FormCanvas hideHeader={false} />
        </div>
      </div>
    );
  }

  // For section type items, show only Code and Name (no form selector)
  return (
    <div className="client-type-editor">
      <div className="client-type-editor-content">
        <div className="cte-header-row">
          <TextField
            label="Code"
            value={currentClientType.code}
            onChange={(e) => updateClientType(currentClientTypeId!, { code: e.target.value })}
            size="small"
            className="cte-code-input"
          />
          <TextField
            label="Name"
            value={currentClientType.name}
            onChange={(e) => handleNameChange(e as React.ChangeEvent<HTMLInputElement>)}
            size="small"
            className="cte-name-input"
          />
        </div>
        <div className="cte-options-row">
          <FormControlLabel
            control={
              <Checkbox
                checked={currentClientType.combine_forms || false}
                onChange={(e) => updateClientType(currentClientTypeId!, { combine_forms: e.target.checked })}
                size="small"
              />
            }
            label="Combine Forms"
            title="Show all descendant forms as one scrollable form in preview"
          />
        </div>
      </div>
    </div>
  );
};
