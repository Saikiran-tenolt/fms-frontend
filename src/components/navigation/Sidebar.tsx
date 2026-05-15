import React, { useCallback, useMemo, memo } from 'react';
import { NavLink } from 'react-router-dom';
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
  Cloud,
  Layers,
  Radio,
  Cpu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAppSelector, useAppDispatch } from '@/hooks';
import { logout } from '@/features/auth/authSlice';
import { toggleSidebarCollapsed } from '@/store/uiSlice';

// ── FIX 5: Hoist icon JSX to module-level constants ───────────────────────────
// Previously icons were created as JSX inside useMemo:
//   { icon: <LayoutDashboard className="h-4 w-4" /> }
// Even though useMemo caches the array, each call to the memo factory
// creates new JSX element objects for the icons. This means navGroups
// produces new item references → NavLinkItem's React.memo sees new props
// → NavLinkItem re-renders on every Sidebar render.
// Module-level constants are created once and never change, so
// NavLinkItem.memo can correctly bail out.
const ICON_DASHBOARD = <LayoutDashboard className="h-4 w-4" />;
const ICON_PLOTS = <MapPin className="h-4 w-4" />;
const ICON_MARKET = <TrendingUp className="h-4 w-4" />;
const ICON_ADVISORY = <FileText className="h-4 w-4" />;
const ICON_WEATHER = <Cloud className="h-4 w-4" />;
const ICON_ASSISTANT = <Sparkles className="h-4 w-4" />;
const ICON_NOTIFS = <Bell className="h-4 w-4" />;
const ICON_SETTINGS = <Settings className="h-4 w-4" />;
const ICON_LOGOUT = <LogOut className="h-4 w-4" />;
const ICON_USERS = <Users className="h-4 w-4" />;
const ICON_PROFILE = <User className="h-4 w-4" />;
const ICON_ALERTS = <Bell className="h-4 w-4" />;
const ICON_ALL_PLOTS = <Layers className="h-4 w-4" />;
const ICON_SENSOR_REQUESTS = <Radio className="h-4 w-4" />;
const ICON_SENSOR_CONFIG = <Cpu className="h-4 w-4" />;

interface NavItem {
  name: string;
  path?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavLinkItemProps {
  item: NavItem;
  isSidebarCollapsed: boolean;
  onNavClick: () => void;
  userRole?: string;
}

const NavLinkItem = memo(({ item, isSidebarCollapsed, onNavClick, userRole }: NavLinkItemProps) => {
  const commonClasses = `group relative flex items-center transition-all duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)] rounded-lg ${isSidebarCollapsed ? 'justify-center w-10 h-10 mx-auto p-0' : 'gap-3 py-2 px-3 mx-2'
    }`;

  const isAdmin = userRole === 'ADMIN';
  const activeBg = isAdmin ? 'bg-indigo-50' : 'bg-emerald-50';
  const activeText = isAdmin ? 'text-indigo-700' : 'text-emerald-700';
  const activeShadow = isAdmin ? 'shadow-[0_1px_2px_rgba(79,70,229,0.05)]' : 'shadow-[0_1px_2px_rgba(16,185,129,0.05)]';

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
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
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
        onClick={() => { item.onClick!(); onNavClick(); }}
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
      onClick={onNavClick}
      title={isSidebarCollapsed ? item.name : undefined}
      className={({ isActive }) =>
        `${commonClasses} ${isActive
          ? `${activeBg} ${activeText} font-semibold ${activeShadow}`
          : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
        }`
      }
    >
      {innerContent}
    </NavLink>
  );
});

NavLinkItem.displayName = 'NavLinkItem';

const SPRING = { type: 'spring', stiffness: 400, damping: 35 } as const;

