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
    <nav className="bg-white/80 backdrop-blur-md border-b border-white/40 shadow-sm px-4 sm:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left side - Hamburger (mobile) + Logo and title */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Hamburger menu button (mobile only) */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <h1 className="text-lg sm:text-2xl font-bold text-[#1F2937]">
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
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200 active:scale-95"
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
          <div
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors py-1 px-2 rounded-xl group"
          >
            <div className="h-9 w-9 bg-primary-50 rounded-full flex items-center justify-center ring-1 ring-primary-200 group-hover:ring-primary-400 transition-all">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold tracking-tight text-slate-900 group-hover:text-primary-700 transition-colors">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{user?.role}</p>
                {user?.permanentLocation && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <p className="text-[10px] font-medium text-slate-400 capitalize whitespace-nowrap">
                      {user.permanentLocation.village}, {user.permanentLocation.district}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
