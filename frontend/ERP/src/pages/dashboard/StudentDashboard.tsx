import React from 'react';
import { BookOpen, Calendar, TrendingUp, Clock, Award } from 'lucide-react';
import Card from '../../components/ui/Card';
import AnalyticsChart from '../../components/charts/AnalyticsChart';
import AIChat from '../../components/ai/AIChat';

const StudentDashboard: React.FC = () => {
  const upcomingClasses = [
    { subject: 'Mathematics', teacher: 'Mr. Smith', time: '09:00 AM', room: 'Room 101' },
    { subject: 'Physics', teacher: 'Ms. Johnson', time: '11:00 AM', room: 'Lab 1' },
    { subject: 'Chemistry', teacher: 'Dr. Brown', time: '02:00 PM', room: 'Lab 2' },
  ];

  const gradeProgress = [
    { name: 'Math', value: 85 },
    { name: 'Physics', value: 78 },
    { name: 'Chemistry', value: 92 },
    { name: 'English', value: 88 },
    { name: 'History', value: 76 },
  ];

  const upcomingAssignments = [
    { subject: 'Mathematics', title: 'Calculus Problem Set', dueDate: '2024-01-15', status: 'pending' },
    { subject: 'Physics', title: 'Lab Report - Motion', dueDate: '2024-01-17', status: 'in-progress' },
    { subject: 'English', title: 'Essay on Shakespeare', dueDate: '2024-01-20', status: 'not-started' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Track your academic progress and stay organized</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">3.8</p>
              <p className="text-gray-600 text-sm">GPA</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">94%</p>
              <p className="text-gray-600 text-sm">Attendance</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-gray-600 text-sm">Assignments Due</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-gray-600 text-sm">Today's Classes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Classes</h3>
          <div className="space-y-4">
            {upcomingClasses.map((classItem, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{classItem.subject}</p>
                  <p className="text-sm text-gray-600">{classItem.teacher} • {classItem.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">{classItem.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Assignments */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Assignments</h3>
          <div className="space-y-3">
            {upcomingAssignments.map((assignment, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  assignment.status === 'pending' ? 'bg-red-500' :
                  assignment.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{assignment.title}</p>
                  <p className="text-xs text-gray-500">{assignment.subject} • Due: {assignment.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Grade Progress and AI Study Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Subject Performance"
          data={gradeProgress}
          type="bar"
          height={300}
        />

        <AIChat />
      </div>

      {/* Recent Grades */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Grades</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Mathematics</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Quiz 3</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    A-
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-01-10</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Physics</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Lab Report 2</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    B+
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-01-08</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Chemistry</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Midterm Exam</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    A
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-01-05</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StudentDashboard;