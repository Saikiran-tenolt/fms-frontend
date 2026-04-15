import { Card } from '../../components/ui/Card';
import { Users, Map, Radio, Activity, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { harvestReadinessData, soilMoistureData, recentFarmersData, farmerCountByDistrict, paddyCultivationStats } from '../data/mockData';

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
          <div className="h-[300px] mt-4 w-full">
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
          <div className="h-[300px] mt-4 w-full relative">
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

      {/* Regional & Cultivation Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Farmer Demographics */}
        <Card title="Farmer Count by District" className="flex flex-col shadow-sm border-slate-200">
          <div className="h-[350px] mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={farmerCountByDistrict} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f8fafc'}} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="farmers" name="Registered Farmers" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24}>
                  {farmerCountByDistrict.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        {/* Paddy Cultivation Growth */}
        <Card title="Paddy Cultivation Area (Acres)" className="flex flex-col shadow-sm border-slate-200">
          <div className="h-[350px] mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={paddyCultivationStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={['dataMin - 500', 'auto']} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="area" name="Total Acres" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorArea)" />
              </AreaChart>
            </ResponsiveContainer>
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
