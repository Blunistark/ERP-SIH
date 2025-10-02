import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '../../hooks/useApi';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';

interface EditAcademicYearForm {
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface AcademicYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AcademicYearResponse {
  success: boolean;
  data: AcademicYear;
}

const EditAcademicYearPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<EditAcademicYearForm>({
    year: '',
    startDate: '',
    endDate: '',
    isActive: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch academic year details
  const { data: academicYearData, isLoading: academicYearLoading } = useApiQuery<AcademicYearResponse>(
    ['academic-year', id || ''],
    `/academic-years/${id}`
  );

  const academicYear = (academicYearData as AcademicYearResponse)?.data;

  useEffect(() => {
    if (academicYear) {
      setFormData({
        year: academicYear.year,
        startDate: academicYear.startDate.split('T')[0], // Convert to YYYY-MM-DD format
        endDate: academicYear.endDate.split('T')[0], // Convert to YYYY-MM-DD format
        isActive: academicYear.isActive,
      });
    }
  }, [academicYear]);

  const updateAcademicYearMutation = useMutation({
    mutationFn: async (data: EditAcademicYearForm) => {
      const response = await fetch(`http://localhost:3000/api/academic-years/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update academic year');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
      queryClient.invalidateQueries({ queryKey: ['academic-year', id] });
      navigate('/academic/years');
    },
    onError: (error: any) => {
      setErrors({ submit: error.message || 'Failed to update academic year' });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.year.trim()) {
      newErrors.year = 'Academic year is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate >= endDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await updateAcademicYearMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (academicYearLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading academic year details...</div>
      </div>
    );
  }

  if (!academicYear) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">Academic year not found</div>
          <Button onClick={() => navigate('/academic/years')}>
            Back to Academic Years
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/academic/years')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back to Academic Years"
          aria-label="Back to Academic Years"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Academic Year</h1>
          <p className="text-gray-600">Update academic year information</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Academic Year Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Year *
                </label>
                <input
                  type="text"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.year ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 2024-2025"
                />
                {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Set as active academic year
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Only one academic year can be active at a time. Setting this as active will deactivate other years.
              </p>
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
              onClick={() => navigate('/academic/years')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Academic Year'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAcademicYearPage;
