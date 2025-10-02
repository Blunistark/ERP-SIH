import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../config/api';
import { Search, Plus, Filter, Edit, Trash2, Calendar, CheckCircle, XCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { clsx } from 'clsx';

interface AcademicYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    classes: number;
  };
}

interface AcademicYearsResponse {
  success: boolean;
  data: {
    academicYears: AcademicYear[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const AcademicYearsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  // Fetch academic years
  const { data: academicYearsData, isLoading, error } = useApiQuery<AcademicYearsResponse>(
    ['academic-years', page.toString(), searchTerm],
    `${API_ENDPOINTS.ACADEMIC_YEARS}?page=${page}&limit=10${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`
  );

  const academicYears: AcademicYear[] = (academicYearsData as any)?.data || [];
  const pagination = (academicYearsData as any)?.pagination;

  const deleteAcademicYearMutation = useMutation({
    mutationFn: async (yearId: string) => {
      const response = await fetch(`http://localhost:3000/api/academic-years/${yearId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete academic year');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    },
    onError: (error: any) => {
      alert('Failed to delete academic year: ' + (error.message || 'Unknown error'));
    },
  });

  const toggleActiveStatusMutation = useMutation({
    mutationFn: async ({ yearId, isActive }: { yearId: string; isActive: boolean }) => {
      const response = await fetch(`http://localhost:3000/api/academic-years/${yearId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update academic year status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-years'] });
    },
    onError: (error: any) => {
      alert('Failed to update academic year status: ' + (error.message || 'Unknown error'));
    },
  });

  const handleEdit = (yearId: string) => {
    navigate(`/academic/years/${yearId}/edit`);
  };

  const handleDelete = (yearId: string, yearName: string) => {
    if (window.confirm(`Are you sure you want to delete academic year "${yearName}"? This action cannot be undone.`)) {
      deleteAcademicYearMutation.mutate(yearId);
    }
  };

  const handleToggleStatus = (yearId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this academic year?`)) {
      toggleActiveStatusMutation.mutate({ yearId, isActive: !currentStatus });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading academic years...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading academic years</div>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Years</h1>
          <p className="text-gray-600">Manage academic years and sessions</p>
        </div>
        <Button 
          icon={Plus}
          onClick={() => navigate('/academic/years/add')}
        >
          Add Academic Year
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search academic years..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button variant="outline" icon={Filter}>
          Filter
        </Button>
      </div>

      {/* Academic Years List */}
      {academicYears.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No academic years found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new academic year.</p>
          <div className="mt-6">
            <Button onClick={() => navigate('/academic/years/add')}>
              Add Academic Year
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden md:block">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academic Year
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {academicYears.map((year) => (
                    <tr key={year.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{year.year}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={clsx(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          year.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        )}>
                          {year.isActive ? (
                            <>
                              <CheckCircle size={12} className="mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle size={12} className="mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {year._count?.classes || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(year.id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit Academic Year"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(year.id, year.isActive)}
                            className={year.isActive ? "text-orange-600 hover:text-orange-800" : "text-green-600 hover:text-green-800"}
                            title={year.isActive ? "Deactivate" : "Activate"}
                          >
                            {year.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(year.id, year.year)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Academic Year"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {academicYears.map((year) => (
              <div key={year.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{year.year}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(year.startDate).toLocaleDateString()} - {new Date(year.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(year.id)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Academic Year"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(year.id, year.isActive)}
                      className={year.isActive ? "text-orange-600 hover:text-orange-800" : "text-green-600 hover:text-green-800"}
                      title={year.isActive ? "Deactivate" : "Activate"}
                    >
                      {year.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(year.id, year.year)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Academic Year"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    year.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  )}>
                    {year.isActive ? (
                      <>
                        <CheckCircle size={12} className="mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle size={12} className="mr-1" />
                        Inactive
                      </>
                    )}
                  </span>
                  <span className="text-sm text-gray-600">
                    {year._count?.classes || 0} Classes
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
              <div className="flex items-center text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AcademicYearsPage;
