import React, { useRef, useState } from 'react';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import CodeIcon from '@mui/icons-material/Code';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DescriptionIcon from '@mui/icons-material/Description';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PersonIcon from '@mui/icons-material/Person';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import PreviewIcon from '@mui/icons-material/Preview';
import { useFormStore, ViewMode } from '../store/formStore';
import { useClientTypeStore } from '../store/clientTypeStore';
import { useReferenceStore } from '../store/referenceStore';
import { useNotification } from './Notification';
import './Toolbar.css';

interface ToolbarProps {
  showFormsPanel: boolean;
  onToggleFormsPanel: () => void;
  onSaveCurrentForm: () => void;
  onRefreshForms: () => void;
  hasUnsavedChanges?: boolean;
  isFormMode?: boolean;
  showAIChat?: boolean;
  onToggleAIChat?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  showFormsPanel,
  onToggleFormsPanel,
  onSaveCurrentForm,
  onRefreshForms,
  hasUnsavedChanges: hasUnsavedChangesProp,
  isFormMode = true,
  showAIChat = false,
  onToggleAIChat
}) => {
  const {
    schema,
    previewMode: formPreviewMode,
    setPreviewMode: setFormPreviewMode,
    viewMode: formViewMode,
    setViewMode: setFormViewMode,
    clearForm,
    exportSchema,
    importSchema,
    setSchema,
    hasUnsavedChanges: formHasUnsavedChanges,
  } = useFormStore();

  const {
    previewMode: clientTypePreviewMode,
    setPreviewMode: setClientTypePreviewMode,
    listMode: clientTypeListMode,
    setListMode: setClientTypeListMode,
    currentClientTypeId,
    clientTypes,
  } = useClientTypeStore();

  const {
    selectedReferenceId,
    references,
  } = useReferenceStore();

  const isClientTypeMode = currentClientTypeId !== null;
  const isReferenceMode = selectedReferenceId !== null;

  // Get current object info for display
  const getCurrentObjectInfo = (): { type: string; name: string; icon: React.ReactNode } | null => {
    if (isClientTypeMode) {
      const clientType = clientTypes.find(ct => ct.id === currentClientTypeId);
      if (clientType) {
        // Determine type label and icon based on item_type and parent_id
        let typeLabel: string;
        let icon: React.ReactNode;

        if (clientType.item_type === 'form') {
          typeLabel = 'Form';
          icon = <DescriptionIcon fontSize="small" />;
        } else if (clientType.parent_id === null) {
          typeLabel = 'Client Type';
          icon = <PersonIcon fontSize="small" />;
        } else {
          typeLabel = 'Section';
          icon = <AccountTreeIcon fontSize="small" />;
        }

        return {
          type: typeLabel,
          name: clientType.name,
          icon
        };
      }
    } else if (isReferenceMode) {
      const reference = references.find(r => r.id === selectedReferenceId);
      if (reference) {
        return {
          type: 'Справочник',
          name: reference.name,
          icon: <ListAltIcon fontSize="small" />
        };
      }
    } else if (schema.name) {
      return {
        type: 'Форма',
        name: schema.name,
        icon: <DescriptionIcon fontSize="small" />
      };
    }
    return null;
  };

  const currentObject = getCurrentObjectInfo();
  const previewMode = isClientTypeMode ? clientTypePreviewMode : formPreviewMode;
  const hasUnsavedChanges = hasUnsavedChangesProp !== undefined ? hasUnsavedChangesProp : formHasUnsavedChanges;

  const { showNotification, showConfirm } = useNotification();
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportSchema();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schema.name.replace(/\s+/g, '_').toLowerCase()}_form.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (importSchema(content)) {
          showNotification('Form imported successfully!', 'success');
        } else {
          showNotification('Invalid form JSON file', 'error');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const handleViewJson = () => {
    setJsonInput(exportSchema());
    setShowJsonModal(true);
  };

  const handleApplyJson = () => {
    if (importSchema(jsonInput)) {
      setShowJsonModal(false);
      showNotification('JSON applied successfully!', 'success');
    } else {
      showNotification('Invalid JSON format', 'error');
    }
  };

  const handleClear = () => {
    showConfirm('Are you sure you want to clear the form? This action cannot be undone.', () => {
      clearForm();
    });
  };

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-left">
          <button
            className={`toolbar-btn icon-only ${hasUnsavedChanges ? 'has-changes' : ''}`}
            onClick={onSaveCurrentForm}
            disabled={!hasUnsavedChanges}
            title="Save"
          >
            <SaveIcon fontSize="small" />
          </button>
          <button className="toolbar-btn icon-only" onClick={onRefreshForms} title="Refresh">
            <RefreshIcon fontSize="small" />
          </button>

          <div className="toolbar-divider" />

          <button
            className="toolbar-btn icon-only"
            onClick={handleViewJson}
            title="View/Edit JSON"
            disabled={!isFormMode}
          >
            <CodeIcon fontSize="small" />
          </button>
          <button
            className="toolbar-btn icon-only"
            onClick={handleExport}
            title="Export form to file"
            disabled={!isFormMode}
          >
            <DownloadIcon fontSize="small" />
          </button>
          <button
            className="toolbar-btn icon-only"
            onClick={handleImportClick}
            title="Import form from file"
            disabled={!isFormMode}
          >
            <UploadIcon fontSize="small" />
          </button>
          <button
            className="toolbar-btn icon-only danger"
            onClick={handleClear}
            title="Clear form"
            disabled={!isFormMode}
          >
            <DeleteSweepIcon fontSize="small" />
          </button>

          <div className="toolbar-divider" />

          <div className="view-mode-toggle">
            <button
              className={`toolbar-btn icon-only ${(isClientTypeMode ? !clientTypePreviewMode && formViewMode !== 'tree' : formViewMode === 'edit') ? 'active' : ''}`}
              onClick={() => {
                if (isClientTypeMode) {
                  setClientTypePreviewMode(false);
                  setFormViewMode('edit');
                } else {
                  setFormViewMode('edit');
                }
              }}
              title="Edit mode"
              disabled={!isFormMode && !isClientTypeMode}
            >
              <EditIcon fontSize="small" />
            </button>
            <button
              className={`toolbar-btn icon-only ${(isClientTypeMode ? clientTypePreviewMode && formViewMode !== 'tree' : formViewMode === 'preview') ? 'active' : ''}`}
              onClick={() => {
                if (isClientTypeMode) {
                  setClientTypePreviewMode(true);
                  setFormViewMode('preview');
                } else {
                  setFormViewMode('preview');
                }
              }}
              title="Preview mode"
              disabled={!isFormMode && !isClientTypeMode}
            >
              <PreviewIcon fontSize="small" />
            </button>
            <button
              className={`toolbar-btn icon-only ${formViewMode === 'tree' ? 'active' : ''}`}
              onClick={() => setFormViewMode('tree')}
              title="Tree view"
              disabled={!isFormMode && !isClientTypeMode}
            >
              <AccountTreeIcon fontSize="small" />
            </button>
          </div>

          {isClientTypeMode && !clientTypeListMode && (
            <button
              className="toolbar-btn mode-toggle-btn run-btn"
              onClick={() => setClientTypeListMode(true)}
              title="Запустить список клиентов"
            >
              <PlayArrowIcon fontSize="small" />
              <span>Run</span>
            </button>
          )}

          {clientTypeListMode && (
            <button
              className="toolbar-btn mode-toggle-btn"
              onClick={() => setClientTypeListMode(false)}
              title="Вернуться к редактированию"
            >
              <EditIcon fontSize="small" />
              <span>Edit</span>
            </button>
          )}
        </div>

        <div className="toolbar-center">
          {currentObject && (
            <div className="toolbar-object-info">
              {currentObject.icon}
              <span className="toolbar-object-type">{currentObject.type}:</span>
              <span className="toolbar-object-name">{currentObject.name}</span>
            </div>
          )}
        </div>

        <div className="toolbar-right">
          <button
            className={`toolbar-btn icon-only ${showAIChat ? 'active' : ''}`}
            onClick={onToggleAIChat}
            title={showAIChat ? 'Hide AI Chat' : 'Show AI Chat'}
          >
            <AutoAwesomeIcon fontSize="small" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* JSON Modal */}
      {showJsonModal && (
        <div className="modal-overlay" onClick={() => setShowJsonModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Form JSON Schema</h2>
              <button className="modal-close" onClick={() => setShowJsonModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <textarea
                className="json-editor"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={() => setShowJsonModal(false)}>
                Cancel
              </button>
              <button
                className="modal-btn secondary"
                onClick={() => {
                  navigator.clipboard.writeText(jsonInput);
                  showNotification('Copied to clipboard!', 'success');
                }}
              >
                Copy
              </button>
              <button className="modal-btn primary" onClick={handleApplyJson}>
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
