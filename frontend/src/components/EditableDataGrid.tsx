import React, { useCallback, useState, useEffect } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowModel,
  GridRowId,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import CloseIcon from '@mui/icons-material/Close';
import { GridColumn, FormSchema, FormComponent } from '../types';
import { FormComponentRenderer } from './FormComponentRenderer';
import { API_URL } from '../config';
import './EditableDataGrid.css';

interface Props {
  columns: GridColumn[];
  value: GridRowModel[];
  onChange: (rows: GridRowModel[]) => void;
  minRows?: number;
  maxRows?: number;
  disabled?: boolean;
  label?: string;
  rowEditorFormId?: string | null;
  columnFieldMapping?: Record<string, string>; // maps column id to form field id
}

export const EditableDataGrid: React.FC<Props> = ({
  columns,
  value = [],
  onChange,
  minRows = 0,
  maxRows = 100,
  disabled = false,
  label,
  rowEditorFormId,
  columnFieldMapping = {},
}) => {
  const [selectedRowId, setSelectedRowId] = useState<GridRowId | null>(null);
  const [editorForm, setEditorForm] = useState<FormSchema | null>(null);
  const [loadingForm, setLoadingForm] = useState(false);

  // Load row editor form when formId changes
  useEffect(() => {
    if (rowEditorFormId) {
      setLoadingForm(true);
      fetch(`${API_URL}/api/forms/${rowEditorFormId}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            setEditorForm(data.schema_json);
          } else {
            setEditorForm(null);
          }
        })
        .catch(() => setEditorForm(null))
        .finally(() => setLoadingForm(false));
    } else {
      setEditorForm(null);
      setSelectedRowId(null);
    }
  }, [rowEditorFormId]);

  // Generate unique ID for new rows
  const generateId = () => `row-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Normalize columns to handle legacy format (value instead of id)
  const normalizedColumns = React.useMemo(() => {
    return columns.map((col: any) => ({
      id: col.id || col.value || `col-${Math.random().toString(36).substr(2, 9)}`,
      label: col.label || '',
      type: col.type || 'text',
      options: col.options,
      computeScript: col.computeScript,
      width: col.width,
      wrap: col.wrap || false,
      iconSourceColumn: col.iconSourceColumn,
      iconMapping: col.iconMapping,
    }));
  }, [columns]);

  // Check if any column has wrap enabled
  const hasWrapColumns = React.useMemo(() => {
    return normalizedColumns.some(col => col.wrap);
  }, [normalizedColumns]);

  // Find a component by ID in the form schema
  const findComponentById = React.useCallback((components: FormComponent[], id: string): FormComponent | undefined => {
    for (const comp of components) {
      if (comp.id === id) return comp;
      if (comp.children) {
        const found = findComponentById(comp.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }, []);

  // Find a component by LABEL in the form schema
  const findComponentByLabel = React.useCallback((components: FormComponent[], label: string): FormComponent | undefined => {
    for (const comp of components) {
      if (comp.props.label === label) return comp;
      if (comp.children) {
        const found = findComponentByLabel(comp.children, label);
        if (found) return found;
      }
    }
    return undefined;
  }, []);

  // Compute value for a computed column based on row data and editor form
  const computeColumnValue = React.useCallback((computeScript: string, row: GridRowModel): string => {
    if (!computeScript) return '';
    try {
      // Create get_field_by_name function that searches by LABEL
      const get_field_by_name = (fieldLabel: string): any => {
        if (!editorForm?.components) return '';

        // Find component by label
        const component = findComponentByLabel(editorForm.components, fieldLabel);
        if (!component) return '';

        // Get value from row - first check _field_ storage, then column mapping
        let value = row[`_field_${component.id}`];

        // If not found, check if it's mapped to a column
        if (value === undefined) {
          for (const [colId, mappedFieldId] of Object.entries(columnFieldMapping)) {
            if (mappedFieldId === component.id) {
              value = row[colId];
              break;
            }
          }
        }

        // If value is undefined or null, return empty string
        if (value === undefined || value === null || value === '') {
          return '';
        }

        // For select fields, return the label instead of value
        if (component.type === 'select' && component.props.options) {
          const option = component.props.options.find((opt: any) => opt.value === value);
          if (option) {
            return option.label;
          }
        }

        return value;
      };

      // Create evaluation context
      const evalScript = new Function('get_field_by_name', 'get_field', 'row', `
        "use strict";
        ${computeScript}
      `);
      const result = evalScript(get_field_by_name, get_field_by_name, row);
      return result !== undefined && result !== null ? String(result) : '';
    } catch (e) {
      return `Error: ${e instanceof Error ? e.message : 'Script error'}`;
    }
  }, [columnFieldMapping, editorForm, findComponentByLabel]);

  // Ensure minimum rows and all rows have IDs
  const rows = React.useMemo(() => {
    // Ensure each existing row has an id
    const currentRows = value.map((row, index) => {
      if (!row.id) {
        return { ...row, id: `row-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
      }
      return row;
    });
    // Add minimum empty rows if needed
    while (currentRows.length < minRows) {
      const newRow: GridRowModel = { id: generateId() };
      normalizedColumns.forEach((col) => {
        newRow[col.id] = '';
      });
      currentRows.push(newRow);
    }
    return currentRows;
  }, [value, minRows, normalizedColumns]);

  const handleDeleteClick = useCallback(
    (id: GridRowId) => () => {
      if (rows.length > minRows) {
        onChange(rows.filter((row) => row.id !== id));
      }
    },
    [rows, minRows, onChange]
  );

  // Get options for a column - either from column itself or from linked form field
  const getColumnOptions = React.useCallback((col: any): { value: string; label: string }[] | null => {
    // First check if column has its own options
    if (col.options && col.options.length > 0) {
      return col.options;
    }
    // Check if column is linked to a form field that has options
    const linkedFieldId = columnFieldMapping[col.id];
    if (linkedFieldId && editorForm?.components) {
      const field = findComponentById(editorForm.components, linkedFieldId);
      if (field && (field.type === 'select' || field.type === 'radio') && field.props?.options) {
        return field.props.options;
      }
    }
    return null;
  }, [columnFieldMapping, editorForm, findComponentById]);

  // Convert our columns to MUI DataGrid columns
  const gridColumns: GridColDef[] = React.useMemo(() => {
    const cols: GridColDef[] = normalizedColumns.map((col) => {
      // Get options from column or linked form field
      const options = getColumnOptions(col);

      // Base column config
      const baseConfig: GridColDef = {
        field: col.id,
        headerName: col.label,
        flex: 1,
        minWidth: col.width || 120,
        editable: !disabled && col.type !== 'computed',
        type: col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'string',
      };

      // Add wrap styles if enabled
      if (col.wrap) {
        baseConfig.renderCell = (params) => {
          // Check if value should be mapped to label
          if (options) {
            const option = options.find((opt) => opt.value === params.value);
            const displayValue = option?.label || params.value;
            return (
              <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: '1.4', padding: '8px 0' }}>
                {displayValue}
              </div>
            );
          }
          return (
            <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: '1.4', padding: '8px 0' }}>
              {params.value}
            </div>
          );
        };
      } else if (options && col.type !== 'select') {
        // Column is linked to select field but is not itself a select - add label rendering
        baseConfig.renderCell = (params) => {
          const option = options.find((opt) => opt.value === params.value);
          return option?.label || params.value || '';
        };
      }

      // Handle select type
      if (col.type === 'select' && col.options) {
        const hasIconMapping = col.iconMapping && col.iconMapping.length > 0;
        const selectConfig: GridColDef = {
          ...baseConfig,
          type: 'singleSelect',
          valueOptions: col.options.map((opt: { value: string; label: string }) => ({ value: opt.value, label: opt.label })),
        };
        // Render icons if iconMapping is configured for select column
        if (hasIconMapping) {
          selectConfig.renderCell = (params) => {
            const match = col.iconMapping?.find((m: { value: string; icon: string; color?: string }) => String(m.value) === String(params.value));
            if (match) {
              return (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  fontSize: '18px',
                  color: match.color || 'inherit'
                }} title={col.options?.find((opt: { value: string; label: string }) => opt.value === params.value)?.label || params.value}>
                  {match.icon}
                </div>
              );
            }
            const option = col.options?.find((opt: { value: string; label: string }) => opt.value === params.value);
            return option?.label || params.value;
          };
        } else if (col.wrap) {
          selectConfig.renderCell = (params) => {
            const option = col.options?.find((opt: { value: string; label: string }) => opt.value === params.value);
            return (
              <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: '1.4', padding: '8px 0' }}>
                {option?.label || params.value}
              </div>
            );
          };
        } else {
          // Default: show label instead of value
          selectConfig.renderCell = (params) => {
            const option = col.options?.find((opt: { value: string; label: string }) => opt.value === params.value);
            return option?.label || params.value || '';
          };
        }
        return selectConfig;
      }

      // Handle computed type
      if (col.type === 'computed') {
        return {
          ...baseConfig,
          editable: false,
          cellClassName: 'computed-cell',
          valueGetter: (value: any, row: GridRowModel) => {
            return computeColumnValue(col.computeScript || '', row);
          },
          renderCell: col.wrap ? (params) => (
            <div style={{ whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: '1.4', padding: '8px 0' }}>
              {params.value}
            </div>
          ) : undefined,
        };
      }

      // Handle date type - convert string to Date for MUI DataGrid
      if (col.type === 'date') {
        return {
          ...baseConfig,
          type: 'date',
          valueGetter: (value: any) => {
            if (!value) return null;
            if (value instanceof Date) return value;
            // Parse string date (YYYY-MM-DD format)
            const date = new Date(value);
            return isNaN(date.getTime()) ? null : date;
          },
          valueSetter: (value: any, row: GridRowModel) => {
            // Convert Date back to string for storage
            if (value instanceof Date) {
              return { ...row, [col.id]: value.toISOString().split('T')[0] };
            }
            return { ...row, [col.id]: value || '' };
          },
        };
      }

      // Handle time type
      if (col.type === 'time') {
        return {
          ...baseConfig,
          editable: !disabled,
          renderCell: (params) => (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {params.value || ''}
            </div>
          ),
          renderEditCell: (params) => (
            <input
              type="time"
              value={params.value || ''}
              onChange={(e) => {
                params.api.setEditCellValue({ id: params.id, field: params.field, value: e.target.value });
              }}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                padding: '0 8px',
                fontSize: '14px',
              }}
              autoFocus
            />
          ),
        };
      }

      // Handle boolean type - show checkbox like the reference design
      if (col.type === 'boolean') {
        return {
          ...baseConfig,
          type: 'boolean',
          editable: !disabled,
          width: col.width || 60,
          minWidth: 50,
          flex: 0,
          renderCell: (params) => (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}>
              {params.value ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="1" width="14" height="14" rx="2" fill="#1976d2" stroke="#1976d2"/>
                  <path d="M4 8L7 11L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#ccc"/>
                </svg>
              )}
            </div>
          ),
        };
      }

      // Handle icon type - show icon based on another column's value
      if (col.type === 'icon') {
        return {
          ...baseConfig,
          editable: false,
          renderCell: (params) => {
            // Get the source value from another column
            const sourceValue = col.iconSourceColumn ? params.row[col.iconSourceColumn] : params.value;
            const mapping = col.iconMapping || [];

            // Find matching icon
            const match = mapping.find((m: any) => String(m.value) === String(sourceValue));

            if (match) {
              return (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  fontSize: '18px',
                  color: match.color || 'inherit'
                }}>
                  {match.icon}
                </div>
              );
            }
            return null;
          },
        };
      }

      return baseConfig;
    });

    // Add delete action column
    if (!disabled) {
      cols.push({
        field: 'actions',
        type: 'actions',
        headerName: '',
        width: 40,
        cellClassName: 'actions',
        getActions: ({ id }) => [
          <GridActionsCellItem
            key="delete"
            icon={<span className="grid-delete-icon">−</span>}
            label="Delete"
            onClick={handleDeleteClick(id)}
            disabled={rows.length <= minRows}
          />,
        ],
      });
    }

    return cols;
  }, [normalizedColumns, disabled, rows, minRows, handleDeleteClick, computeColumnValue, getColumnOptions]);

  const processRowUpdate = useCallback(
    (newRow: GridRowModel) => {
      const updatedRows = rows.map((row) => (row.id === newRow.id ? newRow : row));
      onChange(updatedRows);
      return newRow;
    },
    [rows, onChange]
  );

  const handleAddRow = () => {
    if (rows.length >= maxRows) return;

    const newRow: GridRowModel = { id: generateId() };
    normalizedColumns.forEach((col) => {
      newRow[col.id] = '';
    });
    onChange([...rows, newRow]);
  };

  const canAddRow = !disabled && rows.length < maxRows;

  // Get selected row data
  const selectedRow = selectedRowId ? rows.find((r) => r.id === selectedRowId) : null;

  // Create reverse mapping: form field id -> column id
  const fieldToColumnMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(columnFieldMapping).forEach(([colId, fieldId]) => {
      if (fieldId) {
        map[fieldId] = colId;
      }
    });
    return map;
  }, [columnFieldMapping]);

  // Build formData from selected row - all field values stored in row with _field_ prefix
  const editorFormData = React.useMemo(() => {
    if (!selectedRow) return {};
    const data: Record<string, any> = {};

    // Get mapped column values
    Object.entries(columnFieldMapping).forEach(([colId, fieldId]) => {
      if (fieldId && selectedRow[colId] !== undefined) {
        data[fieldId] = selectedRow[colId];
      }
    });

    // Get all stored field values (for unmapped fields)
    Object.entries(selectedRow).forEach(([key, val]) => {
      if (key.startsWith('_field_')) {
        const fieldId = key.substring(7); // remove '_field_' prefix
        if (data[fieldId] === undefined) {
          data[fieldId] = val;
        }
      }
    });

    return data;
  }, [selectedRow, columnFieldMapping]);

  // Handle field change from FormComponentRenderer - store ALL fields
  const handleEditorFieldChange = (fieldId: string, fieldValue: any) => {
    if (!selectedRowId) return;
    const columnId = fieldToColumnMap[fieldId];

    const updatedRows = rows.map((row) => {
      if (row.id !== selectedRowId) return row;

      const newRow = { ...row };
      if (columnId) {
        // Field is mapped to a column
        newRow[columnId] = fieldValue;
      }
      // Always store with _field_ prefix for retrieval
      newRow[`_field_${fieldId}`] = fieldValue;
      return newRow;
    });
    onChange(updatedRows);
  };

  // Handle row click for editor
  const handleRowClick = (params: any) => {
    if (editorForm && !disabled) {
      setSelectedRowId(params.id);
    }
  };

  return (
    <div className={`editable-data-grid ${selectedRowId && editorForm ? 'with-editor' : ''}`}>
      <div className="grid-main">
        <div className="grid-header">
          {label && <label className="grid-label">{label}</label>}
          {canAddRow && (
            <button type="button" className="grid-add-btn" onClick={handleAddRow} title="Add row">
              +
            </button>
          )}
        </div>
        <div className="grid-container">
          <DataGrid
            rows={rows}
            columns={gridColumns}
            editMode="cell"
            processRowUpdate={processRowUpdate}
            disableRowSelectionOnClick={!editorForm}
            checkboxSelection={false}
            hideFooter
            autoHeight
            density="compact"
            onRowClick={handleRowClick}
            getRowHeight={hasWrapColumns ? () => 'auto' : undefined}
            sx={{
              border: 'none',
              borderRadius: 0,
              fontSize: '13px',
              '& .MuiDataGrid-main': {
                border: 'none',
              },
              '& .MuiDataGrid-row': {
                borderBottom: '1px solid #e8e8e8',
                minHeight: '36px !important',
                maxHeight: hasWrapColumns ? 'none' : '36px !important',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
              },
              '& .MuiDataGrid-cell': {
                fontSize: '13px',
                color: '#333',
                borderBottom: 'none',
                padding: '4px 12px',
                ...(hasWrapColumns && {
                  alignItems: 'flex-start',
                  py: 1,
                }),
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'transparent',
                borderBottom: '1px solid #e0e0e0',
                minHeight: '32px !important',
                maxHeight: '32px !important',
              },
              '& .MuiDataGrid-columnHeader': {
                padding: '0 12px',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontWeight: 400,
                fontSize: '13px',
                color: '#888',
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none',
              },
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-cell:focus-within': {
                outline: 'none',
              },
              '& .MuiDataGrid-columnHeader:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-virtualScroller': {
                minHeight: '36px',
              },
            }}
          />
        </div>
      </div>

      {/* Row Editor Panel */}
      {editorForm && selectedRowId && selectedRow && (
        <div className="row-editor-panel">
          <div className="row-editor-header">
            <span className="row-editor-title">{editorForm.name}</span>
            <button
              type="button"
              className="row-editor-close"
              onClick={() => setSelectedRowId(null)}
              title="Close"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
          <div className="row-editor-content">
            {loadingForm ? (
              <div className="row-editor-loading">Loading...</div>
            ) : (
              editorForm.components.map((comp) => (
                <FormComponentRenderer
                  key={comp.id}
                  component={comp}
                  isPreview={true}
                  formData={editorFormData}
                  onFieldChange={handleEditorFieldChange}
                  formSchema={editorForm.components}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
