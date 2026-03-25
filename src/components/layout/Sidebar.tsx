import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAppDispatch } from '../../hooks';
import { logout } from '../../features/auth/authSlice';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: 'Plots', path: '/plots', icon: <MapPin className="h-5 w-5" /> },
  { name: 'Advisories', path: '/advisories', icon: <FileText className="h-5 w-5" /> },
  { name: 'Notifications', path: '/notifications', icon: <Bell className="h-5 w-5" /> },
  { name: 'Market', path: '/market', icon: <TrendingUp className="h-5 w-5" /> },
  { name: 'Assistant', path: '/assistant', icon: <MessageSquare className="h-5 w-5" /> },
  { name: 'Settings', path: '/settings', icon: <Settings className="h-5 w-5" /> },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
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
      <div className="p-4 border-b border-gray-200 flex justify-end hidden lg:flex">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>
      
      <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
        <button
          onClick={onMobileClose}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
            title={collapsed ? item.name : undefined}
          >
            {item.icon}
            {!collapsed && <span className="text-sm lg:block">{item.name}</span>}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-200"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </>
  );
  
  return (
    <>
      <aside
        className={`hidden lg:flex bg-white border-r border-gray-200 flex-col transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>
      
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onMobileClose}
        />
      )}
      
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
