import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, ClipboardCheck, FileText, Plus, Eye, BarChart3 } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  attendanceRate: number;
}

interface RecentAttendance {
  id: string;
  date: string;
  className: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
}

const AttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: stats } = useApiQuery<{success: boolean, data: AttendanceStats}>('attendance-stats', '/attendance/stats');

  const { data: recentAttendance } = useApiQuery<{success: boolean, data: RecentAttendance[]}>('recent-attendance', '/attendance/recent');

  const safeStats: AttendanceStats = (stats?.data && typeof stats.data === 'object' && 'totalStudents' in stats.data) ? stats.data as AttendanceStats : {
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    attendanceRate: 0,
  };
  const safeRecentAttendance: RecentAttendance[] = Array.isArray(recentAttendance?.data) ? recentAttendance.data : [];

  const statCards = [
    {
      title: 'Total Students',
      value: safeStats.totalStudents.toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Present Today',
      value: safeStats.presentToday.toString(),
      icon: ClipboardCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Absent Today',
      value: safeStats.absentToday.toString(),
      icon: Users,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Attendance Rate',
      value: `${safeStats.attendanceRate}%`,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  const getAttendanceRate = (present: number, total: number) => {
    return Math.round((present / total) * 100);
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Track and manage student attendance</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => navigate('/attendance/mark')}
            icon={Plus}
          >
            Mark Attendance
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/attendance/reports')}
            icon={FileText}
          >
            View Reports
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

      {/* Date Filter */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Attendance Overview</h3>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Recent Attendance Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class-wise Attendance */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Class Attendance</h3>
          <div className="space-y-4">
            {safeRecentAttendance.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{record.className}</h4>
                  <span className={`text-sm font-medium ${getStatusColor(getAttendanceRate(record.present, record.totalStudents))}`}>
                    {getAttendanceRate(record.present, record.totalStudents)}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-green-600 font-medium">{record.present}</p>
                    <p className="text-gray-500">Present</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-600 font-medium">{record.absent}</p>
                    <p className="text-gray-500">Absent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-yellow-600 font-medium">{record.late}</p>
                    <p className="text-gray-500">Late</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/attendance/class/${record.id}`)}
                    icon={Eye}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/attendance/mark')}
              icon={ClipboardCheck}
            >
              Mark Class Attendance
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/attendance/reports')}
              icon={FileText}
            >
              Generate Reports
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/attendance/analytics')}
              icon={BarChart3}
            >
              View Analytics
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/attendance/history')}
              icon={Calendar}
            >
              Attendance History
            </Button>
          </div>

          {/* Monthly Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">This Month Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Average Attendance:</span>
                <span className="font-medium text-green-600">88.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Best Class:</span>
                <span className="font-medium">Class 10-A (95.2%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total School Days:</span>
                <span className="font-medium">22</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AttendancePage;