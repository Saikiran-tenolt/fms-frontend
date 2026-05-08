import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks';

// ── WHY THIS CHANGED ──────────────────────────────────────────────────────────
//
// OLD pattern (children prop):
//   <ProtectedRoute><DashboardLayout /></ProtectedRoute>
//
// Every navigation updates Location.Provider → AppRoutes re-renders →
// a brand-new <DashboardLayout /> JSX element is created inline →
// passed as `children` to ProtectedRoute → ProtectedRoute also re-renders
// (because useLocation() subscribes to Location.Provider) →
// returns <>{children}</> with a NEW children reference →
// React.memo on DashboardLayout is bypassed → DashboardLayout re-renders.
// This caused "What caused this update? → DashboardLayout" on every navigation.
//
// NEW pattern (Outlet):
//   ProtectedRoute renders <Outlet /> directly.
//   DashboardLayout is declared as a sibling route element in AppRoutes,
//   not passed as children. React Router manages the Outlet subtree — it
//   does NOT recreate the DashboardLayout element on every navigation.
//   ProtectedRoute still re-renders on location change (unavoidable since
//   it uses useLocation), but it now returns <Outlet /> — a stable element
//   with no changing props — so React bails out of re-rendering DashboardLayout.

export const ProtectedRoute: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};