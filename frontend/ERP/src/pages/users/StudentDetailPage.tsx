import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, BookOpen, GraduationCap } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../config/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface StudentDetail {
  id: string;
  rollNumber: string;
  admissionDate: string;
  classId: string;
  class: {
    name: string;
    section: string;
  };
  user: {
    id: string;
    email: string;
    isActive: boolean;
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
      dateOfBirth?: string;
      gender?: 'Male' | 'Female' | 'Other';
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
      bloodGroup?: string;
    };
  };
  parent?: {
    user: {
      profile: {
        firstName: string;
        lastName: string;
        phone?: string;
      };
    };
  };
}

const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: studentData, isLoading, error } = useApiQuery<{ success: boolean; data: StudentDetail }>(
    ['student', id || ''],
    `${API_ENDPOINTS.STUDENTS}/${id}`,
    {},
    { enabled: !!id }
  );

  const student = (studentData as { success: boolean; data: StudentDetail })?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading student details...</div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Failed to load student details</div>
          <Button onClick={() => navigate('/users/students')}>Back to Students</Button>
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
            onClick={() => navigate('/users/students')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Students</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {student.user.profile.firstName} {student.user.profile.lastName}
            </h1>
            <p className="text-gray-600">Student Details</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/users/students/${id}/edit`)}
          >
            Edit Student
          </Button>
        </div>
      </div>

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
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <p className="mt-1 text-sm text-gray-900">{student.user.profile.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <p className="mt-1 text-sm text-gray-900">{student.user.profile.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {student.user.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {student.user.profile.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {student.user.profile.dateOfBirth ? new Date(student.user.profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="mt-1 text-sm text-gray-900">{student.user.profile.gender || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <p className="mt-1 text-sm text-gray-900">{student.user.profile.bloodGroup || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    student.user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {student.user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {student.user.profile.address && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                    <span>
                      {student.user.profile.address}
                      {student.user.profile.city && `, ${student.user.profile.city}`}
                      {student.user.profile.state && `, ${student.user.profile.state}`}
                      {student.user.profile.pincode && ` - ${student.user.profile.pincode}`}
                    </span>
                  </p>
                </div>
              )}
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
                  <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                  <p className="mt-1 text-sm text-gray-900">{student.rollNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Class</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {student.class.name} - {student.class.section}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Admission Date</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(student.admissionDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;
