import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, BookOpen, GraduationCap, DollarSign } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../config/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface TeacherDetail {
  id: string;
  employeeId: string;
  joiningDate: string;
  qualification: string;
  experience: number;
  salary: string;
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
  subjects: Array<{
    id: string;
    name: string;
  }>;
  classes: Array<{
    id: string;
    name: string;
    section: string;
  }>;
}

const TeacherDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: teacherData, isLoading, error } = useApiQuery<{ success: boolean; data: TeacherDetail }>(
    ['teacher', id || ''],
    `${API_ENDPOINTS.TEACHERS}/${id}`,
    {},
    { enabled: !!id }
  );

  const teacher = (teacherData as { success: boolean; data: TeacherDetail })?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading teacher details...</div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Failed to load teacher details</div>
          <Button onClick={() => navigate('/users/teachers')}>Back to Teachers</Button>
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
            onClick={() => navigate('/users/teachers')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Teachers</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {teacher.user.profile.firstName} {teacher.user.profile.lastName}
            </h1>
            <p className="text-gray-600">Teacher Details</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/users/teachers/${id}/edit`)}
          >
            Edit Teacher
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
                  <p className="mt-1 text-sm text-gray-900">{teacher.user.profile.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <p className="mt-1 text-sm text-gray-900">{teacher.user.profile.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {teacher.user.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {teacher.user.profile.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {teacher.user.profile.dateOfBirth ? new Date(teacher.user.profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="mt-1 text-sm text-gray-900">{teacher.user.profile.gender || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <p className="mt-1 text-sm text-gray-900">{teacher.user.profile.bloodGroup || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    teacher.user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {teacher.user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {teacher.user.profile.address && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                    <span>
                      {teacher.user.profile.address}
                      {teacher.user.profile.city && `, ${teacher.user.profile.city}`}
                      {teacher.user.profile.state && `, ${teacher.user.profile.state}`}
                      {teacher.user.profile.pincode && ` - ${teacher.user.profile.pincode}`}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Professional Information */}
        <div>
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Professional Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                  <p className="mt-1 text-sm text-gray-900">{teacher.employeeId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Joining Date</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(teacher.joiningDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Qualification</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    {teacher.qualification}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience</label>
                  <p className="mt-1 text-sm text-gray-900">{teacher.experience} years</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Salary</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ₹{parseInt(teacher.salary).toLocaleString()}
                  </p>
                </div>
                {teacher.subjects && teacher.subjects.length > 0 ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subjects</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {teacher.subjects.map((subject, index) => (
                        <span
                          key={subject.id}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          {subject.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subjects</label>
                    <p className="text-gray-500 text-sm mt-1">No subjects assigned</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetailPage;
