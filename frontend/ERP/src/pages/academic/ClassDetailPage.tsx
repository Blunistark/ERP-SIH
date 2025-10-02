import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApiQuery } from '../../hooks/useApi';
import { ArrowLeft, Users, BookOpen, Calendar, Edit, Trash2, UserPlus } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

interface Student {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  student: {
    rollNumber: string;
    admissionDate: string;
  };
}

interface Teacher {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  teacher: {
    employeeId: string;
    department: string;
  };
}

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
}

interface AcademicYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface ClassDetail {
  id: string;
  name: string;
  section: string;
  capacity: number;
  academicYear: AcademicYear;
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  createdAt: string;
  updatedAt: string;
}

interface ClassDetailResponse {
  success: boolean;
  data: ClassDetail;
}

const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: classData, isLoading, error } = useApiQuery<ClassDetailResponse>(
    ['class', id || ''],
    `/classes/${id}`
  );

  const classDetail = (classData as ClassDetailResponse)?.data;

  const handleEdit = () => {
    navigate(`/academic/classes/${id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      // TODO: Implement delete functionality
      console.log('Delete class:', id);
    }
  };

  const handleAddStudent = () => {
    navigate(`/academic/classes/${id}/add-student`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading class details...</div>
      </div>
    );
  }

  if (error || !classDetail) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading class details</div>
          <Button onClick={() => navigate('/academic/classes')}>
            Back to Classes
          </Button>
        </div>
      </div>
    );
  }

  const enrollmentPercentage = Math.round(((classDetail.students?.length || 0) / classDetail.capacity) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/academic/classes')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Classes</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {classDetail.name} - {classDetail.section}
            </h1>
            <p className="text-gray-600">{classDetail.academicYear.year}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            icon={UserPlus}
            onClick={handleAddStudent}
          >
            Add Student
          </Button>
          <Button
            variant="secondary"
            icon={Edit}
            onClick={handleEdit}
          >
            Edit Class
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {classDetail.students?.length || 0}/{classDetail.capacity}
                </p>
                <p className="text-sm text-gray-500">{enrollmentPercentage}% capacity</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{classDetail.teachers?.length || 0}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Subjects</p>
                <p className="text-2xl font-bold text-gray-900">{classDetail.subjects?.length || 0}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Academic Year</p>
                <p className="text-lg font-bold text-gray-900">{classDetail.academicYear.year}</p>
                <p className="text-sm text-gray-500">
                  {classDetail.academicYear.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Students Section */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Students ({classDetail.students?.length || 0})
            </h2>
            <Button
              size="sm"
              icon={UserPlus}
              onClick={handleAddStudent}
            >
              Add Student
            </Button>
          </div>

          {(!classDetail.students || classDetail.students.length === 0) ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No students enrolled</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding students to this class.</p>
              <div className="mt-6">
                <Button onClick={handleAddStudent}>Add Student</Button>
              </div>
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
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admission Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classDetail.students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.user?.firstName || ''} {student.user?.lastName || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.student?.rollNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.user?.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.user?.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.student?.admissionDate ? new Date(student.student.admissionDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Teachers Section */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Teachers ({classDetail.teachers?.length || 0})
          </h2>

          {(!classDetail.teachers || classDetail.teachers.length === 0) ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No teachers assigned</h3>
              <p className="mt-1 text-sm text-gray-500">Assign teachers to this class.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classDetail.teachers.map((teacher) => (
                <div key={teacher.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-900">
                    {teacher.user?.firstName || ''} {teacher.user?.lastName || ''}
                  </div>
                  <div className="text-sm text-gray-600">{teacher.teacher?.department || '-'}</div>
                  <div className="text-sm text-gray-600">{teacher.user?.email || '-'}</div>
                  {teacher.user?.phone && (
                    <div className="text-sm text-gray-600">{teacher.user.phone}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Subjects Section */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Subjects ({classDetail.subjects?.length || 0})
          </h2>

          {(!classDetail.subjects || classDetail.subjects.length === 0) ? (
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No subjects assigned</h3>
              <p className="mt-1 text-sm text-gray-500">Add subjects to this class curriculum.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classDetail.subjects.map((subject) => (
                <div key={subject.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-900">{subject.name}</div>
                  <div className="text-sm text-gray-600">Code: {subject.code}</div>
                  <div className="text-sm text-gray-600">Credits: {subject.credits}</div>
                  {subject.description && (
                    <div className="text-sm text-gray-500 mt-2">{subject.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ClassDetailPage;
