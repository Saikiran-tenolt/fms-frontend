import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Sprout, MapPin, Calendar, Droplets, Thermometer, Wind, 
  CloudRain, MessageSquare, TrendingUp, Image as ImageIcon, ExternalLink, 
  Clock, AlertCircle, ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

import { useAppSelector, useAppDispatch } from '../../hooks';
import { setSensorData, setTrendData } from '../sensors/sensorsSlice';
import { generateMockSensorData, generateMockTrendData, mockAlerts } from '../../services/mockData';
import { EmptyState, Loader } from '../../components/ui';

export const PlotDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plots } = useAppSelector((state) => state.plots);
  const { sensorData, trendData } = useAppSelector((state) => state.sensors);
  const [loading, setLoading] = useState(true);
  
  const plot = plots.find((p) => p.plotId === id);
  const currentSensors = id ? sensorData[id] : null;
  
  const soilMoistureTrend = id ? trendData[`${id}_soilMoisture`] : [];
  const temperatureTrend = id ? trendData[`${id}_temperature`] : [];
  
  const plotAlerts = mockAlerts.filter(alert => alert.plotId === id);
  
  useEffect(() => {
    if (plot) {
      loadPlotData();
    }
  }, [plot]);
  
  const loadPlotData = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    if (plot) {
      const sensors = generateMockSensorData(plot.plotId, plot.environmentType);
      dispatch(setSensorData({ plotId: plot.plotId, data: sensors }));
      dispatch(setTrendData({ plotId: plot.plotId, sensor: 'soilMoisture', data: generateMockTrendData() }));
      dispatch(setTrendData({ plotId: plot.plotId, sensor: 'temperature', data: generateMockTrendData() }));
    }
    
    setLoading(false);
  };
  
  if (!plot) {
    return (
      <EmptyState
        icon={<MapPin className="h-16 w-16" />}
        title="Plot not found"
        description="The plot you're looking for doesn't exist."
        action={{
          label: 'Back to Plots',
          onClick: () => navigate('/plots'),
        }}
      />
    );
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader size="lg" text="Loading plot data..." />
      </div>
    );
  }

  const lat = plot.location.latitude;
  const lon = plot.location.longitude;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  
  const createdDate = new Date(plot.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="w-full font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-12">
      {/* Plot Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-6">
          <motion.button 
            whileHover={{ x: -4 }}
            onClick={() => navigate('/plots')}
            className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </motion.button>
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">{plot.plotName}</h2>
            <p className="text-slate-400 font-medium mt-1">Real-time monitoring & predictive analytics</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate(`/plots/${plot.plotId}/edit`)} className="px-6 py-3 bg-white border border-slate-100 rounded-2xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap">Edit Plot</button>
          <button className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 whitespace-nowrap">Generate Report</button>
        </div>
      </section>

      {/* Plot Info Card - Refined */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-12 relative overflow-hidden mb-8"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600"></div>
        
        <div className="lg:col-span-4 aspect-square lg:aspect-auto h-full min-h-[300px] bg-emerald-50/20 rounded-[2.5rem] flex items-center justify-center border border-emerald-100/20 relative overflow-hidden group shadow-inner">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          {plot.imageUrl ? (
            <img src={plot.imageUrl} alt={plot.plotName} className="w-full h-full object-cover rounded-[2.5rem]" />
          ) : (
            <Sprout className="w-24 h-24 text-emerald-300 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 drop-shadow-2xl" />
          )}
        </div>
        
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-y-12 gap-x-10">
          <InfoItem label="Plot Identity" value={plot.plotName} />
          <InfoItem label="Primary Crop" value={plot.cropType} icon={Sprout} />
          <InfoItem label="Soil Composition" value={plot.soilType} />
          <InfoItem 
            label="Environment" 
            value={plot.environmentType === 'OPEN_FIELD' ? 'Open Field' : 'Indoor/Greenhouse'} 
            badge 
            badgeIcon={Sprout}
          />
          <div className="sm:col-span-2">
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em]">Location & Geospatial Data</span>
              <motion.a 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                href={mapsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-[2rem] bg-slate-50/50 border border-slate-200/50 hover:bg-emerald-50 hover:border-emerald-300/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-500 group/loc"
              >
                <div className="p-3 bg-white w-12 h-12 flex items-center justify-center rounded-2xl shadow-sm text-emerald-600 group-hover/loc:bg-emerald-600 group-hover/loc:text-white group-hover/loc:rotate-12 transition-all duration-500">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <span className="text-xl font-display font-bold text-slate-900 tracking-tight block">Lat: {lat.toFixed(4)}, Lon: {lon.toFixed(4)}</span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2 mt-0.5">
                    Open in Google Maps <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/loc:text-emerald-600 group-hover/loc:border-emerald-200 transition-all sm:ml-auto">
                  <TrendingUp className="w-4 h-4 rotate-45" />
                </div>
              </motion.a>
            </div>
          </div>
          <InfoItem label="Registration Date" value={createdDate} icon={Calendar} />
        </div>
      </motion.section>


      {/* Sensor Readings - Bento Grid Style */}
      <section className="space-y-8 mb-12">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-display font-bold text-slate-900">Live Telemetry</h3>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Last updated: Just now</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {currentSensors?.soilMoisture && (
            <SensorCard 
              label="Soil Moisture" 
              value={`${currentSensors.soilMoisture.value}%`} 
              status={currentSensors.soilMoisture.status === 'ok' ? 'OK' : 'WARNING'} 
              icon={Droplets} 
              color="blue" 
            />
          )}
          {currentSensors?.temperature && (
            <SensorCard 
              label="Temperature" 
              value={`${currentSensors.temperature.value}°C`} 
              status={currentSensors.temperature.status === 'ok' ? 'OK' : 'WARNING'} 
              icon={Thermometer} 
              color="red" 
            />
          )}
          {currentSensors?.humidity && (
            <SensorCard 
              label="Humidity" 
              value={`${currentSensors.humidity.value}%`} 
              status={currentSensors.humidity.status === 'ok' ? 'OK' : 'WARNING'} 
              icon={Wind} 
              color="emerald" 
            />
          )}
          {currentSensors?.soilTemperature && (
            <SensorCard 
              label="Soil Temp" 
              value={`${currentSensors.soilTemperature.value}°C`} 
              status={currentSensors.soilTemperature.status === 'ok' ? 'OK' : 'WARNING'} 
              icon={Thermometer} 
              color="orange" 
            />
          )}
          {plot.environmentType === 'OPEN_FIELD' && currentSensors?.rainfall && (
            <SensorCard 
              label="Rainfall" 
              value={`${currentSensors.rainfall.value} mm`} 
              status={currentSensors.rainfall.status === 'ok' ? 'OK' : 'WARNING'} 
              icon={CloudRain} 
              color="indigo" 
            />
          )}
          {plot.environmentType === 'INDOOR' && currentSensors?.co2 && (
            <SensorCard 
              label="CO2 Level" 
              value={`${currentSensors.co2.value}`} 
              status={currentSensors.co2.status === 'ok' ? 'OK' : 'WARNING'} 
              icon={Wind} 
              color="purple" 
            />
          )}
        </div>
      </section>

      {/* Historical Trends - Area Charts */}
      <section className="space-y-8 mb-12">
        <h3 className="text-2xl font-display font-bold text-slate-900">Analytics & Trends</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TrendChart title="Moisture Levels (7D)" data={soilMoistureTrend} color="#10B981" />
          <TrendChart title="Temperature Profile (7D)" data={temperatureTrend} color="#EF4444" />
        </div>
      </section>

      {/* Active Alerts - High Visibility */}
      {plotAlerts.length > 0 && (
        <section className="space-y-8 mb-12">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-display font-bold text-slate-900">Critical Alerts</h3>
            <div className="flex items-center gap-2 text-red-500 font-bold text-[10px] uppercase tracking-widest animate-pulse">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Live Monitoring Active
            </div>
          </div>
          
          <div className="space-y-6">
            {plotAlerts.map(alert => (
              <motion.div 
                key={alert.id}
                whileHover={{ scale: 1.005, y: -4 }}
                className="bg-white border border-red-100 rounded-[2.5rem] p-6 sm:p-10 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group shadow-sm hover:shadow-2xl hover:shadow-red-500/5 transition-all duration-500"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/[0.02] rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-red-500/[0.05] transition-colors duration-700"></div>
                
                <div className="p-6 bg-red-50 text-red-600 rounded-3xl shadow-inner relative flex-shrink-0">
                  <AlertCircle className="w-10 h-10 animate-bounce-slow" />
                  {alert.severity === 'high' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                    <h4 className="text-2xl font-display font-bold text-slate-900">{alert.title}</h4>
                    <span className={`px-4 py-1 self-start text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-lg ${alert.severity === 'high' ? 'bg-red-600 shadow-red-600/20' : 'bg-amber-500 shadow-amber-500/20'}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">{alert.message}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 pt-6 border-t border-slate-50 gap-4">
                    <div className="flex items-center gap-6">
                      <span className="text-slate-400 text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <Clock className="w-4 h-4" /> {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <button className="px-6 py-2.5 text-red-600 text-[11px] font-bold uppercase tracking-widest hover:bg-red-50 rounded-xl transition-colors border border-red-100">Ignore</button>
                      <button className="px-8 py-2.5 bg-red-600 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">Acknowledge</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions - High End Cards */}
      <section className="space-y-8">
        <h3 className="text-2xl font-display font-bold text-slate-900">Management Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ActionCard 
            title="Smart Assistant" 
            description="AI-driven crop optimization advice" 
            icon={MessageSquare} 
            color="blue" 
            onClick={() => navigate('/assistant')}
          />
          <ActionCard 
            title="Market Intelligence" 
            description="Real-time crop pricing and forecasts" 
            icon={TrendingUp} 
            color="emerald" 
            onClick={() => navigate('/market')}
          />
          <ActionCard 
            title="Crop Diagnostics" 
            description="Upload images for disease detection" 
            icon={ImageIcon} 
            color="purple" 
            onClick={() => navigate('/assistant')}
          />
        </div>
      </section>
    </div>
  );
};

function InfoItem({ label, value, icon: Icon, badge = false, badgeIcon: BadgeIcon }: any) {
  return (
    <div className="space-y-2">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</span>
      <div className="flex items-center gap-3">
        {Icon && <div className="p-2 bg-emerald-50 rounded-xl"><Icon className="w-4 h-4 text-emerald-600" /></div>}
        {badge ? (
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100/50 text-xs font-bold shadow-sm">
            {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
            {value}
          </div>
        ) : (
          <span className="text-xl font-display font-bold text-slate-900 tracking-tight">{value}</span>
        )}
      </div>
    </div>
  );
}

function SensorCard({ label, value, status, icon: Icon, color }: any) {
  const colorMap: any = {
    blue: 'text-blue-600 bg-blue-50/50 border-blue-100/50',
    red: 'text-red-600 bg-red-50/50 border-red-100/50',
    emerald: 'text-emerald-600 bg-emerald-50/50 border-emerald-100/50',
    orange: 'text-orange-600 bg-orange-50/50 border-orange-100/50',
    indigo: 'text-indigo-600 bg-indigo-50/50 border-indigo-100/50',
    purple: 'text-purple-600 bg-purple-50/50 border-purple-100/50',
  };

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="p-8 rounded-[2.5rem] border border-slate-100/80 bg-white shadow-sm hover:shadow-xl hover:shadow-slate-200/20 transition-all duration-500 group"
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`p-3 rounded-2xl ${colorMap[color] || colorMap.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`w-2 h-2 rounded-full ${status === 'OK' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
      </div>
      <div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-2">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-display font-bold text-slate-900 tracking-tighter">{value}</span>
        </div>
      </div>
    </motion.div>
  );
}

function TrendChart({ title, data, color }: any) {
  return (
    <div className="premium-card p-6 sm:p-10 space-y-8">
      <div className="flex items-center justify-between">
        <h4 className="font-display font-bold text-slate-900 text-xl">{title}</h4>
        <select className="bg-slate-50 border-none rounded-xl text-[10px] font-bold uppercase tracking-widest px-4 py-2 focus:ring-2 focus:ring-emerald-500/20 outline-none">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }}
              dx={-15}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '20px', 
                border: 'none', 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '12px 16px'
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={4} 
              fillOpacity={1} 
              fill={`url(#color${color.replace('#', '')})`}
              dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ActionCard({ title, description, icon: Icon, color, onClick }: any) {
  const colorMap: any = {
    blue: 'text-blue-600 bg-blue-50/50 border-blue-100/50',
    emerald: 'text-emerald-600 bg-emerald-50/50 border-emerald-100/50',
    purple: 'text-purple-600 bg-purple-50/50 border-purple-100/50',
  };

  return (
    <motion.div 
      whileHover={{ y: -12, scale: 1.02 }}
      onClick={onClick}
      className="premium-card p-10 flex flex-col items-center text-center gap-8 cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/[0.02] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className={`p-7 rounded-[2.5rem] border transition-all duration-700 group-hover:rotate-6 group-hover:shadow-2xl ${colorMap[color] || colorMap.blue}`}>
        <Icon className="w-10 h-10" />
      </div>
      
      <div className="space-y-3">
        <h4 className="font-display font-bold text-slate-900 text-2xl tracking-tight group-hover:text-emerald-600 transition-colors">{title}</h4>
        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[200px]">{description}</p>
      </div>
      
      <div className="pt-6 border-t border-slate-50 w-full flex items-center justify-center gap-3 text-emerald-600 text-[10px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
        Launch Module <ArrowRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
}
