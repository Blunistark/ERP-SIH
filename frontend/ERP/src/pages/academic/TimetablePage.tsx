import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Plus, Eye, Edit, Trash2, Users, BookOpen } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../config/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface TimetableSlot {
  id: string;
  period: number;
  dayOfWeek: number; // 1 = Monday, 7 = Sunday
  startTime: string;
  endTime: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  teacher: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  class: {
    id: string;
    name: string;
    section: string;
  };
}

interface Timetable {
  id: string;
  name: string;
  classId: string;
  createdAt: string;
  updatedAt: string;
  slots: TimetableSlot[];
}

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
}

interface Teacher {
  id: string;
  employeeId: string;
  user: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

const TimetablePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: timetables } = useApiQuery<any>('timetables', API_ENDPOINTS.TIMETABLES);
  const { data: subjects } = useApiQuery<any>('subjects', API_ENDPOINTS.SUBJECTS);
  const { data: teachers } = useApiQuery<any>('teachers', API_ENDPOINTS.TEACHERS);

  const { data: timetableSlots } = useApiQuery<TimetableSlot[]>(
    `timetable-slots-${selectedClass}`,
    `${API_ENDPOINTS.TIMETABLES}/${selectedClass}/slots`,
    {},
    {
      enabled: !!selectedClass,
    }
  );

  const safeTimetables: Timetable[] = Array.isArray((timetables as any)?.data) ? (timetables as any).data : [];
  const safeTimetableSlots: TimetableSlot[] = Array.isArray(timetableSlots) ? timetableSlots : [];
  const safeSubjects: Subject[] = Array.isArray((subjects as any)?.data) ? (subjects as any).data : [];
  const safeTeachers: Teacher[] = Array.isArray((teachers as any)?.data) ? (teachers as any).data : [];

  // Create a helper function to get class info from first slot
  const getClassInfo = (timetable: Timetable) => {
    if (timetable.slots && timetable.slots.length > 0) {
      const firstSlot = timetable.slots[0];
      return {
        className: firstSlot.class.name,
        section: firstSlot.class.section,
      };
    }
    return { className: '', section: '' };
  };

  const filteredTimetables = safeTimetables.filter(timetable => {
    const classInfo = getClassInfo(timetable);
    return (
      (classInfo.className?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (classInfo.section?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (timetable.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
  });

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = Array.from({ length: 8 }, (_, i) => i + 1);

  // Create a map of slots by day and period
  const slotMap = new Map<string, TimetableSlot>();
  safeTimetableSlots.forEach(slot => {
    const key = `${slot.dayOfWeek}-${slot.period}`;
    slotMap.set(key, slot);
  });

  const handleDeleteTimetable = (timetableId: string) => {
    if (window.confirm('Are you sure you want to delete this timetable?')) {
      alert('Timetable deleted successfully');
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-600">Manage class schedules and time slots</p>
        </div>
        <Button
          onClick={() => navigate('/academic/timetable/create')}
          icon={Plus}
        >
          Create Timetable
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select class to view timetable"
            >
              <option value="">Select class to view timetable</option>
              {safeTimetables.map((timetable) => {
                const classInfo = getClassInfo(timetable);
                return (
                  <option key={timetable.id} value={timetable.id}>
                    {classInfo.className} - {classInfo.section}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </Card>

      {/* Timetables List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Class Timetables ({filteredTimetables.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTimetables.map((timetable) => {
            const classInfo = getClassInfo(timetable);
            return (
              <div key={timetable.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {classInfo.className} - {classInfo.section}
                    </h4>
                    <p className="text-sm text-gray-500">{timetable.name}</p>
                  </div>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Total Slots:</span>
                    <span className="font-medium">{timetable.slots?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span className="font-medium">
                      {new Date(timetable.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/academic/timetable/${timetable.id}`)}
                    icon={Eye}
                  >
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/academic/timetable/${timetable.id}/edit`)}
                    icon={Edit}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTimetable(timetable.id)}
                    icon={Trash2}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Timetable View */}
      {selectedClass && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Weekly Timetable - {(() => {
                const selectedTimetable = safeTimetables.find(t => t.id === selectedClass);
                if (selectedTimetable) {
                  const classInfo = getClassInfo(selectedTimetable);
                  return `${classInfo.className} ${classInfo.section}`;
                }
                return '';
              })()}
            </h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/academic/timetable/${selectedClass}/edit`)}
                icon={Edit}
              >
                Edit Timetable
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                    Period
                  </th>
                  {dayNames.map((day) => (
                    <th key={day} className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">
                      Period {period}
                    </td>
                    {dayNames.map((_, dayIndex) => {
                      const dayOfWeek = dayIndex + 1;
                      const slot = slotMap.get(`${dayOfWeek}-${period}`);
                      
                      return (
                        <td key={dayIndex} className="border border-gray-300 px-4 py-2">
                          {slot ? (
                            <div className="space-y-1">
                              <div className="font-medium text-sm text-gray-900">
                                {slot.subject.name}
                              </div>
                              <div className="text-xs text-gray-600">
                                {slot.teacher.profile.firstName} {slot.teacher.profile.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {slot.startTime} - {slot.endTime}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-gray-400 text-sm">
                              Free Period
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{safeTimetables.length}</p>
              <p className="text-gray-600 text-sm">Total Timetables</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-gray-600 text-sm">Periods per Day</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">6</p>
              <p className="text-gray-600 text-sm">Working Days</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate('/academic/timetable/create')}
            icon={Plus}
          >
            Create New Timetable
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate('/academic/subjects')}
            icon={BookOpen}
          >
            Manage Subjects
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate('/users/teachers')}
            icon={Users}
          >
            Assign Teachers
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => navigate('/academic/classes')}
            icon={Calendar}
          >
            Manage Classes
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TimetablePage;