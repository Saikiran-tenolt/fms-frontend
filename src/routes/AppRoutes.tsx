import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout';
import { LoginPage } from '../features/auth/LoginPage';
import { SignupPage } from '../features/auth/SignupPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { PlotListPage } from '../features/plots/PlotListPage';
import { PlotDetailsPage } from '../features/plots/PlotDetailsPage';
import { AddPlotPage } from '../features/plots/AddPlotPage';
import { AdvisoryPage } from '../features/advisories/AdvisoryPage';
import { NotificationsPage } from '../features/notifications/NotificationsPage';
import { MarketPage } from '../features/market/MarketPage';
import { AssistantPage } from '../features/assistant/AssistantPage';
import { SettingsPage } from '../features/settings/SettingsPage';

// Admin Pages
import { Overview as AdminDashboardPage } from '../admin/pages/Overview';
import { FarmersDirectory } from '../admin/pages/FarmersDirectory';
import { Alerts as AdminAlertsPage } from '../admin/pages/Alerts';
import { AdminProfile } from '../admin/pages/AdminProfile';
import { AdminSettings } from '../admin/pages/AdminSettings';

import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/login" replace />} />
        
        {/* Admin Routes */}
        <Route path="admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="admin/farmers" element={<FarmersDirectory />} />
        <Route path="admin/alerts" element={<AdminAlertsPage />} />
        <Route path="admin/profile" element={<AdminProfile />} />
        <Route path="admin/settings" element={<AdminSettings />} />
        
        {/* Farmer/User Routes */}
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="plots" element={<PlotListPage />} />
        <Route path="plots/create" element={<AddPlotPage />} />
        <Route path="plots/:id" element={<PlotDetailsPage />} />
        <Route path="plots/:id/edit" element={<AddPlotPage />} />
        <Route path="advisories" element={<AdvisoryPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="market" element={<MarketPage />} />
        <Route path="assistant" element={<AssistantPage />} />
        <Route path="settings" element={<SettingsPage />}>
          <Route path="profile" element={<SettingsPage />} />
          <Route path="notifications" element={<SettingsPage />} />
          <Route path="security" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
