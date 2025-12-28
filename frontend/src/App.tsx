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
import ArrowDropDownCircleIcon from '@mui/icons-material/ArrowDropDownCircle';
import BookIcon from '@mui/icons-material/Book';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloseIcon from '@mui/icons-material/Close';
// Custom AI Gear icon - gear with AI text inside
const AIGearsIcon = ({ fontSize = 'small' }: { fontSize?: 'small' | 'medium' | 'large' }) => {
  const size = fontSize === 'small' ? 20 : fontSize === 'medium' ? 24 : 28;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Gear shape */}
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      {/* AI text */}
      <text x="12" y="13.5" fontSize="5" fontWeight="600" textAnchor="middle" fill="currentColor" stroke="none">AI</text>
    </svg>
  );
};
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useReferenceStore } from './store/referenceStore';
import { ReferenceEditor } from './components/ReferenceEditor';
import { SubjectAreaPicker } from './components/SubjectAreaPicker';
import { PPODemoView } from './components/PPODemoView';
import { API_URL, FORM_BUILDER_API_URL } from './config';
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

type DataType = 'text' | 'number' | 'date' | 'money' | 'boolean' | 'select';

interface DomainConcept {
  id: string;
  code: string;
  name: string;
  subject_area_id: string;
  parent_id: string | null;
  concept_type: 'attribute' | 'list' | 'ppo_attribute';
  data_type: DataType | null;
  base_concept_id: string | null;
  reference_id: string | null;
  reference_field_id: string | null;
  select_options: string[] | null;
  mask: string | null;
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

const getConceptIcon = (conceptType: string, dataType?: string | null, hasReference?: boolean) => {
  // If has reference, show book icon (green like others)
  if (hasReference || dataType === 'reference') {
    return <BookIcon fontSize="small" sx={{ color: '#2e7d32' }} />;
  }

  switch (conceptType) {
    case 'attribute':
      // Show data type icon
      switch (dataType) {
        case 'number': return <NumbersIcon fontSize="small" />;
        case 'date': return <CalendarTodayIcon fontSize="small" />;
        case 'money': return <AttachMoneyIcon fontSize="small" />;
        case 'boolean': return <ToggleOnIcon fontSize="small" />;
        case 'select': return <ArrowDropDownCircleIcon fontSize="small" />;
        case 'text':
        default: return <TextFieldsIcon fontSize="small" />;
      }
    case 'list': return <ListAltIcon fontSize="small" sx={{ color: '#2e7d32' }} />;
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
  { value: 'select', label: 'Select', icon: <ArrowDropDownCircleIcon fontSize="small" /> },
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
  const areaTreeRef = useRef<HTMLDivElement>(null);
  const conceptTreeRef = useRef<HTMLDivElement>(null);
  const refTreeRef = useRef<HTMLDivElement>(null);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [middlePanelCollapsed, setMiddlePanelCollapsed] = useState(false);
  const [leftTab, setLeftTab] = useState<LeftTab>('subject-areas');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set());
  const [saPicker, setSaPicker] = useState<{ open: boolean; parentConceptId: string | null }>({ open: false, parentConceptId: null });
  const [referenceFields, setReferenceFields] = useState<Record<string, ReferenceField[]>>({});
  const [draggedAreaId, setDraggedAreaId] = useState<string | null>(null);
  const [dragOverAreaId, setDragOverAreaId] = useState<string | null>(null);
  const [draggedConceptId, setDraggedConceptId] = useState<string | null>(null);
  const [dragOverConceptId, setDragOverConceptId] = useState<string | null>(null);
  const [maskHelpOpen, setMaskHelpOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Demo mode state
  // Shows generated form based on Domain Concepts (ППО) structure
  const [demoMode, setDemoMode] = useState<'off' | 'list' | 'detail'>('off');
  const [demoData, setDemoData] = useState<any[]>([]);
  const [selectedDemoItem, setSelectedDemoItem] = useState<any>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  // Toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show toast message
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  // Set initial focus on first Subject Area when data loads
  useEffect(() => {
    if (subjectAreas.length > 0 && areaTreeRef.current) {
      const firstNode = areaTreeRef.current.querySelector('.tree-node') as HTMLElement;
      if (firstNode) {
        firstNode.focus();
      }
    }
  }, [subjectAreas.length]);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(null);
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
      reference_id: null,
      reference_field_id: null,
      select_options: null,
      mask: null,
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

  // Auto-create child attributes from reference fields when linking a reference to a concept
  const linkReferenceToConcept = async (conceptId: string, referenceId: string) => {
    const concept = domainConcepts.find(c => c.id === conceptId);
    if (!concept) return;

    // Update the concept with reference_id
    updateConcept(conceptId, { reference_id: referenceId });

    // Load reference fields
    const fields = await loadReferenceFields(referenceId);

    // Create child attributes for each field
    const existingChildren = domainConcepts.filter(c => c.parent_id === conceptId);
    const areaConcepts = domainConcepts.filter(c => c.subject_area_id === concept.subject_area_id);
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
        subject_area_id: concept.subject_area_id,
        parent_id: conceptId,
        concept_type: 'attribute' as const,
        data_type: 'text' as DataType,
        base_concept_id: null,
        reference_id: null,
        reference_field_id: field.id,
        select_options: null,
        mask: null,
        sort_order: existingChildren.length + index,
      };
    });

