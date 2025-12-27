import React, { useState, useEffect } from 'react';
import { useFormStore } from '../store/formStore';
import { useNotification } from './Notification';
import { API_URL } from '../config';
import './SavedFormsModal.css';

interface SavedForm {
  id: string;
  name: string;
  description: string | null;
  schema_json: any;
  created_at: string;
  updated_at: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SavedFormsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [forms, setForms] = useState<SavedForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSchema } = useFormStore();
  const { showNotification, showConfirm } = useNotification();

  useEffect(() => {
    if (isOpen) {
      loadForms();
    }
  }, [isOpen]);

  const loadForms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/forms`);
      if (!response.ok) throw new Error('Failed to load forms');
      const data = await response.json();
      setForms(data);
    } catch (err) {
      setError('Failed to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = (form: SavedForm) => {
    setSchema(form.schema_json);
    onClose();
  };

  const handleDelete = (id: string) => {
    showConfirm('Are you sure you want to delete this form?', async () => {
      try {
        const response = await fetch(`${API_URL}/api/forms/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete form');
        loadForms();
        showNotification('Form deleted successfully', 'success');
      } catch {
        showNotification('Failed to delete form', 'error');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal forms-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Saved Forms</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {loading && <div className="loading">Loading forms...</div>}
          {error && <div className="error-message">{error}</div>}
          {!loading && !error && forms.length === 0 && (
            <div className="no-forms">No saved forms yet. Create and save your first form!</div>
          )}
          {!loading && !error && forms.length > 0 && (
            <div className="forms-list">
              {forms.map((form) => (
                <div key={form.id} className="form-item">
                  <div className="form-info">
                    <h4 className="form-name">{form.name}</h4>
                    {form.description && (
                      <p className="form-description">{form.description}</p>
                    )}
                    <span className="form-meta">
                      {form.schema_json.components?.length || 0} components •{' '}
                      Updated {new Date(form.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="form-actions">
                    <button
                      className="form-action-btn load"
                      onClick={() => handleLoad(form)}
                    >
                      Load
                    </button>
                    <button
                      className="form-action-btn delete"
                      onClick={() => handleDelete(form.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="modal-btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
