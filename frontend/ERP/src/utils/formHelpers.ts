// Form field helpers for AI auto-fill functionality

export interface FormField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  value?: string;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'date' | 'number' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message: string;
}

export interface FormData {
  [key: string]: any;
}

// Auto-fill form fields with AI-provided data
export const autoFillForm = (data: FormData): void => {
  Object.keys(data).forEach((fieldName) => {
    const value = data[fieldName];
    if (value === null || value === undefined || value === 'NEEDS_USER_INPUT') return;

    // Try to find input element by name or id
    const input = document.querySelector<HTMLInputElement | HTMLSelectElement>(
      `[name="${fieldName}"], #${fieldName}`
    );

    if (input) {
      // Set value based on input type
      if (input.tagName === 'SELECT') {
        (input as HTMLSelectElement).value = String(value);
      } else if (input.type === 'checkbox') {
        (input as HTMLInputElement).checked = Boolean(value);
      } else if (input.type === 'radio') {
        const radioInput = document.querySelector<HTMLInputElement>(
          `input[name="${fieldName}"][value="${value}"]`
        );
        if (radioInput) radioInput.checked = true;
      } else {
        input.value = String(value);
      }

      // Trigger multiple events to ensure React captures the change
      const inputEvent = new Event('input', { bubbles: true });
      const changeEvent = new Event('change', { bubbles: true });
      
      input.dispatchEvent(inputEvent);
      input.dispatchEvent(changeEvent);
      
      // Force React to detect the change using Object descriptor
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(input, String(value));
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });
};

// Validate a single field
export const validateField = (value: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && !value.trim())) {
          return rule.message;
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          return rule.message;
        }
        break;
      case 'phone':
        const phoneRegex = /^\+?[\d\s-()]+$/;
        if (value && !phoneRegex.test(value)) {
          return rule.message;
        }
        break;
      case 'date':
        if (value && isNaN(Date.parse(value))) {
          return rule.message;
        }
        break;
      case 'number':
        if (value && isNaN(Number(value))) {
          return rule.message;
        }
        break;
      case 'minLength':
        if (value && String(value).length < rule.value) {
          return rule.message;
        }
        break;
      case 'maxLength':
        if (value && String(value).length > rule.value) {
          return rule.message;
        }
        break;
      case 'pattern':
        if (value && rule.value && !new RegExp(rule.value).test(value)) {
          return rule.message;
        }
        break;
    }
  }
  return null;
};

// Validate all form fields
export const validateForm = (data: FormData, fields: FormField[]): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  fields.forEach((field) => {
    if (field.validation && field.validation.length > 0) {
      const error = validateField(data[field.name], field.validation);
      if (error) {
        errors[field.name] = error;
      }
    }
  });

  return errors;
};

// Get all form fields from current page
export const getPageFormFields = (): FormField[] => {
  const fields: FormField[] = [];
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input, select, textarea'
  );

  inputs.forEach((input) => {
    if (input.name || input.id) {
      fields.push({
        id: input.id || input.name,
        name: input.name || input.id,
        type: input.type || input.tagName.toLowerCase(),
        required: input.hasAttribute('required') || input.getAttribute('aria-required') === 'true',
        value: input.value,
      });
    }
  });

  return fields;
};

// Get current form data with actual values
export const getCurrentFormData = (): Record<string, any> => {
  const formData: Record<string, any> = {};
  const inputs = document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input, select, textarea'
  );

  inputs.forEach((input) => {
    const fieldName = input.name || input.id;
    if (fieldName) {
      if (input.type === 'checkbox') {
        formData[fieldName] = (input as HTMLInputElement).checked;
      } else if (input.type === 'radio') {
        if ((input as HTMLInputElement).checked) {
          formData[fieldName] = input.value;
        }
      } else {
        formData[fieldName] = input.value;
      }
    }
  });

  return formData;
};

// Format form data for display in AI chat
export const formatFormDataForDisplay = (): string => {
  const formData = getCurrentFormData();
  const fields = getPageFormFields();
  
  let output = '📋 **Current Form Data:**\n\n';
  
  fields.forEach((field) => {
    const value = formData[field.name];
    const hasValue = value && value.toString().trim() !== '';
    const requiredMark = field.required ? '⚠️ (Required)' : '✓';
    const statusIcon = hasValue ? '✅' : (field.required ? '❌' : '⚪');
    
    output += `${statusIcon} **${field.name}** ${requiredMark}\n`;
    if (hasValue) {
      output += `   Value: \`${value}\`\n`;
    } else {
      output += `   Value: _Empty_\n`;
    }
  });
  
  // Check for missing required fields
  const missingRequired = fields
    .filter(f => f.required && (!formData[f.name] || formData[f.name].toString().trim() === ''))
    .map(f => f.name);
  
  if (missingRequired.length > 0) {
    output += `\n⚠️ **Missing Required Fields:**\n`;
    missingRequired.forEach(field => {
      output += `- ${field}\n`;
    });
  } else {
    output += `\n✨ **All required fields are filled!**\n`;
  }
  
  return output;
};

