import React, { useState } from 'react';
import { User as UserIcon, Bell, Shield, Pencil, Loader2, Save, X, MapPin, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { updateUser } from '../auth/authSlice';
import { Card, Button } from '../../components/ui';
import authService from '../../services/authService';

export const SettingsPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    village: user?.permanentLocation?.village || '',
    block: user?.permanentLocation?.block || '',
    district: user?.permanentLocation?.district || '',
    state: user?.permanentLocation?.state || '',
  });

  const handleSave = async () => {
    if (!editForm.name) return toast.error('Name is required');

    setIsLoading(true);
    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        permanentLocation: {
          village: editForm.village,
          block: editForm.block,
          district: editForm.district,
          state: editForm.state
        }
      };

      const response = await authService.updateProfile(payload);

      if (response.success) {
        dispatch(updateUser(response.user));
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditForm({
      name: user?.name || '',
      email: user?.email || '',
      village: user?.permanentLocation?.village || '',
      block: user?.permanentLocation?.block || '',
      district: user?.permanentLocation?.district || '',
      state: user?.permanentLocation?.state || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 font-['Inter']">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 font-medium">Manage your farmer identity and system preferences</p>
      </div>

      {/* Main Profile Card */}
      <Card className="overflow-hidden border-slate-200/60 shadow-sm">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-emerald-600" />
              Farmer Profile
            </h2>
            {!isEditing && (
              <Button
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="flex gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold text-xs uppercase tracking-widest px-4 py-2"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all font-medium text-slate-900"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 italic">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-4 w-4 text-emerald-500" />
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Farm Location Details</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(['village', 'block', 'district', 'state'] as const).map((field) => (
                    <div key={field} className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">{field}</label>
                      <input
                        type="text"
                        value={editForm[field]}
                        onChange={(e) => setEditForm(prev => ({ ...prev, [field]: e.target.value }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-700"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
                <Button
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-slate-600 font-bold uppercase text-[11px] tracking-widest flex gap-2"
                >
                  <X className="h-4 w-4" /> Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold shadow-xl active:scale-95 transition-all flex gap-2"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
                <div className="h-28 w-28 bg-white border-4 border-slate-50 ring-2 ring-emerald-500/10 rounded-full flex items-center justify-center relative shadow-xl overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                  <UserIcon className="h-12 w-12 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                  <div className="absolute bottom-2 right-2 bg-emerald-500 h-4 w-4 rounded-full border-2 border-white shadow-lg shadow-emerald-200" />
                </div>
                <div className="text-center md:text-left pt-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{user?.name}</h3>
                  <p className="text-slate-500 font-bold text-sm tracking-wide mt-1">{user?.email || 'No email provided'}</p>
                  {user?.phone && (
                    <p className="text-slate-400 font-mono text-sm tracking-wide mt-0.5">+91 {user.phone}</p>
                  )}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                    <span className="inline-flex items-center px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] border border-slate-100 rounded-full">
                      ID: {user?.id?.slice(-8) || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100/60 backdrop-blur-sm">
                {[
                  { label: 'Village', value: user?.permanentLocation?.village, icon: MapPin },
                  { label: 'Block', value: user?.permanentLocation?.block },
                  { label: 'District', value: user?.permanentLocation?.district },
                  { label: 'State', value: user?.permanentLocation?.state }
                ].map((item) => (
                  <div key={item.label} className="group">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2 group-hover:text-emerald-600 transition-colors">{item.label}</p>
                    <p className="text-base font-black text-slate-800 tracking-tight">{item.value || (
                      <span className="text-slate-300 italic font-medium">Not set</span>
                    )}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Auxiliary Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Notifications" className="border-slate-200/40">
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                  <Bell className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Push Alerts</p>
                  <p className="text-[10px] font-medium text-slate-400">Sensor & weather warnings</p>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Privacy & Security" className="border-slate-200/40">
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:border-emerald-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:bg-emerald-50 transition-colors">
                  <Shield className="h-5 w-5 text-slate-400 group-hover:text-emerald-500" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Secure Access</p>
                  <p className="text-[10px] font-medium text-slate-400">Manage login sessions</p>
                </div>
              </div>
              <ChevronLeft className="h-4 w-4 text-slate-300 rotate-180" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const ChevronLeft = ({ className, ...props }: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
)