import React from 'react';
import { User as UserIcon, Bell, Shield, Globe, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '../../hooks';
import { Card, Button } from '../../components/ui';

export const SettingsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    location: {
      village: user?.permanentLocation?.village || '',
      block: user?.permanentLocation?.block || '',
      district: user?.permanentLocation?.district || '',
      state: user?.permanentLocation?.state || '',
    }
  });

  const handleSave = () => {
    // In a real app, this would dispatch an API call
    console.log('Saving profile:', editForm);
    toast.success('Profile saved successfully!');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      location: {
        village: user?.permanentLocation?.village || '',
        block: user?.permanentLocation?.block || '',
        district: user?.permanentLocation?.district || '',
        state: user?.permanentLocation?.state || '',
      }
    });
    setIsEditing(false);
  };

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
      <Card
        title="Profile Information"
        action={!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-emerald-500"
            title="Edit Profile"
          >
            <Pencil className="text-blackh-4 w-4" />
          </button>
        )}
      >
        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Farm Location</p>
              <div className="grid grid-cols-2 gap-4">
                {['village', 'block', 'district', 'state'].map((field) => (
                  <div key={field}>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{field}</label>
                    <input
                      type="text"
                      value={(editForm.location as any)[field]}
                      onChange={(e) => setEditForm({
                        ...editForm,
                        location: { ...editForm.location, [field]: e.target.value }
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={handleCancel} className="text-slate-500">Cancel</Button>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6">Save Changes</Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-6 mb-8">
              <div className="h-20 w-20 bg-emerald-50 border-2 border-emerald-100 rounded-full flex items-center justify-center relative shadow-inner">
                <UserIcon className="h-10 w-10 text-emerald-600" />
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-emerald-200 shadow-sm">
                  <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{editForm.name}</h3>
                <p className="text-slate-500 font-medium">{editForm.email}</p>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider">
                  {user?.role}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-5 bg-slate-50 rounded-2xl border border-slate-100">
              {[
                { label: 'Village', value: editForm.location.village || 'Not Set' },
                { label: 'Block', value: editForm.location.block || 'Not Set' },
                { label: 'District', value: editForm.location.district || 'Not Set' },
                { label: 'State', value: editForm.location.state || 'Not Set' }
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{item.label}</p>
                  <p className="text-sm font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
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
              <input 
                type="checkbox" 
                className="sr-only peer" 
                defaultChecked 
                onChange={(e) => {
                  if (e.target.checked) {
                    toast.success('Email notifications enabled');
                  } else {
                    toast.info('Email notifications disabled');
                  }
                }}
              />
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