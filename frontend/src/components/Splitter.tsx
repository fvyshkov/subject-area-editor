import React, { useCallback, useEffect, useRef, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import './Splitter.css';

interface SplitterProps {
  direction: 'left' | 'right';
  isCollapsed: boolean;
  onToggle: () => void;
  onResize?: (width: number) => void;
  minWidth?: number;
  maxWidthPercent?: number;
}

export const Splitter: React.FC<SplitterProps> = ({
  direction,
  isCollapsed,
  onToggle,
  onResize,
  minWidth = 200,
  maxWidthPercent = 40,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const splitterRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // For left splitter: show right arrow when collapsed, left arrow when expanded
  // For right splitter: show left arrow when collapsed, right arrow when expanded
  const showLeftArrow = direction === 'left' ? !isCollapsed : isCollapsed;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start drag if clicking on the splitter itself, not the button
    if ((e.target as HTMLElement).closest('.splitter-button')) {
      return;
    }

    if (!onResize || isCollapsed) return;

    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;

    // Get the panel element to resize
    const splitter = splitterRef.current;
    if (!splitter) return;

    const panel = direction === 'left'
      ? splitter.previousElementSibling as HTMLElement
      : splitter.nextElementSibling as HTMLElement;

    if (panel) {
      startWidthRef.current = panel.offsetWidth;
    }
  }, [onResize, isCollapsed, direction]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !onResize) return;

    const splitter = splitterRef.current;
    if (!splitter) return;

    const appContent = splitter.closest('.app-content') as HTMLElement;
    if (!appContent) return;

    const maxWidth = appContent.offsetWidth * (maxWidthPercent / 100);
    const deltaX = e.clientX - startXRef.current;

    let newWidth: number;
    if (direction === 'left') {
      newWidth = startWidthRef.current + deltaX;
    } else {
      newWidth = startWidthRef.current - deltaX;
    }

    // Clamp to min/max
    newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
    onResize(newWidth);
  }, [isDragging, onResize, direction, minWidth, maxWidthPercent]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={splitterRef}
      className={`splitter ${isDragging ? 'dragging' : ''} ${onResize && !isCollapsed ? 'resizable' : ''}`}
      onMouseDown={handleMouseDown}
    >
      <div className="splitter-line" />
      <button className="splitter-button" onClick={onToggle} title={isCollapsed ? 'Expand' : 'Collapse'}>
        {showLeftArrow ? (
          <ChevronLeftIcon fontSize="small" />
        ) : (
          <ChevronRightIcon fontSize="small" />
        )}
      </button>
    </div>
  );
};
