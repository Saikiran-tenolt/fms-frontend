import { Card } from '../../components/ui/Card';
import { Shield, Bell, Database, Sliders } from 'lucide-react';

export function AdminSettings() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-sm text-slate-500 mt-1">Configure block-level parameters and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-1 space-y-2">
           <button className="w-full flex items-center gap-3 px-4 py-3 bg-white text-emerald-700 font-semibold rounded-xl border-l-4 border-emerald-600 shadow-sm border-t border-r border-b border-slate-100 transition-all text-sm">
             <Sliders className="w-4 h-4" />
             General Preferences
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all text-sm border border-transparent">
             <Bell className="w-4 h-4 text-slate-400" />
             Notification Rules
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all text-sm border border-transparent">
             <Shield className="w-4 h-4 text-slate-400" />
             Security & Access
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all text-sm border border-transparent">
             <Database className="w-4 h-4 text-slate-400" />
             Data Management
           </button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card title="General Preferences" className="shadow-sm border-slate-200">
             <div className="space-y-6 mt-4">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                   <div>
                     <p className="font-semibold text-slate-800 text-sm">Language Preference</p>
                     <p className="text-xs text-slate-500 mt-1">Select the primary language for the portal interface.</p>
                   </div>
                   <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 font-medium cursor-pointer">
                     <option>English (UK)</option>
                     <option>Telugu</option>
                     <option>Hindi</option>
                   </select>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                   <div>
                     <p className="font-semibold text-slate-800 text-sm">Timezone Setup</p>
                     <p className="text-xs text-slate-500 mt-1">Configure local timezone for accurate data timestamps.</p>
                   </div>
                   <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700 font-medium cursor-pointer">
                     <option>IST (UTC+05:30)</option>
                   </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                   <div>
                     <p className="font-semibold text-slate-800 text-sm">Offline Mode Sync</p>
                     <p className="text-xs text-slate-500 mt-1">Automatically download block payload for offline field visits.</p>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                   </label>
                </div>
             </div>
             
             <div className="mt-8 pt-5 border-t border-slate-100 flex justify-end gap-3">
               <button className="px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                 Discard Changes
               </button>
               <button className="px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-white bg-emerald-600 shadow-md shadow-emerald-500/20 rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer">
                 Save Settings
               </button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
