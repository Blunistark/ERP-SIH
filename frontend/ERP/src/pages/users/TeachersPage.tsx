import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Search, Plus, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../config/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import Input from '../../components/ui/Input';

interface Teacher {
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
  teacher: {
    employeeId: string;
    joiningDate: string;
    qualification: string;
    experience: number;
    salary: number;
  };
}

interface TeachersResponse {
  success: boolean;
  data: {
    users: Teacher[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const TeachersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);

  const { data: teachersData, isLoading, error } = useApiQuery<TeachersResponse>(
    ['teachers', page.toString(), searchTerm, isActiveFilter?.toString() || ''],
    `${API_ENDPOINTS.TEACHERS}?page=${page}&limit=10${searchTerm ? `&search=${searchTerm}` : ''}${isActiveFilter !== undefined ? `&isActive=${isActiveFilter}` : ''}`
  );

  // Map backend data structure to frontend expected structure
  const teachers: Teacher[] = Array.isArray((teachersData as any)?.data) 
    ? (teachersData as any).data.map((t: any) => ({
        id: t.id,
        email: t.user?.email || '',
        isActive: t.user?.isActive || false,
        profile: {
          firstName: t.user?.profile?.firstName || '',
          lastName: t.user?.profile?.lastName || '',
          phone: t.user?.profile?.phone,
          dateOfBirth: t.user?.profile?.dateOfBirth,
          gender: t.user?.profile?.gender,
          city: t.user?.profile?.city,
          state: t.user?.profile?.state,
        },
        teacher: {
          employeeId: t.employeeId || '',
          joiningDate: t.joiningDate || '',
          qualification: t.qualification || '',
          experience: t.experience || 0,
          salary: t.salary || 0,
        },
      }))
    : [];
  const pagination = (teachersData as any)?.pagination;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-600">Manage teacher accounts and information</p>
        </div>
        <Button icon={Plus}>
          Add Teacher
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search teachers by name or email..."
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

      {/* Teachers Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading teachers...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading teachers</div>
          </div>
        ) : teachers.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">No teachers found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qualification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teachers.map((teacher: Teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {teacher.profile.firstName} {teacher.profile.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{teacher.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.teacher.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{teacher.profile.phone || 'N/A'}</div>
                      <div className="text-sm text-gray-500">
                        {teacher.profile.city}, {teacher.profile.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.teacher.qualification}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.teacher.experience} years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          teacher.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {teacher.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Eye}
                          onClick={() => navigate(`/users/teachers/${teacher.id}`)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Edit}
                          onClick={() => navigate(`/users/teachers/${teacher.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Trash2} 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this teacher?')) {
                              // TODO: Implement delete functionality
                              console.log('Delete teacher:', teacher.id);
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

export default TeachersPage;
