import React, { useState, useCallback, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { SkeletonDashboard } from '../ui';

export const DashboardLayout: React.FC = React.memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = useCallback(() => setMobileMenuOpen(prev => !prev), []);
  const handleMobileClose = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* Navbar */}
      <Navbar onMobileMenuToggle={handleMobileMenuToggle} />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={handleMobileClose} />

        {/* Page content — Suspense here catches lazy-loaded page chunks.
            This is the correct location: Navbar + Sidebar stay visible
            while the page chunk downloads, showing only the content area
            as a skeleton. Placing Suspense inside <Routes> is forbidden
            by React Router (only Route/Fragment allowed as children). */}
        <main className="flex-1 overflow-y-auto bg-[#f5f5f3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-[#f5f5f3]">
            <Suspense fallback={<SkeletonDashboard />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';