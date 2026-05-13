import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts';

// ── Auth pages: kept eager — user sees these before any JS loads ──────────────
import { LoginPage } from '@/pages/Auth/LoginPage';
import { SignupPage } from '@/pages/Auth/SignupPage';

import { ProtectedRoute } from './ProtectedRoute';

// ── All page-level components are lazy-loaded ─────────────────────────────────
// Each page is only downloaded when the user first navigates to it.
// IMPORTANT: <Suspense> must NOT be placed inside <Routes> children —
// React Router only allows <Route> or <React.Fragment> as direct children.
// The Suspense boundary lives in DashboardLayout, wrapping the <Outlet>.
const DashboardPage = lazy(() => import('@/pages/Dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const PlotListPage = lazy(() => import('@/pages/Plots/PlotListPage').then(m => ({ default: m.PlotListPage })));
const PlotDetailsPage = lazy(() => import('@/pages/Plots/PlotDetailsPage').then(m => ({ default: m.PlotDetailsPage })));
const AddPlotPage = lazy(() => import('@/pages/Plots/AddPlotPage').then(m => ({ default: m.AddPlotPage })));
const AdvisoryPage = lazy(() => import('@/pages/Advisories/AdvisoryPage').then(m => ({ default: m.AdvisoryPage })));
const NotificationsPage = lazy(() => import('@/pages/Notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const MarketPage = lazy(() => import('@/pages/Market/MarketPage').then(m => ({ default: m.MarketPage })));
const AssistantPage = lazy(() => import('@/pages/Assistant/AssistantPage').then(m => ({ default: m.AssistantPage })));
const SettingsPage = lazy(() => import('@/pages/Settings/SettingsPage').then(m => ({ default: m.SettingsPage })));
const WeatherPage = lazy(() => import('@/pages/Weather/WeatherPage').then(m => ({ default: m.WeatherPage })));

// Admin pages
const AdminDashboardPage = lazy(() => import('@/admin/pages/Overview').then(m => ({ default: m.Overview })));
const FarmersDirectory = lazy(() => import('@/admin/pages/FarmersDirectory').then(m => ({ default: m.FarmersDirectory })));
const AdminAlertsPage = lazy(() => import('@/admin/pages/Alerts').then(m => ({ default: m.Alerts })));
const AdminProfile = lazy(() => import('@/admin/pages/AdminProfile').then(m => ({ default: m.AdminProfile })));
const AdminSettings = lazy(() => import('@/admin/pages/AdminSettings').then(m => ({ default: m.AdminSettings })));
const AllPlotsPage = lazy(() => import('@/admin/pages/AllPlots').then(m => ({ default: m.AllPlots })));
const SensorRequestsPage = lazy(() => import('@/admin/pages/AdminSensorRequestsPage').then(m => ({ default: m.AdminSensorRequestsPage })));
const SensorConfigPage = lazy(() => import('@/admin/pages/SensorConfig').then(m => ({ default: m.SensorConfig })));

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected + Layout
        * ProtectedRoute renders <Outlet /> (stable element, no props).
        * DashboardLayout renders <Outlet /> wrapped in <Suspense> so lazy
        * page chunks show a skeleton while loading — without violating
        * React Router's rule that Route children must be Route elements.
        */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />

          {/* Admin Routes */}
          <Route path="admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="admin/farmers" element={<FarmersDirectory />} />
          <Route path="admin/alerts" element={<AdminAlertsPage />} />
          <Route path="admin/profile" element={<AdminProfile />} />
          <Route path="admin/settings" element={<AdminSettings />} />
          <Route path="admin/plots" element={<AllPlotsPage />} />
          <Route path="admin/sensor-requests" element={<SensorRequestsPage />} />
          <Route path="admin/sensor-config" element={<SensorConfigPage />} />

          {/* Farmer/User Routes */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="plots" element={<PlotListPage />} />
          <Route path="plots/create" element={<AddPlotPage />} />
          <Route path="plots/:id" element={<PlotDetailsPage />} />
          <Route path="plots/:id/edit" element={<AddPlotPage />} />
          <Route path="advisories" element={<AdvisoryPage />} />
          <Route path="weather" element={<WeatherPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="market" element={<MarketPage />} />
          <Route path="assistant" element={<AssistantPage />} />
          <Route path="settings" element={<SettingsPage />}>
            <Route path="profile" element={<SettingsPage />} />
            <Route path="notifications" element={<SettingsPage />} />
            <Route path="security" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};