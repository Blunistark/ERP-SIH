import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface Teacher {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface Class {
  id: string;
  name: string;
  section: string;
}

interface SubjectFormData {
  name: string;
  code: string;
  description: string;
  credits: number;
  department: string;
  category: 'CORE' | 'ELECTIVE' | 'PRACTICAL' | 'PROJECT';
  isActive: boolean;
  teacherIds: string[];
  classIds: string[];
}

const AddSubjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    code: '',
    description: '',
    credits: 1,
    department: '',
    category: 'CORE',
    isActive: true,
    teacherIds: [],
    classIds: [],
  });

  const { data: teachers } = useApiQuery<Teacher[]>('teachers', '/teachers');

  const { data: classes } = useApiQuery<Class[]>('classes', '/classes');

  const safeTeachers: Teacher[] = Array.isArray(teachers) ? teachers : [];
  const safeClasses: Class[] = Array.isArray(classes) ? classes : [];

  const departments = [
    'Mathematics',
    'Science',
    'Languages',
    'Social Studies',
    'Physical Education',
    'Arts',
    'Technology',
    'Commerce',
  ];

  const categories = [
    { value: 'CORE', label: 'Core Subject' },
    { value: 'ELECTIVE', label: 'Elective' },
    { value: 'PRACTICAL', label: 'Practical' },
    { value: 'PROJECT', label: 'Project Work' },
  ];

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
    
    if (!formData.department) {
      alert('Department is required');
      return;
    }

    setIsSaving(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Subject created successfully!');
      navigate('/academic/subjects');
    } catch (error) {
      alert('Failed to create subject. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedTeachers = safeTeachers.filter(t => formData.teacherIds.includes(t.id));
  const selectedClasses = safeClasses.filter(c => formData.classIds.includes(c.id));

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
            <h1 className="text-2xl font-bold text-gray-900">Add New Subject</h1>
            <p className="text-gray-600">Create a new subject with teacher and class assignments</p>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                title="Select department"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Select category"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active Subject
              </label>
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
                    {teacher.profile.firstName} {teacher.profile.lastName}
                    <button
                      type="button"
                      onClick={() => handleTeacherToggle(teacher.id)}
                      className="ml-2 text-blue-600 hover:text-blue-700"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {safeTeachers.filter(t => !formData.teacherIds.includes(t.id)).map(teacher => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => handleTeacherToggle(teacher.id)}
                  className="flex items-center p-3 border border-gray-300 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-left"
                >
                  <Plus className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm">
                    {teacher.profile.firstName} {teacher.profile.lastName}
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
            {isSaving ? 'Creating...' : 'Create Subject'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddSubjectPage;