import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Search, Plus, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../config/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import Input from '../../components/ui/Input';

interface Parent {
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
}

interface ParentsResponse {
  success: boolean;
  data: {
    users: Parent[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const ParentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);

  const { data: parentsData, isLoading, error } = useApiQuery<ParentsResponse>(
    ['parents', page.toString(), searchTerm, isActiveFilter?.toString() || ''],
    `${API_ENDPOINTS.USERS}?role=PARENT&page=${page}&limit=10${searchTerm ? `&search=${searchTerm}` : ''}${isActiveFilter !== undefined ? `&isActive=${isActiveFilter}` : ''}`
  );

  const parents: Parent[] = (parentsData as ParentsResponse)?.data?.users || [];
  const pagination = (parentsData as ParentsResponse)?.data?.pagination;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parents</h1>
          <p className="text-gray-600">Manage parent accounts and information</p>
        </div>
        <Button icon={Plus}>
          Add Parent
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search parents by name or email..."
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

      {/* Parents Table */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading parents...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">Error loading parents</div>
          </div>
        ) : parents.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">No parents found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
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
                {parents.map((parent: Parent) => (
                  <tr key={parent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {parent.profile.firstName} {parent.profile.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{parent.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{parent.profile.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {parent.profile.city || 'N/A'}, {parent.profile.state || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          parent.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {parent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Eye}
                          onClick={() => navigate(`/users/parents/${parent.id}`)}
                        >
                          View
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Edit}
                          onClick={() => navigate(`/users/parents/${parent.id}/edit`)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Trash2} 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this parent?')) {
                              // TODO: Implement delete functionality
                              console.log('Delete parent:', parent.id);
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
        {pagination && pagination.pages > 1 && (
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
                disabled={page === pagination.pages}
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
                  totalPages={pagination.pages}
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

export default ParentsPage;
