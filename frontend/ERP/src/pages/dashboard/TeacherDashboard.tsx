import React from 'react';
import { BookOpen, Users, ClipboardCheck, Calendar, Brain } from 'lucide-react';
import Card from '../../components/ui/Card';
import AnalyticsChart from '../../components/charts/AnalyticsChart';
import AIChat from '../../components/ai/AIChat';

const TeacherDashboard: React.FC = () => {
  const todaysClasses = [
    { subject: 'Mathematics', class: '10-A', time: '09:00 AM', room: 'Room 101' },
    { subject: 'Physics', class: '11-B', time: '11:00 AM', room: 'Lab 1' },
    { subject: 'Mathematics', class: '10-B', time: '02:00 PM', room: 'Room 101' },
  ];

  const studentPerformance = [
    { name: 'Week 1', value: 78 },
    { name: 'Week 2', value: 82 },
    { name: 'Week 3', value: 85 },
    { name: 'Week 4', value: 88 },
  ];

  const pendingTasks = [
    { task: 'Grade Math Quiz - Class 10A', priority: 'high', dueDate: 'Today' },
    { task: 'Prepare Physics Lab Report', priority: 'medium', dueDate: 'Tomorrow' },
    { task: 'Submit Attendance Report', priority: 'low', dueDate: 'This Week' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600">Manage your classes and track student progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover>
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">5</p>
              <p className="text-gray-600 text-sm">Active Classes</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-gray-600 text-sm">Total Students</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-gray-600 text-sm">Pending Grades</p>
            </div>
          </div>
        </Card>

        <Card hover>
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-gray-600 text-sm">Today's Classes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
          <div className="space-y-4">
            {todaysClasses.map((classItem, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{classItem.subject}</p>
                  <p className="text-sm text-gray-600">{classItem.class} • {classItem.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">{classItem.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Student Performance */}
        <AnalyticsChart
          title="Student Performance Trend"
          data={studentPerformance}
          type="line"
          height={300}
        />

        {/* Pending Tasks */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h3>
          <div className="space-y-3">
            {pendingTasks.map((task, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  task.priority === 'high' ? 'bg-red-500' :
                  task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{task.task}</p>
                  <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI Teaching Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIChat />
        
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Teaching Tools</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Lesson Planner</span>
            </button>
            <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ClipboardCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Quiz Generator</span>
            </button>
            <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Student Analytics</span>
            </button>
            <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Grade Predictor</span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;