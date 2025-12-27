import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LinkIcon from '@mui/icons-material/Link';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import NumbersIcon from '@mui/icons-material/Numbers';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { useReferenceStore } from './store/referenceStore';
import { ReferenceEditor } from './components/ReferenceEditor';
import { SubjectAreaPicker } from './components/SubjectAreaPicker';
import { API_URL } from './config';
import './App.css';

type LeftTab = 'subject-areas' | 'refs';

interface SubjectArea {
  id: string;
  code: string;
  name: string;
  parent_id: string | null;
  reference_id: string | null;
  sort_order: number;
  is_terminal: boolean;
}

type DataType = 'text' | 'number' | 'date' | 'money' | 'boolean';

interface DomainConcept {
  id: string;
  code: string;
  name: string;
  subject_area_id: string;
  parent_id: string | null;
  concept_type: 'attribute' | 'list' | 'ppo_attribute';
  data_type: DataType | null;
  base_concept_id: string | null;
  reference_field_id: string | null;
  sort_order: number;
}

interface ReferenceField {
  id: string;
  reference_id: string;
  code: string;
  name: string;
  ref_reference_id: string | null;
  sort_order: number;
}

interface Reference {
  id: string;
  code: string;
  name: string;
  parent_id: string | null;
  sort_order: number;
  is_hierarchical: boolean;
  created_at?: string;
  updated_at?: string;
}

const generateCode = (prefix: string, existingCodes: string[]): string => {
  let counter = 1;
  let code = `${prefix}_${counter}`;
  while (existingCodes.includes(code)) {
    counter++;
    code = `${prefix}_${counter}`;
  }
  return code;
};

const generateName = (prefix: string, existingNames: string[]): string => {
  let counter = 1;
  let name = `${prefix} ${counter}`;
  while (existingNames.includes(name)) {
    counter++;
    name = `${prefix} ${counter}`;
  }
  return name;
};

const getConceptIcon = (conceptType: string, dataType?: string | null) => {
  switch (conceptType) {
    case 'attribute':
      // Show data type icon
      switch (dataType) {
        case 'number': return <NumbersIcon fontSize="small" />;
        case 'date': return <CalendarTodayIcon fontSize="small" />;
        case 'money': return <AttachMoneyIcon fontSize="small" />;
        case 'boolean': return <ToggleOnIcon fontSize="small" />;
        case 'text':
        default: return <TextFieldsIcon fontSize="small" />;
      }
    case 'list': return <ListAltIcon fontSize="small" />;
    case 'ppo_attribute': return <LinkIcon fontSize="small" />;
    default: return <TextFieldsIcon fontSize="small" />;
  }
};

const getConceptTypeName = (conceptType: string) => {
  switch (conceptType) {
    case 'attribute': return 'Concept';
    case 'list': return 'List';
    case 'ppo_attribute': return 'PPO Concept';
    default: return 'Concept';
  }
};

const DATA_TYPE_OPTIONS: { value: DataType; label: string; icon: React.ReactNode }[] = [
  { value: 'text', label: 'Text', icon: <TextFieldsIcon fontSize="small" /> },
  { value: 'number', label: 'Number', icon: <NumbersIcon fontSize="small" /> },
  { value: 'date', label: 'Date', icon: <CalendarTodayIcon fontSize="small" /> },
  { value: 'money', label: 'Money', icon: <AttachMoneyIcon fontSize="small" /> },
  { value: 'boolean', label: 'Boolean', icon: <ToggleOnIcon fontSize="small" /> },
];

