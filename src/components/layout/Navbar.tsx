import React from 'react';
import { Bell, User, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { toggleSidebarCollapsed } from '../../store/uiSlice';

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { unreadCount } = useAppSelector((state) => state.notifications);
  const { isSidebarCollapsed } = useAppSelector((state) => state.ui);

  return (
    <nav className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-4 sm:px-8 py-3 sticky top-0 z-30 transition-all duration-300">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        {/* Left side - Hamburger (mobile) + Logo and title */}
        <div className="flex items-center gap-4">
          {/* Hamburger menu button (mobile only) */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-col">
            <h1 className="text-sm sm:text-lg font-black tracking-tighter text-slate-900 uppercase">
              Farmer Monitoring <span className="text-emerald-600">Portal</span>
            </h1>
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">System Operational</p>
            </div>
          </div>
        </div>

        {/* Right side - User info, notifications and sidebar toggle */}
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle - Top Right as requested */}
          <button
            onClick={() => dispatch(toggleSidebarCollapsed())}
            className="hidden lg:flex w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all active:scale-95 group shadow-sm"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1 hidden lg:block" />

          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
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
                    <p className="text-[10px] font-medium tracking-wider text-slate-500 uppercase whitespace-nowrap">
                      {user.permanentLocation.village}
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