    if (newConcepts.length > 0) {
      setDomainConcepts(prev => [...prev, ...newConcepts]);
      // Expand the parent concept to show new children
      setExpandedConcepts(prev => new Set([...prev, conceptId]));
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

  // Generate demo data from PPO structure
  const generateDemoData = async () => {
    if (!selectedAreaId) return;

    setDemoLoading(true);
    try {
      // Get concepts for this subject area
      const areaConcepts = domainConcepts.filter(c => c.subject_area_id === selectedAreaId);

      // Generate 10 sample records
      const records = [];
      for (let i = 0; i < 10; i++) {
        const record: any = { id: `demo-${i}` };

        // For each top-level concept, generate a value
        const topLevelConcepts = areaConcepts.filter(c => !c.parent_id);

        for (const concept of topLevelConcepts) {
          if (concept.concept_type === 'list') {
            // Generate array of child records
            const childConcepts = areaConcepts.filter(c => c.parent_id === concept.id);
            const listItems = [];
            const itemCount = Math.floor(Math.random() * 3) + 1;

            for (let j = 0; j < itemCount; j++) {
              const listItem: any = { id: `${concept.code}-${j}` };
              for (const child of childConcepts) {
                listItem[child.code] = generateFieldValue(child, i, j);
              }
              listItems.push(listItem);
            }
            record[concept.code] = listItems;
          } else {
            record[concept.code] = generateFieldValue(concept, i);
          }
        }

        records.push(record);
      }

      setDemoData(records);
    } catch (error) {
      console.error('Failed to generate demo data:', error);
    } finally {
      setDemoLoading(false);
    }
  };

  // Generate a field value based on concept type
  const generateFieldValue = (concept: DomainConcept, recordIndex: number, itemIndex?: number) => {
    const names = ['Иванов', 'Петров', 'Сидоров', 'Козлов', 'Новиков', 'Морозов', 'Волков', 'Соколов', 'Лебедев', 'Орлов'];
    const firstNames = ['Иван', 'Пётр', 'Александр', 'Сергей', 'Дмитрий', 'Андрей', 'Михаил', 'Николай', 'Алексей', 'Владимир'];
    const patronymics = ['Иванович', 'Петрович', 'Александрович', 'Сергеевич', 'Дмитриевич', 'Андреевич', 'Михайлович', 'Николаевич', 'Алексеевич', 'Владимирович'];
    const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Новосибирск', 'Екатеринбург', 'Нижний Новгород', 'Самара', 'Омск', 'Ростов-на-Дону', 'Уфа'];
    const streets = ['Ленина', 'Пушкина', 'Гагарина', 'Мира', 'Советская', 'Кирова', 'Московская', 'Центральная', 'Садовая', 'Молодёжная'];

    const code = concept.code.toLowerCase();
    const name = concept.name.toLowerCase();

    // Match by code or name
    if (code.includes('last_name') || code.includes('surname') || name.includes('фамилия')) {
      return names[recordIndex % names.length];
    }
    if (code.includes('first_name') || name.includes('имя')) {
      return firstNames[recordIndex % firstNames.length];
    }
    if (code.includes('middle_name') || code.includes('patronymic') || name.includes('отчество')) {
      return patronymics[recordIndex % patronymics.length];
    }
    if (code.includes('city') || name.includes('город')) {
      return cities[recordIndex % cities.length];
    }
    if (code.includes('street') || name.includes('улица')) {
      return `ул. ${streets[(recordIndex + (itemIndex || 0)) % streets.length]}`;
    }
    if (code.includes('house') || name.includes('дом')) {
      return String(Math.floor(Math.random() * 100) + 1);
    }
    if (code.includes('apartment') || name.includes('квартира')) {
      return String(Math.floor(Math.random() * 200) + 1);
    }
    if (code.includes('postal') || code.includes('index') || name.includes('индекс')) {
      return String(100000 + Math.floor(Math.random() * 900000));
    }
    if (code.includes('phone') || name.includes('телефон')) {
      return `+7${String(9000000000 + Math.floor(Math.random() * 999999999)).slice(0, 10)}`;
    }
    if (code.includes('email')) {
      return `${firstNames[recordIndex % firstNames.length].toLowerCase()}@example.com`;
    }
    if (code.includes('code') || name.includes('код')) {
      return `FL-${String(10000 + recordIndex).slice(1)}`;
    }

    // Handle data types
    switch (concept.data_type) {
      case 'date':
        const year = 1970 + Math.floor(Math.random() * 40);
        const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        return `${year}-${month}-${day}`;
      case 'number':
        return Math.floor(Math.random() * 1000);
      case 'money':
        return (Math.random() * 100000).toFixed(2);
      case 'boolean':
        return Math.random() > 0.5;
      case 'select':
        if (concept.select_options && concept.select_options.length > 0) {
          return concept.select_options[Math.floor(Math.random() * concept.select_options.length)];
        }
        return '';
      default:
        return `${concept.name} ${recordIndex + 1}`;
    }
  };

  // Combined hasChanges check
  const totalHasChanges = hasChanges || refHasChanges();

  // Create Client Type in form-builder from PPO structure
  const createInFormBuilder = async () => {
    if (!selectedAreaId || !selectedArea) return;
    if (isGenerating) return; // Prevent double-click

    setIsGenerating(true);
    const GEN_SUFFIX = '_gen'; // Суффикс для сгенерированных форм

    try {
      const areaConcepts = domainConcepts.filter(c => c.subject_area_id === selectedAreaId);
      const topLevelPPO = areaConcepts.find(c => !c.parent_id && c.concept_type === 'list');

      if (!topLevelPPO) {
        alert('Нет ППО для генерации. Добавьте список верхнего уровня.');
        return;
      }

      // 1. Delete existing _gen client types and forms only for THIS PPO
      const thisPpoCode = topLevelPPO.code;
      const thisPpoGenPrefix = `${thisPpoCode}${GEN_SUFFIX}`;
      showToast(`Удаление старых ${thisPpoGenPrefix} записей...`);

      const existingCTRes = await fetch(`${FORM_BUILDER_API_URL}/api/client-types`);
      const existingCTs: any[] = await existingCTRes.json();
      const existingFormsRes = await fetch(`${FORM_BUILDER_API_URL}/api/forms`);
      const existingForms: any[] = await existingFormsRes.json();

      // Find root client type for this PPO
      const existingRoot = existingCTs.find(ct => ct.code === thisPpoGenPrefix && !ct.parent_id);

      if (existingRoot) {
        // Delete all children recursively
        const deleteChildrenRecursive = async (parentId: string) => {
          const children = existingCTs.filter(ct => ct.parent_id === parentId);
          for (const child of children) {
            await deleteChildrenRecursive(child.id);
            await fetch(`${FORM_BUILDER_API_URL}/api/client-types/${child.id}`, { method: 'DELETE' });
          }
        };
        await deleteChildrenRecursive(existingRoot.id);
        await fetch(`${FORM_BUILDER_API_URL}/api/client-types/${existingRoot.id}`, { method: 'DELETE' });
      }

      // Delete _gen forms only for this PPO (code contains thisPpoCode and _gen)
      for (const form of existingForms) {
        if (form.code?.includes(thisPpoCode) && form.code?.includes(GEN_SUFFIX)) {
          await fetch(`${FORM_BUILDER_API_URL}/api/forms/${form.id}`, { method: 'DELETE' });
        }
      }

      showToast('Генерация новой структуры...');

      // Helper to convert data type to form component type
      const getComponentType = (dataType: string | null) => {
        switch (dataType) {
          case 'number':
          case 'money': return 'number';
          case 'date': return 'date';
          case 'boolean': return 'checkbox';
          case 'select': return 'select';
          default: return 'input';
        }
      };

      // Helper to create form component from concept
      const createComponent = (concept: DomainConcept): any => {
        const base: any = {
          id: concept.id,
          type: getComponentType(concept.data_type),
          props: {
            label: concept.name,
            placeholder: '',
            required: false,
            disabled: false,
          },
          validation: [],
        };

        if (concept.data_type === 'select' && concept.select_options) {
          base.props.options = concept.select_options.map(opt => ({
            label: opt,
            value: opt,
          }));
        }

        if (concept.data_type === 'boolean') {
          base.props.text = concept.name;
        }

        if (concept.reference_id) {
          base.props.referenceId = concept.reference_id;
        }

        return base;
      };

      // Helper to group fields into rows intelligently
      const groupFieldsIntoRows = (concepts: DomainConcept[]): any[] => {
        const components: any[] = [];
        const used = new Set<string>();

        // Define field groupings by name patterns
        const groupPatterns = [
          // ФИО group
          { patterns: ['фамил', 'имя', 'отчеств', 'surname', 'first', 'last', 'middle', 'patronymic'], minMatch: 2 },
          // Full name variations
          { patterns: ['фио', 'полное имя', 'full name'], minMatch: 1 },
          // Document series/number
          { patterns: ['серия', 'номер документ', 'series', 'number'], minMatch: 2 },
          // Dates that belong together
          { patterns: ['дата выдач', 'срок действ', 'issue', 'expir', 'valid'], minMatch: 2 },
          // Identity numbers
          { patterns: ['инн', 'снилс', 'inn', 'snils'], minMatch: 2 },
          // Address parts (small group)
          { patterns: ['индекс', 'postal', 'zip'], minMatch: 1 },
        ];

        // Try to group fields
        for (const group of groupPatterns) {
          const matchingConcepts = concepts.filter(c => {
            if (used.has(c.id)) return false;
            const nameLower = c.name.toLowerCase();
            const codeLower = c.code.toLowerCase();
            return group.patterns.some(p => nameLower.includes(p) || codeLower.includes(p));
          });

          if (matchingConcepts.length >= group.minMatch) {
            // Create a row with these fields
            const rowId = uuidv4();
            components.push({
              id: rowId,
              type: 'row',
              props: {
                columns: matchingConcepts.length,
              },
              children: matchingConcepts.map(c => {
                used.add(c.id);
                return createComponent(c);
              }),
            });
          }
        }

        // Add remaining fields - try to pair up small fields (2-3 per row)
        const remaining = concepts.filter(c => !used.has(c.id));
        let currentRow: DomainConcept[] = [];

        for (const concept of remaining) {
          const isLargeField = ['text', 'textarea'].includes(concept.data_type || '') &&
            (concept.name.toLowerCase().includes('адрес') ||
             concept.name.toLowerCase().includes('address') ||
             concept.name.toLowerCase().includes('комментар') ||
             concept.name.toLowerCase().includes('описан'));

          if (isLargeField) {
            // Flush current row if any
            if (currentRow.length > 0) {
              const rowId = uuidv4();
              components.push({
                id: rowId,
                type: 'row',
                props: { columns: currentRow.length },
                children: currentRow.map(c => createComponent(c)),
              });
              currentRow = [];
            }
            // Add large field as single component
            components.push(createComponent(concept));
          } else {
            currentRow.push(concept);
            // Create row when we have 3 fields or it's a date/select (takes less space)
            const isCompact = ['date', 'select', 'boolean', 'number'].includes(concept.data_type || '');
            if (currentRow.length >= 3 || (currentRow.length >= 2 && !isCompact)) {
              const rowId = uuidv4();
              components.push({
                id: rowId,
                type: 'row',
                props: { columns: currentRow.length },
                children: currentRow.map(c => createComponent(c)),
              });
              currentRow = [];
            }
          }
        }

        // Flush remaining
        if (currentRow.length > 0) {
          if (currentRow.length === 1) {
            components.push(createComponent(currentRow[0]));
          } else {
            const rowId = uuidv4();
            components.push({
              id: rowId,
              type: 'row',
              props: { columns: currentRow.length },
              children: currentRow.map(c => createComponent(c)),
            });
          }
        }

        return components;
      };

      // Helper to create grid columns from child concepts
      const createGridColumns = (childConcepts: DomainConcept[]) => {
        return childConcepts
          .filter(c => c.concept_type === 'attribute')
          .map(child => ({
            id: child.code,
            label: child.name,
            type: child.data_type === 'select' ? 'select' :
                  child.data_type === 'boolean' ? 'boolean' :
                  child.data_type === 'date' ? 'date' :
                  child.data_type === 'number' || child.data_type === 'money' ? 'number' : 'text',
            ...(child.data_type === 'select' && child.select_options ? {
              options: child.select_options.map(opt => ({ label: opt, value: opt })),
            } : {}),
          }));
      };

      // Source PPO ID for tracking
      const sourcePpoId = topLevelPPO.id;

      // 1. Create ONE root Client Type
      const ROOT_ID = uuidv4();
      console.log('Creating root with ID:', ROOT_ID);

      const rootRes = await fetch(`${FORM_BUILDER_API_URL}/api/client-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: ROOT_ID,
          code: `${topLevelPPO.code}${GEN_SUFFIX}`,
          name: `${topLevelPPO.name}${GEN_SUFFIX}`,
          parent_id: null,
          item_type: 'section',
          form_id: null,
          caption: `${topLevelPPO.name}${GEN_SUFFIX}`,
          always_show: false,
        }),
      });
      if (!rootRes.ok) throw new Error('Failed to create root');

      // 2. Get children of PPO (sections)
      const ppoChildren = areaConcepts.filter(c => c.parent_id === topLevelPPO.id && c.concept_type === 'list').sort((a, b) => a.sort_order - b.sort_order);
      console.log('PPO children:', ppoChildren.map(c => c.name));

      let isFirstForm = true;
      for (const sectionConcept of ppoChildren) {
        const SECTION_ID = uuidv4();
        console.log(`Creating section "${sectionConcept.name}" with ID: ${SECTION_ID}, parent: ${ROOT_ID}`);

        // Create section under root
        const sectionRes = await fetch(`${FORM_BUILDER_API_URL}/api/client-types`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: SECTION_ID,
            code: `${sectionConcept.code}${GEN_SUFFIX}`,
            name: sectionConcept.name,
            parent_id: ROOT_ID,
            item_type: 'section',
            form_id: null,
            caption: sectionConcept.name,
            always_show: false,
          }),
        });
        if (!sectionRes.ok) throw new Error(`Failed to create section: ${sectionConcept.name}`);

        const childConcepts = areaConcepts.filter(c => c.parent_id === sectionConcept.id).sort((a, b) => a.sort_order - b.sort_order);
        const childAttributes = childConcepts.filter(c => c.concept_type === 'attribute');
        const childLists = childConcepts.filter(c => c.concept_type === 'list');

        // If section has only attributes - create one form with fields
        if (childLists.length === 0 && childAttributes.length > 0) {
          const FORM_ID = uuidv4();
          const formCode = `${sectionConcept.code}${GEN_SUFFIX}`;

          // Create form
          await fetch(`${FORM_BUILDER_API_URL}/api/forms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: FORM_ID,
              code: formCode,
              name: `${sectionConcept.name}${GEN_SUFFIX}`,
              description: `Сгенерировано из ППО: ${sourcePpoId}`,
              schema_json: {
                code: formCode,
                name: `${sectionConcept.name}${GEN_SUFFIX}`,
                components: groupFieldsIntoRows(childAttributes),
                settings: { theme: 'light' },
              },
            }),
          });

