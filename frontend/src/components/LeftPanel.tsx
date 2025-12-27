import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { FormsPanel, FormsPanelRef } from './FormsPanel';
import { ClientTypesPanel, ClientTypesPanelRef } from './ClientTypesPanel';
import { ReferencesPanel, ReferencesPanelRef } from './ReferencesPanel';
import { useClientTypeStore } from '../store/clientTypeStore';
import { useReferenceStore } from '../store/referenceStore';
import './LeftPanel.css';

export interface LeftPanelRef {
  formsPanelRef: React.RefObject<FormsPanelRef | null>;
  clientTypesPanelRef: React.RefObject<ClientTypesPanelRef | null>;
  referencesPanelRef: React.RefObject<ReferencesPanelRef | null>;
}

interface LeftPanelProps {
  style?: React.CSSProperties;
}

type TabType = 'clientTypes' | 'forms' | 'references';

export const LeftPanel = forwardRef<LeftPanelRef, LeftPanelProps>(({ style }, ref) => {
  const [activeTab, setActiveTab] = useState<TabType>('clientTypes');
  const formsPanelRef = useRef<FormsPanelRef>(null);
  const clientTypesPanelRef = useRef<ClientTypesPanelRef>(null);
  const referencesPanelRef = useRef<ReferencesPanelRef>(null);
  const { clearClientType } = useClientTypeStore();
  const { references, selectReference } = useReferenceStore();

  const [formsCount, setFormsCount] = useState(0);
  const [clientTypesCount, setClientTypesCount] = useState(0);

  useImperativeHandle(ref, () => ({
    formsPanelRef,
    clientTypesPanelRef,
    referencesPanelRef
  }));

  // Update counts periodically
  useEffect(() => {
    const updateCounts = () => {
      setFormsCount(formsPanelRef.current?.getCount() || 0);
      setClientTypesCount(clientTypesPanelRef.current?.getCount() || 0);
    };

    updateCounts();
    const interval = setInterval(updateCounts, 500);
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabType) => {
    // Clear selections when switching tabs
    if (newValue === 'forms') {
      clearClientType();
      selectReference(null);
    }
    if (newValue === 'clientTypes') {
      selectReference(null);
    }
    if (newValue === 'references') {
      clearClientType();
    }
    setActiveTab(newValue);
  };

  return (
    <div className="left-panel" style={style}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        className="left-panel-tabs"
      >
        <Tab value="clientTypes" label={`Client Types (${clientTypesCount})`} />
        <Tab value="forms" label={`Forms (${formsCount})`} />
        <Tab value="references" label={`Refs (${references.length})`} />
      </Tabs>

      <div className="tab-content">
        <div className={`tab-panel ${activeTab === 'clientTypes' ? 'active' : ''}`}>
          <ClientTypesPanel ref={clientTypesPanelRef} />
        </div>
        <div className={`tab-panel ${activeTab === 'forms' ? 'active' : ''}`}>
          <FormsPanel ref={formsPanelRef} />
        </div>
        <div className={`tab-panel ${activeTab === 'references' ? 'active' : ''}`}>
          <ReferencesPanel ref={referencesPanelRef} />
        </div>
      </div>
    </div>
  );
});

LeftPanel.displayName = 'LeftPanel';