function App() {
  const [subjectAreas, setSubjectAreas] = useState<SubjectArea[]>([]);
  const [domainConcepts, setDomainConcepts] = useState<DomainConcept[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);
  const [expandedAreas, setExpandedAreas] = useState<Set<string>>(new Set());
  const [expandedConcepts, setExpandedConcepts] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState<string | null>(null); // 'header' | conceptId | null
  const addMenuRef = useRef<HTMLDivElement>(null);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [middlePanelCollapsed, setMiddlePanelCollapsed] = useState(false);
  const [leftTab, setLeftTab] = useState<LeftTab>('subject-areas');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set());
  const [saPicker, setSaPicker] = useState<{ open: boolean; parentConceptId: string | null }>({ open: false, parentConceptId: null });
  const [refPickerOpen, setRefPickerOpen] = useState(false);
  const [referenceFields, setReferenceFields] = useState<Record<string, ReferenceField[]>>({});
  const [fieldPickerOpen, setFieldPickerOpen] = useState(false);
  const [dataTypeMenuOpen, setDataTypeMenuOpen] = useState(false);
  const dataTypeMenuRef = useRef<HTMLDivElement>(null);
  const [draggedAreaId, setDraggedAreaId] = useState<string | null>(null);
  const [dragOverAreaId, setDragOverAreaId] = useState<string | null>(null);
  const [draggedConceptId, setDraggedConceptId] = useState<string | null>(null);
  const [dragOverConceptId, setDragOverConceptId] = useState<string | null>(null);

  // Reference store
  const {
    references,
    selectedReferenceId: selectedRefId,
    selectReference,
    loadReferences,
    hasChanges: refHasChanges,
    saveAllChanges: saveRefChanges,
  } = useReferenceStore();

  useEffect(() => {
    loadData();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(null);
      }
      if (dataTypeMenuRef.current && !dataTypeMenuRef.current.contains(e.target as Node)) {
        setDataTypeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      const [areasRes, conceptsRes] = await Promise.all([
        fetch(`${API_URL}/api/subject-areas`),
        fetch(`${API_URL}/api/domain-concepts`),
      ]);
      const areas = await areasRes.json();
      const concepts = await conceptsRes.json();
      setSubjectAreas(areas);
      setDomainConcepts(concepts);
      setHasChanges(false);
      setSelectedAreaId(null);
      setSelectedConceptId(null);
      selectReference(null);
      // Load references from store
      loadReferences();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const selectedArea = subjectAreas.find(a => a.id === selectedAreaId);
  const selectedConcept = domainConcepts.find(c => c.id === selectedConceptId);
  const selectedRef = references.find(r => r.id === selectedRefId);

  // Get all ancestor IDs for an item
  const getAncestorIds = (items: { id: string; parent_id: string | null }[], itemId: string): string[] => {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.parent_id) return [];
    return [item.parent_id, ...getAncestorIds(items, item.parent_id)];
  };

  // Get all descendant IDs for an item
  const getDescendantIds = (items: { id: string; parent_id: string | null }[], parentId: string): string[] => {
    const children = items.filter(i => i.parent_id === parentId);
    return children.flatMap(child => [child.id, ...getDescendantIds(items, child.id)]);
  };

  // Filter items by search - show matching items + their ancestors + their descendants
  const filterBySearch = <T extends { id: string; name: string; parent_id: string | null }>(
    items: T[],
    query: string
  ): Set<string> => {
    if (!query.trim()) return new Set(items.map(i => i.id));

    const lowerQuery = query.toLowerCase();
    const matchingIds = items.filter(i => i.name.toLowerCase().includes(lowerQuery)).map(i => i.id);

    const visibleIds = new Set<string>();
    matchingIds.forEach(id => {
      visibleIds.add(id);
      getAncestorIds(items, id).forEach(aid => visibleIds.add(aid));
      getDescendantIds(items, id).forEach(did => visibleIds.add(did));
    });

    return visibleIds;
  };

  const visibleAreaIds = filterBySearch(subjectAreas, leftTab === 'subject-areas' ? searchQuery : '');
  const visibleRefIds = filterBySearch(references, leftTab === 'refs' ? searchQuery : '');

  const isTerminal = (areaId: string): boolean => {
    return !subjectAreas.some(a => a.parent_id === areaId);
  };

  const buildAreaTree = (parentId: string | null = null): SubjectArea[] => {
    return subjectAreas
      .filter(a => a.parent_id === parentId && visibleAreaIds.has(a.id))
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  const buildRefTree = (parentId: string | null = null): Reference[] => {
    return references
      .filter(r => r.parent_id === parentId && visibleRefIds.has(r.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const toggleRefExpand = (refId: string) => {
    setExpandedRefs(prev => {
      const next = new Set(prev);
      if (next.has(refId)) next.delete(refId);
      else next.add(refId);
      return next;
    });
  };

  const buildConceptTree = (parentId: string | null = null): DomainConcept[] => {
    if (!selectedAreaId) return [];
    return domainConcepts
      .filter(c => c.subject_area_id === selectedAreaId && c.parent_id === parentId)
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  const toggleAreaExpand = (areaId: string) => {
    setExpandedAreas(prev => {
      const next = new Set(prev);
      if (next.has(areaId)) next.delete(areaId);
      else next.add(areaId);
      return next;
    });
  };

  const toggleConceptExpand = (conceptId: string) => {
    setExpandedConcepts(prev => {
      const next = new Set(prev);
      if (next.has(conceptId)) next.delete(conceptId);
      else next.add(conceptId);
      return next;
    });
  };

  const addSubjectArea = (parentId: string | null = null) => {
    const existingCodes = subjectAreas.map(a => a.code);
    const existingNames = subjectAreas.map(a => a.name);

    const newArea: SubjectArea = {
      id: uuidv4(),
      code: generateCode('area', existingCodes),
      name: generateName('Subject Area', existingNames),
      parent_id: parentId,
      reference_id: null,
      sort_order: subjectAreas.filter(a => a.parent_id === parentId).length,
      is_terminal: true,
    };

    setSubjectAreas(prev => [...prev, newArea]);
    setSelectedAreaId(newArea.id);
    setSelectedConceptId(null);
    setHasChanges(true);

    if (parentId) {
      setExpandedAreas(prev => new Set([...prev, parentId]));
    }
  };

  const deleteSubjectArea = async (areaId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await fetch(`${API_URL}/api/subject-areas/${areaId}`, { method: 'DELETE' });

      // Update local state
      const collectChildIds = (parentId: string): string[] => {
        const children = subjectAreas.filter(a => a.parent_id === parentId);
        return children.flatMap(child => [child.id, ...collectChildIds(child.id)]);
      };
      const idsToDelete = [areaId, ...collectChildIds(areaId)];

      setSubjectAreas(prev => prev.filter(a => !idsToDelete.includes(a.id)));
      setDomainConcepts(prev => prev.filter(c => !idsToDelete.includes(c.subject_area_id)));

      if (selectedAreaId && idsToDelete.includes(selectedAreaId)) {
        setSelectedAreaId(null);
        setSelectedConceptId(null);
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const addDomainConcept = (type: 'attribute' | 'list' | 'ppo_attribute', parentId: string | null = null, baseConceptId?: string) => {
    if (!selectedAreaId || !isTerminal(selectedAreaId)) return;

    const areaConcepts = domainConcepts.filter(c => c.subject_area_id === selectedAreaId);
    const existingCodes = areaConcepts.map(c => c.code);
    const existingNames = areaConcepts.map(c => c.name);

    const prefixMap = { attribute: 'attr', list: 'list', ppo_attribute: 'ppo_attr' };
    const namePrefixMap = { attribute: 'Concept', list: 'List', ppo_attribute: 'PPO Concept' };
    const prefix = prefixMap[type];
    const namePrefix = namePrefixMap[type];

    const newConcept: DomainConcept = {
      id: uuidv4(),
      code: generateCode(prefix, existingCodes),
      name: generateName(namePrefix, existingNames),
      subject_area_id: selectedAreaId,
      parent_id: parentId,
      concept_type: type,
      data_type: type === 'ppo_attribute' ? null : 'text',
      base_concept_id: baseConceptId || null,
      reference_field_id: null,
      sort_order: areaConcepts.filter(c => c.parent_id === parentId).length,
    };

    setDomainConcepts(prev => [...prev, newConcept]);
    setSelectedConceptId(newConcept.id);
    setHasChanges(true);

    if (parentId) {
      setExpandedConcepts(prev => new Set([...prev, parentId]));
    }
  };

  const deleteDomainConcept = async (conceptId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await fetch(`${API_URL}/api/domain-concepts/${conceptId}`, { method: 'DELETE' });

      // Update local state - collect all children ids
      const collectChildIds = (parentId: string): string[] => {
        const children = domainConcepts.filter(c => c.parent_id === parentId);
        return children.flatMap(child => [child.id, ...collectChildIds(child.id)]);
      };
      const idsToDelete = [conceptId, ...collectChildIds(conceptId)];

      setDomainConcepts(prev => prev.filter(c => !idsToDelete.includes(c.id)));

      if (selectedConceptId && idsToDelete.includes(selectedConceptId)) {
        setSelectedConceptId(null);
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const updateConcept = (id: string, updates: Partial<DomainConcept>) => {
    setDomainConcepts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    setHasChanges(true);
  };

  const updateArea = (id: string, updates: Partial<SubjectArea>) => {
    setSubjectAreas(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    setHasChanges(true);
  };

  // Load fields for a reference
  const loadReferenceFields = async (referenceId: string) => {
    if (referenceFields[referenceId]) return referenceFields[referenceId];
    try {
      const res = await fetch(`${API_URL}/api/references/${referenceId}/fields`);
      const fields = await res.json();
      setReferenceFields(prev => ({ ...prev, [referenceId]: fields }));
      return fields;
    } catch (error) {
      console.error('Failed to load reference fields:', error);
      return [];
    }
  };

  // Auto-create attributes from reference fields when linking a reference to a Subject Area
  const linkReferenceToArea = async (areaId: string, referenceId: string) => {
    updateArea(areaId, { reference_id: referenceId });

    // Load reference fields
    const fields = await loadReferenceFields(referenceId);

    // Create attributes for each field
    const areaConcepts = domainConcepts.filter(c => c.subject_area_id === areaId);
    const existingCodes = areaConcepts.map(c => c.code);
    const existingNames = areaConcepts.map(c => c.name);

    const newConcepts: DomainConcept[] = fields.map((field: ReferenceField, index: number) => {
      let code = field.code;
      let name = field.name;
      // Ensure unique code/name
      let counter = 1;
      while (existingCodes.includes(code)) {
        code = `${field.code}_${counter}`;
        counter++;
      }
      counter = 1;
      while (existingNames.includes(name)) {
        name = `${field.name} ${counter}`;
        counter++;
      }
      existingCodes.push(code);
      existingNames.push(name);

      return {
        id: uuidv4(),
        code,
        name,
        subject_area_id: areaId,
        parent_id: null,
        concept_type: 'attribute' as const,
        data_type: 'text' as DataType,
        base_concept_id: null,
        reference_field_id: field.id,
        sort_order: areaConcepts.length + index,
      };
    });

    if (newConcepts.length > 0) {
      setDomainConcepts(prev => [...prev, ...newConcepts]);
      setHasChanges(true);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      // Save subject areas and domain concepts
      await fetch(`${API_URL}/api/bulk-save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_areas: subjectAreas,
          domain_concepts: domainConcepts,
        }),
      });
      setHasChanges(false);

      // Save reference changes if any
      if (refHasChanges()) {
        await saveRefChanges();
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  // Combined hasChanges check
  const totalHasChanges = hasChanges || refHasChanges();

  // Drag and drop handlers for Subject Areas
  const handleDragStart = (e: React.DragEvent, areaId: string) => {
    setDraggedAreaId(areaId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', areaId);
  };

  const handleDragEnd = () => {
    setDraggedAreaId(null);
    setDragOverAreaId(null);
  };

  const handleDragOver = (e: React.DragEvent, areaId: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverAreaId !== areaId) {
      setDragOverAreaId(areaId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetParentId: string | null) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedAreaId || draggedAreaId === targetParentId) {
      handleDragEnd();
      return;
    }

    // Prevent dropping on itself or its descendants
    const descendantIds = getDescendantIds(subjectAreas, draggedAreaId);
    if (targetParentId && (targetParentId === draggedAreaId || descendantIds.includes(targetParentId))) {
      handleDragEnd();
      return;
    }

    // Update parent_id
    updateArea(draggedAreaId, { parent_id: targetParentId });

    // Expand target if dropping into a folder
    if (targetParentId) {
      setExpandedAreas(prev => new Set([...prev, targetParentId]));
    }

    handleDragEnd();
  };

  // Drag and drop handlers for Domain Concepts
  const handleConceptDragStart = (e: React.DragEvent, conceptId: string) => {
    setDraggedConceptId(conceptId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', conceptId);
  };

  const handleConceptDragEnd = () => {
    setDraggedConceptId(null);
    setDragOverConceptId(null);
  };

  const handleConceptDragOver = (e: React.DragEvent, conceptId: string | null) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverConceptId !== conceptId) {
      setDragOverConceptId(conceptId);
    }
  };

  const handleConceptDrop = (e: React.DragEvent, targetParentId: string | null) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedConceptId || draggedConceptId === targetParentId) {
      handleConceptDragEnd();
      return;
    }

    // Prevent dropping on itself or its descendants
    const descendantIds = getDescendantIds(domainConcepts, draggedConceptId);
    if (targetParentId && (targetParentId === draggedConceptId || descendantIds.includes(targetParentId))) {
      handleConceptDragEnd();
      return;
    }

    // Update parent_id
    updateConcept(draggedConceptId, { parent_id: targetParentId });

    // Expand target if dropping into a parent
    if (targetParentId) {
      setExpandedConcepts(prev => new Set([...prev, targetParentId]));
    }

    handleConceptDragEnd();
  };

  const renderAreaNode = (area: SubjectArea, level: number = 0) => {
    const children = buildAreaTree(area.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedAreas.has(area.id);
    const terminal = isTerminal(area.id);
    const isDragging = draggedAreaId === area.id;
    const isDragOver = dragOverAreaId === area.id;

    return (
      <div key={area.id} className="tree-node-wrapper">
        <div
          className={`tree-node ${selectedAreaId === area.id ? 'active' : ''} ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''}`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, area.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, area.id)}
          onDrop={(e) => handleDrop(e, area.id)}
          onClick={() => {
            setSelectedAreaId(area.id);
            setSelectedConceptId(null);
          }}
        >
          {hasChildren ? (
            <button
              className="tree-expand-btn"
              draggable={false}
              onClick={(e) => {
                e.stopPropagation();
                toggleAreaExpand(area.id);
              }}
            >
              {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </button>
          ) : (
            <span className="tree-expand-spacer" />
          )}
          <div className="tree-node-content" draggable={false}>
            <span className="tree-node-icon">
              {terminal ? <DescriptionIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
            </span>
            <span className="tree-node-text">{area.name}</span>
          </div>
          <button
            className="tree-node-btn add-btn"
            draggable={false}
            onClick={(e) => {
              e.stopPropagation();
              addSubjectArea(area.id);
            }}
            title="Add child"
          >
            <AddIcon fontSize="small" />
          </button>
          <button
            className="tree-node-btn delete-btn"
            draggable={false}
            onClick={(e) => deleteSubjectArea(area.id, e)}
            title="Delete"
          >
            <DeleteOutlineIcon fontSize="small" />
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div className="tree-node-children">
            {children.map(child => renderAreaNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderRefNode = (ref: Reference, level: number = 0) => {
    const children = buildRefTree(ref.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedRefs.has(ref.id);

    return (
      <div key={ref.id} className="tree-node-wrapper">
        <div
          className={`tree-node ${selectedRefId === ref.id ? 'active' : ''}`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => {
            selectReference(ref.id);
            setSelectedAreaId(null);
            setSelectedConceptId(null);
          }}
        >
          {hasChildren ? (
            <button
              className="tree-expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleRefExpand(ref.id);
              }}
            >
              {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </button>
          ) : (
            <span className="tree-expand-spacer" />
          )}
          <div className="tree-node-content">
            <span className="tree-node-icon">
              <ListAltIcon fontSize="small" />
            </span>
            <span className="tree-node-text">{ref.name}</span>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="tree-node-children">
            {children.map(child => renderRefNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderConceptNode = (concept: DomainConcept, level: number = 0) => {
    const children = domainConcepts.filter(c => c.parent_id === concept.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedConcepts.has(concept.id);
    const menuId = `concept-${concept.id}`;
    const isDragging = draggedConceptId === concept.id;
    const isDragOver = dragOverConceptId === concept.id;

    return (
      <div key={concept.id} className="tree-node-wrapper">
        <div
          className={`tree-node ${selectedConceptId === concept.id ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          draggable={true}
          onDragStart={(e) => handleConceptDragStart(e, concept.id)}
          onDragEnd={handleConceptDragEnd}
          onDragOver={(e) => handleConceptDragOver(e, concept.id)}
          onDrop={(e) => handleConceptDrop(e, concept.id)}
          onClick={() => setSelectedConceptId(concept.id)}
        >
          {hasChildren ? (
            <button
              className="tree-expand-btn"
              draggable={false}
              onClick={(e) => {
                e.stopPropagation();
                toggleConceptExpand(concept.id);
              }}
            >
              {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </button>
          ) : (
            <span className="tree-expand-spacer" />
          )}
          <div className="tree-node-content" draggable={false}>
            <span className="tree-node-icon">
              {getConceptIcon(concept.concept_type, concept.data_type)}
            </span>
            <span className="tree-node-text">{concept.name}</span>
          </div>
          <div
            className="dropdown-wrapper inline"
            ref={addMenuOpen === menuId ? addMenuRef : null}
            draggable={false}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="tree-node-btn add-btn"
              onClick={() => setAddMenuOpen(addMenuOpen === menuId ? null : menuId)}
              title="Add"
            >
              <AddIcon fontSize="small" />
            </button>
            {addMenuOpen === menuId && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    addDomainConcept('attribute', concept.id);
                    setAddMenuOpen(null);
                  }}
                >
                  <PanoramaFishEyeIcon fontSize="small" />
                  <span>Concept</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    addDomainConcept('list', concept.id);
                    setAddMenuOpen(null);
                  }}
                >
                  <ListAltIcon fontSize="small" />
                  <span>List</span>
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setSaPicker({ open: true, parentConceptId: concept.id });
                    setAddMenuOpen(null);
                  }}
                >
                  <LinkIcon fontSize="small" />
                  <span>Attribute from PPO</span>
                </button>
              </div>
            )}
          </div>
          <button
            className="tree-node-btn delete-btn"
            draggable={false}
            onClick={(e) => deleteDomainConcept(concept.id, e)}
            title="Delete"
          >
            <DeleteOutlineIcon fontSize="small" />
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div className="tree-node-children">
            {children.map(child => renderConceptNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <button
            className={`toolbar-btn icon-only ${totalHasChanges ? 'has-changes' : ''}`}
            onClick={saveAll}
            disabled={saving || !totalHasChanges}
            title="Save"
          >
            <SaveIcon fontSize="small" />
          </button>
          <button
            className="toolbar-btn icon-only"
            onClick={loadData}
            title="Refresh"
          >
            <RefreshIcon fontSize="small" />
          </button>
        </div>
        <div className="toolbar-center">
          {selectedArea && (
            <div className="toolbar-breadcrumb">
              <span className="breadcrumb-icon">
                {isTerminal(selectedArea.id) ? <DescriptionIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
              </span>
              <span className="breadcrumb-item">{selectedArea.name}</span>
              {selectedConcept && (
                <>
                  <span className="breadcrumb-separator">→</span>
                  <span className="breadcrumb-icon">
                    {getConceptIcon(selectedConcept.concept_type, selectedConcept.data_type)}
                  </span>
                  <span className="breadcrumb-item">{selectedConcept.name}</span>
                </>
              )}
            </div>
          )}
          {selectedRef && (
            <div className="toolbar-breadcrumb">
              <span className="breadcrumb-icon">
                <ListAltIcon fontSize="small" />
              </span>
              <span className="breadcrumb-item">{selectedRef.name}</span>
            </div>
          )}
        </div>
        <div className="toolbar-right">
        </div>
      </div>

      {/* Main content */}
      <div className="app-content">
        {/* Left Panel with Tabs */}
        {leftPanelCollapsed ? (
          <div className="panel-collapsed" onClick={() => setLeftPanelCollapsed(false)}>
            <button className="panel-expand-btn">
              <ChevronRightIcon fontSize="small" />
            </button>
            <div className="panel-collapsed-label">
              <span>{leftTab === 'subject-areas' ? `Subject Area: ${selectedArea?.name || '—'}` : `Ref: ${selectedRef?.name || '—'}`}</span>
            </div>
          </div>
        ) : (
          <div className="panel">
            {/* Tabs */}
            <div className="panel-tabs">
              <button
                className={`panel-tab ${leftTab === 'subject-areas' ? 'active' : ''}`}
                onClick={() => { setLeftTab('subject-areas'); setSearchQuery(''); selectReference(null); }}
              >
                Subject Areas
              </button>
              <button
                className={`panel-tab ${leftTab === 'refs' ? 'active' : ''}`}
                onClick={() => { setLeftTab('refs'); setSearchQuery(''); setSelectedAreaId(null); setSelectedConceptId(null); }}
              >
                Refs
              </button>
            </div>
            {/* Search + Add */}
            <div className="panel-search-row">
              <input
                type="text"
                className="panel-search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {leftTab === 'subject-areas' && (
                <button
                  className="panel-add-btn"
                  onClick={() => addSubjectArea(null)}
                  title="Add Subject Area"
                >
                  <AddIcon fontSize="small" />
                </button>
              )}
              <button
                className="panel-collapse-btn"
                onClick={() => setLeftPanelCollapsed(true)}
                title="Collapse"
              >
                <ChevronLeftIcon fontSize="small" />
              </button>
            </div>
            {/* Content */}
            <div className="panel-content">
              {leftTab === 'subject-areas' ? (
                <div
                  className={`tree-drop-zone ${draggedAreaId && dragOverAreaId === null ? 'drag-over-root' : ''}`}
                  onDragOver={(e) => handleDragOver(e, null)}
                  onDrop={(e) => handleDrop(e, null)}
                >
                  {buildAreaTree().map(area => renderAreaNode(area))}
                  {subjectAreas.length === 0 && (
                    <div className="panel-empty">No subject areas</div>
                  )}
                  {draggedAreaId && (
                    <div className="drop-to-root-hint">Drop here to make root</div>
                  )}
                </div>
              ) : (
                <>
                  {buildRefTree().map(ref => renderRefNode(ref))}
                  {references.length === 0 && (
                    <div className="panel-empty">No references</div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Middle Panel - Domain Concepts (only show on subject-areas tab) */}
        {leftTab === 'subject-areas' && (
          middlePanelCollapsed ? (
            <div className="panel-collapsed" onClick={() => setMiddlePanelCollapsed(false)}>
              <button className="panel-expand-btn">
                <ChevronRightIcon fontSize="small" />
              </button>
              <div className="panel-collapsed-label">
                <span>Concept: {selectedConcept?.name || '—'}</span>
              </div>
            </div>
          ) : (
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Domain Concepts</span>
                {selectedAreaId && isTerminal(selectedAreaId) && (
                  <div className="dropdown-wrapper" ref={addMenuOpen === 'header' ? addMenuRef : null}>
                    <button
                      className="panel-add-btn"
                      onClick={() => setAddMenuOpen(addMenuOpen === 'header' ? null : 'header')}
                      title="Add"
                    >
                      <AddIcon fontSize="small" />
                    </button>
                    {addMenuOpen === 'header' && (
                      <div className="dropdown-menu">
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            addDomainConcept('attribute');
                            setAddMenuOpen(null);
                          }}
                        >
                          <PanoramaFishEyeIcon fontSize="small" />
                          <span>Concept</span>
                        </button>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            addDomainConcept('list');
                            setAddMenuOpen(null);
                          }}
                        >
                          <ListAltIcon fontSize="small" />
                          <span>List</span>
                        </button>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setSaPicker({ open: true, parentConceptId: null });
                            setAddMenuOpen(null);
                          }}
                        >
                          <LinkIcon fontSize="small" />
                          <span>Attribute from PPO</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <button
                  className="panel-collapse-btn"
                  onClick={() => setMiddlePanelCollapsed(true)}
                  title="Collapse"
                >
                  <ChevronLeftIcon fontSize="small" />
                </button>
              </div>
              <div className="panel-content">
                {selectedAreaId && isTerminal(selectedAreaId) ? (
                  <div
                    className="tree-drop-zone"
                    onDragOver={(e) => handleConceptDragOver(e, null)}
                    onDrop={(e) => handleConceptDrop(e, null)}
                  >
                    {buildConceptTree().map(concept => renderConceptNode(concept))}
                    {buildConceptTree().length === 0 && (
                      <div className="panel-empty">No concepts. Add attribute or list.</div>
                    )}
                  </div>
                ) : (
                  <div className="panel-empty">
                    {selectedAreaId ? 'Select a terminal Subject Area' : 'Select a Subject Area'}
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* Right Panel - Properties */}
        <div className="panel properties-panel">
          {selectedRefId ? (
            // Show ReferenceEditor when a reference is selected
            <ReferenceEditor />
          ) : (
            <>
              <div className="panel-header">
                {selectedConceptId && selectedConcept ? (
                  <div className="panel-header-item">
                    <span className="panel-header-icon">
                      {getConceptIcon(selectedConcept.concept_type, selectedConcept.data_type)}
                    </span>
                    <span className="panel-header-type">
                      {getConceptTypeName(selectedConcept.concept_type)}:
                    </span>
                    <span className="panel-header-name">{selectedConcept.name}</span>
                  </div>
                ) : selectedAreaId && selectedArea ? (
                  <div className="panel-header-item">
                    <span className="panel-header-icon">
                      {isTerminal(selectedAreaId) ? <DescriptionIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
                    </span>
                    <span className="panel-header-type">
                      {isTerminal(selectedAreaId) ? 'Subject Area' : 'Folder'}:
                    </span>
                    <span className="panel-header-name">{selectedArea.name}</span>
                  </div>
                ) : (
                  <span>Properties</span>
                )}
              </div>
              <div className="panel-content">
                {selectedConceptId && selectedConcept ? (
                  <div className="properties-form">
                    <div className="property-row">
                      <div className="property-field">
                        <label>Code</label>
                        <input
                          type="text"
                          value={selectedConcept.code}
                          onChange={(e) => updateConcept(selectedConceptId, { code: e.target.value })}
                        />
                      </div>
                      <div className="property-field">
                        <label>Name</label>
                        <input
                          type="text"
                          value={selectedConcept.name}
                          onChange={(e) => updateConcept(selectedConceptId, { name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="property-info">
                      Type: {getConceptTypeName(selectedConcept.concept_type)}
                    </div>
                    {selectedConcept.concept_type !== 'ppo_attribute' && (
                      <div className="property-field">
                        <label>Data Type</label>
                        <div className="dropdown-wrapper" ref={dataTypeMenuRef}>
                          <button
                            className="data-type-trigger"
                            onClick={() => setDataTypeMenuOpen(!dataTypeMenuOpen)}
                          >
                            <span className="data-type-icon">
                              {DATA_TYPE_OPTIONS.find(o => o.value === selectedConcept.data_type)?.icon || <TextFieldsIcon fontSize="small" />}
                            </span>
                            <span className="data-type-label">
                              {DATA_TYPE_OPTIONS.find(o => o.value === selectedConcept.data_type)?.label || 'Text'}
                            </span>
                            <ExpandMoreIcon fontSize="small" className="data-type-arrow" />
                          </button>
                          {dataTypeMenuOpen && (
                            <div className="dropdown-menu data-type-menu">
                              {DATA_TYPE_OPTIONS.map(opt => (
                                <button
                                  key={opt.value}
                                  className={`dropdown-item ${selectedConcept.data_type === opt.value ? 'active' : ''}`}
                                  onClick={() => {
                                    updateConcept(selectedConceptId, { data_type: opt.value });
                                    setDataTypeMenuOpen(false);
                                  }}
                                >
                                  {opt.icon}
                                  <span>{opt.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Reference field mapping - show for all concepts if subject area has a reference */}
                    {selectedArea?.reference_id && (
                      <div className="property-field">
                        <label>Reference Field</label>
                        <div className="reference-picker-field">
                          <span className="reference-picker-value">
                            {selectedConcept.reference_field_id
                              ? referenceFields[selectedArea.reference_id]?.find(f => f.id === selectedConcept.reference_field_id)?.name || 'Loading...'
                              : 'Not mapped'}
                          </span>
                          <button
                            className="reference-picker-btn"
                            onClick={async () => {
                              if (selectedArea?.reference_id) {
                                await loadReferenceFields(selectedArea.reference_id);
                              }
                              setFieldPickerOpen(true);
                            }}
                          >
                            Select
                          </button>
                          {selectedConcept.reference_field_id && (
                            <button
                              className="reference-clear-btn"
                              onClick={() => updateConcept(selectedConceptId, { reference_field_id: null })}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedConcept.concept_type === 'ppo_attribute' && (
                      <div className="property-field">
                        <label>Linked to PPO</label>
                        <div className="reference-picker-field">
                          <span className="reference-picker-value">
                            {selectedConcept.base_concept_id
                              ? subjectAreas.find(a => a.id === selectedConcept.base_concept_id)?.name || 'Unknown'
                              : 'Not linked'}
                          </span>
                          <button
                            className="reference-picker-btn"
                            onClick={() => setSaPicker({ open: true, parentConceptId: 'edit-link' })}
                          >
                            Select
                          </button>
                          {selectedConcept.base_concept_id && (
                            <button
                              className="reference-clear-btn"
                              onClick={() => updateConcept(selectedConceptId, { base_concept_id: null })}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : selectedAreaId && selectedArea ? (
                  <div className="properties-form">
                    <div className="property-row">
                      <div className="property-field">
                        <label>Code</label>
                        <input
                          type="text"
                          value={selectedArea.code}
                          onChange={(e) => updateArea(selectedAreaId, { code: e.target.value })}
                        />
                      </div>
                      <div className="property-field">
                        <label>Name</label>
                        <input
                          type="text"
                          value={selectedArea.name}
                          onChange={(e) => updateArea(selectedAreaId, { name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="property-info">
                      {isTerminal(selectedAreaId) ? 'Terminal node (can add concepts)' : 'Folder node'}
                    </div>
                    <div className="property-field">
                      <label>Reference</label>
                      <div className="reference-picker-field">
                        <span className="reference-picker-value">
                          {selectedArea.reference_id
                            ? references.find(r => r.id === selectedArea.reference_id)?.name || 'Unknown'
                            : 'Not selected'}
                        </span>
                        <button
                          className="reference-picker-btn"
                          onClick={() => setRefPickerOpen(true)}
                        >
                          Select
                        </button>
                        {selectedArea.reference_id && (
                          <button
                            className="reference-clear-btn"
                            onClick={() => updateArea(selectedAreaId, { reference_id: null })}
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="panel-empty">Select an item to edit</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Subject Area Picker for adding PPO Attribute or editing link */}
      {saPicker.open && (
        <SubjectAreaPicker
          subjectAreas={subjectAreas}
          excludeId={selectedAreaId || undefined}
          onSelect={(area) => {
            if (saPicker.parentConceptId === 'edit-link' && selectedConceptId) {
              // Editing existing ppo_attribute link
              updateConcept(selectedConceptId, { base_concept_id: area.id });
            } else {
              // Creating new ppo_attribute
              addDomainConcept('ppo_attribute', saPicker.parentConceptId, area.id);
            }
            setSaPicker({ open: false, parentConceptId: null });
          }}
          onClose={() => setSaPicker({ open: false, parentConceptId: null })}
        />
      )}

      {/* Reference Picker for Subject Area */}
      {refPickerOpen && selectedAreaId && (
        <div className="ref-picker-overlay" onClick={() => setRefPickerOpen(false)}>
          <div className="ref-picker-popup" onClick={(e) => e.stopPropagation()}>
            <div className="ref-picker-header">
              <h3>Select Reference</h3>
              <button onClick={() => setRefPickerOpen(false)}>×</button>
            </div>
            <div className="ref-picker-list">
              {references.map(ref => (
                <div
                  key={ref.id}
                  className="ref-picker-item"
                  onClick={() => {
                    linkReferenceToArea(selectedAreaId, ref.id);
                    setRefPickerOpen(false);
                  }}
                >
                  <ListAltIcon fontSize="small" />
                  <span>{ref.name}</span>
                </div>
              ))}
              {references.length === 0 && (
                <div className="ref-picker-empty">No references available</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Field Picker for attribute reference field mapping */}
      {fieldPickerOpen && selectedConceptId && selectedArea?.reference_id && (
        <div className="ref-picker-overlay" onClick={() => setFieldPickerOpen(false)}>
          <div className="ref-picker-popup" onClick={(e) => e.stopPropagation()}>
            <div className="ref-picker-header">
              <h3>Select Reference Field</h3>
              <button onClick={() => setFieldPickerOpen(false)}>×</button>
            </div>
            <div className="ref-picker-list">
              {(referenceFields[selectedArea.reference_id] || []).map(field => (
                <div
                  key={field.id}
                  className="ref-picker-item"
                  onClick={() => {
                    updateConcept(selectedConceptId, { reference_field_id: field.id });
                    setFieldPickerOpen(false);
                  }}
                >
                  <PanoramaFishEyeIcon fontSize="small" />
                  <span>{field.name}</span>
                </div>
              ))}
              {(referenceFields[selectedArea.reference_id] || []).length === 0 && (
                <div className="ref-picker-empty">No fields available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
