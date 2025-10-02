import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Calendar, Users, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface NoticeFormData {
  title: string;
  content: string;
  type: 'ANNOUNCEMENT' | 'EVENT' | 'URGENT' | 'GENERAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  targetAudience: 'ALL' | 'STUDENTS' | 'TEACHERS' | 'PARENTS' | 'STAFF';
  isActive: boolean;
  isPinned: boolean;
  validFrom: string;
  validTo: string;
  attachments: File[];
}

const CreateNoticePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<NoticeFormData>({
    title: '',
    content: '',
    type: 'GENERAL',
    priority: 'MEDIUM',
    targetAudience: 'ALL',
    isActive: true,
    isPinned: false,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: '',
    attachments: [],
  });

  const noticeTypes = [
    { value: 'GENERAL', label: 'General Notice', description: 'Regular information sharing' },
    { value: 'ANNOUNCEMENT', label: 'Announcement', description: 'Important announcements' },
    { value: 'EVENT', label: 'Event', description: 'School events and activities' },
    { value: 'URGENT', label: 'Urgent Notice', description: 'Time-sensitive information' },
  ];

  const priorities = [
    { value: 'LOW', label: 'Low', color: 'bg-green-500', description: 'General information' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-500', description: 'Moderately important' },
    { value: 'HIGH', label: 'High', color: 'bg-orange-500', description: 'Important notice' },
    { value: 'CRITICAL', label: 'Critical', color: 'bg-red-500', description: 'Urgent attention required' },
  ];

  const audiences = [
    { value: 'ALL', label: 'Everyone', description: 'All users in the system' },
    { value: 'STUDENTS', label: 'Students', description: 'All enrolled students' },
    { value: 'TEACHERS', label: 'Teachers', description: 'Teaching staff only' },
    { value: 'PARENTS', label: 'Parents', description: 'Parents and guardians' },
    { value: 'STAFF', label: 'Staff', description: 'Administrative staff' },
  ];

  const handleInputChange = (field: keyof NoticeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Notice title is required');
      return;
    }
    
    if (!formData.content.trim()) {
      alert('Notice content is required');
      return;
    }
    
    if (!formData.validFrom) {
      alert('Valid from date is required');
      return;
    }

    if (formData.validTo && new Date(formData.validTo) <= new Date(formData.validFrom)) {
      alert('Valid to date must be after valid from date');
      return;
    }

    setIsSaving(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Notice created successfully!');
      navigate('/communication/notices');
    } catch (error) {
      alert('Failed to create notice. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getEstimatedAudience = () => {
    // Mock audience sizes - in real app, this would come from API
    const audienceSizes = {
      ALL: 500,
      STUDENTS: 300,
      TEACHERS: 50,
      PARENTS: 250,
      STAFF: 25,
    };
    return audienceSizes[formData.targetAudience] || 0;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/communication/notices')}
            icon={ArrowLeft}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Notice</h1>
            <p className="text-gray-600">Create and publish a new notice</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notice Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter notice title"
                required
                className="text-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notice Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Enter notice content"
                rows={6}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.content.length} characters
              </p>
            </div>
          </div>
        </Card>

        {/* Notice Configuration */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notice Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notice Type
              </label>
              <div className="space-y-2">
                {noticeTypes.map(type => (
                  <label key={type.value} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{type.label}</p>
                      <p className="text-xs text-gray-500">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <div className="space-y-2">
                {priorities.map(priority => (
                  <label key={priority.value} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value={priority.value}
                      checked={formData.priority === priority.value}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className={`w-3 h-3 rounded-full ml-3 mr-2 ${priority.color}`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{priority.label}</p>
                      <p className="text-xs text-gray-500">{priority.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Target Audience */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Target Audience
          </h3>
          <div className="space-y-3">
            {audiences.map(audience => (
              <label key={audience.value} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  value={audience.value}
                  checked={formData.targetAudience === audience.value}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{audience.label}</p>
                      <p className="text-xs text-gray-500">{audience.description}</p>
                    </div>
                    {formData.targetAudience === audience.value && (
                      <span className="text-sm text-blue-600 font-medium">
                        ~{getEstimatedAudience()} recipients
                      </span>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Validity Period */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Validity Period
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid From *
              </label>
              <Input
                type="date"
                value={formData.validFrom}
                onChange={(e) => handleInputChange('validFrom', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid To (Optional)
              </label>
              <Input
                type="date"
                value={formData.validTo}
                onChange={(e) => handleInputChange('validTo', e.target.value)}
                min={formData.validFrom}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for permanent notice
              </p>
            </div>
          </div>
        </Card>

        {/* Attachments */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
          
          {/* File Upload */}
          <div className="mb-4">
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-300 cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload files or drag and drop</p>
                <p className="text-xs text-gray-500">PDF, DOC, Images (Max 10MB each)</p>
              </div>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />
            </label>
          </div>

          {/* Uploaded Files */}
          {formData.attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
              {formData.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded">
                      <Upload className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-600 hover:text-red-700"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Notice Options */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notice Options</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Publish immediately (make visible to target audience)
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPinned"
                checked={formData.isPinned}
                onChange={(e) => handleInputChange('isPinned', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-700">
                Pin to top of notice board
              </label>
            </div>
          </div>
        </Card>

        {/* Preview */}
        {formData.title && formData.content && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${formData.type === 'URGENT' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                  {formData.type}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${priorities.find(p => p.value === formData.priority)?.color}`}>
                  {formData.priority}
                </span>
                {formData.isPinned && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    PINNED
                  </span>
                )}
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{formData.title}</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{formData.content}</p>
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{formData.targetAudience}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>From {new Date(formData.validFrom).toLocaleDateString()}</span>
                  {formData.validTo && <span>to {new Date(formData.validTo).toLocaleDateString()}</span>}
                </div>
                {formData.attachments.length > 0 && (
                  <span>📎 {formData.attachments.length} files</span>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/communication/notices')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            icon={Save}
          >
            {isSaving ? 'Creating...' : 'Create Notice'}
          </Button>
        </div>
      </form>

      {/* Warning for Critical/Urgent notices */}
      {(formData.priority === 'CRITICAL' || formData.type === 'URGENT') && (
        <Card>
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">High Priority Notice</p>
              <p className="text-sm text-yellow-700">
                This notice will be marked as {formData.priority.toLowerCase()} priority and may trigger immediate notifications to recipients.
                Please ensure the content is accurate and appropriate.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CreateNoticePage;