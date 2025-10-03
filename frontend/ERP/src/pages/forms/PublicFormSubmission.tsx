import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, CheckCircle, AlertCircle, Loader, Home } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

interface FormData {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  tableName: string;
}

const PublicFormSubmission: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORMS.GET}/${formId}`);
      if (!res.ok) {
        throw new Error('Form not found');
      }
      const response = await res.json();
      const formData = response.data || response; // Handle both {data: ...} and direct response
      setForm(formData);
      
      // Initialize form values
      const initialValues: Record<string, any> = {};
      formData.fields.forEach((field: FormField) => {
        if (field.type === 'checkbox') {
          initialValues[field.name] = false;
        } else {
          initialValues[field.name] = '';
        }
      });
      setFormValues(initialValues);
    } catch (err) {
      console.error('Error fetching form:', err);
      setError('Form not found or has been deleted');
    } finally {
      setLoading(false);
    }
  };

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && !value) {
      return `${field.label} is required`;
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (field.validation) {
      if (field.validation.min !== undefined && value < field.validation.min) {
        return field.validation.message || `Value must be at least ${field.validation.min}`;
      }
      if (field.validation.max !== undefined && value > field.validation.max) {
        return field.validation.message || `Value must be at most ${field.validation.max}`;
      }
      if (field.validation.pattern) {
        const regex = new RegExp(field.validation.pattern);
        if (!regex.test(value)) {
          return field.validation.message || 'Invalid format';
        }
      }
    }

    return null;
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormValues(prev => ({ ...prev, [fieldName]: value }));
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form) return;

    // Validate all fields
    const errors: Record<string, string> = {};
    form.fields.forEach(field => {
      const error = validateField(field, formValues[field.name]);
      if (error) {
        errors[field.name] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORMS.SUBMIT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: form.id,
          data: formValues,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit form');
      }

      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = !!validationErrors[field.name];
    const commonProps = {
      id: field.name,
      name: field.name,
      required: field.required,
      placeholder: field.placeholder,
      className: `w-full px-4 py-3 border ${
        hasError ? 'border-red-500' : 'border-gray-300'
      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`,
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            value={formValues[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            {...commonProps}
            value={formValues[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
          >
            <option value="">Select an option</option>
            {field.options?.map((option, i) => (
              <option key={i} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.name}
              name={field.name}
              checked={formValues[field.name] || false}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor={field.name} className="text-gray-700">
              {field.label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {field.options?.map((option, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`${field.name}-${i}`}
                  name={field.name}
                  value={option}
                  checked={formValues[field.name] === option}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={`${field.name}-${i}`} className="text-gray-700">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <input
            type="file"
            {...commonProps}
            onChange={(e) => handleInputChange(field.name, e.target.files?.[0])}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type={field.type}
            value={formValues[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !form) {
    const isLoggedIn = !!localStorage.getItem('authToken');
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This form does not exist or has been removed.'}</p>
          
          {isLoggedIn && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Are you looking to manage forms?</p>
              <Button
                onClick={() => navigate('/forms/generator')}
                className="flex items-center justify-center gap-2 mx-auto"
              >
                <Home className="w-4 h-4" />
                Go to Form Generator
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600">Your response has been submitted successfully.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="p-8">
          {/* Form Header */}
          <div className="mb-8 border-b pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
            <p className="text-gray-600">{form.description}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map((field, index) => (
              <div key={index} className="space-y-2">
                {field.type !== 'checkbox' && (
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                )}
                
                {renderField(field)}

                {validationErrors[field.name] && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validationErrors[field.name]}
                  </p>
                )}
              </div>
            ))}

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-4 text-lg"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Response
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Powered by NexVidya ERP AI Form Generator</p>
        </div>
      </div>
    </div>
  );
};

export default PublicFormSubmission;
