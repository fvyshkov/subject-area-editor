import { ComponentConfig, ComponentType } from '../types';

export const componentConfigs: ComponentConfig[] = [
  // Input components
  {
    type: 'input',
    label: 'Text Input',
    icon: 'T',
    category: 'input',
    defaultProps: { label: 'Text Input', placeholder: 'Enter text...' },
  },
  {
    type: 'textarea',
    label: 'Text Area',
    icon: '¶',
    category: 'input',
    defaultProps: { label: 'Text Area', placeholder: 'Enter long text...' },
  },
  {
    type: 'number',
    label: 'Number',
    icon: '#',
    category: 'input',
    defaultProps: { label: 'Number', placeholder: 'Enter number...' },
  },
  {
    type: 'email',
    label: 'Email',
    icon: '@',
    category: 'input',
    defaultProps: { label: 'Email', placeholder: 'Enter email...' },
  },
  {
    type: 'password',
    label: 'Password',
    icon: '•••',
    category: 'input',
    defaultProps: { label: 'Password', placeholder: 'Enter password...' },
  },
  {
    type: 'date',
    label: 'Date Picker',
    icon: '▦',
    category: 'input',
    defaultProps: { label: 'Date' },
  },
  {
    type: 'time',
    label: 'Time Picker',
    icon: '◷',
    category: 'input',
    defaultProps: { label: 'Time' },
  },
  {
    type: 'select',
    label: 'Dropdown',
    icon: '▼',
    category: 'input',
    defaultProps: { label: 'Select', options: [{ label: 'Option 1', value: 'option1' }] },
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    icon: '☐',
    category: 'input',
    defaultProps: { label: 'Checkbox', text: 'Check this option' },
  },
  {
    type: 'radio',
    label: 'Radio Group',
    icon: '○',
    category: 'input',
    defaultProps: { label: 'Radio Group', options: [{ label: 'Option A', value: 'a' }] },
  },
  {
    type: 'file',
    label: 'File Upload',
    icon: '↑',
    category: 'input',
    defaultProps: { label: 'Upload File' },
  },
  {
    type: 'picture',
    label: 'Picture',
    icon: '▣',
    category: 'input',
    defaultProps: { label: 'Upload Picture', accept: 'image/*', maxSize: 5, placeholderText: 'Click to upload' },
  },
  {
    type: 'computed',
    label: 'Computed',
    icon: 'ƒ',
    category: 'input',
    defaultProps: { label: 'Computed Field', computeScript: '// get_field_by_name("field_name")\nreturn ""' },
  },

  // Layout components
  {
    type: 'container',
    label: 'Container',
    icon: '□',
    category: 'layout',
    defaultProps: { direction: 'column', gap: 16, label: '', width: '', height: '', fillSpace: true },
  },
  {
    type: 'grid',
    label: 'Data Grid',
    icon: '⊞',
    category: 'layout',
    defaultProps: {
      label: 'Data Grid',
      gridColumns: [
        { id: 'col1', label: 'Column 1', type: 'text' },
        { id: 'col2', label: 'Column 2', type: 'text' },
      ],
      minRows: 0,
      maxRows: 10,
    },
  },
  {
    type: 'tabs',
    label: 'Tabs',
    icon: '⊟',
    category: 'layout',
    defaultProps: {
      tabs: [
        { id: 'tab1', label: 'Tab 1', children: [] },
        { id: 'tab2', label: 'Tab 2', children: [] },
      ],
    },
  },
  {
    type: 'divider',
    label: 'Divider',
    icon: '—',
    category: 'layout',
    defaultProps: {},
  },

  // Static components
  {
    type: 'heading',
    label: 'Heading',
    icon: 'H',
    category: 'static',
    defaultProps: { text: 'Heading', headingLevel: 2 },
  },
  {
    type: 'paragraph',
    label: 'Paragraph',
    icon: 'P',
    category: 'static',
    defaultProps: { text: 'This is a paragraph.' },
  },
  {
    type: 'button',
    label: 'Button',
    icon: '▢',
    category: 'static',
    defaultProps: { buttonText: 'Submit', buttonType: 'submit' },
  },
];

export const getComponentConfig = (type: ComponentType): ComponentConfig | undefined => {
  return componentConfigs.find((c) => c.type === type);
};

export const getComponentsByCategory = (category: ComponentConfig['category']): ComponentConfig[] => {
  return componentConfigs.filter((c) => c.category === category);
};