export const Sidebar: React.FC<SidebarProps> = memo(({ mobileOpen, onMobileClose }) => {
  const dispatch = useAppDispatch();

  const userRole = useAppSelector((state) => state.auth.user?.role);
  const userName = useAppSelector((state) => state.auth.user?.name);
  const isSidebarCollapsed = useAppSelector((state) => state.ui.isSidebarCollapsed);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    window.location.href = '/login';
  }, [dispatch]);

  const handleToggleSidebar = useCallback(() => {
    dispatch(toggleSidebarCollapsed());
  }, [dispatch]);

  const handleNavClick = useCallback(() => {
    if (window.innerWidth < 1024) onMobileClose();
  }, [onMobileClose]);

  const settingsPath = userRole === 'ADMIN' ? '/admin/settings' : '/settings';

  // ── navGroups uses stable icon constants, so memo comparison works ──────────
  const navGroups = useMemo((): NavGroup[] => {
    if (userRole === 'ADMIN') {
      return [
        {
          label: 'Overview',
          items: [
            { name: 'Dashboard', path: '/admin/dashboard', icon: ICON_DASHBOARD },
          ],
        },
        {
          label: 'Management',
          items: [
            { name: 'Farmers', path: '/admin/farmers', icon: ICON_USERS },
            { name: 'All Plots', path: '/admin/plots', icon: ICON_ALL_PLOTS },
            { name: 'Sensor Requests', path: '/admin/sensor-requests', icon: ICON_SENSOR_REQUESTS },
            { name: 'Sensor Config', path: '/admin/sensor-config', icon: ICON_SENSOR_CONFIG },
            { name: 'Alerts', path: '/admin/alerts', icon: ICON_ALERTS },
          ],
        },
        {
          label: 'Account',
          items: [
            { name: 'Profile', path: '/admin/profile', icon: ICON_PROFILE },
            { name: 'Settings', path: settingsPath, icon: ICON_SETTINGS },
          ],
        },
      ];
    }
    return [
      {
        label: 'Workspace',
        items: [
          { name: 'Dashboard', path: '/dashboard', icon: ICON_DASHBOARD },
          { name: 'Plots', path: '/plots', icon: ICON_PLOTS },
        ],
      },
      {
        label: 'Analysis',
        items: [
          { name: 'Market', path: '/market', icon: ICON_MARKET },
          { name: 'Advisory', path: '/advisories', icon: ICON_ADVISORY },
          { name: 'Weather', path: '/weather', icon: ICON_WEATHER },
        ],
      },
      {
        label: 'Tools',
        items: [
          { name: 'Assistant', path: '/assistant', icon: ICON_ASSISTANT },
          { name: 'Notifications', path: '/notifications', icon: ICON_NOTIFS },
        ],
      },
      {
        label: 'Account',
        items: [
          { name: 'Settings', path: settingsPath, icon: ICON_SETTINGS },
          { name: 'Logout', icon: ICON_LOGOUT, onClick: handleLogout },
        ],
      },
    ];
  }, [userRole, handleLogout, settingsPath]);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#fcfcfd] border-r border-slate-200/60 relative w-full overflow-hidden">
      <div className="flex-1 overflow-hidden pt-8 space-y-3 flex flex-col">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={SPRING}
                  className="px-6 overflow-hidden whitespace-nowrap"
                >
                  <div className="pb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {group.label}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-0.5 flex flex-col items-stretch">
              {group.items.map((item) => (
                <NavLinkItem
                  key={item.path || item.name}
                  item={item}
                  isSidebarCollapsed={isSidebarCollapsed}
                  onNavClick={handleNavClick}
                  userRole={userRole}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile Card */}
      <div className="p-5 border-t border-slate-100 bg-white/50">
        <div
          className={`group relative flex items-center rounded-xl p-2 transition-all duration-[400ms] ease-[cubic-bezier(0.25,1,0.5,1)] ${isSidebarCollapsed
            ? 'justify-center p-0'
            : 'bg-slate-50/50 border border-slate-200/50 hover:bg-slate-50'
            }`}
        >
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/10">
            {userName?.charAt(0) || 'F'}
          </div>

          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={SPRING}
                className="ml-3 flex-1 overflow-hidden whitespace-nowrap"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 truncate">{userName}</span>
                  <span className="text-[10px] font-medium text-slate-500 tracking-tight">{userRole}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isSidebarCollapsed && (
            <div className="flex items-center gap-1">
              <NavLink
                to={settingsPath}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                title="Settings"
              >
                <Settings size={16} />
              </NavLink>
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
              {userName} (Logout)
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
        transition={SPRING}
        className="hidden lg:flex h-full bg-white flex-shrink-0 relative z-40"
      >
        {sidebarContent}
        <button
          onClick={handleToggleSidebar}
          className="hidden lg:flex absolute -right-3 top-6 w-8 h-8 bg-white/60 backdrop-blur-xl border-2 border-white shadow-xl rounded-full items-center justify-center text-slate-900 z-50 hover:bg-white hover:scale-110 active:scale-95 group transition-all duration-300 ring-4 ring-black/5"
          aria-label={isSidebarCollapsed ? 'Expand' : 'Collapse'}
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={16} strokeWidth={3} className={`transition-colors ${userRole === 'ADMIN' ? 'group-hover:text-indigo-600' : 'group-hover:text-emerald-600'}`} />
          ) : (
            <ChevronLeft size={16} strokeWidth={3} className={`transition-colors ${userRole === 'ADMIN' ? 'group-hover:text-indigo-600' : 'group-hover:text-emerald-600'}`} />
          )}
        </button>
      </motion.aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/20 backdrop-blur-[2px] z-40 transition-opacity duration-300 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';