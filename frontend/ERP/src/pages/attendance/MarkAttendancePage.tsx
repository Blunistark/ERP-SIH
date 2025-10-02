import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Users, Calendar, Search } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface Class {
  id: string;
  name: string;
  section: string;
  capacity: number;
  studentCount: number;
}

interface Student {
  id: string;
  rollNumber: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface AttendanceRecord {
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

const MarkAttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, AttendanceRecord>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { data: classes } = useApiQuery<{success: boolean, data: Class[]}>('classes', '/classes');

  const { data: students } = useApiQuery<{success: boolean, data: Student[]}>(
    `class-students-${selectedClassId}`,
    `/classes/${selectedClassId}/students`,
    {},
    {
      enabled: !!selectedClassId,
    }
  );

  const safeClasses: Class[] = Array.isArray((classes as any)?.data) ? (classes as any).data : [];
  const safeStudents: Student[] = Array.isArray((students as any)?.data) ? (students as any).data : [];

  const selectedClass = safeClasses.find(c => c.id === selectedClassId);

  const filteredStudents = safeStudents.filter(student =>
    student.profile.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.profile.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber.includes(searchQuery)
  );

  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        studentId,
        status: prev[studentId]?.status || 'PRESENT',
        remarks,
      },
    }));
  };

  const markAllPresent = () => {
    const allPresentRecords: Record<string, AttendanceRecord> = {};
    filteredStudents.forEach(student => {
      allPresentRecords[student.id] = {
        studentId: student.id,
        status: 'PRESENT',
      };
    });
    setAttendanceRecords(allPresentRecords);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId) {
      alert('Please select a class');
      return;
    }

    setIsSaving(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      alert('Attendance saved successfully!');
      navigate('/attendance');
    } catch (error) {
      alert('Failed to save attendance. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: AttendanceRecord['status'] | undefined) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-800 border-green-200';
      case 'ABSENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'LATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EXCUSED': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAttendanceSummary = () => {
    const records = Object.values(attendanceRecords);
    return {
      present: records.filter(r => r.status === 'PRESENT').length,
      absent: records.filter(r => r.status === 'ABSENT').length,
      late: records.filter(r => r.status === 'LATE').length,
      excused: records.filter(r => r.status === 'EXCUSED').length,
    };
  };

  const summary = getAttendanceSummary();

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
            <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
            <p className="text-gray-600">Record student attendance for the selected class</p>
          </div>
        </div>
        <Button
          onClick={handleSaveAttendance}
          disabled={!selectedClassId || isSaving}
          icon={Save}
        >
          {isSaving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </div>

      {/* Class and Date Selection */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a class...</option>
              {safeClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.section} ({cls.studentCount} students)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {selectedClassId && (
        <>
          {/* Summary and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Attendance Summary - {selectedClass?.name} {selectedClass?.section}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{summary.present}</p>
                  <p className="text-sm text-gray-600">Present</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
                  <p className="text-sm text-gray-600">Absent</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{summary.late}</p>
                  <p className="text-sm text-gray-600">Late</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{summary.excused}</p>
                  <p className="text-sm text-gray-600">Excused</p>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={markAllPresent}
                >
                  Mark All Present
                </Button>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Student List */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Students ({filteredStudents.length})
            </h3>
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {student.profile.firstName} {student.profile.lastName}
                      </h4>
                      <p className="text-sm text-gray-500">Roll No: {student.rollNumber}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(student.id, status)}
                          className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                            attendanceRecords[student.id]?.status === status
                              ? getStatusColor(status)
                              : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(attendanceRecords[student.id]?.status === 'ABSENT' || 
                    attendanceRecords[student.id]?.status === 'LATE' ||
                    attendanceRecords[student.id]?.status === 'EXCUSED') && (
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="Add remarks (optional)"
                        value={attendanceRecords[student.id]?.remarks || ''}
                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default MarkAttendancePage;