import { FormSchema, FormComponent, ComponentType, SelectOption, ValidationRule } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const FORM_GENERATOR_SYSTEM_PROMPT = `You are an expert form builder assistant. Your job is to help users create form schemas in JSON format.

When a user describes a form they want to create, you should:
1. Analyze their requirements carefully
2. Create a well-structured form with appropriate components
3. Use the create_form tool to generate the JSON schema

Available component types:
- **Input fields**: input, textarea, number, email, password, date, file
- **Selection**: select (dropdown), radio (radio buttons), checkbox
- **Layout**: container (vertical/horizontal layout), row (multi-column layout), grid (data grid)
- **Static**: heading, paragraph, divider, button

Component properties:
- All input components support: label, placeholder, required, disabled, defaultValue
- Select and radio support: options array with {label, value}
- Container: direction (row/column), gap
- Row: columns (number of columns), gap
- Heading: text, headingLevel (1-6)
- Button: buttonText, buttonType (submit/button/reset)
- Grid: gridColumns array, minRows, maxRows

Validation rules:
- required, minLength, maxLength, min, max, pattern, email

Form schema structure:
{
  "name": "Form Name",
  "description": "Form description",
  "code": "unique_code",
  "components": [...],
  "settings": {
    "theme": "light",
    "submitUrl": "optional",
    "submitMethod": "POST"
  }
}

Always create user-friendly, well-organized forms with clear labels and appropriate validation.`;

export interface CreateFormTool {
  type: 'function';
  function: {
    name: 'create_form';
    description: 'Creates a form JSON schema based on user requirements';
    parameters: {
      type: 'object';
      properties: {
        name: {
          type: 'string';
          description: 'The name of the form';
        };
        description: {
          type: 'string';
          description: 'Description of what the form is for';
        };
        code: {
          type: 'string';
          description: 'Unique code identifier for the form (snake_case)';
        };
        components: {
          type: 'array';
          description: 'Array of form components';
          items: {
            type: 'object';
            properties: {
              type: {
                type: 'string';
                enum: ['input', 'textarea', 'select', 'checkbox', 'radio', 'date', 'number', 'email', 'password', 'file', 'button', 'heading', 'paragraph', 'divider', 'container', 'row', 'grid'];
                description: 'Type of the component';
              };
              props: {
                type: 'object';
                description: 'Component properties (label, placeholder, options, etc.)';
              };
              validation: {
                type: 'array';
                description: 'Array of validation rules';
                items: {
                  type: 'object';
                  properties: {
                    type: {
                      type: 'string';
                      enum: ['required', 'minLength', 'maxLength', 'min', 'max', 'pattern', 'email'];
                    };
                    value: {
                      description: 'Validation value (for min, max, length rules)';
                    };
                    message: {
                      type: 'string';
                      description: 'Error message to display';
                    };
                  };
                };
              };
              children: {
                type: 'array';
                description: 'Child components (only for container and row types)';
              };
            };
            required: ['type', 'props'];
          };
        };
        settings: {
          type: 'object';
          description: 'Form settings';
          properties: {
            theme: {
              type: 'string';
              enum: ['light', 'dark'];
            };
            submitUrl: {
              type: 'string';
              description: 'Optional URL to submit form data';
            };
            submitMethod: {
              type: 'string';
              enum: ['GET', 'POST', 'PUT'];
            };
          };
        };
      };
      required: ['name', 'components'];
    };
  };
}

export const CREATE_FORM_TOOL: CreateFormTool = {
  type: 'function',
  function: {
    name: 'create_form',
    description: 'Creates a form JSON schema based on user requirements',
    parameters: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The name of the form',
        },
        description: {
          type: 'string',
          description: 'Description of what the form is for',
        },
        code: {
          type: 'string',
          description: 'Unique code identifier for the form (snake_case)',
        },
        components: {
          type: 'array',
          description: 'Array of form components',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['input', 'textarea', 'select', 'checkbox', 'radio', 'date', 'number', 'email', 'password', 'file', 'button', 'heading', 'paragraph', 'divider', 'container', 'row', 'grid'],
                description: 'Type of the component',
              },
              props: {
                type: 'object',
                description: 'Component properties (label, placeholder, options, etc.)',
              },
              validation: {
                type: 'array',
                description: 'Array of validation rules',
                items: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      enum: ['required', 'minLength', 'maxLength', 'min', 'max', 'pattern', 'email'],
                    },
                    value: {
                      description: 'Validation value (for min, max, length rules)',
                    },
                    message: {
                      type: 'string',
                      description: 'Error message to display',
                    },
                  },
                },
              },
              children: {
                type: 'array',
                description: 'Child components (only for container and row types)',
              },
            },
            required: ['type', 'props'],
          },
        },
        settings: {
          type: 'object',
          description: 'Form settings',
          properties: {
            theme: {
              type: 'string',
              enum: ['light', 'dark'],
            },
            submitUrl: {
              type: 'string',
              description: 'Optional URL to submit form data',
            },
            submitMethod: {
              type: 'string',
              enum: ['GET', 'POST', 'PUT'],
            },
          },
        },
      },
      required: ['name', 'components'],
    },
  },
};

// Add IDs to components recursively
export function addIdsToComponents(components: any[]): FormComponent[] {
  return components.map((comp) => ({
    ...comp,
    id: uuidv4(),
    validation: comp.validation || [],
    children: comp.children ? addIdsToComponents(comp.children) : undefined,
  }));
}

// Process tool call result into FormSchema
export function processFormToolCall(toolCallArgs: any): FormSchema {
  return {
    name: toolCallArgs.name,
    description: toolCallArgs.description || '',
    code: toolCallArgs.code || '',
    components: addIdsToComponents(toolCallArgs.components || []),
    settings: toolCallArgs.settings || { theme: 'light' },
  };
}
