import React from 'react';
import { Card } from '../../components/ui/Card';
import { Users, Map, Radio, Activity, TrendingUp } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

// --- ADMIN PORTAL MOCK DATA ---
const harvestData = [
  { name: 'North Block', ready: 400, notReady: 240, daysRemaining: 12 },
  { name: 'South Block', ready: 300, notReady: 139, daysRemaining: 8 },
  { name: 'East Block', ready: 200, notReady: 980, daysRemaining: 25 },
  { name: 'West Block', ready: 278, notReady: 390, daysRemaining: 15 },
  { name: 'Central', ready: 189, notReady: 480, daysRemaining: 18 },
];

const moistureData = [
  { day: 'Mon', avgMoisture: 45, target: 50 },
  { day: 'Tue', avgMoisture: 42, target: 50 },
  { day: 'Wed', avgMoisture: 38, target: 50 },
  { day: 'Thu', avgMoisture: 55, target: 50 },
  { day: 'Fri', avgMoisture: 60, target: 50 },
  { day: 'Sat', avgMoisture: 52, target: 50 },
  { day: 'Sun', avgMoisture: 48, target: 50 },
];

const sensorStatusData = [
  { id: 'SEN-001', block: 'North Block', crop: 'Paddy', status: 'OK', moisture: '48%', lastUpdated: '10 mins ago' },
  { id: 'SEN-002', block: 'South Block', crop: 'Wheat', status: 'Low', moisture: '22%', lastUpdated: '5 mins ago' },
  { id: 'SEN-003', block: 'East Block', crop: 'Paddy', status: 'High', moisture: '75%', lastUpdated: '12 mins ago' },
  { id: 'SEN-004', block: 'West Block', crop: 'Corn', status: 'OK', moisture: '51%', lastUpdated: '2 mins ago' },
  { id: 'SEN-005', block: 'Central', crop: 'Paddy', status: 'OK', moisture: '45%', lastUpdated: 'Just now' },
];

export function Overview() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-manrope">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Farmers</p>
              <h4 className="text-2xl font-bold text-gray-900">24,592</h4>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" /> +12% this month
              </p>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Map className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Cultivated Area</p>
              <h4 className="text-2xl font-bold text-gray-900">12,450 Ha</h4>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" /> +5% this season
              </p>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Radio className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Sensors</p>
              <h4 className="text-2xl font-bold text-gray-900">8,942</h4>
              <p className="text-xs text-gray-500 flex items-center mt-1">
                98% uptime rate
              </p>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-rose-100 rounded-lg">
              <Activity className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Critical Alerts</p>
              <h4 className="text-2xl font-bold text-gray-900">14</h4>
              <p className="text-xs text-rose-600 flex items-center mt-1">Requires immediate action</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card title="Harvest Readiness Statistics" className="flex flex-col shadow-sm border-slate-200">
          <div className="flex-1 min-h-[300px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={harvestData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="ready" name="Ready for Harvest" stackId="a" fill="#16a34a" radius={[0, 0, 4, 4]} />
                <Bar dataKey="notReady" name="Not Ready" stackId="a" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Line Chart */}
        <Card title="Average Soil Moisture Trends (Weekly)" className="flex flex-col shadow-sm border-slate-200">
          <div className="flex-1 min-h-[300px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moistureData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="avgMoisture" name="Avg Moisture (%)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="target" name="Target Optimal (%)" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Data Table */}
      <Card title="Live Sensor Feeds" className="shadow-sm border-slate-200">
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Sensor ID</th>
                <th scope="col" className="px-6 py-3">Block</th>
                <th scope="col" className="px-6 py-3">Crop</th>
                <th scope="col" className="px-6 py-3">Moisture</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {sensorStatusData.map((sensor, idx) => (
                <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{sensor.id}</td>
                  <td className="px-6 py-4">{sensor.block}</td>
                  <td className="px-6 py-4">{sensor.crop}</td>
                  <td className="px-6 py-4 font-bold">{sensor.moisture}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${sensor.status === 'OK' ? 'bg-emerald-100 text-emerald-700' : sensor.status === 'Low' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {sensor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{sensor.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
