import React, { useState, useEffect } from 'react';
import { Wand2, Copy, ExternalLink, Database, Save, Eye, Sparkles, Trash2, Edit2, Plus, List, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
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

interface GeneratedForm {
  id?: string;
  title: string;
  description: string;
  fields: FormField[];
  tableName: string;
  shareableLink?: string;
  createdAt?: Date;
  _count?: {
    responses: number;
  };
}

interface SavedForm {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  tableName: string;
  createdAt: string;
  updatedAt: string;
  responseCount: number;
}

const AIFormGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedForm, setGeneratedForm] = useState<GeneratedForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Form management states
  const [existingForms, setExistingForms] = useState<SavedForm[]>([]);
  const [isLoadingForms, setIsLoadingForms] = useState(false);
  const [showFormsList, setShowFormsList] = useState(true);
  const [editingMode, setEditingMode] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  // Load existing forms on mount
  useEffect(() => {
    loadExistingForms();
  }, []);

  const loadExistingForms = async () => {
    setIsLoadingForms(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORMS.LIST}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to load forms');

      const response = await res.json();
      setExistingForms(response.data || []);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setIsLoadingForms(false);
    }
  };

  const loadFormForEditing = (form: SavedForm) => {
    setGeneratedForm({
      id: form.id,
      title: form.title,
      description: form.description,
      fields: form.fields,
      tableName: form.tableName,
      shareableLink: `${window.location.origin}/form/${form.id}`,
      createdAt: new Date(form.createdAt),
      _count: {
        responses: form.responseCount
      },
    });
    setEditingMode(true);
    setSelectedFormId(form.id);
    setShowPreview(true);
    setShowFormsList(false);
  };

  const deleteForm = async (formId: string, formTitle: string) => {
    if (!confirm(`⚠️ Are you sure you want to delete "${formTitle}"?\n\nThis will:\n- Delete the form definition\n- Drop the database table\n- Delete ALL responses\n\nThis action cannot be undone!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}/api/forms/delete/${formId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete form');

      alert('✅ Form deleted successfully!');
      await loadExistingForms();
      
      // Clear current form if it was deleted
      if (selectedFormId === formId) {
        setGeneratedForm(null);
        setEditingMode(false);
        setSelectedFormId(null);
        setShowFormsList(true);
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Failed to delete form. Please try again.');
    }
  };

  const createNewForm = () => {
    setGeneratedForm(null);
    setEditingMode(false);
    setSelectedFormId(null);
    setShowPreview(false);
    setPrompt('');
    setShowFormsList(false);
  };

  const generateForm = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      // Get session ID
      let sessionId = localStorage.getItem('ai_chat_session_id');
      if (!sessionId) {
        sessionId = 'sess-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
        localStorage.setItem('ai_chat_session_id', sessionId);
      }

      const payload = {
        sessionId,
        action: 'generateForm',
        chatInput: prompt,
        query: prompt,
        currentPage: '/forms/generator',
        timestamp: new Date().toISOString(),
      };

      const url = (import.meta.env.VITE_N8N_CHAT_URL as string) || API_ENDPOINTS.AI.PROCESS;
      const token = (import.meta.env.VITE_N8N_CHAT_TOKEN as string) || localStorage.getItem('authToken');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate form: ${res.statusText}`);
      }

      const responseData = await res.json();
      console.log('AI Form Response:', responseData);

      // Extract form from response
      const extractedForm = extractFormFromResponse(responseData);
      if (extractedForm) {
        setGeneratedForm(extractedForm);
        setShowPreview(true);
      } else {
        throw new Error('Could not parse form from AI response');
      }
    } catch (error) {
      console.error('Error generating form:', error);
      alert('Failed to generate form. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const extractFormFromResponse = (data: any): GeneratedForm | null => {
    try {
      // Extract from markdown code blocks
      if (data.output) {
        const jsonBlockRegex = /```json\s*\n?([\s\S]*?)\n?```/g;
        const matches = [...data.output.matchAll(jsonBlockRegex)];

        if (matches.length > 0) {
          for (const match of matches) {
            try {
              const parsed = JSON.parse(match[1].trim());
              if (parsed.action === 'generateForm' && parsed.form) {
                return parsed.form;
              }
            } catch (e) {
              continue;
            }
          }
        }
      }

      // Direct object
      if (data.action === 'generateForm' && data.form) {
        return data.form;
      }

      return null;
    } catch (error) {
      console.error('Error extracting form:', error);
      return null;
    }
  };

  const saveForm = async () => {
    if (!generatedForm) return;

    setIsSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // If editing existing form, just update the fields
      if (editingMode && selectedFormId) {
        // Note: Update endpoint to be implemented
        alert('⚠️ Form update feature coming soon! For now, delete and recreate the form.');
        setIsSaving(false);
        return;
      }
      
      // Create new form
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORMS.CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(generatedForm),
      });

      const responseData = await res.json();
      
      if (!res.ok) {
        // Handle duplicate table name
        if (res.status === 409) {
          alert(`❌ ${responseData.error}\n\nPlease:\n1. Use a different form name\n2. Or delete the existing form first\n3. Or edit the existing form`);
          return;
        }
        throw new Error(responseData.error || 'Failed to save form');
      }

      const savedForm = responseData.data || responseData;
      setGeneratedForm(savedForm);
      alert('✅ Form saved successfully! Table created in database.');
      await loadExistingForms(); // Refresh the list
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyShareableLink = () => {
    if (generatedForm?.shareableLink) {
      navigator.clipboard.writeText(generatedForm.shareableLink);
      alert('📋 Link copied to clipboard!');
    }
  };

  const fieldTypeIcons: Record<string, string> = {
    text: '📝',
    email: '📧',
    number: '🔢',
    date: '📅',
    select: '📋',
    textarea: '📄',
    checkbox: '☑️',
    radio: '🔘',
    file: '📎',
  };

  return (
    <div className="flex gap-6">
      {/* Existing Forms Sidebar */}
      {showFormsList && (
        <Card className="w-80 flex-shrink-0 p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <List className="w-5 h-5" />
                Your Forms
              </h2>
              <button
                onClick={loadExistingForms}
                disabled={isLoadingForms}
                className="p-1 hover:bg-gray-100 rounded"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoadingForms ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <Button
              onClick={createNewForm}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4" />
              Create New Form
            </Button>

            {isLoadingForms ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                Loading forms...
              </div>
            ) : existingForms.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No forms yet.<br />Create your first form!
              </div>
            ) : (
              <div className="space-y-2">
                {existingForms.map((form) => (
                  <div
                    key={form.id}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedFormId === form.id
                        ? 'bg-purple-50 border-purple-300'
                        : 'bg-gray-50 border-gray-200 hover:border-purple-200'
                    }`}
                  >
                    <div className="space-y-2">
                      <div>
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-1">
                          {form.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {form.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          📝 {form.fields.length} fields
                        </span>
                        <span className="flex items-center gap-1">
                          📊 {form.responseCount || 0} responses
                        </span>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            loadFormForEditing(form);
                          }}
                          className="flex-1 px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteForm(form.id, form.title);
                          }}
                          className="flex-1 px-2 py-1 text-xs bg-red-50 border border-red-200 text-red-600 rounded hover:bg-red-100 flex items-center justify-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Wand2 className="w-8 h-8 text-purple-600" />
              AI Form Generator
              {editingMode && (
                <span className="text-sm font-normal text-gray-500">
                  (Viewing)
                </span>
              )}
            </h1>
            <p className="mt-2 text-gray-600">
              {editingMode 
                ? 'Viewing form details and responses'
                : 'Describe your form needs, and AI will create it with database schema'
              }
            </p>
          </div>
          
          {!showFormsList && (
            <Button
              onClick={() => setShowFormsList(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              Show Forms List
            </Button>
          )}
        </div>

        {/* AI Prompt Section */}
        {!editingMode && (
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your form
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: Create an admission form with student name, email, phone, date of birth, address, previous school, grade applying for, and parent details"
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  disabled={isGenerating}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={generateForm}
                  disabled={!prompt.trim() || isGenerating}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate Form with AI
                    </>
                  )}
                </Button>

                {generatedForm && (
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? 'Hide' : 'Show'} Preview
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

      {/* Generated Form Preview */}
      {generatedForm && showPreview && (
        <Card className="p-6">
          <div className="space-y-6">
            {/* Form Header */}
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">{generatedForm.title}</h2>
              <p className="text-gray-600 mt-1">{generatedForm.description}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Database className="w-4 h-4" />
                  Table: <code className="text-purple-600 font-mono">{generatedForm.tableName}</code>
                </span>
                <span className="flex items-center gap-1">
                  📝 {generatedForm.fields.length} fields
                </span>
                {generatedForm._count && (
                  <span className="flex items-center gap-1">
                    📊 {generatedForm._count.responses} responses
                  </span>
                )}
              </div>
            </div>

            {/* Fields List */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Form Fields</h3>
              <div className="grid gap-3">
                {generatedForm.fields.map((field, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{fieldTypeIcons[field.type] || '📝'}</span>
                          <span className="font-medium text-gray-900">{field.label}</span>
                          {field.required && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-600">
                          <span className="bg-white px-2 py-1 rounded border border-gray-200">
                            Type: {field.type}
                          </span>
                          <span className="bg-white px-2 py-1 rounded border border-gray-200">
                            Name: {field.name}
                          </span>
                          {field.placeholder && (
                            <span className="bg-white px-2 py-1 rounded border border-gray-200 italic">
                              Placeholder: {field.placeholder}
                            </span>
                          )}
                        </div>
                        {field.options && field.options.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs text-gray-500">Options:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {field.options.map((opt, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {field.validation && (
                          <div className="mt-2 text-xs text-gray-500">
                            <span className="font-medium">Validation:</span> {field.validation.message || 'Custom validation rules applied'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {!editingMode && (
                <Button
                  onClick={saveForm}
                  disabled={isSaving || !!generatedForm.id}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <>
                      <Database className="w-4 h-4 animate-pulse" />
                      Creating Table...
                    </>
                  ) : generatedForm.id ? (
                    <>
                      <Database className="w-4 h-4" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save & Create Database Table
                    </>
                  )}
                </Button>
              )}

              {generatedForm.shareableLink && (
                <>
                  <Button
                    onClick={copyShareableLink}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </Button>
                  <Button
                    onClick={() => window.open(generatedForm.shareableLink, '_blank')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Form
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Example Prompts */}
      {!generatedForm && !editingMode && (
        <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Example Prompts
          </h3>
          <div className="grid gap-2">
            {[
              'Create an admission form with student details, contact info, and previous education',
              'Build a feedback form with rating scales, comments, and satisfaction metrics',
              'Generate an event registration form with attendee info, meal preferences, and t-shirt size',
              'Make an inquiry form for prospective students with interests and preferred contact method',
              'Design a job application form with resume upload, experience, and availability',
            ].map((example, i) => (
              <button
                key={i}
                onClick={() => setPrompt(example)}
                className="text-left p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:shadow-sm transition-all text-sm text-gray-700"
              >
                💡 {example}
              </button>
            ))}
          </div>
        </Card>
      )}
      </div>
    </div>
  );
};

export default AIFormGenerator;
