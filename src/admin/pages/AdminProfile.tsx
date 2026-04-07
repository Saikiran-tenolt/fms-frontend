
import { Card } from '../../components/ui/Card';
import { User, Mail, Shield, MapPin, Building2, Phone } from 'lucide-react';
import { useAppSelector } from '../../hooks';

export function AdminProfile() {
  const { user } = useAppSelector((state: any) => state.auth);

  // Fallbacks for profile fields that might not be in the redux store yet
  const fullName = user?.name || 'Admin User';
  const govEmail = user?.email || 'admin.user@gov.in';
  const roleName = user?.role === 'ADMIN' ? 'Block Agricultural Officer' : 'System Administrator';
  const assignedBlock = user?.block || 'Block A (North District)';
  const phone = user?.phone || '+91 98765 43210';
  const department = 'Department of Agriculture & Farmers Welfare';

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Profile</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your official credentials and view your assigned jurisdiction.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Left Column - ID Card Style */}
        <div className="md:col-span-1">
          <Card className="shadow-lg shadow-slate-200/40 border-slate-200 relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-600 to-emerald-800"></div>
            <div className="relative pt-12 pb-6 px-6 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md mb-4">
                <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-emerald-700 text-3xl font-bold">
                  {fullName.charAt(0)}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center">{fullName}</h3>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-1 mb-4 text-center">{roleName}</p>
              
              <div className="w-full bg-emerald-50 rounded-xl p-4 border border-emerald-100/50 mt-2 shadow-inner">
                 <p className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-wider text-center mb-1">Assigned Jurisdiction</p>
                 <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-bold text-center">
                    <MapPin className="w-4 h-4" />
                    {assignedBlock}
                 </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="md:col-span-2 space-y-6">
          <Card title="Official Information" className="shadow-sm border-slate-200">
            <div className="space-y-6 mt-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100/80 flex items-center justify-center shrink-0 border border-slate-200/50">
                   <User className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Full Name</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{fullName}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100/80 flex items-center justify-center shrink-0 border border-slate-200/50">
                   <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gov Email Address</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{govEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100/80 flex items-center justify-center shrink-0 border border-slate-200/50">
                   <Phone className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Contact Number</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100/80 flex items-center justify-center shrink-0 border border-slate-200/50">
                   <Shield className="w-5 h-5 text-slate-500" />
                </div>
                <div className="flex-1 border-b border-slate-100 pb-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Role</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{roleName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100/50">
                   <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-emerald-600/70 uppercase tracking-wider">Department</p>
                  <p className="font-bold text-emerald-800 mt-0.5">{department}</p>
                </div>
              </div>

            </div>
          </Card>
          
          <div className="flex justify-end gap-3">
             <button className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-colors">
               Change Password
             </button>
             <button className="px-5 py-2.5 text-[11px] font-bold uppercase tracking-widest text-white bg-slate-900 shadow-lg shadow-slate-900/20 rounded-xl hover:bg-slate-800 transition-all">
               Edit Profile
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