// Extract form schema for AI to understand
export const getFormSchema = (): string => {
  const fields = getPageFormFields();
  const schema = fields.map((field) => {
    const requiredText = field.required ? '(Required)' : '(Optional)';
    const valueText = field.value ? `Current: "${field.value}"` : 'Empty';
    return `- ${field.name} ${requiredText} [Type: ${field.type}] - ${valueText}`;
  });

  return schema.join('\n');
};

// Generate sample data for testing
export const generateSampleData = (formType: string): FormData => {
  const samples: Record<string, FormData> = {
    student: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      dateOfBirth: '2008-05-15',
      gender: 'Male',
      bloodGroup: 'O+',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      pincode: '10001',
      rollNumber: 'STU' + Math.floor(Math.random() * 10000),
      admissionDate: new Date().toISOString().split('T')[0],
      classId: '',
      parentId: '',
    },
    teacher: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567890',
      dateOfBirth: '1985-03-20',
      gender: 'Female',
      bloodGroup: 'A+',
      address: '456 Oak Avenue',
      city: 'Boston',
      state: 'MA',
      pincode: '02101',
      employeeId: 'EMP' + Math.floor(Math.random() * 10000),
      joiningDate: new Date().toISOString().split('T')[0],
      qualification: 'M.Ed',
      specialization: 'Mathematics',
      experience: '5',
    },
    class: {
      name: 'Class',
      section: 'A',
      capacity: '40',
      roomNumber: '101',
      classTeacherId: '',
    },
  };

  return samples[formType] || {};
};

// Highlight filled fields
export const highlightFilledFields = (fieldNames: string[]): void => {
  fieldNames.forEach((fieldName) => {
    const input = document.querySelector<HTMLInputElement | HTMLSelectElement>(
      `[name="${fieldName}"], #${fieldName}`
    );
    if (input) {
      input.classList.add('bg-green-50', 'border-green-500');
      setTimeout(() => {
        input.classList.remove('bg-green-50', 'border-green-500');
      }, 2000);
    }
  });
};

// Get current page type
export const detectPageType = (): string | null => {
  const path = window.location.pathname;
  
  if (path.includes('/students/add')) return 'student';
  if (path.includes('/teachers/add')) return 'teacher';
  if (path.includes('/parents/add')) return 'parent';
  if (path.includes('/classes/add')) return 'class';
  if (path.includes('/subjects/add')) return 'subject';
  if (path.includes('/years/add')) return 'year';
  
  return null;
};

// Form field descriptions for AI context
export const FORM_DESCRIPTIONS: Record<string, string> = {
  student: `
**Student Registration Form Fields:**

**Personal Information** (Required: First Name, Last Name, Email)
- First Name*: Student's first name
- Last Name*: Student's last name  
- Email*: Valid email address (format: user@domain.com)
- Phone: Contact phone number (format: +1234567890)
- Date of Birth: Birth date (must be in past)
- Gender: Male/Female/Other
- Blood Group: A+, A-, B+, B-, AB+, AB-, O+, O-

**Address Information** (All Optional)
- Address: Full residential address
- City: City name
- State: State/Province
- PIN Code: Postal code

**Academic Information** (Required: Roll Number, Admission Date, Class)
- Roll Number*: Unique student roll number
- Admission Date*: Date of admission (cannot be future)
- Class*: Class ID (find in Classes section)
- Parent ID: Optional parent ID if registered
`,
  teacher: `
**Teacher Registration Form Fields:**

**Personal Information** (Required: First Name, Last Name, Email)
- First Name*: Teacher's first name
- Last Name*: Teacher's last name
- Email*: Valid email address
- Phone: Contact phone number
- Date of Birth: Birth date
- Gender: Male/Female/Other
- Blood Group: Blood group type

**Professional Information** (Required: Employee ID, Joining Date)
- Employee ID*: Unique employee identifier
- Joining Date*: Date of joining
- Qualification: Educational qualification
- Specialization: Subject specialization
- Experience: Years of experience
`,
  class: `
**Class Creation Form Fields:**

- Name*: Class name (e.g., "Class 10")
- Section*: Section (e.g., "A", "B")
- Capacity: Maximum number of students
- Room Number: Classroom number
- Class Teacher ID: ID of assigned teacher
`,
};
