import React, { useState, useMemo } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import './SubjectAreaPicker.css';

interface SubjectArea {
  id: string;
  code: string;
  name: string;
  parent_id: string | null;
  is_terminal: boolean;
}

interface SubjectAreaPickerProps {
  subjectAreas: SubjectArea[];
  onSelect: (area: SubjectArea) => void;
  onClose: () => void;
  excludeId?: string;
}

export const SubjectAreaPicker: React.FC<SubjectAreaPickerProps> = ({
  subjectAreas,
  onSelect,
  onClose,
  excludeId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Get all ancestor IDs for an item
  const getAncestorIds = (itemId: string): string[] => {
    const item = subjectAreas.find(i => i.id === itemId);
    if (!item || !item.parent_id) return [];
    return [item.parent_id, ...getAncestorIds(item.parent_id)];
  };

  // Get all descendant IDs for an item
  const getDescendantIds = (parentId: string): string[] => {
    const children = subjectAreas.filter(i => i.parent_id === parentId);
    return children.flatMap(child => [child.id, ...getDescendantIds(child.id)]);
  };

  // Filter areas - exclude specified ID and its descendants
  const availableAreas = useMemo(() => {
    if (!excludeId) return subjectAreas;
    const excludeIds = new Set([excludeId, ...getDescendantIds(excludeId)]);
    return subjectAreas.filter(a => !excludeIds.has(a.id));
  }, [subjectAreas, excludeId]);

  // Filter by search - show matching items + their ancestors
  const visibleIds = useMemo(() => {
    if (!searchQuery.trim()) return new Set(availableAreas.map(a => a.id));

    const lowerQuery = searchQuery.toLowerCase();
    const matchingIds = availableAreas
      .filter(a => a.name.toLowerCase().includes(lowerQuery))
      .map(a => a.id);

    const visible = new Set<string>();
    matchingIds.forEach(id => {
      visible.add(id);
      getAncestorIds(id).forEach(aid => visible.add(aid));
    });

    return visible;
  }, [availableAreas, searchQuery]);

  // Build tree structure
  const buildTree = (parentId: string | null = null): SubjectArea[] => {
    return availableAreas
      .filter(a => a.parent_id === parentId && visibleIds.has(a.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Flatten tree for display
  const flattenTree = (
    parentId: string | null = null,
    level: number = 0
  ): { area: SubjectArea; level: number; hasChildren: boolean }[] => {
    const nodes = buildTree(parentId);
    const result: { area: SubjectArea; level: number; hasChildren: boolean }[] = [];

    nodes.forEach(area => {
      const children = availableAreas.filter(a => a.parent_id === area.id && visibleIds.has(a.id));
      const hasChildren = children.length > 0;
      result.push({ area, level, hasChildren });

      if (hasChildren && (expandedRows.has(area.id) || searchQuery.trim())) {
        result.push(...flattenTree(area.id, level + 1));
      }
    });

    return result;
  };

  const displayRows = flattenTree();

  const toggleRowExpanded = (areaId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(areaId)) {
        next.delete(areaId);
      } else {
        next.add(areaId);
      }
      return next;
    });
  };

  const handleRowClick = (area: SubjectArea) => {
    onSelect(area);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="sa-picker-overlay" onClick={handleOverlayClick}>
      <div className="sa-picker-popup">
        <div className="sa-picker-header">
          <h3>Select Subject Area</h3>
          <button className="sa-picker-close" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <div className="sa-picker-search">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="sa-picker-content">
          {displayRows.length === 0 ? (
            <div className="sa-picker-empty">
              {searchQuery ? 'No matching areas' : 'No subject areas'}
            </div>
          ) : (
            <div className="sa-picker-list">
              {displayRows.map(({ area, level, hasChildren }) => (
                <div
                  key={area.id}
                  className="sa-picker-row"
                  style={{ paddingLeft: `${level * 20 + 12}px` }}
                  onClick={() => handleRowClick(area)}
                >
                  {hasChildren ? (
                    <button
                      className="sa-picker-expand-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRowExpanded(area.id);
                      }}
                    >
                      {expandedRows.has(area.id) || searchQuery.trim() ? (
                        <ExpandMoreIcon fontSize="small" />
                      ) : (
                        <ChevronRightIcon fontSize="small" />
                      )}
                    </button>
                  ) : (
                    <span className="sa-picker-expand-spacer" />
                  )}
                  <span className="sa-picker-icon">
                    {area.is_terminal ? (
                      <DescriptionIcon fontSize="small" />
                    ) : (
                      <FolderIcon fontSize="small" />
                    )}
                  </span>
                  <span className="sa-picker-name">{area.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
