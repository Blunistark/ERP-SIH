import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  Home,
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  Brain,
  Settings,
  LogOut,
  Menu,
  BarChart3,
  Sparkles,
  MessageSquare,
  Cog,
  Bell,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import Button from '../ui/Button';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  {
    name: 'Users',
    href: '/users',
    icon: Users,
    roles: ['ADMIN', 'TEACHER'],
    children: [
      { name: 'Students', href: '/users/students', icon: GraduationCap },
      { name: 'Teachers', href: '/users/teachers', icon: Users },
      { name: 'Parents', href: '/users/parents', icon: Users },
    ],
  },
  {
    name: 'Academic',
    href: '/academic',
    icon: BookOpen,
    roles: ['ADMIN', 'TEACHER'],
    children: [
      { name: 'Classes', href: '/academic/classes', icon: BookOpen },
      { name: 'Academic Years', href: '/academic/years', icon: Calendar },
      { name: 'Subjects', href: '/academic/subjects', icon: BookOpen },
      { name: 'Timetable', href: '/academic/timetable', icon: Calendar },
    ],
  },
  { name: 'Attendance', href: '/attendance', icon: ClipboardCheck, roles: ['ADMIN', 'TEACHER', 'PARENT'] },
  { name: 'Examinations', href: '/examinations', icon: GraduationCap },
  {
    name: 'AI Hub',
    href: '/ai',
    icon: Brain,
    children: [
      { name: 'Analytics', href: '/ai/analytics', icon: BarChart3 },
      { name: 'Predictions', href: '/ai/predictions', icon: Sparkles },
      { name: 'Content Generator', href: '/ai/content', icon: Sparkles },
      { name: 'Assistant', href: '/ai/assistant', icon: MessageSquare },
      { name: 'Automation', href: '/ai/automation', icon: Cog },
    ],
  },
  { name: 'Communications', href: '/communications', icon: Bell },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN'] },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemVisible = (item: NavigationItem) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:z-auto lg:shadow-none',
          sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">NexVidhya ERP</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              icon={Menu}
              className="lg:hidden"
            >
              Close
            </Button>
          </div>

          {/* User Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {user?.profile.firstName?.[0]}{user?.profile.lastName?.[0]}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user?.profile.firstName} {user?.profile.lastName}
                </p>
                <p className="text-xs text-gray-500 capitalize">{user?.role.toLowerCase()}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.filter(isItemVisible).map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 group"
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                        {item.name}
                      </div>
                      {expandedItems.includes(item.name) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    {expandedItems.includes(item.name) && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.name}
                            to={child.href}
                            className={({ isActive }) =>
                              clsx(
                                'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                                isActive
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                              )
                            }
                          >
                            <child.icon className="mr-3 h-4 w-4" />
                            {child.name}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      clsx(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-md',
                        isActive
                          ? 'bg-blue-100 text-blue-900'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      )
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    {item.name}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={handleLogout}
              icon={LogOut}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;