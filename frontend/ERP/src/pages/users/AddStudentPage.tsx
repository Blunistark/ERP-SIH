import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, GraduationCap, Users } from 'lucide-react';
import { useApiMutation, useApiQuery } from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../config/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface AddStudentForm {
  // User fields
  email: string;
  
  // Profile fields
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  address: string;
  city: string;
  state: string;
  pincode: string;
  bloodGroup: string;
  
  // Student specific fields
  rollNumber: string;
  admissionDate: string;
  classId: string;
  parentId?: string;
}

const AddStudentPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Fetch classes for dropdown
  const { data: classesResponse, isLoading: classesLoading } = useApiQuery(
    ['classes'],
    `${API_ENDPOINTS.CLASSES}?limit=100`
  );
  
  const classes = (classesResponse as any)?.data?.classes || [];
  
  const [formData, setFormData] = useState<AddStudentForm>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bloodGroup: '',
    rollNumber: '',
    admissionDate: '',
    classId: '',
    parentId: ''
  });

  const createStudentMutation = useApiMutation(
    async (data: AddStudentForm) => {
      const response = await fetch(`${API_ENDPOINTS.USERS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          email: data.email,
          role: 'STUDENT',
          profile: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            bloodGroup: data.bloodGroup
          },
          student: {
            rollNumber: data.rollNumber,
            admissionDate: data.admissionDate,
            classId: data.classId,
            parentId: data.parentId || null
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create student');
      }
      
      return response.json();
    },
    {
      onSuccess: () => {
        navigate('/users/students');
      },
      onError: (error: any) => {
        console.error('Error creating student:', error);
        setErrors({ submit: error.message || 'Failed to create student' });
      }
    }
  );

  const handleInputChange = (field: keyof AddStudentForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Listen for AI form fill events
  useEffect(() => {
    const handleAIFormFill = (event: Event) => {
      const customEvent = event as CustomEvent<{ fieldName: string; value: any }>;
      const { fieldName, value } = customEvent.detail;
      
      console.log('🎯 Received AI form fill event:', fieldName, value);
      
      // Update form data
      if (fieldName in formData) {
        setFormData(prev => ({
          ...prev,
          [fieldName]: value
        }));
        
        // Clear any errors for this field
        if (errors[fieldName]) {
          setErrors(prev => ({ ...prev, [fieldName]: '' }));
        }
      }
    };

    window.addEventListener('ai-form-fill', handleAIFormFill);
    
    return () => {
      window.removeEventListener('ai-form-fill', handleAIFormFill);
    };
  }, [formData, errors]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.rollNumber.trim()) newErrors.rollNumber = 'Roll number is required';
    if (!formData.admissionDate) newErrors.admissionDate = 'Admission date is required';
    if (!formData.classId.trim()) newErrors.classId = 'Class is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Date validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.dateOfBirth = 'Date of birth must be in the past';
      }
    }

    if (formData.admissionDate) {
      const admissionDate = new Date(formData.admissionDate);
      const today = new Date();
      if (admissionDate > today) {
        newErrors.admissionDate = 'Admission date cannot be in the future';
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
      await createStudentMutation.mutateAsync(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/users/students')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Students</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
            <p className="text-gray-600">Create a new student account</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Enter first name"
                      error={errors.firstName}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Enter last name"
                      error={errors.lastName}
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      error={errors.email}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      error={errors.phone}
                    />
                  </div>
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      error={errors.dateOfBirth}
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value as 'Male' | 'Female' | 'Other')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Group
                    </label>
                    <select
                      id="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Enter full address"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <Input
                        id="city"
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <Input
                        id="state"
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                    <div>
                      <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">
                        PIN Code
                      </label>
                      <Input
                        id="pincode"
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        placeholder="Enter PIN code"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Academic Information */}
          <div>
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Academic Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Roll Number *
                    </label>
                    <Input
                      id="rollNumber"
                      type="text"
                      value={formData.rollNumber}
                      onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                      placeholder="Enter roll number"
                      error={errors.rollNumber}
                    />
                  </div>
                  <div>
                    <label htmlFor="admissionDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Admission Date *
                    </label>
                    <Input
                      id="admissionDate"
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                      error={errors.admissionDate}
                    />
                  </div>
                  <div>
                    <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-1">
                      Class *
                    </label>
                    <select
                      id="classId"
                      value={formData.classId}
                      onChange={(e) => handleInputChange('classId', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.classId ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={classesLoading}
                    >
                      <option value="">Select a class</option>
                      {classes?.map((classItem: any) => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name} - Section {classItem.section}
                        </option>
                      ))}
                    </select>
                    {errors.classId && (
                      <p className="text-xs text-red-500 mt-1">{errors.classId}</p>
                    )}
                    {classesLoading && (
                      <p className="text-xs text-gray-500 mt-1">Loading classes...</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-1">
                      Parent ID (Optional)
                    </label>
                    <Input
                      id="parentId"
                      type="text"
                      value={formData.parentId}
                      onChange={(e) => handleInputChange('parentId', e.target.value)}
                      placeholder="Enter parent ID"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty if parent is not registered
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  {errors.submit && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{isSubmitting ? 'Creating Student...' : 'Create Student'}</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddStudentPage;
