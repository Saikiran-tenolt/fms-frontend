import React from 'react';
import { Bell, User, Menu } from 'lucide-react';
import { useAppSelector } from '../../hooks';
import { Badge } from '../ui';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const appMode = import.meta.env.VITE_APP_MODE || 'simulation';
  
  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left side - Hamburger (mobile) + Logo and title */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Hamburger menu button (mobile only) */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <h1 className="text-lg sm:text-2xl font-bold text-primary-700">
            Smart Agriculture Monitoring
          </h1>
          {appMode === 'simulation' && (
            <Badge variant="info" size="sm" className="hidden sm:inline-flex">
              Mode: Simulation
            </Badge>
          )}
        </div>
        
        {/* Right side - User info and notifications */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* User menu */}
          <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-gray-200">
            <div className="h-9 w-9 bg-primary-100 rounded-full flex items-center justify-center ring-2 ring-primary-200">
              <User className="h-5 w-5 text-primary-700" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600 capitalize">{user?.role.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
