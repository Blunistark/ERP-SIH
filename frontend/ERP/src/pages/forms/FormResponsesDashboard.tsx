import React, { useState, useEffect } from 'react';
import { Download, Eye, Trash2, Calendar, Users, BarChart3 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';

interface FormResponse {
  id: string;
  formId: string;
  data: Record<string, any>;
  submittedAt: Date;
}

interface Form {
  id: string;
  title: string;
  description: string;
  fields: any[];
  tableName: string;
  responseCount: number;
  createdAt: Date;
}

const FormResponsesDashboard: React.FC = () => {
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (selectedForm) {
      fetchResponses(selectedForm.id);
    }
  }, [selectedForm]);

  const fetchForms = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORMS.LIST}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setForms(data);
      if (data.length > 0) {
        setSelectedForm(data[0]);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async (formId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.FORMS.RESPONSES}/${formId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setResponses(data);
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const exportToCSV = () => {
    if (!selectedForm || responses.length === 0) return;

    const headers = selectedForm.fields.map(f => f.label).join(',');
    const rows = responses.map(response => 
      selectedForm.fields.map(f => response.data[f.name] || '').join(',')
    );

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedForm.title}_responses_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <Card className="p-8 text-center">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Forms Yet</h2>
        <p className="text-gray-600 mb-4">Create your first AI-powered form to start collecting responses</p>
        <Button
          onClick={() => window.location.href = '/forms/generator'}
          className="bg-gradient-to-r from-purple-600 to-blue-600"
        >
          Create Form
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Form Responses</h1>
          <p className="mt-2 text-gray-600">View and manage form submissions</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Forms List */}
        <Card className="lg:col-span-1 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Your Forms</h3>
          <div className="space-y-2">
            {forms.map(form => (
              <button
                key={form.id}
                onClick={() => setSelectedForm(form)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedForm?.id === form.id
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900 truncate">{form.title}</div>
                <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Users className="w-3 h-3" />
                  {form.responseCount || 0} responses
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Responses */}
        <div className="lg:col-span-3 space-y-4">
          {selectedForm && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-sm text-gray-600">Total Responses</div>
                  <div className="text-3xl font-bold text-gray-900 mt-1">
                    {responses.length}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-gray-600">Form Created</div>
                  <div className="text-lg font-semibold text-gray-900 mt-1">
                    {new Date(selectedForm.createdAt).toLocaleDateString()}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-gray-600">Fields</div>
                  <div className="text-3xl font-bold text-gray-900 mt-1">
                    {selectedForm.fields.length}
                  </div>
                </Card>
              </div>

              {/* Actions */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{selectedForm.title}</h3>
                  <Button
                    onClick={exportToCSV}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={responses.length === 0}
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                </div>
              </Card>

              {/* Responses Table */}
              <Card className="p-6">
                {responses.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Responses Yet</h3>
                    <p className="text-gray-600">Share your form link to start collecting responses</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            #
                          </th>
                          {selectedForm.fields.slice(0, 5).map((field, i) => (
                            <th key={i} className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              {field.label}
                            </th>
                          ))}
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Submitted
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {responses.map((response, index) => (
                          <tr key={response.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">{index + 1}</td>
                            {selectedForm.fields.slice(0, 5).map((field, i) => (
                              <td key={i} className="py-3 px-4 text-sm text-gray-700">
                                {typeof response.data[field.name] === 'boolean'
                                  ? response.data[field.name] ? '✓' : '✗'
                                  : response.data[field.name] || '-'}
                              </td>
                            ))}
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {new Date(response.submittedAt).toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button className="text-blue-600 hover:text-blue-700">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-700">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormResponsesDashboard;
