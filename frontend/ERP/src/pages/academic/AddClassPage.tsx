import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '../../hooks/useApi';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';

interface AddClassForm {
  name: string;
  section: string;
  capacity: number;
  academicYearId: string;
}

interface AcademicYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface AcademicYearsResponse {
  success: boolean;
  data: AcademicYear[];
}

const AddClassPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<AddClassForm>({
    name: '',
    section: '',
    capacity: 30,
    academicYearId: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch academic years
  const { data: academicYearsData, isLoading: academicYearsLoading } = useApiQuery(
    'academic-years',
    '/academic-years'
  );

  const academicYears: AcademicYear[] = (academicYearsData as AcademicYearsResponse)?.data || [];

  const createClassMutation = useMutation({
    mutationFn: async (data: AddClassForm) => {
      const response = await fetch('http://localhost:3000/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create class');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      navigate('/academic/classes');
    },
    onError: (error: any) => {
      setErrors({ submit: error.message || 'Failed to create class' });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Class name is required';
    }

    if (!formData.section.trim()) {
      newErrors.section = 'Section is required';
    }

    if (!formData.academicYearId) {
      newErrors.academicYearId = 'Academic year is required';
    }

    if (formData.capacity < 1 || formData.capacity > 100) {
      newErrors.capacity = 'Capacity must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await createClassMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (academicYearsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading academic years...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/academic/classes')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to Classes"
          aria-label="Back to Classes"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Class</h1>
          <p className="text-gray-600">Create a new class section</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Class Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Grade 10, Class A"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
                  Section *
                </label>
                <input
                  type="text"
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.section ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., A, B, C"
                />
                {errors.section && <p className="text-red-500 text-sm mt-1">{errors.section}</p>}
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.capacity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="30"
                />
                {errors.capacity && <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>}
              </div>

              <div>
                <label htmlFor="academicYearId" className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year *
                </label>
                <select
                  id="academicYearId"
                  name="academicYearId"
                  value={formData.academicYearId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.academicYearId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.year} {year.isActive ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
                {errors.academicYearId && <p className="text-red-500 text-sm mt-1">{errors.academicYearId}</p>}
              </div>
            </div>

            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/academic/classes')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Class'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddClassPage;
