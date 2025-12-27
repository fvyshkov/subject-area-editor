import React, { useState, useEffect, useMemo } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Reference, ReferenceField, ReferenceData } from '../store/referenceStore';
import { API_URL } from '../config';
import './ReferencePickerPopup.css';

interface ReferencePickerPopupProps {
  referenceId: string;
  onSelect: (record: ReferenceData) => void;
  onClose: () => void;
  filterField?: string;
  filterValue?: string;
}

export const ReferencePickerPopup: React.FC<ReferencePickerPopupProps> = ({
  referenceId,
  onSelect,
  onClose,
  filterField,
  filterValue,
}) => {
  const [reference, setReference] = useState<Reference | null>(null);
  const [fields, setFields] = useState<ReferenceField[]>([]);
  const [dataRows, setDataRows] = useState<ReferenceData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    loadReferenceData();
  }, [referenceId, filterField, filterValue]);

  const loadReferenceData = async () => {
    try {
      setLoading(true);

      // Load reference info
      const refResponse = await fetch(`${API_URL}/api/references`);
      if (refResponse.ok) {
        const refs = await refResponse.json();
        const ref = refs.find((r: Reference) => r.id === referenceId);
        setReference(ref || null);
      }

      // Load fields
      const fieldsResponse = await fetch(`${API_URL}/api/references/${referenceId}/fields`);
      if (fieldsResponse.ok) {
        const fieldsData = await fieldsResponse.json();
        setFields(fieldsData);
      }

      // Load data with optional filter
      let dataUrl = `${API_URL}/api/references/${referenceId}/data`;
      if (filterField && filterValue) {
        dataUrl += `?filter_field=${encodeURIComponent(filterField)}&filter_value=${encodeURIComponent(filterValue)}`;
      }
      const dataResponse = await fetch(dataUrl);
      if (dataResponse.ok) {
        const data = await dataResponse.json();
        setDataRows(data);
      }
    } catch (error) {
      console.error('Failed to load reference data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data rows by search query and column filters
  const filteredRows = useMemo(() => {
    let result = dataRows;

    // Apply global search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((row) => {
        return Object.values(row.data).some((value) => {
          if (value === null || value === undefined) return false;
          return String(value).toLowerCase().includes(query);
        });
      });
    }

    // Apply column filters
    const activeFilters = Object.entries(columnFilters).filter(([_, val]) => val.trim());
    if (activeFilters.length > 0) {
      result = result.filter((row) => {
        return activeFilters.every(([fieldId, filterVal]) => {
          const cellValue = row.data[fieldId];
          if (cellValue === null || cellValue === undefined) return false;
          return String(cellValue).toLowerCase().includes(filterVal.toLowerCase());
        });
      });
    }

    return result;
  }, [dataRows, searchQuery, columnFilters]);

  const handleColumnFilterChange = (fieldId: string, value: string) => {
    setColumnFilters(prev => ({ ...prev, [fieldId]: value }));
  };

  // Build tree structure for hierarchical references
  const buildDataTree = (rows: ReferenceData[]): { row: ReferenceData; children: any[]; level: number }[] => {
    const rowMap = new Map<string, { row: ReferenceData; children: any[]; level: number }>();
    const rootRows: { row: ReferenceData; children: any[]; level: number }[] = [];

    rows.forEach((row) => {
      rowMap.set(row.id, { row, children: [], level: 0 });
    });

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

  const flattenDataTree = (
    nodes: { row: ReferenceData; children: any[]; level: number }[],
    result: { row: ReferenceData; level: number; hasChildren: boolean }[] = []
  ): { row: ReferenceData; level: number; hasChildren: boolean }[] => {
    nodes.forEach((node) => {
      result.push({ row: node.row, level: node.level, hasChildren: node.children.length > 0 });
      if (expandedRows.has(node.row.id) && node.children.length > 0) {
        flattenDataTree(node.children, result);
      }
    });
    return result;
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchQuery.trim() || Object.values(columnFilters).some(v => v.trim());
  }, [searchQuery, columnFilters]);

  // Get display rows - either flat or hierarchical
  const displayRows = useMemo(() => {
    if (!reference?.is_hierarchical || hasActiveFilters) {
      // Flat list for non-hierarchical or when filtering
      return filteredRows.map(row => ({ row, level: 0, hasChildren: false }));
    }
    // Hierarchical tree
    const tree = buildDataTree(filteredRows);
    return flattenDataTree(tree);
  }, [reference?.is_hierarchical, filteredRows, hasActiveFilters, expandedRows]);

  const toggleRowExpanded = (rowId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const handleRowClick = (row: ReferenceData) => {
    onSelect(row);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="reference-picker-overlay" onClick={handleOverlayClick}>
      <div className="reference-picker-popup">
        <div className="reference-picker-header">
          <h3>{reference?.name || 'Select from Reference'}</h3>
          <button className="reference-picker-close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="reference-picker-search">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="reference-picker-content">
          {loading ? (
            <div className="reference-picker-loading">Loading...</div>
          ) : displayRows.length === 0 ? (
            <div className="reference-picker-empty">
              {searchQuery ? 'No matching records' : 'No data'}
            </div>
          ) : (
            <table className="reference-picker-table">
              <thead>
                <tr>
                  {reference?.is_hierarchical && !hasActiveFilters && (
                    <th className="reference-picker-tree-col"></th>
                  )}
                  {fields.map((field) => (
                    <th key={field.id}>
                      <div className="reference-picker-filter-header">
                        <span>{field.name}</span>
                        <input
                          type="text"
                          placeholder="Filter..."
                          value={columnFilters[field.id] || ''}
                          onChange={(e) => handleColumnFilterChange(field.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map(({ row, level, hasChildren }) => (
                  <tr key={row.id} onClick={() => handleRowClick(row)}>
                    {reference?.is_hierarchical && !hasActiveFilters && (
                      <td className="reference-picker-tree-cell">
                        <div
                          className="reference-picker-tree-indent"
                          style={{ paddingLeft: `${level * 20}px` }}
                        >
                          {hasChildren && (
                            <button
                              className="reference-picker-expand-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRowExpanded(row.id);
                              }}
                            >
                              {expandedRows.has(row.id) ? (
                                <ExpandMoreIcon fontSize="small" />
                              ) : (
                                <ChevronRightIcon fontSize="small" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                    {fields.map((field) => (
                      <td key={field.id}>{row.data[field.id] ?? ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
