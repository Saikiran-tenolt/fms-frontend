import React, { useState, useCallback, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/navigation/Navbar';
import { Sidebar } from '@/components/navigation/Sidebar';
import { SkeletonDashboard } from '@/components/loaders/Skeleton';

export const DashboardLayout: React.FC = React.memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = useCallback(() => setMobileMenuOpen(prev => !prev), []);
  const handleMobileClose = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <Navbar onMobileMenuToggle={handleMobileMenuToggle} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={handleMobileClose} />

        {/* FIX 6: Removed the constraining max-w-7xl wrapper div.
            Previously DashboardLayout wrapped <Outlet /> in:
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            This created a double-padding conflict: DashboardLayout applied
            padding AND DashboardPage applied its own p-[22px] px-6 inside.
            The outer constraint also capped DashboardPage's flex-1 min-h-screen,
            causing layout recalculations on every render.
            Now each page owns its own padding/width — no layout thrash. */}
        <main className="flex-1 overflow-y-auto bg-[#f5f5f3]">
          <Suspense fallback={<SkeletonDashboard />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';
