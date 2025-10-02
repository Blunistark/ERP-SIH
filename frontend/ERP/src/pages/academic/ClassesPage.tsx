import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiQuery } from '../../hooks/useApi';
import { Search, Plus, Filter, Edit, Trash2, Eye, BookOpen } from 'lucide-react';
import Button from '../../components/ui/Button';
import { clsx } from 'clsx';

interface AcademicYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Class {
  id: string;
  name: string;
  section: string;
  capacity: number;
  academicYear: AcademicYear;
  students: Array<{
    id: string;
    userId: string;
    rollNumber: string;
    user: {
      id: string;
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
  teachers: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
  subjects?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  _count: {
    students: number;
    teachers: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ClassesResponse {
  success: boolean;
  data: {
    classes: Class[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const ClassesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');

  const { data: classesData, isLoading, error } = useApiQuery<ClassesResponse>(
    ['classes', page.toString(), searchTerm, selectedAcademicYear],
    `/classes?page=${page}&limit=10&search=${searchTerm}${selectedAcademicYear ? `&academicYearId=${selectedAcademicYear}` : ''}`
  );

  const classes: Class[] = (classesData as ClassesResponse)?.data?.classes || [];
  const pagination = (classesData as ClassesResponse)?.data?.pagination;

  const queryClient = useQueryClient();
  
  const deleteClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      const response = await fetch(`http://localhost:3000/api/classes/${classId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete class');
      }

      return response.json();
    },
    onSuccess: () => {
      // Refresh the classes list
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
    onError: (error: any) => {
      alert('Failed to delete class: ' + (error.message || 'Unknown error'));
    },
  });

  const handleView = (classId: string) => {
    navigate(`/academic/classes/${classId}`);
  };

  const handleEdit = (classId: string) => {
    navigate(`/academic/classes/${classId}/edit`);
  };

  const handleDelete = (classId: string, className: string, section: string) => {
    if (window.confirm(`Are you sure you want to delete ${className} - ${section}? This action cannot be undone.`)) {
      deleteClassMutation.mutate(classId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600">Manage class sections and academic structure</p>
        </div>
        <Button 
          icon={Plus}
          onClick={() => navigate('/academic/classes/add')}
        >
          Add Class
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search classes by name or section..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            title="Filter by Academic Year"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Academic Years</option>
            {/* TODO: Fetch and populate academic years */}
          </select>
          <Button variant="secondary" icon={Filter}>
            Filter
          </Button>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading classes...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-500">Error loading classes</div>
          </div>
        ) : classes.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No classes found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new class.</p>
              <div className="mt-6">
                <Button onClick={() => navigate('/academic/classes/add')}>
                  Add Class
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Grid View */}
            <div className="hidden md:block">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                {classes.map((classItem) => (
                  <div key={classItem.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {classItem.name} - {classItem.section}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {classItem.academicYear.year}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(classItem.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(classItem.id)}
                          className="text-amber-600 hover:text-amber-800"
                          title="Edit Class"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(classItem.id, classItem.name, classItem.section)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Class"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Capacity:</span>
                        <span className="text-sm font-medium">{classItem.capacity} students</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Enrolled:</span>
                        <span className="text-sm font-medium text-blue-600">
                          {classItem._count?.students || classItem.students?.length || 0} students
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Teachers:</span>
                        <span className="text-sm font-medium">
                          {classItem._count?.teachers || classItem.teachers?.length || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Subjects:</span>
                        <span className="text-sm font-medium">
                          {classItem.subjects?.length || 0}
                        </span>
                      </div>

                      {/* Enrollment Status */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Enrollment</span>
                          <span>{Math.round(((classItem._count?.students || classItem.students?.length || 0) / classItem.capacity) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={clsx(
                              "h-2 rounded-full transition-all",
                              ((classItem._count?.students || classItem.students?.length || 0) / classItem.capacity) > 0.8 
                                ? "bg-red-500 w-full" 
                                : ((classItem._count?.students || classItem.students?.length || 0) / classItem.capacity) > 0.6 
                                ? "bg-yellow-500" 
                                : "bg-green-500"
                            )}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile List View */}
            <div className="md:hidden">
              <div className="divide-y divide-gray-200">
                {classes.map((classItem) => (
                  <div key={classItem.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {classItem.name} - {classItem.section}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(classItem.id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Class Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(classItem.id)}
                          className="text-amber-600 hover:text-amber-800"
                          title="Edit Class"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(classItem.id, classItem.name, classItem.section)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Class"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{classItem.academicYear.year}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-600">Students: {classItem._count?.students || classItem.students?.length || 0}/{classItem.capacity}</span>
                      <span className="text-gray-600">Teachers: {classItem._count?.teachers || classItem.teachers?.length || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.pages} ({pagination.total} total classes)
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                    disabled={page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClassesPage;
