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
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAppSelector, useAppDispatch } from '../../hooks';
import { logout } from '../../features/auth/authSlice';
import { toggleSidebarCollapsed } from '../../store/uiSlice';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
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
        ]
      }
    ];
  };

  const navGroups = getNavGroups();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onMobileClose();
    }
  };

  const NavLinkItem = ({ item }: { item: NavItem }) => (
    <NavLink
      key={item.path}
      to={item.path}
      onClick={handleNavClick}
      title={isSidebarCollapsed ? item.name : undefined}
      className={({ isActive }) =>
        `group relative flex items-center transition-all duration-200 gap-3 rounded-lg py-2 ${
          isSidebarCollapsed ? 'justify-center px-0 mx-2' : 'px-3 mx-3'
        } ${
          isActive
            ? 'bg-emerald-50/80 text-emerald-700 font-semibold shadow-[inset_0_0_0_1px_rgba(16,185,129,0.1)]'
            : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
        }`
      }
    >
      <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'w-full'}`}>
        <div className={`flex-shrink-0 transition-colors duration-200`}>
          {item.icon}
        </div>
        {!isSidebarCollapsed && (
          <span className="text-[13px] tracking-tight ml-3 animate-in fade-in duration-300">
            {item.name}
          </span>
        )}
      </div>
      {/* Tooltip or indicator can go here */}
    </NavLink>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#fcfcfd] border-r border-slate-200/60 relative transition-all duration-300">
      {/* Top Branding Section */}
      <div className={`h-20 flex items-center transition-all duration-300 ${isSidebarCollapsed ? 'justify-center' : 'px-6'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Sparkles className="text-white h-5 w-5" />
          </div>
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="text-sm font-bold text-slate-900 leading-tight">FMS Pro</span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider">WORKSPACE</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Toggle Collapse Button */}
        {!mobileOpen && (
          <button 
            onClick={() => dispatch(toggleSidebarCollapsed())}
            className="hidden lg:flex absolute -right-3.5 top-6 w-7 h-7 bg-white border border-slate-200 rounded-full items-center justify-center text-slate-600 shadow-sm transition-all z-50 hover:bg-slate-50 hover:shadow-md hover:scale-105"
            aria-label={isSidebarCollapsed ? "Expand" : "Collapse"}
          >
            {isSidebarCollapsed ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto pt-4 space-y-6 flex flex-col">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            {!isSidebarCollapsed && (
              <div className="px-6 pb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.label}</span>
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLinkItem key={item.path} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Premium User Profile Card */}
      <div className="p-4 border-t border-slate-100 bg-white/50">
        <div className={`group relative flex items-center rounded-xl p-2 transition-all ${
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
                className="ml-3 flex-1 overflow-hidden"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 truncate">{user?.name}</span>
                  <span className="text-[10px] font-medium text-slate-500 tracking-tight">{user?.role}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isSidebarCollapsed && (
            <button 
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
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
      <aside className={`hidden lg:flex ${isSidebarCollapsed ? 'w-[72px]' : 'w-64'} h-screen bg-white transition-all duration-300 ease-in-out`}>
        {sidebarContent}
      </aside>

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
