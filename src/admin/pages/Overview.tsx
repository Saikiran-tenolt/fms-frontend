
import { Card } from '../../components/ui/Card';
import { Users, Map, Radio, Activity, TrendingUp, AlertTriangle, SignalHigh, MapPin, Cog, BatteryWarning, Droplet } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { harvestReadinessData, soilMoistureData, recentFarmersData } from '../data/mockData';
import { mockAlerts } from '../../services/mockData';

export function Overview() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100/50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Farmers</p>
              <h4 className="text-2xl font-bold text-slate-900">4,285</h4>
              <p className="text-xs text-emerald-600 flex items-center mt-1 font-medium">
                <TrendingUp className="h-3 w-3 mr-1" /> +12 this week
              </p>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-100/50 rounded-lg">
              <Map className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Paddy Cultivation Area</p>
              <h4 className="text-2xl font-bold text-slate-900">12,450 Acres</h4>
              <p className="text-xs text-emerald-600 flex items-center mt-1 font-medium">
                <TrendingUp className="h-3 w-3 mr-1" /> +5% this season
              </p>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100/50 rounded-lg">
              <Radio className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Sensor Status (Online)</p>
              <h4 className="text-2xl font-bold text-slate-900">98.5%</h4>
              <p className="text-xs text-slate-500 flex items-center mt-1 font-medium">
                1,420 Active Sensors
              </p>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100/50 rounded-lg">
              <Activity className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Harvest Readiness</p>
              <h4 className="text-2xl font-bold text-slate-900">350 Farms</h4>
              <p className="text-xs text-amber-600 flex items-center mt-1 font-medium">Ready within 14 days</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card title="Harvest Readiness Statistics" className="flex flex-col shadow-sm border-slate-200">
          <div className="flex-1 min-h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={harvestReadinessData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f8fafc'}} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="ready" name="Ready" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="approaching" name="Approaching" stackId="a" fill="#3b82f6" />
                <Bar dataKey="notReady" name="Not Ready" stackId="a" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Doughnut Chart */}
        <Card title="Soil Moisture Sensor Status" className="flex flex-col shadow-sm border-slate-200">
          <div className="flex-1 min-h-[300px] mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} verticalAlign="bottom" />
                <Pie
                  data={soilMoistureData}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {soilMoistureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center text for Doughnut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
               <span className="text-3xl font-bold text-slate-900">100%</span>
               <span className="text-xs text-slate-500 font-medium">Coverage</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Infrastructure & Geography */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Geospatial Hotspot Map */}
        <Card title="Geospatial Impact Map (Sector Blocks)" className="flex flex-col shadow-sm border-slate-200">
          <div className="mt-4 flex-1 bg-slate-50 border border-slate-200 rounded-xl p-6 relative overflow-hidden flex flex-col justify-center min-h-[350px]">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
            
            <div className="grid grid-cols-3 gap-2 w-full max-w-[300px] mx-auto z-10">
              {/* Sector 1 - Healthy */}
              <div className="bg-emerald-100/80 border border-emerald-300 rounded-lg aspect-square flex flex-col items-center justify-center p-2 relative group hover:scale-105 transition-transform cursor-crosshair">
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <MapPin className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-[10px] font-bold text-emerald-800 tracking-wider">SEC-1</span>
              </div>
              
              {/* Sector 2 - Drought Warning */}
              <div className="bg-rose-100/80 border border-rose-300 rounded-lg aspect-square flex flex-col items-center justify-center p-2 relative group hover:scale-105 transition-transform cursor-crosshair">
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></div>
                <Droplet className="w-5 h-5 text-rose-600 mb-1 opacity-50" />
                <span className="text-[10px] font-bold text-rose-800 tracking-wider">SEC-2</span>
              </div>

              {/* Sector 3 - Healthy */}
              <div className="bg-emerald-100/80 border border-emerald-300 rounded-lg aspect-square flex flex-col items-center justify-center p-2 relative group hover:scale-105 transition-transform cursor-crosshair">
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500"></div>
                <MapPin className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-[10px] font-bold text-emerald-800 tracking-wider">SEC-3</span>
              </div>

              {/* Sector 4 - Pest Warning */}
              <div className="bg-amber-100/80 border border-amber-300 rounded-lg aspect-square flex flex-col items-center justify-center p-2 relative group hover:scale-105 transition-transform cursor-crosshair">
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <AlertTriangle className="w-5 h-5 text-amber-600 mb-1" />
                <span className="text-[10px] font-bold text-amber-800 tracking-wider">SEC-4</span>
              </div>

              {/* Sector 5 - Neutral / No Data */}
              <div className="bg-slate-200/80 border border-slate-300 rounded-lg aspect-square flex flex-col items-center justify-center p-2 relative group hover:scale-105 transition-transform cursor-not-allowed grayscale">
                <SignalHigh className="w-5 h-5 text-slate-400 mb-1 opacity-50" />
                <span className="text-[10px] font-bold text-slate-500 tracking-wider">SEC-5</span>
              </div>

              {/* Sector 6 - Healthy */}
              <div className="bg-emerald-100/80 border border-emerald-300 rounded-lg aspect-square flex flex-col items-center justify-center p-2 relative group hover:scale-105 transition-transform cursor-crosshair">
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <MapPin className="w-5 h-5 text-emerald-600 mb-1" />
                <span className="text-[10px] font-bold text-emerald-800 tracking-wider">SEC-6</span>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-6 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-slate-200 mx-auto w-max shadow-sm">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[10px] font-bold text-slate-600 uppercase">Optimal</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div><span className="text-[10px] font-bold text-slate-600 uppercase">Drought Risk</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-[10px] font-bold text-slate-600 uppercase">Pest Alert</span></div>
            </div>
          </div>
        </Card>
        
        {/* System Logs */}
        <Card title="Infrastructure Event Log" className="flex flex-col shadow-sm border-slate-200">
          <div className="mt-4 flex-1 bg-white rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden h-[350px] overflow-y-auto">
            {mockAlerts.map((alert) => (
              <div key={alert.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                    {alert.severity === 'critical' ? (
                       <BatteryWarning className="w-5 h-5 text-red-500" />
                    ) : (
                       <Cog className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{alert.title}</h4>
                    <p className="text-[11px] font-medium text-slate-500">{alert.message} • {alert.plotId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Priority</p>
                    <p className={`text-[11px] font-bold ${alert.severity === 'critical' ? 'text-red-500' : 'text-amber-600'}`}>
                      {alert.severity === 'critical' ? 'P0' : 'P1'}
                    </p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-slate-700">
                    Dispatch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

      </div>
      
      {/* Recent Activity Table */}
      <Card title="Recent Farmer Registrations" className="shadow-sm border-slate-200">
        <div className="overflow-x-auto mt-4 rounded-xl border border-slate-100">
          <table className="w-full text-sm text-left font-medium text-slate-500">
            <thead className="text-[11px] text-slate-400 uppercase bg-slate-50/50 tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Farmer Name</th>
                <th scope="col" className="px-6 py-4 font-semibold">Village</th>
                <th scope="col" className="px-6 py-4 font-semibold">Farm Size</th>
                <th scope="col" className="px-6 py-4 font-semibold">Crop Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentFarmersData.map((farmer) => (
                <tr key={farmer.id} className="bg-white hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">{farmer.name}</td>
                  <td className="px-6 py-4">{farmer.village}</td>
                  <td className="px-6 py-4">{farmer.farmSize}</td>
                  <td className="px-6 py-4 text-slate-700">{farmer.cropType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
