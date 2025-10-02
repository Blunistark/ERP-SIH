import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, Briefcase, Users } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../config/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface ParentDetail {
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
  parent: {
    occupation: string;
    income: string;
    students?: Array<{
      id: string;
      rollNumber: string;
      user: {
        profile: {
          firstName: string;
          lastName: string;
        };
      };
    }>;
  };
}

const ParentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: parentData, isLoading, error } = useApiQuery<{ success: boolean; data: ParentDetail }>(
    ['parent', id || ''],
    `${API_ENDPOINTS.USERS}/${id}`,
    {},
    { enabled: !!id }
  );

  const parent = (parentData as { success: boolean; data: ParentDetail })?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading parent details...</div>
      </div>
    );
  }

  if (error || !parent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg text-red-600 mb-4">Failed to load parent details</div>
          <Button onClick={() => navigate('/users/parents')}>Back to Parents</Button>
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
            onClick={() => navigate('/users/parents')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Parents</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {parent.profile.firstName} {parent.profile.lastName}
            </h1>
            <p className="text-gray-600">Parent Details</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={() => navigate(`/users/parents/${id}/edit`)}
          >
            Edit Parent
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
                  <p className="mt-1 text-sm text-gray-900">{parent.profile.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <p className="mt-1 text-sm text-gray-900">{parent.profile.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {parent.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {parent.profile.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {parent.profile.dateOfBirth ? new Date(parent.profile.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="mt-1 text-sm text-gray-900">{parent.profile.gender || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <p className="mt-1 text-sm text-gray-900">{parent.profile.bloodGroup || 'Not provided'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    parent.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {parent.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {parent.profile.address && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                    <span>
                      {parent.profile.address}
                      {parent.profile.city && `, ${parent.profile.city}`}
                      {parent.profile.state && `, ${parent.profile.state}`}
                      {parent.profile.pincode && ` - ${parent.profile.pincode}`}
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
                <Users className="h-5 w-5 mr-2" />
                Family Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Occupation</label>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    {parent.parent.occupation}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Annual Income</label>
                  <p className="mt-1 text-sm text-gray-900">
                    ₹{parseInt(parent.parent.income || '0').toLocaleString()}
                  </p>
                </div>
                {parent.parent.students && parent.parent.students.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Children</label>
                    <div className="mt-1 space-y-2">
                      {parent.parent.students.map((student) => (
                        <div key={student.id} className="flex items-center text-sm text-gray-900">
                          <User className="h-4 w-4 mr-2" />
                          {student.user.profile.firstName} {student.user.profile.lastName} ({student.rollNumber})
                        </div>
                      ))}
                    </div>
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

export default ParentDetailPage;
