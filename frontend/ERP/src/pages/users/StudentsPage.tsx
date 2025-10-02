import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Search, Plus, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../config/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import Input from '../../components/ui/Input';

interface Student {
  id: string;
  email: string;
  isActive: boolean;
  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: 'Male' | 'Female' | 'Other';
    city?: string;
    state?: string;
  };
  student: {
    rollNumber: string;
    admissionDate: string;
    classId: string;
  };
}

interface StudentsResponse {
  success: boolean;
  data: {
    users: Student[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const StudentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);

  const { data: studentsData, isLoading, error } = useApiQuery<StudentsResponse>(
    ['students', page.toString(), searchTerm, isActiveFilter?.toString() || ''],
    `${API_ENDPOINTS.STUDENTS}?page=${page}&limit=10${searchTerm ? `&search=${searchTerm}` : ''}${isActiveFilter !== undefined ? `&isActive=${isActiveFilter}` : ''}`
  );

  // Map backend data structure to frontend expected structure
  const students: Student[] = Array.isArray((studentsData as any)?.data) 
    ? (studentsData as any).data.map((s: any) => ({
        id: s.id,
        email: s.user?.email || '',
        isActive: s.user?.isActive || false,
        profile: {
          firstName: s.user?.profile?.firstName || '',
          lastName: s.user?.profile?.lastName || '',
          phone: s.user?.profile?.phone,
          dateOfBirth: s.user?.profile?.dateOfBirth,
          gender: s.user?.profile?.gender,
          city: s.user?.profile?.city,
          state: s.user?.profile?.state,
        },
        student: {
          rollNumber: s.rollNumber || '',
          admissionDate: s.admissionDate || '',
          classId: s.classId || '',
        },
      }))
    : [];
  const pagination = (studentsData as any)?.pagination;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage student accounts and information</p>
        </div>
        <Button 
          icon={Plus}
          onClick={() => navigate('/users/students/add')}
        >
          Add Student
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
              iconPosition="left"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={isActiveFilter === true ? "primary" : "secondary"}
              size="sm"
              onClick={() => setIsActiveFilter(isActiveFilter === true ? undefined : true)}
            >
              Active
            </Button>
            <Button
              variant={isActiveFilter === false ? "primary" : "secondary"}
              size="sm"
              onClick={() => setIsActiveFilter(isActiveFilter === false ? undefined : false)}
            >
              Inactive
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={Filter}
              onClick={() => {
                setIsActiveFilter(undefined);
                setSearchTerm('');
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Students Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading students...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading students</div>
          </div>
        ) : students.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">No students found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.profile.firstName} {student.profile.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.student.rollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{student.profile.phone || 'N/A'}</div>
                      <div className="text-sm text-gray-500">
                        {student.profile.city}, {student.profile.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(student.student.admissionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Eye}
                          onClick={() => navigate(`/users/students/${student.id}`)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Edit}
                          onClick={() => navigate(`/users/students/${student.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Trash2} 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this student?')) {
                              // TODO: Implement delete functionality
                              console.log('Delete student:', student.id);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === pagination.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <Pagination
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StudentsPage;
