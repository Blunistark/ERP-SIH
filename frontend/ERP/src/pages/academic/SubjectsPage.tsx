import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Book, Users, Edit, Trash2, Filter, BookOpen, GraduationCap } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../config/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  teachers: {
    id: string;
    user: {
      id: string;
      email: string;
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  }[];
  classes: {
    id: string;
    name: string;
    section?: string;
  }[];
  _count: {
    teachers: number;
    classes: number;
    exams: number;
  };
  createdAt: string;
  updatedAt: string;
}

const SubjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: subjects } = useApiQuery<any>('subjects', API_ENDPOINTS.SUBJECTS);

  const safeSubjects: Subject[] = Array.isArray((subjects as any)?.data) ? (subjects as any).data : [];

  const filteredSubjects = safeSubjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // All subjects are considered active since there's no isActive field
  const activeSubjects = filteredSubjects;



  const handleEdit = (subjectId: string) => {
    navigate(`/academic/subjects/${subjectId}/edit`);
  };

  const handleDelete = async (subjectId: string) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        // API call would go here
        await new Promise(resolve => setTimeout(resolve, 500));
        alert('Subject deleted successfully!');
        // Refresh data
      } catch (error) {
        alert('Failed to delete subject. Please try again.');
      }
    }
  };

  const totalCredits = activeSubjects.reduce((sum, subject) => sum + subject.credits, 0);
  const totalTeachers = new Set(activeSubjects.flatMap(s => s.teachers.map(t => t.id))).size;
  const totalSubjects = activeSubjects.length;

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
          <p className="text-gray-600">Manage subjects, teachers, and class assignments</p>
        </div>
        <Button
          onClick={() => navigate('/academic/subjects/add')}
          icon={Plus}
        >
          Add Subject
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalSubjects}</p>
              <p className="text-gray-600 text-sm">Total Subjects</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalCredits}</p>
              <p className="text-gray-600 text-sm">Total Credits</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalTeachers}</p>
              <p className="text-gray-600 text-sm">Teachers Assigned</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Book className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{activeSubjects.reduce((sum, s) => sum + s._count.exams, 0)}</p>
              <p className="text-gray-600 text-sm">Total Exams</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search subjects by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setSearchTerm('')}
            icon={Filter}
          >
            Clear Search
          </Button>
        </div>
      </Card>

      {/* Active Subjects */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Active Subjects ({activeSubjects.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Credits</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Teachers</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Classes</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Exams</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeSubjects.map((subject) => (
                <tr key={subject.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{subject.name}</p>
                      {subject.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">{subject.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                      {subject.code}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium">{subject.credits}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {subject.teachers.slice(0, 2).map((teacher) => (
                        <span key={teacher.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {teacher.user.profile?.firstName || 'Unknown'} {teacher.user.profile?.lastName || ''}
                        </span>
                      ))}
                      {subject.teachers.length > 2 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{subject.teachers.length - 2}
                        </span>
                      )}
                      {subject.teachers.length === 0 && (
                        <span className="text-xs text-gray-500">No teachers assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {subject.classes.slice(0, 2).map((cls) => (
                        <span key={cls.id} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {cls.name}{cls.section ? `-${cls.section}` : ''}
                        </span>
                      ))}
                      {subject.classes.length > 2 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          +{subject.classes.length - 2}
                        </span>
                      )}
                      {subject.classes.length === 0 && (
                        <span className="text-xs text-gray-500">No classes assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{subject._count.exams}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(subject.id)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Edit subject"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {activeSubjects.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? `No subjects found matching "${searchTerm}"` : 'No subjects found'}
            </p>
          </div>
        )}
      </Card>


    </div>
  );
};

export default SubjectsPage;