
import { Card } from '../../components/ui/Card';
import { Bell, AlertTriangle, ShieldCheck } from 'lucide-react';
import { sensorStatusData } from '../data/mockData';

export function Alerts() {
  const criticalCount = sensorStatusData.filter(s => s.status !== 'OK').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Alerts</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor critical alerts and sensor status anomalies across the block.</p>
        </div>
        {criticalCount === 0 ? (
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100/50 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            All Systems Normal
          </div>
         ) : (
          <div className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-full border border-red-100/50 shadow-sm">
            <AlertTriangle className="w-4 h-4" />
            {criticalCount} Critical Alerts
          </div>
         )}
      </div>

      <Card className="shadow-sm border-slate-200">
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm text-left font-medium text-slate-500">
            <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/50 tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Sensor ID</th>
                <th scope="col" className="px-6 py-4 font-semibold">Block Location</th>
                <th scope="col" className="px-6 py-4 font-semibold">Crop</th>
                <th scope="col" className="px-6 py-4 font-semibold">Moisture</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 font-semibold">Last Updated</th>
                <th scope="col" className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sensorStatusData.map((sensor, idx) => (
                <tr key={idx} className="bg-white hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <Bell className={`w-4 h-4 ${sensor.status === 'OK' ? 'text-slate-300' : sensor.status === 'Low' ? 'text-amber-500' : 'text-red-500'}`} />
                       {sensor.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">{sensor.block}</td>
                  <td className="px-6 py-4">{sensor.crop}</td>
                  <td className="px-6 py-4 font-bold text-slate-700">{sensor.moisture}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        sensor.status === 'OK' ? 'bg-emerald-100/50 text-emerald-700 border border-emerald-200/50' : 
                        sensor.status === 'Low' ? 'bg-amber-100/50 text-amber-700 border border-amber-200/50' : 
                        'bg-red-100/50 text-red-700 border border-red-200/50'
                      }`}>
                        {sensor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">{sensor.lastUpdated}</td>
                  <td className="px-6 py-4 text-right">
                    {sensor.status !== 'OK' && (
                       <button className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                          Resolve
                       </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
