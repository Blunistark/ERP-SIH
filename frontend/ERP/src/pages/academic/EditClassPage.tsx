import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApiQuery, useApiMutation, apiClient } from '../../hooks/useApi';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

interface AcademicYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface ClassDetail {
  id: string;
  name: string;
  section: string;
  capacity: number;
  academicYear: AcademicYear;
  academicYearId: string;
}

interface ClassDetailResponse {
  success: boolean;
  data: ClassDetail;
}

interface AcademicYearsResponse {
  success: boolean;
  data: AcademicYear[];
}

interface UpdateClassForm {
  name: string;
  section: string;
  capacity: number;
  academicYearId: string;
}

interface FormErrors {
  name?: string;
  section?: string;
  capacity?: string;
  academicYearId?: string;
  submit?: string;
}

const EditClassPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<UpdateClassForm>({
    name: '',
    section: '',
    capacity: 50,
    academicYearId: '',
  });

  const { data: classData, isLoading: classLoading, error: classError } = useApiQuery<ClassDetailResponse>(
    ['class', id || ''],
    `/classes/${id}`
  );

  const { data: academicYearsData } = useApiQuery<AcademicYearsResponse>(
    ['academic-years'],
    '/academic-years'
  );

  const classDetail = (classData as ClassDetailResponse)?.data;
  const academicYears = (academicYearsData as AcademicYearsResponse)?.data || [];

  // Populate form when class data loads
  useEffect(() => {
    if (classDetail) {
      setFormData({
        name: classDetail.name,
        section: classDetail.section,
        capacity: classDetail.capacity,
        academicYearId: classDetail.academicYearId,
      });
    }
  }, [classDetail]);

  const updateClassMutation = useApiMutation(
    (data: UpdateClassForm) => apiClient(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    {
      onSuccess: () => {
        navigate(`/academic/classes/${id}`);
      },
      onError: (error: any) => {
        setErrors({ submit: error.message || 'Failed to update class' });
      },
    }
  );

  const handleInputChange = (field: keyof UpdateClassForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
    }

    if (!formData.section.trim()) {
      newErrors.section = 'Section is required';
    }

    if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    if (!formData.academicYearId) {
      newErrors.academicYearId = 'Academic year is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await updateClassMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (classLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading class details...</div>
      </div>
    );
  }

  if (classError || !classDetail) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading class details</div>
          <Button onClick={() => navigate('/academic/classes')}>
            Back to Classes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/academic/classes/${id}`)}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Class</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Class</h1>
            <p className="text-gray-600">
              {classDetail.name} - {classDetail.section}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <BookOpen className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Class Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Class Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Class 10, Grade 5"
                  error={errors.name}
                />
              </div>

              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                  Section *
                </label>
                <Input
                  id="section"
                  type="text"
                  value={formData.section}
                  onChange={(e) => handleInputChange('section', e.target.value)}
                  placeholder="e.g., A, B, C"
                  error={errors.section}
                />
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity *
                </label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity.toString()}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                  placeholder="Maximum number of students"
                  error={errors.capacity}
                />
              </div>

              <div>
                <label htmlFor="academicYearId" className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year *
                </label>
                <select
                  id="academicYearId"
                  value={formData.academicYearId}
                  onChange={(e) => handleInputChange('academicYearId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.year} {year.isActive ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
                {errors.academicYearId && (
                  <p className="mt-1 text-sm text-red-600">{errors.academicYearId}</p>
                )}
              </div>
            </div>

            {/* Current Stats */}
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Students Enrolled:</span>
                  <span className="ml-2 font-medium">
                    {classDetail.students?.length || 0}/{classDetail.capacity}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Teachers Assigned:</span>
                  <span className="ml-2 font-medium">{classDetail.teachers?.length || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Subjects:</span>
                  <span className="ml-2 font-medium">{classDetail.subjects?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              {errors.submit && (
                <div className="flex-1">
                  <p className="text-sm text-red-600">{errors.submit}</p>
                </div>
              )}
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/academic/classes/${id}`)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                icon={Save}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default EditClassPage;
