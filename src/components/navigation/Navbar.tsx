import React, { memo } from 'react';
import { Bell, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/hooks';
import { Badge } from '../common/Badge';

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

// ── WHY React.memo + Link instead of useNavigate ──────────────────────────────
// useNavigate() subscribes to React Router's NavigationContext. Every route
// change updates that context → Navbar re-rendered on every navigation even
// though its own props never change. Replacing navigate() calls with <Link>
// components removes that subscription entirely. React.memo then ensures
// Navbar only re-renders when onMobileMenuToggle or unreadCount actually
// changes — not on every route transition.
export const Navbar: React.FC<NavbarProps> = memo(({ onMobileMenuToggle }) => {
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);
  const appMode = import.meta.env.VITE_APP_MODE;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 sm:px-8 py-2.5 sticky top-0 z-30 transition-all duration-300">
      <div className="w-full flex items-center justify-between">
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

          <div className="flex items-center gap-3">
            <h1 className="text-sm sm:text-lg font-black tracking-tighter text-slate-900 uppercase">
              Farm Monitoring <span className="text-emerald-600">System</span>
            </h1>
            {appMode === 'simulation' && (
              <Badge variant="info" size="sm" className="hidden sm:inline-flex scale-[0.85] origin-left">
                Mode: Simulation
              </Badge>
            )}
          </div>
        </div>

        {/* Right side - Notifications + User avatar */}
        <div className="flex items-center gap-3">
          {/* Notifications — Link avoids useNavigate router subscription */}
          <Link
            to="/notifications"
            className="relative w-10 h-10 rounded-xl flex items-center justify-center text-black hover:bg-slate-50 transition-all active:scale-95"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            )}
          </Link>

          {/* User menu — Link avoids useNavigate router subscription */}
          <Link
            to="/settings"
            className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors p-1 rounded-xl group"
          >
            <div className="h-7 w-7 bg-[#3b6d11] rounded-full flex flex-col items-center justify-end overflow-hidden shadow-sm ring-2 ring-transparent group-hover:ring-emerald-100 group-hover:bg-[#2c520d] transition-all">
              <div className="w-2.5 h-2.5 bg-white rounded-full mb-0.5 shrink-0" />
              <div className="w-[18px] h-[9px] bg-white rounded-t-full shrink-0" />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
});

Navbar.displayName = 'Navbar';

