import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Filter, Calendar, BarChart3, FileText } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AnalyticsChart from '../../components/charts/AnalyticsChart';

interface AttendanceReport {
  classId: string;
  className: string;
  section: string;
  totalStudents: number;
  averageAttendance: number;
  presentDays: number;
  totalDays: number;
}

interface StudentAttendanceReport {
  studentId: string;
  studentName: string;
  rollNumber: string;
  className: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
}

const AttendanceReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState<'class' | 'student'>('class');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedClass, setSelectedClass] = useState('');

  const { data: classReports } = useApiQuery<{success: boolean, data: AttendanceReport[]}>('attendance-class-reports', 
    `/attendance/reports/class?month=${selectedMonth}`);

  const { data: studentReports } = useApiQuery<{success: boolean, data: StudentAttendanceReport[]}>('attendance-student-reports',
    `/attendance/reports/student?month=${selectedMonth}&classId=${selectedClass}`, {}, {
    enabled: !!selectedClass,
  });

  const safeClassReports: AttendanceReport[] = Array.isArray((classReports as any)?.data) ? (classReports as any).data : [];
  const safeStudentReports: StudentAttendanceReport[] = Array.isArray((studentReports as any)?.data) ? (studentReports as any).data : [];

  const attendanceTrendData = [
    { name: 'Week 1', value: 92 },
    { name: 'Week 2', value: 88 },
    { name: 'Week 3', value: 90 },
    { name: 'Week 4', value: 87 },
  ];

  const classComparisonData = safeClassReports.map(report => ({
    name: `${report.className}-${report.section}`,
    value: report.averageAttendance,
  }));

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-100';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const exportReport = () => {
    // In a real app, this would generate and download a PDF/Excel file
    alert('Report export functionality would be implemented here');
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/attendance')}
            icon={ArrowLeft}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
            <p className="text-gray-600">Generate and view attendance analytics</p>
          </div>
        </div>
        <Button
          onClick={exportReport}
          icon={Download}
        >
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as 'class' | 'student')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select report type"
            >
              <option value="class">Class-wise Report</option>
              <option value="student">Student-wise Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select month for report"
            />
          </div>
          {reportType === 'student' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Select class for student report"
              >
                <option value="">All Classes</option>
                {safeClassReports.map((cls) => (
                  <option key={cls.classId} value={cls.classId}>
                    {cls.className} - {cls.section}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Weekly Attendance Trend"
          data={attendanceTrendData}
          type="line"
          height={300}
        />
        <AnalyticsChart
          title="Class Comparison"
          data={classComparisonData}
          type="bar"
          height={300}
        />
      </div>

      {/* Reports Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {reportType === 'class' ? 'Class-wise Attendance Report' : 'Student-wise Attendance Report'}
          </h3>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {reportType === 'class' ? `${safeClassReports.length} classes` : `${safeStudentReports.length} students`}
            </span>
          </div>
        </div>

        {reportType === 'class' ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Class</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total Students</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Present Days</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Total Days</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Average Attendance</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {safeClassReports.map((report) => (
                  <tr key={report.classId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {report.className} - {report.section}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{report.totalStudents}</td>
                    <td className="py-3 px-4 text-gray-600">{report.presentDays}</td>
                    <td className="py-3 px-4 text-gray-600">{report.totalDays}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">
                        {report.averageAttendance.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.averageAttendance)}`}>
                        {report.averageAttendance >= 90 ? 'Excellent' : 
                         report.averageAttendance >= 75 ? 'Good' : 'Needs Attention'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Roll No</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Present</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Absent</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Late</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Attendance %</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {safeStudentReports.map((report) => (
                  <tr key={report.studentId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{report.studentName}</div>
                      <div className="text-sm text-gray-500">{report.className}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{report.rollNumber}</td>
                    <td className="py-3 px-4 text-green-600 font-medium">{report.presentDays}</td>
                    <td className="py-3 px-4 text-red-600 font-medium">{report.absentDays}</td>
                    <td className="py-3 px-4 text-yellow-600 font-medium">{report.lateDays}</td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">
                        {report.attendancePercentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.attendancePercentage)}`}>
                        {report.attendancePercentage >= 90 ? 'Excellent' : 
                         report.attendancePercentage >= 75 ? 'Good' : 'Needs Attention'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">89.2%</p>
              <p className="text-gray-600 text-sm">Overall Attendance</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">22</p>
              <p className="text-gray-600 text-sm">Total School Days</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">4</p>
              <p className="text-gray-600 text-sm">Classes Monitored</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AttendanceReportPage;