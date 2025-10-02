import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Plus, Eye, Edit, Trash2, BookOpen, Clock, Users } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface Exam {
  id: string;
  name: string;
  type: 'UNIT_TEST' | 'MIDTERM' | 'FINAL' | 'ASSIGNMENT' | 'PROJECT';
  subject: {
    id: string;
    name: string;
    code: string;
  };
  term: {
    id: string;
    name: string;
  };
  date: string;
  duration: number; // in minutes
  totalMarks: number;
  passingMarks: number;
  studentsEnrolled: number;
  resultsPublished: boolean;
}

interface ExamStats {
  totalExams: number;
  upcomingExams: number;
  completedExams: number;
  pendingResults: number;
}

const ExaminationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const { data: stats } = useApiQuery<ExamStats>('exam-stats', '/exams/stats');

  const { data: exams } = useApiQuery<Exam[]>('exams', '/exams');

  const safeStats: ExamStats = (stats && typeof stats === 'object' && 'totalExams' in stats) ? stats as ExamStats : {
    totalExams: 0,
    upcomingExams: 0,
    completedExams: 0,
    pendingResults: 0,
  };
  const safeExams: Exam[] = Array.isArray(exams) ? exams : [];

  const filteredExams = safeExams.filter(exam => {
    const matchesSearch = exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exam.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exam.subject.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'ALL' || exam.type === filterType;
    
    const examDate = new Date(exam.date);
    const today = new Date();
    const isUpcoming = examDate > today;
    const isCompleted = examDate <= today;
    
    let matchesStatus = true;
    if (filterStatus === 'UPCOMING') matchesStatus = isUpcoming;
    else if (filterStatus === 'COMPLETED') matchesStatus = isCompleted;
    else if (filterStatus === 'PENDING_RESULTS') matchesStatus = isCompleted && !exam.resultsPublished;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const statCards = [
    {
      title: 'Total Exams',
      value: safeStats.totalExams.toString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Upcoming Exams',
      value: safeStats.upcomingExams.toString(),
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Completed Exams',
      value: safeStats.completedExams.toString(),
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Pending Results',
      value: safeStats.pendingResults.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  const getExamTypeColor = (type: string) => {
    switch (type) {
      case 'UNIT_TEST': return 'bg-blue-100 text-blue-800';
      case 'MIDTERM': return 'bg-purple-100 text-purple-800';
      case 'FINAL': return 'bg-red-100 text-red-800';
      case 'ASSIGNMENT': return 'bg-green-100 text-green-800';
      case 'PROJECT': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (exam: Exam) => {
    const examDate = new Date(exam.date);
    const today = new Date();
    
    if (examDate > today) {
      return 'bg-green-100 text-green-800';
    } else if (exam.resultsPublished) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (exam: Exam) => {
    const examDate = new Date(exam.date);
    const today = new Date();
    
    if (examDate > today) {
      return 'Upcoming';
    } else if (exam.resultsPublished) {
      return 'Results Published';
    } else {
      return 'Pending Results';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return 'No time limit';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
    }
    return `${mins}m`;
  };

  const handleDeleteExam = (examId: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      // API call would go here
      alert('Exam deleted successfully');
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Examinations</h1>
          <p className="text-gray-600">Manage exams, schedules, and results</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => navigate('/examinations/results')}
            variant="outline"
            icon={FileText}
          >
            Manage Results
          </Button>
          <Button
            onClick={() => navigate('/examinations/create')}
            icon={Plus}
          >
            Schedule Exam
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} hover>
            <div className="flex items-center">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Input
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filter by exam type"
            >
              <option value="ALL">All Types</option>
              <option value="UNIT_TEST">Unit Tests</option>
              <option value="MIDTERM">Midterm</option>
              <option value="FINAL">Final</option>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="PROJECT">Project</option>
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filter by exam status"
            >
              <option value="ALL">All Status</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING_RESULTS">Pending Results</option>
            </select>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => navigate('/examinations/calendar')}
              icon={Calendar}
            >
              Calendar View
            </Button>
          </div>
        </div>
      </Card>

      {/* Exams List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Examinations ({filteredExams.length})
          </h3>
        </div>

        <div className="space-y-4">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{exam.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getExamTypeColor(exam.type)}`}>
                      {exam.type.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(exam)}`}>
                      {getStatusText(exam)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Subject:</span> {exam.subject.name}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {new Date(exam.date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {formatDuration(exam.duration)}
                    </div>
                    <div>
                      <span className="font-medium">Students:</span> {exam.studentsEnrolled}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600 mt-2">
                    <div>
                      <span className="font-medium">Total Marks:</span> {exam.totalMarks}
                    </div>
                    <div>
                      <span className="font-medium">Passing Marks:</span> {exam.passingMarks}
                    </div>
                    <div>
                      <span className="font-medium">Term:</span> {exam.term.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/examinations/${exam.id}`)}
                    icon={Eye}
                    title="View details"
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/examinations/${exam.id}/edit`)}
                    icon={Edit}
                    title="Edit exam"
                  >
                    Edit
                  </Button>
                  {!exam.resultsPublished && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/examinations/${exam.id}/results`)}
                      icon={FileText}
                      title="Enter results"
                    >
                      Results
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExam(exam.id)}
                    icon={Trash2}
                    title="Delete exam"
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredExams.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No exams found matching your criteria</p>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/examinations/create')}
              icon={Plus}
            >
              Schedule New Exam
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/examinations/results')}
              icon={FileText}
            >
              Enter Exam Results
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/examinations/reports')}
              icon={BookOpen}
            >
              Generate Reports
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/examinations/calendar')}
              icon={Calendar}
            >
              View Exam Calendar
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Exams</h3>
          <div className="space-y-3">
            {safeExams
              .filter(exam => new Date(exam.date) > new Date())
              .slice(0, 4)
              .map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{exam.name}</p>
                    <p className="text-xs text-gray-500">{exam.subject.name} • {new Date(exam.date).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getExamTypeColor(exam.type)}`}>
                    {exam.type.replace('_', ' ')}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ExaminationsPage;