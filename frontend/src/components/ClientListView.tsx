import React, { useState, useEffect, useCallback } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import { useClientTypeStore } from '../store/clientTypeStore';
import { API_URL } from '../config';
import './ClientListView.css';

interface ClientData {
  id: string;
  client_type_id: string;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface FieldOption {
  value: string;
  label: string;
}

interface FieldInfo {
  code: string;
  label: string;
  type: string;
  required?: boolean;
  options?: FieldOption[];
}

interface FormFields {
  form_code: string;
  form_name: string;
  always_show: boolean;
  fields: FieldInfo[];
}

interface ClientListViewProps {
  clientTypeId: string;
  clientTypeName: string;
  onEditClient: (clientId: string) => void;
}

export const ClientListView: React.FC<ClientListViewProps> = ({
  clientTypeId,
  clientTypeName,
  onEditClient,
}) => {
  const { setListMode } = useClientTypeStore();
  const [clients, setClients] = useState<ClientData[]>([]);
  const [fields, setFields] = useState<FormFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Load fields and clients in parallel
      const [fieldsRes, clientsRes] = await Promise.all([
        fetch(`${API_URL}/api/client-data/${clientTypeId}/fields?always_show_only=true`),
        fetch(`${API_URL}/api/client-data/${clientTypeId}/list`),
      ]);

      if (!fieldsRes.ok) throw new Error('Failed to load fields');
      if (!clientsRes.ok) throw new Error('Failed to load clients');

      const fieldsData = await fieldsRes.json();
      const clientsData = await clientsRes.json();

      setFields(fieldsData);
      setClients(clientsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [clientTypeId]);

  const generateClients = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/client-data/${clientTypeId}/generate?count=10`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate clients');
      }

      const result = await response.json();
      if (result.generated) {
        // Reload clients after generation
        await loadData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGenerating(false);
    }
  }, [clientTypeId, loadData]);

  const deleteClient = useCallback(async (clientId: string) => {
    if (!confirm('Удалить клиента?')) return;

    try {
      const response = await fetch(`${API_URL}/api/client-data/${clientTypeId}/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete client');

      setClients(prev => prev.filter(c => c.id !== clientId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [clientTypeId]);

  // Auto-generate data when list opens
  useEffect(() => {
    const loadAndGenerate = async () => {
      setLoading(true);
      setError(null);
      try {
        // First, generate new data
        setGenerating(true);
        const genResponse = await fetch(`${API_URL}/api/client-data/${clientTypeId}/generate?count=10`, {
          method: 'POST',
        });
        if (!genResponse.ok) {
          const errorData = await genResponse.json();
          throw new Error(errorData.detail || 'Failed to generate clients');
        }
        setGenerating(false);

        // Then load fields and clients
        const [fieldsRes, clientsRes] = await Promise.all([
          fetch(`${API_URL}/api/client-data/${clientTypeId}/fields?always_show_only=true`),
          fetch(`${API_URL}/api/client-data/${clientTypeId}/list`),
        ]);

        if (!fieldsRes.ok) throw new Error('Failed to load fields');
        if (!clientsRes.ok) throw new Error('Failed to load clients');

        const fieldsData = await fieldsRes.json();
        const clientsData = await clientsRes.json();

        setFields(fieldsData);
        setClients(clientsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setGenerating(false);
      } finally {
        setLoading(false);
      }
    };

    loadAndGenerate();
  }, [clientTypeId]);

  // Get value from nested client data structure
  const getClientValue = (clientData: Record<string, any>, formCode: string, fieldCode: string): string => {
    const formData = clientData[formCode];
    if (!formData) return '';
    const value = formData[fieldCode];
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
    return String(value);
  };

  // Build flat list of columns from always_show fields
  const columns = fields.flatMap(form =>
    form.fields.map(field => ({
      formCode: form.form_code,
      formName: form.form_name,
      fieldCode: field.code,
      fieldLabel: field.label,
      fieldType: field.type,
      options: field.options,
    }))
  );

  // Get display value - for select/radio fields, map value to label
  const getDisplayValue = (
    value: string,
    fieldType: string,
    options?: FieldOption[]
  ): string => {
    if (!value) return '';
    if ((fieldType === 'select' || fieldType === 'radio') && options) {
      const option = options.find(o => o.value === value);
      return option ? option.label : value;
    }
    return value;
  };

  if (loading) {
    return (
      <div className="client-list-loading">
        <CircularProgress size={40} />
        <span>{generating ? 'Генерация данных...' : 'Загрузка...'}</span>
      </div>
    );
  }

  return (
    <div className="client-list-view">
      <div className="client-list-header">
        <h2>{clientTypeName} - Список клиентов</h2>
        <div className="client-list-actions">
          <button
            className="client-list-btn"
            onClick={loadData}
            title="Обновить"
          >
            <RefreshIcon fontSize="small" />
          </button>
          <button
            className="client-list-btn primary"
            onClick={generateClients}
            disabled={generating}
            title="Сгенерировать тестовые данные"
          >
            {generating ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <AutoFixHighIcon fontSize="small" />
            )}
            <span>{generating ? 'Генерация...' : 'Сгенерировать данные'}</span>
          </button>
          <button
            className="client-list-btn close"
            onClick={() => setListMode(false)}
            title="Закрыть"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>
      </div>

      {error && (
        <div className="client-list-error">
          {error}
        </div>
      )}

      {clients.length === 0 && !generating ? (
        <div className="client-list-empty">
          <p>Нет данных клиентов</p>
          <p className="hint">Нажмите "Сгенерировать данные" для создания тестовых записей</p>
        </div>
      ) : (
        <div className="client-list-table-container">
          {generating && (
            <div className="client-list-generating-overlay">
              <CircularProgress size={40} />
              <span>Генерация данных...</span>
            </div>
          )}
          <table className="client-list-table">
            <thead>
              <tr>
                <th className="col-actions">Действия</th>
                {columns.map((col, idx) => (
                  <th key={idx} title={`${col.formName} - ${col.fieldLabel}`}>
                    {col.fieldLabel}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id} onClick={() => onEditClient(client.id)} style={{ cursor: 'pointer' }}>
                  <td className="col-actions" onClick={e => e.stopPropagation()}>
                    <button
                      className="row-action-btn"
                      onClick={() => onEditClient(client.id)}
                      title="Редактировать"
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <button
                      className="row-action-btn danger"
                      onClick={() => deleteClient(client.id)}
                      title="Удалить"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </td>
                  {columns.map((col, idx) => {
                    const rawValue = getClientValue(client.data, col.formCode, col.fieldCode);
                    const isPicture = col.fieldType === 'picture';
                    const displayValue = getDisplayValue(rawValue, col.fieldType, col.options);

                    return (
                      <td key={idx} className={isPicture ? 'col-photo' : ''}>
                        {isPicture && rawValue ? (
                          <img src={rawValue} alt="" />
                        ) : (
                          displayValue
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
