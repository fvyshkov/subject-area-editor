export type ComponentType =
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'time'
  | 'number'
  | 'email'
  | 'password'
  | 'file'
  | 'picture'
  | 'button'
  | 'heading'
  | 'paragraph'
  | 'divider'
  | 'container'
  | 'row'
  | 'grid'
  | 'tabs'
  | 'computed';

export interface IconMapping {
  value: string;
  icon: string; // emoji or icon name
  color?: string;
}

export interface GridColumn {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'select' | 'computed' | 'boolean' | 'icon';
  options?: SelectOption[]; // for select type
  computeScript?: string; // for computed type - JavaScript expression
  width?: number;
  wrap?: boolean; // wrap text and adjust row height
  // For icon type columns or select columns with icons
  iconSourceColumn?: string; // which column's value determines the icon (for icon type)
  iconMapping?: IconMapping[]; // mapping of values to icons (works for select and icon types)
}

export interface TabItem {
  id: string;
  label: string;
  children?: FormComponent[];
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'email';
  value?: string | number;
  message?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface ReferenceFilterParam {
  fieldCode: string;      // Field ID in reference to filter by
  sourceType: 'field' | 'static' | 'context';  // Where to get value from
  sourceFieldId?: string; // Form field ID (for sourceType='field')
  staticValue?: string;   // Static value (for sourceType='static')
  contextKey?: string;    // Context key like 'clientType' (for sourceType='context')
}

export interface FormComponent {
  id: string;
  type: ComponentType;
  props: {
    label?: string;
    placeholder?: string;
    defaultValue?: string | number | boolean;
    options?: SelectOption[];
    required?: boolean;
    disabled?: boolean;
    className?: string;
    style?: React.CSSProperties;
    // Field ID for mapping to grid columns
    fieldId?: string;
    // Button props
    buttonText?: string;
    buttonType?: 'submit' | 'button' | 'reset';
    // Heading props
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    text?: string;
    // Container props
    direction?: 'row' | 'column';
    gap?: number;
    // Row props
    columns?: number;
    // Tabs props
    tabs?: TabItem[];
    // Reference picker props
    referenceId?: string;
    referenceValueField?: string;
    referenceDisplayField?: string;
    referenceFieldMapping?: Record<string, string>;
    referenceFilterParams?: ReferenceFilterParam[];
    [key: string]: any;
  };
  validation?: ValidationRule[];
  children?: FormComponent[];
}

export interface FormSchema {
  id?: string;
  code?: string;
  name: string;
  description?: string;
  components: FormComponent[];
  settings: {
    submitUrl?: string;
    submitMethod?: 'GET' | 'POST' | 'PUT';
    theme?: 'light' | 'dark';
    [key: string]: any;
  };
}

export interface FormData {
  [key: string]: any;
}

export interface ComponentConfig {
  type: ComponentType;
  label: string;
  icon: string;
  category: 'input' | 'layout' | 'static';
  defaultProps: FormComponent['props'];
}
