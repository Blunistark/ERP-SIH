import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Bell, Users, Calendar, Pin, Eye, Edit, Trash2, MessageSquare } from 'lucide-react';
import { useApiQuery } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'ANNOUNCEMENT' | 'EVENT' | 'URGENT' | 'GENERAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  targetAudience: 'ALL' | 'STUDENTS' | 'TEACHERS' | 'PARENTS' | 'STAFF';
  isActive: boolean;
  isPinned: boolean;
  validFrom: string;
  validTo?: string;
  attachments: string[];
  author: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  readCount: number;
  totalTargetCount: number;
  createdAt: string;
  updatedAt: string;
}

const NoticesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [audienceFilter, setAudienceFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  const { data: notices } = useApiQuery<Notice[]>('notices', '/notices');

  const safeNotices: Notice[] = Array.isArray(notices) ? notices : [];

  const filteredNotices = safeNotices.filter(notice => {
    const matchesSearch = notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notice.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || notice.type === typeFilter;
    const matchesAudience = !audienceFilter || notice.targetAudience === audienceFilter;
    const matchesPriority = !priorityFilter || notice.priority === priorityFilter;
    
    return matchesSearch && matchesType && matchesAudience && matchesPriority;
  });

  const pinnedNotices = filteredNotices.filter(n => n.isPinned);
  const regularNotices = filteredNotices.filter(n => !n.isPinned);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT': return 'bg-blue-100 text-blue-800';
      case 'EVENT': return 'bg-green-100 text-green-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'GENERAL': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-white';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'ALL': return <Users className="w-4 h-4" />;
      case 'STUDENTS': return <Users className="w-4 h-4" />;
      case 'TEACHERS': return <Users className="w-4 h-4" />;
      case 'PARENTS': return <Users className="w-4 h-4" />;
      case 'STAFF': return <Users className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const handleEdit = (noticeId: string) => {
    navigate(`/communication/notices/${noticeId}/edit`);
  };

  const handleDelete = async (noticeId: string) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        // API call would go here
        await new Promise(resolve => setTimeout(resolve, 500));
        alert('Notice deleted successfully!');
        // Refresh data
      } catch (error) {
        alert('Failed to delete notice. Please try again.');
      }
    }
  };

  const handleTogglePin = async (noticeId: string) => {
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 300));
      alert('Notice pin status updated!');
      // Refresh data
    } catch (error) {
      alert('Failed to update notice. Please try again.');
    }
  };

  const totalNotices = safeNotices.length;
  const activeNotices = safeNotices.filter(n => n.isActive).length;
  const totalReads = safeNotices.reduce((sum, n) => sum + n.readCount, 0);
  const avgReadRate = safeNotices.length > 0 
    ? Math.round((totalReads / safeNotices.reduce((sum, n) => sum + n.totalTargetCount, 0)) * 100) 
    : 0;

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
          <p className="text-gray-600">Manage announcements and communications</p>
        </div>
        <Button
          onClick={() => navigate('/communication/notices/create')}
          icon={Plus}
        >
          Create Notice
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalNotices}</p>
              <p className="text-gray-600 text-sm">Total Notices</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{activeNotices}</p>
              <p className="text-gray-600 text-sm">Active Notices</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{totalReads}</p>
              <p className="text-gray-600 text-sm">Total Views</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{avgReadRate}%</p>
              <p className="text-gray-600 text-sm">Avg. Read Rate</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Filter by type"
          >
            <option value="">All Types</option>
            <option value="ANNOUNCEMENT">Announcement</option>
            <option value="EVENT">Event</option>
            <option value="URGENT">Urgent</option>
            <option value="GENERAL">General</option>
          </select>
          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Filter by audience"
          >
            <option value="">All Audiences</option>
            <option value="ALL">All</option>
            <option value="STUDENTS">Students</option>
            <option value="TEACHERS">Teachers</option>
            <option value="PARENTS">Parents</option>
            <option value="STAFF">Staff</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Filter by priority"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('');
              setAudienceFilter('');
              setPriorityFilter('');
            }}
            icon={Filter}
          >
            Clear
          </Button>
        </div>
      </Card>

      {/* Pinned Notices */}
      {pinnedNotices.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Pin className="w-5 h-5 mr-2" />
              Pinned Notices ({pinnedNotices.length})
            </h3>
          </div>
          
          <div className="space-y-4">
            {pinnedNotices.map((notice) => (
              <div key={notice.id} className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{notice.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notice.type)}`}>
                        {notice.type}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notice.priority)}`}>
                        {notice.priority}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3 line-clamp-2">{notice.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        {getAudienceIcon(notice.targetAudience)}
                        <span>{notice.targetAudience}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{notice.readCount}/{notice.totalTargetCount} views</span>
                      </div>
                      <span>By {notice.author.profile.firstName} {notice.author.profile.lastName}</span>
                      <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleTogglePin(notice.id)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Unpin notice"
                    >
                      <Pin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(notice.id)}
                      className="text-gray-600 hover:text-gray-700"
                      title="Edit notice"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Delete notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Regular Notices */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            All Notices ({regularNotices.length})
          </h3>
        </div>
        
        <div className="space-y-4">
          {regularNotices.map((notice) => (
            <div key={notice.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{notice.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notice.type)}`}>
                      {notice.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notice.priority)}`}>
                      {notice.priority}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3 line-clamp-2">{notice.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      {getAudienceIcon(notice.targetAudience)}
                      <span>{notice.targetAudience}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{notice.readCount}/{notice.totalTargetCount} views</span>
                    </div>
                    <span>By {notice.author.profile.firstName} {notice.author.profile.lastName}</span>
                    <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                    {notice.attachments.length > 0 && (
                      <span className="text-blue-600">📎 {notice.attachments.length} files</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleTogglePin(notice.id)}
                    className="text-gray-400 hover:text-blue-600"
                    title="Pin notice"
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(notice.id)}
                    className="text-gray-600 hover:text-gray-700"
                    title="Edit notice"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {regularNotices.length === 0 && (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No notices found</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NoticesPage;