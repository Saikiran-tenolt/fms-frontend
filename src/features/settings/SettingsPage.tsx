import React from 'react';
import { User, Bell, Shield, Globe } from 'lucide-react';
import { useAppSelector } from '../../hooks';
import { Card } from '../../components/ui';

export const SettingsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your account and preferences
        </p>
      </div>
      
      {/* Profile Section */}
      <Card title="Profile Information">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-primary-700" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-600 capitalize">{user?.role.toLowerCase()}</p>
          </div>
        </div>
      </Card>
      
      {/* Settings Sections */}
      <Card title="Notification Preferences">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-600" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive alerts via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </Card>
      
      <Card title="Privacy & Security">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Change Password</p>
              <p className="text-sm text-gray-600">Update your account password</p>
            </div>
          </div>
        </div>
      </Card>
      
      <Card title="Language & Region">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Language</p>
              <p className="text-sm text-gray-600">English (Default)</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
