/**
 * Demo View Component
 *
 * Renders a demo form based on Domain Concepts (ППО) structure.
 * ППО (Понятие Предметной Области) = Domain Concept
 *
 * Shows:
 * - List view with generated data
 * - Detail view with form fields based on Domain Concept types
 */
import React, { useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ListAltIcon from '@mui/icons-material/ListAlt';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import NumbersIcon from '@mui/icons-material/Numbers';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import './PPODemoView.css';

interface DomainConcept {
  id: string;
  code: string;
  name: string;
  subject_area_id: string;
  parent_id: string | null;
  concept_type: 'attribute' | 'list' | 'ppo_attribute';
  data_type: 'text' | 'number' | 'date' | 'money' | 'boolean' | 'select' | null;
  base_concept_id: string | null;
  reference_id: string | null;
  reference_field_id: string | null;
  select_options: string[] | null;
  mask: string | null;
  sort_order: number;
}

interface SubjectArea {
  id: string;
  code: string;
  name: string;
}

interface PPODemoViewProps {
  subjectArea: SubjectArea;
  concepts: DomainConcept[];
  data: any[];
  mode: 'list' | 'detail';
  selectedItem: any;
  loading: boolean;
  onModeChange: (mode: 'list' | 'detail') => void;
  onSelectItem: (item: any) => void;
  onRefresh: () => void;
  onBack: () => void;
}

export const PPODemoView: React.FC<PPODemoViewProps> = ({
  subjectArea,
  concepts,
  data,
  mode,
  selectedItem,
  loading,
  onModeChange,
  onSelectItem,
  onRefresh,
  onBack,
}) => {
  const [expandedLists, setExpandedLists] = useState<Set<string>>(new Set());
  const [editedItem, setEditedItem] = useState<any>(null);

  // Get top-level concepts (not list children)
  const topLevelConcepts = concepts.filter(c => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order);

  // Get list concepts
  const listConcepts = topLevelConcepts.filter(c => c.concept_type === 'list');

  // Get attribute concepts (for list columns)
  const attributeConcepts = topLevelConcepts.filter(c => c.concept_type === 'attribute');

  // Get display columns for list view (first 5 non-list attributes + status if exists)
  const getListColumns = () => {
    const columns: DomainConcept[] = [];
    const statusConcept = attributeConcepts.find(c =>
      c.code.toLowerCase().includes('status') ||
      c.name.toLowerCase().includes('состояние') ||
      c.name.toLowerCase().includes('статус')
    );
    const nameConcepts = attributeConcepts.filter(c =>
      c.code.toLowerCase().includes('name') ||
      c.code.toLowerCase().includes('last_name') ||
      c.code.toLowerCase().includes('first_name') ||
      c.name.toLowerCase().includes('фамилия') ||
      c.name.toLowerCase().includes('имя')
    );

    // Add name-related columns first
    columns.push(...nameConcepts.slice(0, 3));

    // Add other columns
    for (const c of attributeConcepts) {
      if (columns.length >= 5) break;
      if (!columns.find(col => col.id === c.id)) {
        columns.push(c);
      }
    }

    // Always add status if exists
    if (statusConcept && !columns.find(col => col.id === statusConcept.id)) {
      columns.push(statusConcept);
    }

    return columns;
  };

  const columns = getListColumns();

  // Format value for display
  const formatValue = (value: any, concept: DomainConcept) => {
    if (value === null || value === undefined) return '—';

    switch (concept.data_type) {
      case 'boolean':
        return value ? 'Да' : 'Нет';
      case 'date':
        if (typeof value === 'string') {
          const parts = value.split('-');
          if (parts.length === 3) {
            return `${parts[2]}.${parts[1]}.${parts[0]}`;
          }
        }
        return value;
      case 'money':
        return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(Number(value));
      default:
        return String(value);
    }
  };

  // Toggle list expansion
  const toggleList = (listCode: string) => {
    setExpandedLists(prev => {
      const next = new Set(prev);
      if (next.has(listCode)) {
        next.delete(listCode);
      } else {
        next.add(listCode);
      }
      return next;
    });
  };

  // Get icon for data type
  const getDataTypeIcon = (dataType: string | null) => {
    switch (dataType) {
      case 'number': return <NumbersIcon fontSize="small" />;
      case 'date': return <CalendarTodayIcon fontSize="small" />;
      case 'money': return <AttachMoneyIcon fontSize="small" />;
      case 'boolean': return <ToggleOnIcon fontSize="small" />;
      case 'select': return <ArrowDropDownCircleIcon fontSize="small" />;
      default: return <TextFieldsIcon fontSize="small" />;
    }
  };

  // Handle item selection for editing
  const handleEditItem = (item: any) => {
    setEditedItem({ ...item });
    onSelectItem(item);
    onModeChange('detail');
  };

  // Render field input based on data type
  const renderFieldInput = (concept: DomainConcept, value: any, onChange: (val: any) => void) => {
    switch (concept.data_type) {
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => onChange(e.target.checked)}
              />
            }
            label={concept.name}
          />
        );
      case 'select':
        return (
          <FormControl size="small" fullWidth>
            <InputLabel>{concept.name}</InputLabel>
            <Select
              value={value || ''}
              label={concept.name}
              onChange={(e) => onChange(e.target.value)}
            >
              {(concept.select_options || []).map(opt => (
                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'date':
        return (
          <TextField
            type="date"
            label={concept.name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            size="small"
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        );
      case 'number':
      case 'money':
        return (
          <TextField
            type="number"
            label={concept.name}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            size="small"
            fullWidth
          />
        );
      default:
        return (
          <TextField
            label={concept.name}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            size="small"
            fullWidth
          />
        );
    }
  };

  // Render list view
  const renderListView = () => (
    <div className="demo-list-view">
      <div className="demo-list-header">
        <h2>{subjectArea.name}</h2>
        <div className="demo-list-actions">
          <button className="demo-btn" onClick={onRefresh} disabled={loading}>
            <RefreshIcon fontSize="small" />
            <span>Обновить</span>
          </button>
          <button className="demo-btn primary">
            <AddIcon fontSize="small" />
            <span>Добавить</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="demo-loading">Генерация данных...</div>
      ) : (
        <div className="demo-table-container">
          <table className="demo-table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th key={col.id}>
                    <span className="th-icon">{getDataTypeIcon(col.data_type)}</span>
                    <span>{col.name}</span>
                  </th>
                ))}
                <th className="actions-col">Действия</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={item.id || idx} onClick={() => handleEditItem(item)}>
                  {columns.map(col => (
                    <td key={col.id}>{formatValue(item[col.code], col)}</td>
                  ))}
                  <td className="actions-col">
                    <button
                      className="demo-icon-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditItem(item);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <button className="demo-icon-btn delete">
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && (
            <div className="demo-empty">Нет данных</div>
          )}
        </div>
      )}
    </div>
  );

  // Render detail view
  const renderDetailView = () => {
    if (!editedItem && !selectedItem) {
      return <div className="demo-empty">Выберите запись для редактирования</div>;
    }

    const item = editedItem || selectedItem;

    return (
      <div className="demo-detail-view">
        <div className="demo-detail-header">
          <button className="demo-btn" onClick={() => {
            setEditedItem(null);
            onModeChange('list');
          }}>
            <ArrowBackIcon fontSize="small" />
            <span>К списку</span>
          </button>
          <h2>Редактирование</h2>
        </div>

        <div className="demo-detail-content">
          {/* Attribute fields */}
          <div className="demo-section">
            <h3>Основные данные</h3>
            <div className="demo-fields-grid">
              {attributeConcepts.map(concept => (
                <div key={concept.id} className="demo-field">
                  {renderFieldInput(
                    concept,
                    item[concept.code],
                    (val) => setEditedItem({ ...item, [concept.code]: val })
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* List sections */}
          {listConcepts.map(listConcept => {
            const isExpanded = expandedLists.has(listConcept.code);
            const childConcepts = concepts.filter(c => c.parent_id === listConcept.id).sort((a, b) => a.sort_order - b.sort_order);
            const listData = item[listConcept.code] || [];

            return (
              <div key={listConcept.id} className="demo-section">
                <div
                  className="demo-section-header"
                  onClick={() => toggleList(listConcept.code)}
                >
                  <span className="demo-section-toggle">
                    {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                  </span>
                  <ListAltIcon fontSize="small" />
                  <h3>{listConcept.name}</h3>
                  <span className="demo-section-count">{listData.length}</span>
                </div>

                {isExpanded && (
                  <div className="demo-section-content">
                    {listData.length > 0 ? (
                      <table className="demo-table nested">
                        <thead>
                          <tr>
                            {childConcepts.map(child => (
                              <th key={child.id}>{child.name}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {listData.map((listItem: any, idx: number) => (
                            <tr key={listItem.id || idx}>
                              {childConcepts.map(child => (
                                <td key={child.id}>{formatValue(listItem[child.code], child)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="demo-empty-list">Нет записей</div>
                    )}
                    <button className="demo-btn small">
                      <AddIcon fontSize="small" />
                      <span>Добавить</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="ppo-demo-view">
      {mode === 'list' ? renderListView() : renderDetailView()}
    </div>
  );
};