          // Create form node under section
          const FORM_NODE_ID = uuidv4();
          console.log(`Creating form node "${sectionConcept.name}" with ID: ${FORM_NODE_ID}, parent: ${SECTION_ID}`);

          await fetch(`${FORM_BUILDER_API_URL}/api/client-types`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: FORM_NODE_ID,
              code: `${sectionConcept.code}_form${GEN_SUFFIX}`,
              name: sectionConcept.name,
              parent_id: SECTION_ID,
              item_type: 'form',
              form_id: FORM_ID,
              caption: sectionConcept.name,
              always_show: isFirstForm,
            }),
          });
          isFirstForm = false;
        }
        // If section has nested lists - create forms for each list
        else if (childLists.length > 0) {
          for (const listConcept of childLists) {
            const listChildren = areaConcepts.filter(c => c.parent_id === listConcept.id).sort((a, b) => a.sort_order - b.sort_order);
            const listAttributes = listChildren.filter(c => c.concept_type === 'attribute');

            const FORM_ID = uuidv4();
            const formCode = `${listConcept.code}${GEN_SUFFIX}`;

            // Create form with grid if there are columns
            let components: any[];
            if (listAttributes.length > 0) {
              const gridColumns = createGridColumns(listChildren);
              components = [{
                id: uuidv4(),
                type: 'grid',
                props: {
                  label: listConcept.name,
                  gridColumns,
                  minRows: 0,
                  maxRows: 10,
                },
                validation: [],
              }];
            } else {
              components = groupFieldsIntoRows(listChildren.filter(c => c.concept_type === 'attribute'));
            }

            // Create form
            await fetch(`${FORM_BUILDER_API_URL}/api/forms`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: FORM_ID,
                code: formCode,
                name: `${listConcept.name}${GEN_SUFFIX}`,
                description: `Сгенерировано из ППО: ${sourcePpoId}`,
                schema_json: {
                  code: formCode,
                  name: `${listConcept.name}${GEN_SUFFIX}`,
                  components,
                  settings: { theme: 'light' },
                },
              }),
            });

            // Create form node under section
            const FORM_NODE_ID = uuidv4();
            console.log(`Creating form node "${listConcept.name}" with ID: ${FORM_NODE_ID}, parent: ${SECTION_ID}`);

            await fetch(`${FORM_BUILDER_API_URL}/api/client-types`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: FORM_NODE_ID,
                code: `${listConcept.code}${GEN_SUFFIX}`,
                name: listConcept.name,
                parent_id: SECTION_ID,
                item_type: 'form',
                form_id: FORM_ID,
                caption: listConcept.name,
                always_show: isFirstForm,
              }),
            });
            isFirstForm = false;
          }
        }
      }

      showToast(`✓ Client Type "${topLevelPPO.name}${GEN_SUFFIX}" создан`);
    } catch (error) {
      console.error('Failed to create in form-builder:', error);
      showToast(`✗ Ошибка: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

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
          tabIndex={0}
          draggable={true}
          onDragStart={(e) => handleDragStart(e, area.id)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, area.id)}
          onDrop={(e) => handleDrop(e, area.id)}
          onClick={() => {
            setSelectedAreaId(area.id);
            setSelectedConceptId(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
              e.preventDefault();
              toggleAreaExpand(area.id);
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              if (isExpanded) {
                toggleAreaExpand(area.id);
              } else if (area.parent_id) {
                // Go to parent and collapse it
                const nodes = areaTreeRef.current?.querySelectorAll('.tree-node') as NodeListOf<HTMLElement>;
                const parentArea = subjectAreas.find(a => a.id === area.parent_id);
                if (parentArea && nodes) {
                  const arr = Array.from(nodes);
                  const parentIdx = arr.findIndex((_, i) => {
                    const prevNodes = arr.slice(0, i + 1);
                    return prevNodes.length > 0;
                  });
                  // Find parent node by clicking through
                  for (const node of arr) {
                    if (node.textContent?.includes(parentArea.name)) {
                      node.focus();
                      node.click();
                      if (expandedAreas.has(parentArea.id)) {
                        toggleAreaExpand(parentArea.id);
                      }
                      break;
                    }
                  }
                }
              }
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              const nodes = areaTreeRef.current?.querySelectorAll('.tree-node') as NodeListOf<HTMLElement>;
              if (nodes) {
                const arr = Array.from(nodes);
                const idx = arr.indexOf(e.currentTarget as HTMLElement);
                const next = e.key === 'ArrowDown' ? arr[idx + 1] : arr[idx - 1];
                if (next) {
                  next.focus();
                  next.click();
                }
              }
            } else if (e.key === 'Tab' && !e.shiftKey && conceptTreeRef.current) {
              const firstConcept = conceptTreeRef.current.querySelector('.tree-node') as HTMLElement;
              if (firstConcept) {
                e.preventDefault();
                firstConcept.focus();
                firstConcept.click();
              }
            }
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
          tabIndex={0}
          onClick={() => {
            selectReference(ref.id);
            setSelectedAreaId(null);
            setSelectedConceptId(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
              e.preventDefault();
              toggleRefExpand(ref.id);
            } else if (e.key === 'ArrowLeft' && isExpanded) {
              e.preventDefault();
              toggleRefExpand(ref.id);
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              const nodes = refTreeRef.current?.querySelectorAll('.tree-node') as NodeListOf<HTMLElement>;
              if (nodes) {
                const arr = Array.from(nodes);
                const idx = arr.indexOf(e.currentTarget as HTMLElement);
                const next = e.key === 'ArrowDown' ? arr[idx + 1] : arr[idx - 1];
                if (next) {
                  next.focus();
                  next.click();
                }
              }
            }
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
          tabIndex={0}
          draggable={true}
          onDragStart={(e) => handleConceptDragStart(e, concept.id)}
          onDragEnd={handleConceptDragEnd}
          onDragOver={(e) => handleConceptDragOver(e, concept.id)}
          onDrop={(e) => handleConceptDrop(e, concept.id)}
          onClick={() => setSelectedConceptId(concept.id)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' && hasChildren && !isExpanded) {
              e.preventDefault();
              toggleConceptExpand(concept.id);
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              if (isExpanded) {
                toggleConceptExpand(concept.id);
              } else if (concept.parent_id) {
                // Go to parent and collapse it
                const nodes = conceptTreeRef.current?.querySelectorAll('.tree-node') as NodeListOf<HTMLElement>;
                const parentConcept = domainConcepts.find(c => c.id === concept.parent_id);
                if (parentConcept && nodes) {
                  for (const node of Array.from(nodes)) {
                    if (node.textContent?.includes(parentConcept.name)) {
                      node.focus();
                      node.click();
                      if (expandedConcepts.has(parentConcept.id)) {
                        toggleConceptExpand(parentConcept.id);
                      }
                      break;
                    }
                  }
                }
              }
            } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              const nodes = conceptTreeRef.current?.querySelectorAll('.tree-node') as NodeListOf<HTMLElement>;
              if (nodes) {
                const arr = Array.from(nodes);
                const idx = arr.indexOf(e.currentTarget as HTMLElement);
                const next = e.key === 'ArrowDown' ? arr[idx + 1] : arr[idx - 1];
                if (next) {
                  next.focus();
                  next.click();
                }
              }
            } else if (e.key === 'Tab' && e.shiftKey && areaTreeRef.current) {
              const firstArea = areaTreeRef.current.querySelector('.tree-node') as HTMLElement;
              if (firstArea) {
                e.preventDefault();
                firstArea.focus();
                firstArea.click();
              }
            }
          }}
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
              {getConceptIcon(concept.concept_type, concept.data_type, !!concept.reference_id)}
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
          <div className="toolbar-separator" />
          <button
            className={`toolbar-btn icon-only ${demoMode !== 'off' ? 'active' : ''}`}
            onClick={() => {
              if (demoMode !== 'off') {
                setDemoMode('off');
                setDemoData([]);
                setSelectedDemoItem(null);
              } else if (selectedAreaId && isTerminal(selectedAreaId)) {
                setDemoMode('list');
                generateDemoData();
              }
            }}
            disabled={!selectedAreaId || !isTerminal(selectedAreaId)}
            title={demoMode !== 'off' ? 'Close Demo' : 'Demo Mode'}
          >
            {demoMode !== 'off' ? <CloseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
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
                    {getConceptIcon(selectedConcept.concept_type, selectedConcept.data_type, !!selectedConcept.reference_id)}
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
        {/* Demo Mode */}
        {demoMode !== 'off' && selectedArea && (
          <PPODemoView
            subjectArea={selectedArea}
            concepts={domainConcepts.filter(c => c.subject_area_id === selectedAreaId)}
            data={demoData}
            mode={demoMode}
            selectedItem={selectedDemoItem}
            loading={demoLoading}
            onModeChange={setDemoMode}
            onSelectItem={setSelectedDemoItem}
            onRefresh={generateDemoData}
            onBack={() => {
              setDemoMode('off');
              setDemoData([]);
              setSelectedDemoItem(null);
            }}
          />
        )}

        {/* Normal Mode: Left Panel with Tabs */}
        {demoMode === 'off' && (leftPanelCollapsed ? (
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
                  ref={areaTreeRef}
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
                <div ref={refTreeRef}>
                  {buildRefTree().map(ref => renderRefNode(ref))}
                  {references.length === 0 && (
                    <div className="panel-empty">No references</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Middle Panel - Domain Concepts (only show on subject-areas tab) */}
        {demoMode === 'off' && leftTab === 'subject-areas' && (
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
                  <>
                  <button
                    className="panel-add-btn"
                    onClick={createInFormBuilder}
                    disabled={isGenerating}
                    title="Create in Form-Builder"
                  >
                    <AIGearsIcon fontSize="small" />
                  </button>
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
                  </>
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
                    ref={conceptTreeRef}
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
        {demoMode === 'off' && (
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
                      {getConceptIcon(selectedConcept.concept_type, selectedConcept.data_type, !!selectedConcept.reference_id)}
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
                      <TextField
                        label="Code"
                        value={selectedConcept.code}
                        onChange={(e) => updateConcept(selectedConceptId, { code: e.target.value })}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Name"
                        value={selectedConcept.name}
                        onChange={(e) => updateConcept(selectedConceptId, { name: e.target.value })}
                        size="small"
                        fullWidth
                      />
                    </div>
                    {/* Data Type + Mask in one row */}
                    {selectedConcept.concept_type !== 'ppo_attribute' && (
                      <div className="property-row-inline">
                        <FormControl size="small" sx={{ flex: 1 }}>
                          <InputLabel>Data Type</InputLabel>
                          <Select
                            value={selectedConcept.data_type || 'text'}
                            label="Data Type"
                            onChange={(e) => updateConcept(selectedConceptId, { data_type: e.target.value as DataType })}
                            renderValue={(value) => {
                              const opt = DATA_TYPE_OPTIONS.find(o => o.value === value);
                              return (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  {opt?.icon}
                                  <span>{opt?.label || 'Text'}</span>
                                </span>
                              );
                            }}
                          >
                            {DATA_TYPE_OPTIONS.map(opt => (
                              <MenuItem key={opt.value} value={opt.value}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  {opt.icon}
                                  <span>{opt.label}</span>
                                </span>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          label="Mask"
                          value={selectedConcept.mask || ''}
                          onChange={(e) => updateConcept(selectedConceptId, { mask: e.target.value || null })}
                          placeholder="e.g. DD.MM.YYYY"
                          size="small"
                          sx={{ flex: 1 }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  onClick={() => setMaskHelpOpen(!maskHelpOpen)}
                                  title="Show mask examples"
                                >
                                  <HelpOutlineIcon fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      </div>
                    )}
                    {/* Mask help popup */}
                    {selectedConcept.concept_type !== 'ppo_attribute' && maskHelpOpen && (
                      <div className="mask-help-popup">
                        <div className="mask-help-header">
                          <span>Mask Examples</span>
                          <button onClick={() => setMaskHelpOpen(false)}>×</button>
                        </div>
                        <div className="mask-help-list">
                          {MASK_EXAMPLES.map((example, i) => (
                            <div
                              key={i}
                              className="mask-help-item"
                              onClick={() => {
                                updateConcept(selectedConceptId, { mask: example.mask });
                                setMaskHelpOpen(false);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <code>{example.mask}</code>
                              <span>{example.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Select options editor */}
                    {selectedConcept.data_type === 'select' && (
                      <div className="property-field">
                        <div className="select-options-header">Select Options</div>
                        <div className="select-options-editor">
                          <div className="select-options-list">
                            {(selectedConcept.select_options || []).map((option, index) => (
                              <div key={index} className="select-option-item">
                                <TextField
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...(selectedConcept.select_options || [])];
                                    newOptions[index] = e.target.value;
                                    updateConcept(selectedConceptId, { select_options: newOptions });
                                  }}
                                  placeholder={`Option ${index + 1}`}
                                  size="small"
                                  fullWidth
                                  InputProps={{
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            const newOptions = (selectedConcept.select_options || []).filter((_, i) => i !== index);
                                            updateConcept(selectedConceptId, { select_options: newOptions.length > 0 ? newOptions : null });
                                          }}
                                          title="Remove option"
                                          sx={{ color: '#999', '&:hover': { color: '#d32f2f' } }}
                                        >
                                          <span style={{ fontSize: 18 }}>×</span>
                                        </IconButton>
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          <button
                            className="select-option-add"
                            onClick={() => {
                              const newOptions = [...(selectedConcept.select_options || []), ''];
                              updateConcept(selectedConceptId, { select_options: newOptions });
                            }}
                          >
                            <AddIcon fontSize="small" />
                            <span>Add Option</span>
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Reference dropdown */}
                    <FormControl size="small" fullWidth>
                      <InputLabel shrink>Reference</InputLabel>
                      <Select
                        value={selectedConcept.reference_id || ''}
                        label="Reference"
                        onChange={(e) => {
                          const refId = e.target.value as string;
                          if (!refId) {
                            updateConcept(selectedConceptId, { reference_id: null, reference_field_id: null });
                          } else if (!selectedConcept.reference_id) {
                            linkReferenceToConcept(selectedConceptId, refId);
                          } else {
                            updateConcept(selectedConceptId, { reference_id: refId });
                          }
                        }}
                        onOpen={() => loadReferences()}
                        displayEmpty
                        notched
                        renderValue={(value) => {
                          if (!value) return 'Not selected';
                          return references.find(r => r.id === value)?.name || 'Not selected';
                        }}
                        endAdornment={
                          selectedConcept.reference_id && (
                            <InputAdornment position="end" sx={{ mr: 2 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateConcept(selectedConceptId, { reference_id: null, reference_field_id: null });
                                }}
                              >
                                <span style={{ fontSize: 18 }}>×</span>
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      >
                        {references.map(ref => (
                          <MenuItem key={ref.id} value={ref.id}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <ListAltIcon fontSize="small" />
                              <span>{ref.name}</span>
                            </span>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {/* Reference field mapping - show if concept or parent has a reference */}
                    {(() => {
                      // Get parent's reference if current concept doesn't have one
                      const parentConcept = selectedConcept.parent_id
                        ? domainConcepts.find(c => c.id === selectedConcept.parent_id)
                        : null;
                      const mappingReferenceId = selectedConcept.reference_id || parentConcept?.reference_id;

                      if (!mappingReferenceId) return null;

                      const fields = referenceFields[mappingReferenceId] || [];

                      return (
                        <FormControl size="small" fullWidth>
                          <InputLabel shrink>
                            Reference Field
                            {parentConcept?.reference_id && !selectedConcept.reference_id ? ' (from parent)' : ''}
                          </InputLabel>
                          <Select
                            value={selectedConcept.reference_field_id || ''}
                            label={`Reference Field${parentConcept?.reference_id && !selectedConcept.reference_id ? ' (from parent)' : ''}`}
                            onChange={(e) => updateConcept(selectedConceptId, { reference_field_id: e.target.value as string || null })}
                            onOpen={() => loadReferenceFields(mappingReferenceId)}
                            displayEmpty
                            notched
                            renderValue={(value) => {
                              if (!value) return 'Not mapped';
                              return fields.find(f => f.id === value)?.name || 'Not mapped';
                            }}
                            endAdornment={
                              selectedConcept.reference_field_id && (
                                <InputAdornment position="end" sx={{ mr: 2 }}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateConcept(selectedConceptId, { reference_field_id: null });
                                    }}
                                  >
                                    <span style={{ fontSize: 18 }}>×</span>
                                  </IconButton>
                                </InputAdornment>
                              )
                            }
                          >
                            {fields.map(field => (
                              <MenuItem key={field.id} value={field.id}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <PanoramaFishEyeIcon fontSize="small" />
                                  <span>{field.name}</span>
                                </span>
                              </MenuItem>
                            ))}
                            {fields.length === 0 && (
                              <MenuItem disabled>No fields available</MenuItem>
                            )}
                          </Select>
                        </FormControl>
                      );
                    })()}
                    {selectedConcept.concept_type === 'ppo_attribute' && (
                      <TextField
                        label="Linked to PPO"
                        value={selectedConcept.base_concept_id
                          ? subjectAreas.find(a => a.id === selectedConcept.base_concept_id)?.name || 'Unknown'
                          : 'Not linked'}
                        size="small"
                        fullWidth
                        InputProps={{
                          readOnly: true,
                          onClick: () => setSaPicker({ open: true, parentConceptId: 'edit-link' }),
                          sx: { cursor: 'pointer' },
                          startAdornment: (
                            <InputAdornment position="start">
                              <LinkIcon fontSize="small" />
                            </InputAdornment>
                          ),
                          endAdornment: selectedConcept.base_concept_id && (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateConcept(selectedConceptId, { base_concept_id: null });
                                }}
                              >
                                <span style={{ fontSize: 18 }}>×</span>
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </div>
                ) : selectedAreaId && selectedArea ? (
                  <div className="properties-form">
                    <div className="property-row">
                      <TextField
                        label="Code"
                        value={selectedArea.code}
                        onChange={(e) => updateArea(selectedAreaId, { code: e.target.value })}
                        size="small"
                        fullWidth
                      />
                      <TextField
                        label="Name"
                        value={selectedArea.name}
                        onChange={(e) => updateArea(selectedAreaId, { name: e.target.value })}
                        size="small"
                        fullWidth
                      />
                    </div>
                  </div>
                ) : (
                  <div className="panel-empty">Select an item to edit</div>
                )}
              </div>
            </>
          )}
        </div>)}
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

      {/* Toast notification */}
      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}

    </div>
  );
}

export default App;
