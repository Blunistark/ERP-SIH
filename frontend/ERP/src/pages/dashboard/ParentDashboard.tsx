import React from 'react';
import { Users, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import AnalyticsChart from '../../components/charts/AnalyticsChart';

const ParentDashboard: React.FC = () => {
  const children = [
    { name: 'Alex Johnson', class: '10-A', gpa: 3.8, attendance: 94 },
    { name: 'Emma Johnson', class: '8-B', gpa: 3.9, attendance: 96 },
  ];

  const performanceData = [
    { name: 'Jan', Alex: 85, Emma: 88 },
    { name: 'Feb', Alex: 88, Emma: 90 },
    { name: 'Mar', Alex: 82, Emma: 87 },
    { name: 'Apr', Alex: 90, Emma: 92 },
  ];

  const upcomingEvents = [
    { event: 'Parent-Teacher Conference', date: '2024-01-20', child: 'Alex Johnson' },
    { event: 'Science Fair Presentation', date: '2024-01-25', child: 'Emma Johnson' },
    { event: 'Math Competition', date: '2024-01-30', child: 'Alex Johnson' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
        <p className="text-gray-600">Monitor your children's academic progress</p>
      </div>

      {/* Children Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((child, index) => (
          <Card key={index} hover>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
                <p className="text-sm text-gray-600">Class {child.class}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-gray-900">{child.gpa}</p>
                <p className="text-sm text-gray-600">GPA</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{child.attendance}%</p>
                <p className="text-sm text-gray-600">Attendance</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Performance Chart */}
      <AnalyticsChart
        title="Children's Performance Comparison"
        data={performanceData}
        type="line"
        height={300}
      />

      {/* Upcoming Events and Recent Communications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.event}</p>
                  <p className="text-xs text-gray-500">{event.child} • {event.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Communications</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Attendance Alert</p>
                <p className="text-xs text-gray-600">Alex has missed 2 classes this week</p>
                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Grade Update</p>
                <p className="text-xs text-gray-600">Emma received an A on her Science project</p>
                <p className="text-xs text-gray-500 mt-1">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Event Reminder</p>
                <p className="text-xs text-gray-600">Parent-Teacher Conference scheduled for next week</p>
                <p className="text-xs text-gray-500 mt-1">2 days ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Status */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">{child.name}</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tuition Fee (Jan 2024)</span>
                  <span className="text-green-600 font-medium">Paid</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Library Fee</span>
                  <span className="text-green-600 font-medium">Paid</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Activity Fee</span>
                  <span className="text-yellow-600 font-medium">Pending</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ParentDashboard;