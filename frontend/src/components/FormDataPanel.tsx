import React from 'react';
import './FormDataPanel.css';

interface FormDataPanelProps {
  data: Record<string, any>;
  title?: string;
  style?: React.CSSProperties;
}

export const FormDataPanel: React.FC<FormDataPanelProps> = ({
  data,
  title = 'Form Data',
  style,
}) => {
  return (
    <div className="form-data-panel" style={style}>
      <div className="form-data-header">
        <h3 className="form-data-title">{title}</h3>
      </div>
      <div className="form-data-content">
        <pre className="form-data-json">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};
