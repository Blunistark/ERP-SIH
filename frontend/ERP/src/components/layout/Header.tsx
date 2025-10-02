import React from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Header: React.FC = () => {
  const { toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            icon={Menu}
            className="lg:hidden"
          >
            Menu
          </Button>
          
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome back, {user?.profile.firstName}!
            </h1>
          </div>
        </div>

        {/* Center - Search */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <Input
            type="search"
            placeholder="Search students, teachers, classes..."
            icon={Search}
            iconPosition="left"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            icon={Search}
            className="md:hidden"
          >
            Search
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            icon={Bell}
            className="relative"
          >
            Notifications
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.profile.firstName} {user?.profile.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;