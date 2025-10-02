import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X, Clock } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface Teacher {
  id: string;
  user: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

interface Class {
  id: string;
  name: string;
  section: string;
  capacity: number;
  academicYearId: string;
}

interface SubjectFormData {
  name: string;
  code: string;
  description: string;
  credits: number;
  teacherIds: string[];
  classIds: string[];
}

interface SubjectData {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  teachers: Teacher[];
  classes: Class[];
  _count: {
    teachers: number;
    classes: number;
    exams: number;
  };
  createdAt: string;
  updatedAt: string;
}

const EditSubjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    code: '',
    description: '',
    credits: 1,
    teacherIds: [],
    classIds: [],
  });

  const { data: teachersResponse } = useApiQuery<any>('teachers', API_ENDPOINTS.TEACHERS);
  const { data: classesResponse } = useApiQuery<any>('classes', API_ENDPOINTS.CLASSES);

  // Debug logging
  console.log('Teachers Response:', teachersResponse);
  console.log('Classes Response:', classesResponse);

  const safeTeachers: Teacher[] = Array.isArray((teachersResponse as any)?.data) ? (teachersResponse as any).data : [];
  const safeClasses: Class[] = Array.isArray((classesResponse as any)?.data?.classes) ? (classesResponse as any).data.classes : [];
  
  console.log('Safe Teachers:', safeTeachers);
  console.log('Safe Classes:', safeClasses);

  // Load existing subject data
  useEffect(() => {
    if (id) {
      loadSubjectData();
    }
  }, [id]);

  const loadSubjectData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUBJECTS}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to fetch subject: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('Raw API Response:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response text:', responseText);
        throw new Error('Invalid JSON response from server');
      }
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch subject');
      }
      
      const subjectData: SubjectData = result.data;
      
      setFormData({
        name: subjectData.name,
        code: subjectData.code,
        description: subjectData.description || '',
        credits: subjectData.credits,
        teacherIds: subjectData.teachers.map(t => t.id),
        classIds: subjectData.classes.map(c => c.id),
      });
      
    } catch (error) {
      console.error('Error loading subject:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to load subject data: ${errorMessage}`);
      // Don't navigate away immediately, let user see the error
    } finally {
      setIsLoading(false);
    }
  };



  const handleInputChange = (field: keyof SubjectFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTeacherToggle = (teacherId: string) => {
    setFormData(prev => ({
      ...prev,
      teacherIds: prev.teacherIds.includes(teacherId)
        ? prev.teacherIds.filter(id => id !== teacherId)
        : [...prev.teacherIds, teacherId],
    }));
  };

  const handleClassToggle = (classId: string) => {
    setFormData(prev => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Subject name is required');
      return;
    }
    
    if (!formData.code.trim()) {
      alert('Subject code is required');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SUBJECTS}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          code: formData.code.trim(),
          description: formData.description.trim() || null,
          credits: formData.credits,
          teacherIds: formData.teacherIds,
          classIds: formData.classIds,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update subject');
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to update subject');
      }
      
      alert('Subject updated successfully!');
      navigate('/academic/subjects');
    } catch (error) {
      console.error('Error updating subject:', error);
      alert(error instanceof Error ? error.message : 'Failed to update subject. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedTeachers = safeTeachers.filter(t => formData.teacherIds.includes(t.id));
  const selectedClasses = safeClasses.filter(c => formData.classIds.includes(c.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading subject...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/academic/subjects')}
            icon={ArrowLeft}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Subject</h1>
            <p className="text-gray-600">Update subject information and assignments</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter subject name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject Code *
              </label>
              <Input
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                placeholder="e.g., MATH101"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter subject description"
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credits
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={formData.credits}
                onChange={(e) => handleInputChange('credits', parseInt(e.target.value) || 1)}
                required
              />
            </div>



          </div>
        </Card>

        {/* Teacher Assignment */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Teacher Assignment</h3>
          
          {/* Selected Teachers */}
          {selectedTeachers.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Teachers:</p>
              <div className="flex flex-wrap gap-2">
                {selectedTeachers.map(teacher => (
                  <span
                    key={teacher.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {teacher?.user?.profile?.firstName || 'Unknown'} {teacher?.user?.profile?.lastName || ''}
                    <button
                      type="button"
                      onClick={() => handleTeacherToggle(teacher.id)}
                      className="ml-2 text-blue-600 hover:text-blue-700"
                      title="Remove teacher"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available Teachers */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Available Teachers:</p>
            {safeTeachers.length === 0 && (
              <p className="text-sm text-gray-500 mb-2">Loading teachers...</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {safeTeachers.filter(t => !formData.teacherIds.includes(t.id)).map(teacher => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => handleTeacherToggle(teacher.id)}
                  className="flex items-center p-3 border border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-left"
                  title="Add teacher"
                >
                  <Plus className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm">
                    {teacher?.user?.profile?.firstName || 'Unknown'} {teacher?.user?.profile?.lastName || ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Class Assignment */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Assignment</h3>
          
          {/* Selected Classes */}
          {selectedClasses.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Selected Classes:</p>
              <div className="flex flex-wrap gap-2">
                {selectedClasses.map(cls => (
                  <span
                    key={cls.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {cls.name} - {cls.section}
                    <button
                      type="button"
                      onClick={() => handleClassToggle(cls.id)}
                      className="ml-2 text-green-600 hover:text-green-700"
                      title="Remove class"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available Classes */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Available Classes:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {safeClasses.filter(c => !formData.classIds.includes(c.id)).map(cls => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => handleClassToggle(cls.id)}
                  className="flex items-center p-3 border border-gray-300 rounded-lg hover:border-green-300 hover:bg-green-50 text-left"
                  title="Add class"
                >
                  <Plus className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm">
                    {cls.name} - {cls.section}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/academic/subjects')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            icon={Save}
          >
            {isSaving ? 'Updating...' : 'Update Subject'}
          </Button>
        </div>
      </form>

      {/* Change History */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Changes</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">Subject created</p>
              <p className="text-xs text-gray-500">Initial setup with basic information</p>
            </div>
            <span className="text-xs text-gray-500">Jan 1, 2024</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-900">Teacher assignments updated</p>
              <p className="text-xs text-gray-500">Added Sarah Johnson as co-instructor</p>
            </div>
            <span className="text-xs text-gray-500">Jan 15, 2024</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditSubjectPage;