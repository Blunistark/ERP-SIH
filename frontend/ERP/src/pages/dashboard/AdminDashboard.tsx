import React from 'react';
import { Users, GraduationCap, BookOpen, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import Card from '../../components/ui/Card';
import AnalyticsChart from '../../components/charts/AnalyticsChart';
import AIChat from '../../components/ai/AIChat';
import { useApiQuery } from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../config/api';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC = () => {
  const { data: statsResponse, isLoading, error } = useApiQuery('admin-stats', API_ENDPOINTS.ADMIN.STATS);

  console.log('Dashboard stats response:', statsResponse);

  // Extract stats from the response data wrapper
  const stats = (statsResponse as any)?.data;
  
  // Ensure stats is properly typed with fallback values
  const safeStats: DashboardStats = stats ? {
    totalStudents: stats.totalStudents || 0,
    totalTeachers: stats.totalTeachers || 0,
    totalClasses: stats.totalClasses || 0,
    totalRevenue: stats.totalRevenue || 0,
  } : {
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalRevenue: 0,
  };

  const performanceData = [
    { name: 'Jan', value: 85 },
    { name: 'Feb', value: 88 },
    { name: 'Mar', value: 82 },
    { name: 'Apr', value: 90 },
    { name: 'May', value: 87 },
    { name: 'Jun', value: 92 },
  ];

  const gradeDistribution = [
    { name: 'Grade A', value: 30 },
    { name: 'Grade B', value: 45 },
    { name: 'Grade C', value: 20 },
    { name: 'Grade D', value: 5 },
  ];

  const statCards = [
    {
      title: 'Total Students',
      value: safeStats.totalStudents.toLocaleString(),
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Teachers',
      value: safeStats.totalTeachers.toString(),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Active Classes',
      value: safeStats.totalClasses.toString(),
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Revenue (Monthly)',
      value: `$${safeStats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome to your school management dashboard</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to load dashboard statistics. Please try refreshing the page.
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} hover>
            <div className="flex items-center">
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                {isLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 w-16 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-gray-600 text-sm">{stat.title}</p>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts and AI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <AnalyticsChart
            title="School Performance Trends"
            data={performanceData}
            type="line"
            height={300}
          />
        </div>

        {/* Grade Distribution */}
        <AnalyticsChart
          title="Grade Distribution"
          data={gradeDistribution}
          type="pie"
          height={300}
        />
      </div>

      {/* Recent Activities and AI Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">New student enrollment: John Doe</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Grade 10 exam results published</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">Teacher meeting scheduled for tomorrow</p>
                <p className="text-xs text-gray-500">6 hours ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">AI analytics report generated</p>
                <p className="text-xs text-gray-500">8 hours ago</p>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Chat */}
        <AIChat />
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Add Student</span>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Create Class</span>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Schedule Exam</span>
          </button>
          <button className="p-4 text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">View Reports</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;