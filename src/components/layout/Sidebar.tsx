import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Bell,
  TrendingUp,
  Settings,
  LogOut,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAppSelector, useAppDispatch } from '../../hooks';
import { logout } from '../../features/auth/authSlice';
import { toggleSidebarCollapsed } from '../../store/uiSlice';

interface NavItem {
  name: string;
  path?: string;
  icon: React.ReactNode;
  onClick?: () => void; // optional click handler for items like logout
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state: any) => state.auth);
  const { isSidebarCollapsed } = useAppSelector((state) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getNavGroups = (): NavGroup[] => {
    if (user?.role === 'ADMIN') {
      return [
        {
          label: 'Overview',
          items: [
            { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
          ]
        },
        {
          label: 'Management',
          items: [
            { name: 'Farmers', path: '/admin/farmers', icon: <Users className="h-4 w-4" /> },
            { name: 'Alerts', path: '/admin/alerts', icon: <Bell className="h-4 w-4" /> },
          ]
        },
        {
          label: 'Account',
          items: [
            { name: 'Profile', path: '/admin/profile', icon: <User className="h-4 w-4" /> },
            { name: 'Settings', path: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
          ]
        }
      ];
    }
    return [
      {
        label: 'Workspace',
        items: [
          { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
          { name: 'Plots', path: '/plots', icon: <MapPin className="h-4 w-4" /> },
        ]
      },
      {
        label: 'Analysis',
        items: [
          { name: 'Market', path: '/market', icon: <TrendingUp className="h-4 w-4" /> },
          { name: 'Advisory', path: '/advisories', icon: <FileText className="h-4 w-4" /> },
          { name: 'Weather', path: '/weather', icon: <Cloud className="h-4 w-4" /> },
        ]
      },
      {
        label: 'Tools',
        items: [
          { name: 'Assistant', path: '/assistant', icon: <Sparkles className="h-4 w-4" /> },
          { name: 'Notifications', path: '/notifications', icon: <Bell className="h-4 w-4" /> },
        ]
      },
      {
        label: 'Account',
        items: [
          { name: 'Settings', path: '/settings', icon: <Settings className="h-4 w-4" /> },
          { name: 'Logout', icon: <LogOut className="h-4 w-4" />, onClick: handleLogout },
        ]
      }
    ];
  };

  const navGroups = getNavGroups();

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onMobileClose();
    }
  };

  const NavLinkItem = ({ item }: { item: NavItem }) => {
    const commonClasses = `group relative flex items-center transition-all duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)] rounded-lg ${
      isSidebarCollapsed ? 'justify-center w-10 h-10 mx-auto p-0' : 'gap-3 py-2 px-3 mx-3'
    }`;

    const innerContent = (
      <>
        <div className="flex-shrink-0 transition-colors duration-200 flex items-center justify-center">
          {item.icon}
        </div>
        <AnimatePresence>
          {!isSidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="text-[13px] tracking-tight whitespace-nowrap overflow-hidden"
            >
              {item.name}
            </motion.span>
          )}
        </AnimatePresence>
      </>
    );

    if (item.onClick) {
      return (
        <button
          onClick={() => {
            item.onClick!();
            handleNavClick();
          }}
          title={isSidebarCollapsed ? item.name : undefined}
          className={`${commonClasses} text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 font-medium text-left`}
        >
          {innerContent}
        </button>
      );
    }

    return (
      <NavLink
        to={item.path || '#'}
        onClick={handleNavClick}
        title={isSidebarCollapsed ? item.name : undefined}
        className={({ isActive }) =>
          `${commonClasses} ${
            isActive
              ? 'bg-emerald-50/80 text-emerald-700 font-semibold shadow-[inset_0_0_0_1px_rgba(16,185,129,0.1)]'
              : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
          }`
        }
      >
        {innerContent}
      </NavLink>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#fcfcfd] border-r border-slate-200/60 relative w-full overflow-hidden">
      {/* Navigation Groups */}
      <div className="flex-1 overflow-hidden pt-8 space-y-3 flex flex-col">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  className="px-6 overflow-hidden whitespace-nowrap"
                >
                  <div className="pb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.label}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-0.5 flex flex-col items-stretch">
              {group.items.map((item) => (
                <NavLinkItem key={item.path || item.name} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Premium User Profile Card */}
      <div className="p-4 border-t border-slate-100 bg-white/50">
        <div className={`group relative flex items-center rounded-xl p-2 transition-all duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${
          isSidebarCollapsed ? 'justify-center p-0' : 'bg-slate-50/50 border border-slate-200/50 hover:bg-slate-50'
        }`}>
          {/* Avatar Badge */}
          <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/10`}>
            {user?.name?.charAt(0) || 'F'}
          </div>

          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className="ml-3 flex-1 overflow-hidden whitespace-nowrap"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 truncate">{user?.name}</span>
                  <span className="text-[10px] font-medium text-slate-500 tracking-tight">{user?.role}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isSidebarCollapsed && (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => {
                  navigate(user?.role === 'ADMIN' ? '/admin/settings' : '/settings');
                  handleNavClick();
                }}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                title="Settings"
              >
                <Settings size={16} />
              </button>
              <button 
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {isSidebarCollapsed && (
            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {user?.name} (Logout)
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 72 : 256 }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="hidden lg:flex h-full bg-white flex-shrink-0 relative z-40"
      >
        {sidebarContent}
        {/* Toggle Collapse Button - Premium Glassmorphism with Enhanced Borders */}
        <button 
          onClick={() => dispatch(toggleSidebarCollapsed())}
          className="hidden lg:flex absolute -right-4 top-6 w-8 h-8 bg-white/60 backdrop-blur-xl border-2 border-white shadow-xl rounded-full items-center justify-center text-slate-900 z-50 hover:bg-white hover:scale-110 active:scale-95 group transition-all duration-300 ring-4 ring-black/5"
          aria-label={isSidebarCollapsed ? "Expand" : "Collapse"}
        >
          {isSidebarCollapsed ? 
            <ChevronRight size={16} strokeWidth={3} className="group-hover:text-emerald-600 transition-colors" /> : 
            <ChevronLeft size={16} strokeWidth={3} className="group-hover:text-emerald-600 transition-colors" />
          }
        </button>
      </motion.aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-[2px] z-40 transition-opacity duration-300 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
