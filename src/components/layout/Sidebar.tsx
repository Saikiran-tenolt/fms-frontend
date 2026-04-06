import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Bell,
  TrendingUp,
  MessageSquare,
  Settings,
  LogOut,
  X,
  Users
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { logout } from '../../features/auth/authSlice';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state: any) => state.auth);

  const navItems: NavItem[] = user?.role === 'ADMIN' ? [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Farmers', path: '/admin/farmers', icon: <Users className="h-5 w-5" /> },
    { name: 'Alerts', path: '/admin/alerts', icon: <Bell className="h-5 w-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ] : [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Plots', path: '/plots', icon: <MapPin className="h-5 w-5" /> },
    { name: 'Market', path: '/market', icon: <TrendingUp className="h-5 w-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onMobileClose();
    }
  };

  const sidebarContent = (
    <>
      <div className="pt-6 pb-6 border-b border-slate-100 flex items-center justify-center lg:group-hover/sidebar:justify-start lg:group-hover/sidebar:px-6 h-[88px] transition-all duration-300">
        <div className="flex items-center">
          <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="absolute w-6 h-6 text-emerald-600 fill-current ml-1 mt-1">
              <path d="M12 3L2 21h20L12 3z" />
            </svg>
            <svg viewBox="0 0 24 24" className="absolute w-6 h-6 text-emerald-400 stroke-current fill-none stroke-2 -ml-1 -mt-1">
              <path d="M12 3L2 21h20L12 3z" />
            </svg>
          </div>
          <span className="text-xl tracking-tight leading-none flex items-baseline lg:max-w-0 lg:opacity-0 lg:group-hover/sidebar:max-w-[200px] lg:group-hover/sidebar:opacity-100 lg:group-hover/sidebar:ml-3 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap">
            <span className="font-bold text-slate-900">FMS</span>
            <span className="font-light text-slate-600 ml-1">Pro</span>
          </span>
        </div>
      </div>

      <div className="lg:hidden flex justify-between items-center px-6 pt-6 pb-6 border-b border-slate-100 absolute top-0 w-full bg-slate-50 z-10">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="absolute w-6 h-6 text-emerald-600 fill-current ml-1 mt-1">
              <path d="M12 3L2 21h20L12 3z" />
            </svg>
            <svg viewBox="0 0 24 24" className="absolute w-6 h-6 text-emerald-400 stroke-current fill-none stroke-2 -ml-1 -mt-1">
              <path d="M12 3L2 21h20L12 3z" />
            </svg>
          </div>
          <span className="text-xl tracking-tight leading-none flex items-baseline">
            <span className="font-bold text-slate-900">FMS</span>
            <span className="font-light text-slate-600 ml-1">Pro</span>
          </span>
        </div>
        <button
          onClick={onMobileClose}
          className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* spacer for mobile overlay since header is absolute to avoid layout shifting on desktop */}
      <div className="h-[88px] lg:hidden"></div>

      <nav className="flex-1 px-4 lg:px-2 lg:group-hover/sidebar:px-4 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden transition-all duration-300">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `group relative flex items-center justify-center lg:group-hover/sidebar:justify-start px-4 lg:px-0 lg:group-hover/sidebar:px-4 py-3.5 rounded-2xl transition-all duration-200 ${isActive
                ? 'bg-emerald-50 text-emerald-800 font-semibold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator Pill */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-7 bg-emerald-600 rounded-r-full -ml-4 lg:-ml-0 lg:group-hover/sidebar:-ml-4 transition-all duration-300"></div>
                )}
                <div className="flex items-center">
                  <div className={`flex-shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </div>
                  <span className="text-[15px] lg:max-w-0 lg:opacity-0 lg:group-hover/sidebar:max-w-[200px] lg:group-hover/sidebar:opacity-100 lg:group-hover/sidebar:ml-5 ml-5 lg:ml-0 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap">
                    {item.name}
                  </span>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 lg:px-3 lg:group-hover/sidebar:px-6 border-t border-slate-100 mt-auto transition-all duration-300">
        <button
          onClick={handleLogout}
          className="group relative flex items-center justify-center lg:group-hover/sidebar:justify-start w-full px-4 lg:px-0 lg:group-hover/sidebar:px-4 py-3.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 font-semibold rounded-2xl transition-all duration-300"
          title="Logout"
        >
          <div className="flex items-center">
            <div className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="text-[15px] lg:max-w-0 lg:opacity-0 lg:group-hover/sidebar:max-w-[200px] lg:group-hover/sidebar:opacity-100 lg:group-hover/sidebar:ml-5 ml-5 lg:ml-0 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap">
              Logout
            </span>
          </div>
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="group/sidebar hidden lg:flex bg-slate-50 backdrop-blur-3xl border-r border-slate-200 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] flex-col transition-all duration-300 ease-in-out w-20 hover:w-64 z-20 relative overflow-hidden">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 backdrop-blur-3xl border-r border-slate-200 shadow-2xl flex flex-col transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
