import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApiQuery } from '../../hooks/useApi';
import { ArrowLeft, Calendar, Edit, ToggleLeft, ToggleRight } from 'lucide-react';
import Button from '../../components/ui/Button';

interface AcademicYear {
  id: string;
  year: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AcademicYearResponse {
  success: boolean;
  data: AcademicYear;
}

const ViewAcademicYearPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: academicYearData, isLoading } = useApiQuery<AcademicYearResponse>(
    ['academic-year', id || ''],
    `/academic-years/${id}`
  );

  const academicYear = (academicYearData as AcademicYearResponse)?.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    
    if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ${days > 0 ? `and ${days} day${days > 1 ? 's' : ''}` : ''}`;
    }
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading academic year details...</div>
      </div>
    );
  }

  if (!academicYear) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">Academic year not found</div>
          <Button onClick={() => navigate('/academic/years')}>
            Back to Academic Years
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/academic/years')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Academic Years"
            aria-label="Back to Academic Years"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{academicYear.year}</h1>
            <p className="text-gray-600">Academic Year Details</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/academic/years/${id}/edit`)}
            className="flex items-center space-x-2"
          >
            <Edit size={16} />
            <span>Edit</span>
          </Button>
        </div>
      </div>

      {/* Academic Year Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Academic Year Information</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Academic Year</label>
                <p className="text-lg font-semibold text-gray-900">{academicYear.year}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                <div className="flex items-center space-x-2">
                  {academicYear.isActive ? (
                    <>
                      <ToggleRight className="text-green-500" size={20} />
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="text-gray-400" size={20} />
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Duration</label>
                <p className="text-gray-900">{calculateDuration(academicYear.startDate, academicYear.endDate)}</p>
              </div>
            </div>

            {/* Date Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-400" />
                  <p className="text-gray-900">{formatDate(academicYear.startDate)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">End Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar size={16} className="text-gray-400" />
                  <p className="text-gray-900">{formatDate(academicYear.endDate)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Progress</label>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  {(() => {
                    const now = new Date();
                    const start = new Date(academicYear.startDate);
                    const end = new Date(academicYear.endDate);
                    const total = end.getTime() - start.getTime();
                    const elapsed = now.getTime() - start.getTime();
                    const progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
                    
                    return (
                      <div 
                        className={`bg-blue-600 h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                      />
                    );
                  })()}
                </div>
                {(() => {
                  const now = new Date();
                  const start = new Date(academicYear.startDate);
                  const end = new Date(academicYear.endDate);
                  
                  if (now < start) {
                    return <p className="text-sm text-gray-500 mt-1">Not started yet</p>;
                  } else if (now > end) {
                    return <p className="text-sm text-gray-500 mt-1">Completed</p>;
                  } else {
                    const total = end.getTime() - start.getTime();
                    const elapsed = now.getTime() - start.getTime();
                    const progress = Math.max(0, Math.min(100, (elapsed / total) * 100));
                    return <p className="text-sm text-gray-500 mt-1">{progress.toFixed(1)}% completed</p>;
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-gray-500 mb-1">Created At</label>
              <p className="text-gray-900">{formatDate(academicYear.createdAt)}</p>
            </div>
            <div>
              <label className="block text-gray-500 mb-1">Last Updated</label>
              <p className="text-gray-900">{formatDate(academicYear.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section (Future Enhancement) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">-</div>
              <div className="text-sm text-gray-600">Total Classes</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">-</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">-</div>
              <div className="text-sm text-gray-600">Total Teachers</div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 text-center mt-4">
            Statistics will be available once the academic year is linked to classes and students.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewAcademicYearPage;
