import React, { useState, useRef } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Editor, { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useReferenceStore, ReferenceData } from '../store/referenceStore';
import './ReferenceEditor.css';

export const ReferenceEditor: React.FC = () => {
  const {
    references,
    selectedReferenceId,
    updateReference,
    addField,
    updateField,
    deleteField,
    addDataRow,
    updateDataRow,
    deleteDataRow,
    loadReferenceData,
    referencesToCreate,
    referencesToUpdate,
    fieldsToCreate,
    fieldsToUpdate,
    dataToCreate,
    dataToUpdate,
  } = useReferenceStore();

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['attributes', 'fields', 'data']));
  const [selectedDataRowId, setSelectedDataRowId] = useState<string | null>(null);
  const [expandedDataRows, setExpandedDataRows] = useState<Set<string>>(new Set());
  const [codeSearchQuery, setCodeSearchQuery] = useState('');
  const [codeSearchVisible, setCodeSearchVisible] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewSearch, setPreviewSearch] = useState('');
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleCodeSearch = () => {
    if (editorRef.current && codeSearchQuery) {
      const model = editorRef.current.getModel();
      if (model) {
        const matches = model.findMatches(codeSearchQuery, true, false, false, null, true);
        if (matches.length > 0) {
          editorRef.current.setSelection(matches[0].range);
          editorRef.current.revealLineInCenter(matches[0].range.startLineNumber);
          editorRef.current.focus();
        }
      }
    }
  };

  const handleCodeSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCodeSearch();
    }
  };

  const selectedReference = references.find((r) => r.id === selectedReferenceId);

  const handleCalculationCodeChange = (value: string | undefined) => {
    if (selectedReference) {
      updateReference(selectedReference.id, { calculation_code: value || '' });
    }
  };

  if (!selectedReference) {
    return (
      <div className="reference-editor-empty">
        <p>Select a reference to edit</p>
      </div>
    );
  }

  const isNew = referencesToCreate.has(selectedReference.id);
  const isModified = referencesToUpdate.has(selectedReference.id);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateReference(selectedReference.id, { name: e.target.value });
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateReference(selectedReference.id, { code: e.target.value });
  };

  const handleHierarchicalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateReference(selectedReference.id, { is_hierarchical: e.target.checked });
  };

  const handleDataByScriptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateReference(selectedReference.id, { data_by_script: e.target.checked });
  };

  const handlePreviewData = () => {
    if (selectedReference.data_by_script) {
      // Parse the script and simulate returning data
      // The script should return a JSON array like [{code_f1: ..., code_f2: ...}, ...]
      const code = selectedReference.calculation_code || '';
      try {
        // For now, try to extract JSON from the script by looking for return statement or last expression
        // In a real implementation, this would execute Python on the server
        // For preview, we'll try to parse any JSON-like structure in the code
        const jsonMatch = code.match(/\[\s*\{[\s\S]*?\}\s*\]/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[0]);
          setPreviewData(data);
        } else {
          // Try to find a return statement with a list
          setPreviewData([{ message: 'No valid JSON array found in script. Script should return [{...}, ...]' }]);
        }
      } catch (e) {
        setPreviewData([{ error: 'Failed to parse script output', details: String(e) }]);
      }
    } else {
      // Show data from dataRows with field names as headers
      const fields = selectedReference.fields || [];
      const rows = selectedReference.dataRows || [];

      if (rows.length === 0) {
        setPreviewData([]);
      } else {
        // Transform dataRows to display format with field names
        const displayData = rows.map(row => {
          const displayRow: Record<string, any> = {};
          fields.forEach(field => {
            // Data can be stored by field.id or field.code, check both
            const value = row.data[field.id] ?? row.data[field.code] ?? '';
            displayRow[field.name || field.code] = value;
          });
          return displayRow;
        });
        setPreviewData(displayData);
      }
    }
    setPreviewOpen(true);
  };

  const handleAddField = () => {
    addField(selectedReference.id);
  };

  const handleFieldNameChange = (fieldId: string, value: string) => {
    updateField(selectedReference.id, fieldId, { name: value });
  };

  const handleFieldCodeChange = (fieldId: string, value: string) => {
    updateField(selectedReference.id, fieldId, { code: value });
  };

  const handleFieldRefChange = (fieldId: string, value: string) => {
    updateField(selectedReference.id, fieldId, { ref_reference_id: value || null });
  };

  const handleDeleteField = (fieldId: string) => {
    deleteField(selectedReference.id, fieldId);
  };

  const handleAddDataRow = () => {
    addDataRow(selectedReference.id, null);
  };

  const handleAddChildDataRow = (parentId: string) => {
    addDataRow(selectedReference.id, parentId);
    setExpandedDataRows((prev) => new Set(prev).add(parentId));
  };

  const toggleDataRowExpanded = (rowId: string) => {
    setExpandedDataRows((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  // Build hierarchical structure for data rows
  const buildDataTree = (rows: ReferenceData[]): { row: ReferenceData; children: any[]; level: number }[] => {
    const rowMap = new Map<string, { row: ReferenceData; children: any[]; level: number }>();
    const rootRows: { row: ReferenceData; children: any[]; level: number }[] = [];

    // Create nodes
    rows.forEach((row) => {
      rowMap.set(row.id, { row, children: [], level: 0 });
    });

    // Build hierarchy
    rows.forEach((row) => {
      const node = rowMap.get(row.id)!;
      if (row.parent_id && rowMap.has(row.parent_id)) {
        const parent = rowMap.get(row.parent_id)!;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        rootRows.push(node);
      }
    });

    return rootRows;
  };

  // Flatten tree for rendering
  const flattenDataTree = (
    nodes: { row: ReferenceData; children: any[]; level: number }[],
    result: { row: ReferenceData; level: number; hasChildren: boolean }[] = []
  ): { row: ReferenceData; level: number; hasChildren: boolean }[] => {
    nodes.forEach((node) => {
      result.push({ row: node.row, level: node.level, hasChildren: node.children.length > 0 });
      if (expandedDataRows.has(node.row.id) && node.children.length > 0) {
        flattenDataTree(node.children, result);
      }
    });
    return result;
  };

  const handleDeleteDataRow = () => {
    if (selectedDataRowId) {
      deleteDataRow(selectedReference.id, selectedDataRowId);
      setSelectedDataRowId(null);
    }
  };

  const handleRefreshData = () => {
    if (!referencesToCreate.has(selectedReference.id)) {
      loadReferenceData(selectedReference.id);
      setSelectedDataRowId(null);
    }
  };

  const handleDataCellChange = (rowId: string, fieldCode: string, value: string) => {
    const row = (selectedReference.dataRows || []).find((r) => r.id === rowId);
    if (row) {
      updateDataRow(selectedReference.id, rowId, { ...row.data, [fieldCode]: value });
    }
  };

  const otherReferences = references.filter((r) => r.id !== selectedReference.id);

  return (
    <div className="reference-editor">
      {/* Attributes Accordion */}
      <div className="ref-editor-accordion">
        <div
          className={`ref-editor-accordion-header ${expandedSections.has('attributes') ? 'active' : ''}`}
          onClick={() => toggleSection('attributes')}
        >
          <span className="ref-editor-accordion-title">
            Attributes
            {isNew && <span className="ref-editor-badge new">new</span>}
            {isModified && !isNew && <span className="ref-editor-badge mod">mod</span>}
          </span>
          <ExpandMoreIcon
            className={`ref-editor-accordion-icon ${expandedSections.has('attributes') ? 'expanded' : ''}`}
          />
        </div>
        <div className={`ref-editor-accordion-content ${expandedSections.has('attributes') ? 'expanded' : ''}`}>
          <div className="ref-editor-field-row">
            <TextField
              label="Code"
              value={selectedReference.code}
              onChange={handleCodeChange}
              size="small"
              className="ref-editor-code-input"
            />
            <TextField
              label="Name"
              value={selectedReference.name}
              onChange={handleNameChange}
              size="small"
              className="ref-editor-name-input"
            />
          </div>
          <div className="ref-editor-field-row">
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedReference.is_hierarchical || false}
                  onChange={handleHierarchicalChange}
                  size="small"
                />
              }
              label="Hierarchy (tree structure)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedReference.data_by_script || false}
                  onChange={handleDataByScriptChange}
                  size="small"
                />
              }
              label="Data By Script"
            />
          </div>

          {/* Data Script Editor - only show when data_by_script is true */}
          {selectedReference.data_by_script && (
            <div className="ref-editor-code-section">
              <div className="ref-editor-code-header">
                <span className="ref-editor-code-label">Data Script (Python)</span>
                <button
                  className="ref-editor-search-toggle"
                  onClick={() => setCodeSearchVisible(!codeSearchVisible)}
                  title="Search in code"
                >
                  <SearchIcon fontSize="small" />
                </button>
              </div>
              {codeSearchVisible && (
                <div className="ref-editor-code-search">
                  <input
                    type="text"
                    value={codeSearchQuery}
                    onChange={(e) => setCodeSearchQuery(e.target.value)}
                    onKeyDown={handleCodeSearchKeyDown}
                    placeholder="Search..."
                    className="ref-editor-code-search-input"
                  />
                  <button
                    className="ref-editor-code-search-btn"
                    onClick={handleCodeSearch}
                  >
                    Find
                  </button>
                </div>
              )}
              <div className="ref-editor-monaco-wrapper">
                <Editor
                  height="200px"
                  defaultLanguage="python"
                  value={selectedReference.calculation_code || ''}
                  onChange={handleCalculationCodeChange}
                  onMount={handleEditorMount}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    fontSize: 12,
                    tabSize: 4,
                    automaticLayout: true,
                    wordWrap: 'on',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fields Accordion */}
      <div className="ref-editor-accordion">
        <div
          className={`ref-editor-accordion-header ${expandedSections.has('fields') ? 'active' : ''}`}
          onClick={() => toggleSection('fields')}
        >
          <span className="ref-editor-accordion-title">
            Fields ({(selectedReference.fields || []).length})
          </span>
          <button
            className="ref-editor-add-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleAddField();
            }}
            title="Add field"
          >
            <AddIcon fontSize="small" />
          </button>
          <ExpandMoreIcon
            className={`ref-editor-accordion-icon ${expandedSections.has('fields') ? 'expanded' : ''}`}
          />
        </div>
        <div className={`ref-editor-accordion-content ${expandedSections.has('fields') ? 'expanded' : ''}`}>
          {(selectedReference.fields || []).length === 0 ? (
            <div className="ref-editor-empty">No fields</div>
          ) : (
            <table className="ref-editor-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Ref</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(selectedReference.fields || []).map((field) => {
                  const isFieldNew = fieldsToCreate.has(field.id);
                  const isFieldModified = fieldsToUpdate.has(field.id);

                  return (
                    <tr key={field.id}>
                      <td>
                        <div className="ref-editor-field-cell">
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => handleFieldNameChange(field.id, e.target.value)}
                            className="ref-editor-table-input"
                          />
                          {isFieldNew && <span className="ref-editor-badge-small new">+</span>}
                          {isFieldModified && !isFieldNew && <span className="ref-editor-badge-small mod">*</span>}
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={field.code}
                          onChange={(e) => handleFieldCodeChange(field.id, e.target.value)}
                          className="ref-editor-table-input"
                        />
                      </td>
                      <td>
                        <select
                          value={field.ref_reference_id || ''}
                          onChange={(e) => handleFieldRefChange(field.id, e.target.value)}
                          className="ref-editor-select"
                        >
                          <option value="">-</option>
                          {otherReferences.map((ref) => (
                            <option key={ref.id} value={ref.id}>
                              {ref.name || ref.code}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          className="ref-editor-delete-btn"
                          onClick={() => handleDeleteField(field.id)}
                          title="Delete field"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Data Accordion */}
      <div className="ref-editor-accordion">
        <div
          className={`ref-editor-accordion-header ${expandedSections.has('data') ? 'active' : ''}`}
          onClick={() => toggleSection('data')}
        >
          <span className="ref-editor-accordion-title">
            Data ({(selectedReference.dataRows || []).length})
          </span>
          <div className="ref-editor-header-buttons" onClick={(e) => e.stopPropagation()}>
            <button
              className="ref-editor-add-btn ref-editor-preview-btn"
              onClick={handlePreviewData}
              title="Preview reference data"
            >
              <VisibilityIcon fontSize="small" />
            </button>
            <button
              className="ref-editor-add-btn"
              onClick={handleAddDataRow}
              title="Add data row"
            >
              <AddIcon fontSize="small" />
            </button>
            <button
              className="ref-editor-add-btn"
              onClick={handleDeleteDataRow}
              disabled={selectedDataRowId === null}
              title="Delete selected row"
            >
              <DeleteIcon fontSize="small" />
            </button>
            <button
              className="ref-editor-add-btn"
              onClick={handleRefreshData}
              disabled={referencesToCreate.has(selectedReference.id)}
              title="Refresh data"
            >
              <RefreshIcon fontSize="small" />
            </button>
          </div>
          <ExpandMoreIcon
            className={`ref-editor-accordion-icon ${expandedSections.has('data') ? 'expanded' : ''}`}
          />
        </div>
        <div className={`ref-editor-accordion-content ${expandedSections.has('data') ? 'expanded' : ''}`}>
          {(selectedReference.fields || []).length === 0 ? (
            <div className="ref-editor-empty">No fields defined. Add fields first.</div>
          ) : (selectedReference.dataRows || []).length === 0 ? (
            <div className="ref-editor-empty">No data</div>
          ) : (
            <div className="ref-editor-data-table-wrapper">
              <table className="ref-editor-table ref-editor-data-table">
                <thead>
                  <tr>
                    {selectedReference.is_hierarchical && <th className="ref-editor-tree-col"></th>}
                    {(selectedReference.fields || []).map((field) => (
                      <th key={field.id}>{field.name || field.code}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const rows = selectedReference.dataRows || [];
                    const displayRows = selectedReference.is_hierarchical
                      ? flattenDataTree(buildDataTree(rows))
                      : rows.map((row) => ({ row, level: 0, hasChildren: false }));

                    return displayRows.map(({ row, level, hasChildren }) => {
                      const isRowNew = dataToCreate.has(row.id);
                      const isRowModified = dataToUpdate.has(row.id);
                      const isSelected = selectedDataRowId === row.id;
                      const isExpanded = expandedDataRows.has(row.id);

                      return (
                        <tr
                          key={row.id}
                          className={isSelected ? 'selected' : ''}
                          onClick={() => setSelectedDataRowId(row.id)}
                        >
                          {selectedReference.is_hierarchical && (
                            <td className="ref-editor-tree-cell">
                              <div
                                className="ref-editor-tree-controls"
                                style={{ paddingLeft: `${level * 16}px` }}
                              >
                                {isSelected && (
                                  <button
                                    className="ref-editor-add-child-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddChildDataRow(row.id);
                                    }}
                                    title="Add child row"
                                  >
                                    <SubdirectoryArrowRightIcon fontSize="small" />
                                  </button>
                                )}
                                {hasChildren && (
                                  <button
                                    className="ref-editor-expand-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleDataRowExpanded(row.id);
                                    }}
                                  >
                                    {isExpanded ? (
                                      <ExpandMoreIcon fontSize="small" />
                                    ) : (
                                      <ChevronRightIcon fontSize="small" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                          {(selectedReference.fields || []).map((field, idx) => (
                            <td key={field.id}>
                              <div className="ref-editor-field-cell">
                                <input
                                  type="text"
                                  value={row.data[field.id] || ''}
                                  onChange={(e) => handleDataCellChange(row.id, field.id, e.target.value)}
                                  className="ref-editor-table-input"
                                />
                                {idx === 0 && isRowNew && <span className="ref-editor-badge-small new">+</span>}
                                {idx === 0 && isRowModified && !isRowNew && <span className="ref-editor-badge-small mod">*</span>}
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Preview Data Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#fff',
            color: '#333',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
          <span>{selectedReference?.name || 'Reference'} - Preview</span>
          <IconButton onClick={() => setPreviewOpen(false)} size="small" sx={{ color: '#666' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <div className="ref-editor-preview-search" style={{ padding: '12px 16px', borderBottom: '1px solid #e0e0e0' }}>
            <input
              type="text"
              value={previewSearch}
              onChange={(e) => setPreviewSearch(e.target.value)}
              placeholder="Search in data..."
              className="ref-editor-preview-search-input"
              style={{ background: '#f5f5f5', border: '1px solid #ddd', color: '#333' }}
            />
          </div>
          <div className="ref-editor-preview-content" style={{ maxHeight: '60vh', overflow: 'auto' }}>
            {previewData.length === 0 ? (
              <div className="ref-editor-preview-empty" style={{ color: '#666', padding: '40px', textAlign: 'center' }}>No data</div>
            ) : (
              <table className="ref-editor-preview-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {previewData.length > 0 && Object.keys(previewData[0]).map((key) => (
                      <th key={key} style={{ padding: '10px 14px', background: '#f8f8f8', borderBottom: '1px solid #e0e0e0', textAlign: 'left', fontWeight: 500, color: '#555' }}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData
                    .filter((row) => {
                      if (!previewSearch) return true;
                      const searchLower = previewSearch.toLowerCase();
                      return Object.values(row).some((val) =>
                        String(val).toLowerCase().includes(searchLower)
                      );
                    })
                    .map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        {Object.values(row).map((val, cellIdx) => (
                          <td key={cellIdx} style={{ padding: '10px 14px', color: '#333' }}>{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
