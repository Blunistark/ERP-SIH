import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Teacher {
  id: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface Class {
  id: string;
  name: string;
  section: string;
}

interface TimetableSlot {
  period: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
}

const CreateTimetablePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedClassId, setSelectedClassId] = useState('');
  const [timetableName, setTimetableName] = useState('Weekly Timetable');
  const [slots, setSlots] = useState<Record<string, TimetableSlot>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data: classes } = useApiQuery<Class[]>('classes', '/classes');

  const { data: subjects } = useApiQuery<Subject[]>('subjects', '/subjects');

  const { data: teachers } = useApiQuery<Teacher[]>('teachers', '/teachers');

  const safeClasses: Class[] = Array.isArray(classes) ? classes : [];
  const safeSubjects: Subject[] = Array.isArray(subjects) ? subjects : [];
  const safeTeachers: Teacher[] = Array.isArray(teachers) ? teachers : [];

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = Array.from({ length: 8 }, (_, i) => i + 1);
  
  const timeSlots = [
    { period: 1, startTime: '09:00', endTime: '09:45' },
    { period: 2, startTime: '09:45', endTime: '10:30' },
    { period: 3, startTime: '10:30', endTime: '11:15' },
    { period: 4, startTime: '11:15', endTime: '12:00' },
    { period: 5, startTime: '13:00', endTime: '13:45' },
    { period: 6, startTime: '13:45', endTime: '14:30' },
    { period: 7, startTime: '14:30', endTime: '15:15' },
    { period: 8, startTime: '15:15', endTime: '16:00' },
  ];

  const handleSlotChange = (dayOfWeek: number, period: number, field: 'subjectId' | 'teacherId', value: string) => {
    const key = `${dayOfWeek}-${period}`;
    const timeSlot = timeSlots.find(t => t.period === period);
    
    setSlots(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        period,
        dayOfWeek,
        startTime: timeSlot?.startTime || '',
        endTime: timeSlot?.endTime || '',
        [field]: value,
        subjectId: field === 'subjectId' ? value : prev[key]?.subjectId || '',
        teacherId: field === 'teacherId' ? value : prev[key]?.teacherId || '',
      },
    }));
  };

  const removeSlot = (dayOfWeek: number, period: number) => {
    const key = `${dayOfWeek}-${period}`;
    setSlots(prev => {
      const newSlots = { ...prev };
      delete newSlots[key];
      return newSlots;
    });
  };

  const getSlot = (dayOfWeek: number, period: number): TimetableSlot | undefined => {
    const key = `${dayOfWeek}-${period}`;
    return slots[key];
  };

  const handleSave = async () => {
    if (!selectedClassId) {
      alert('Please select a class');
      return;
    }

    if (!timetableName.trim()) {
      alert('Please enter a timetable name');
      return;
    }

    setIsSaving(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Timetable created successfully!');
      navigate('/academic/timetable');
    } catch (error) {
      alert('Failed to create timetable. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedClass = safeClasses.find(c => c.id === selectedClassId);

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/academic/timetable')}
            icon={ArrowLeft}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Timetable</h1>
            <p className="text-gray-600">Set up class schedule and time slots</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={!selectedClassId || isSaving}
          icon={Save}
        >
          {isSaving ? 'Saving...' : 'Save Timetable'}
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timetable Name
            </label>
            <Input
              value={timetableName}
              onChange={(e) => setTimetableName(e.target.value)}
              placeholder="Enter timetable name"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Select class for timetable"
            >
              <option value="">Choose a class...</option>
              {safeClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.section}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {selectedClassId && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Weekly Schedule - {selectedClass?.name} {selectedClass?.section}
            </h3>
            <div className="text-sm text-gray-600">
              Click on cells to add subjects and teachers
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">
                    Period / Time
                  </th>
                  {dayNames.map((day) => (
                    <th key={day} className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900 min-w-[200px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => {
                  const timeSlot = timeSlots.find(t => t.period === period);
                  return (
                    <tr key={period} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium text-gray-900">
                        <div>Period {period}</div>
                        {timeSlot && (
                          <div className="text-xs text-gray-500">
                            {timeSlot.startTime} - {timeSlot.endTime}
                          </div>
                        )}
                      </td>
                      {dayNames.map((_, dayIndex) => {
                        const dayOfWeek = dayIndex + 1;
                        const slot = getSlot(dayOfWeek, period);
                        
                        return (
                          <td key={dayIndex} className="border border-gray-300 px-2 py-2">
                            {slot ? (
                              <div className="space-y-2">
                                <select
                                  value={slot.subjectId}
                                  onChange={(e) => handleSlotChange(dayOfWeek, period, 'subjectId', e.target.value)}
                                  className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  title="Select subject"
                                >
                                  <option value="">Select Subject</option>
                                  {safeSubjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                      {subject.name}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  value={slot.teacherId}
                                  onChange={(e) => handleSlotChange(dayOfWeek, period, 'teacherId', e.target.value)}
                                  className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  title="Select teacher"
                                >
                                  <option value="">Select Teacher</option>
                                  {safeTeachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                      {teacher.profile.firstName} {teacher.profile.lastName}
                                    </option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => removeSlot(dayOfWeek, period)}
                                  className="w-full text-xs text-red-600 hover:text-red-700 flex items-center justify-center space-x-1"
                                  title="Remove slot"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleSlotChange(dayOfWeek, period, 'subjectId', '')}
                                className="w-full h-16 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-blue-300 hover:text-blue-500 flex items-center justify-center space-x-1"
                                title="Add slot"
                              >
                                <Plus className="w-4 h-4" />
                                <span className="text-xs">Add Slot</span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Summary */}
      {selectedClassId && Object.keys(slots).length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Timetable Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(slots).length}</p>
              <p className="text-gray-600 text-sm">Total Periods Scheduled</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(Object.values(slots).map(s => s.subjectId).filter(Boolean)).size}
              </p>
              <p className="text-gray-600 text-sm">Subjects Assigned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(Object.values(slots).map(s => s.teacherId).filter(Boolean)).size}
              </p>
              <p className="text-gray-600 text-sm">Teachers Assigned</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CreateTimetablePage;