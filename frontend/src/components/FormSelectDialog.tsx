import React, { useState, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import './FormSelectDialog.css';

interface SavedForm {
  id: string;
  code: string | null;
  name: string;
}

interface FormSelectDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (action: 'new' | 'link' | 'copy', formId?: string, formName?: string) => void;
  forms: SavedForm[];
}

export const FormSelectDialog: React.FC<FormSelectDialogProps> = ({
  open,
  onClose,
  onSelect,
  forms,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  const filteredForms = useMemo(() => {
    if (!searchQuery) return forms;
    const query = searchQuery.toLowerCase();
    return forms.filter(
      (form) =>
        form.name.toLowerCase().includes(query) ||
        (form.code && form.code.toLowerCase().includes(query))
    );
  }, [forms, searchQuery]);

  const handleClose = () => {
    setSearchQuery('');
    setSelectedFormId(null);
    onClose();
  };

  const handleAddNew = () => {
    onSelect('new');
    handleClose();
  };

  const handleAddSelected = () => {
    if (selectedFormId) {
      const form = forms.find(f => f.id === selectedFormId);
      onSelect('link', selectedFormId, form?.name);
      handleClose();
    }
  };

  const handleAddCopy = () => {
    if (selectedFormId) {
      const form = forms.find(f => f.id === selectedFormId);
      onSelect('copy', selectedFormId, form?.name);
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select Form</DialogTitle>
      <DialogContent>
        <div className="form-select-toolbar">
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            size="small"
          >
            Add New
          </Button>
          <Button
            variant="outlined"
            startIcon={<LinkIcon />}
            onClick={handleAddSelected}
            disabled={!selectedFormId}
            size="small"
          >
            Add Selected
          </Button>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleAddCopy}
            disabled={!selectedFormId}
            size="small"
          >
            Add Copy
          </Button>
        </div>

        <TextField
          fullWidth
          size="small"
          placeholder="Search forms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-select-search"
        />

        <List className="form-select-list">
          {filteredForms.length === 0 ? (
            <div className="form-select-empty">No forms found</div>
          ) : (
            filteredForms.map((form) => (
              <ListItemButton
                key={form.id}
                selected={selectedFormId === form.id}
                onClick={() => setSelectedFormId(form.id)}
                onDoubleClick={() => {
                  setSelectedFormId(form.id);
                  onSelect('link', form.id, form.name);
                  handleClose();
                }}
              >
                <ListItemText
                  primary={form.name}
                  secondary={form.code || undefined}
                />
              </ListItemButton>
            ))
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
