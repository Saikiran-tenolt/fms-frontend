import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { setSensorData, setTrendData } from '../sensors/sensorsSlice';
import { setAdvisories, fetchWeatherAndAdvisories } from '../advisories/advisoriesSlice';
import { EmptyState, SkeletonCard, SkeletonChart } from '../../components/ui';
import { toast } from 'sonner';
import {
  Droplets,
  Thermometer,
  Cloud,
  Radio,
  MapPin,
  Maximize,
  Brain,
  ChevronDown,
  CloudRain,
  Loader2,
  Activity,
  Droplet,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  generateMockSensorData,
  generateMockTrendData,
  generateMockWeather,
  mockAdvisories,
} from '../../services/mockData';
import { selectPlot, fetchAllPlots } from '../plots/plotsSlice';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plots, selectedPlotId, loading: plotsLoading } = useAppSelector((state: any) => state.plots);
  const { sensorData, trendData } = useAppSelector((state: any) => state.sensors);
  const { notifications } = useAppSelector((state: any) => state.notifications);
  const { user } = useAppSelector((state: any) => state.auth);
  const { weatherData: realWeather, advisories } = useAppSelector((state: any) => state.advisories);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);
  const [executingAdvisoryId, setExecutingAdvisoryId] = useState<string | null>(null);
  const hasShownNotifications = useRef(false);

  useEffect(() => {
    if (plots.length === 0 && !plotsLoading) {
      dispatch(fetchAllPlots());
    }
  }, [dispatch, plots.length, plotsLoading]);

  useEffect(() => {
    if (!loading && notifications.length > 0 && !hasShownNotifications.current) {
      const unread = notifications.filter((n: any) => !n.isRead);
      if (unread.length > 0) {
        unread.forEach((n: any, index: number) => {
          setTimeout(() => {
            toast(n.title, {
              description: n.message,
              duration: 5000,
            });
          }, index * 500);
        });
        hasShownNotifications.current = true;
      }
    }
  }, [loading, notifications]);

  const selectedPlot = plots.find((p: any) => p._id === selectedPlotId);

  useEffect(() => {
    if (plots.length > 0 && selectedPlotId) {
      loadDashboardData();
    }
  }, [selectedPlotId, plots.length]);

  const loadDashboardData = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (selectedPlot) {
      const sensors = generateMockSensorData(selectedPlot._id, selectedPlot.environmentType);
      dispatch(setSensorData({ plotId: selectedPlot._id, data: sensors }));
      dispatch(setTrendData({ plotId: selectedPlot._id, sensor: 'soilMoisture', data: generateMockTrendData() }));
      dispatch(setTrendData({ plotId: selectedPlot._id, sensor: 'temperature', data: generateMockTrendData() }));
      dispatch(setTrendData({ plotId: selectedPlot._id, sensor: 'humidity', data: generateMockTrendData() }));
      dispatch(setTrendData({ plotId: selectedPlot._id, sensor: 'soilTemperature', data: generateMockTrendData() }));

      // Fetch weather based on plot coordinates
      const loc = selectedPlot.location as any;
      const lat = loc.coordinates?.coordinates?.[1] ?? loc.lat;
      const lon = loc.coordinates?.coordinates?.[0] ?? loc.lng;

      if (lat !== undefined && lon !== undefined) {
        dispatch(fetchWeatherAndAdvisories({ lat, lon }) as any);
      } else if (user?.pincode) {
        dispatch(fetchWeatherAndAdvisories({ pincode: user.pincode }) as any);
      } else {
        setWeather(generateMockWeather(selectedPlot._id));
      }

      dispatch(setAdvisories(mockAdvisories));
    }

    setLoading(false);
  };

  if (plotsLoading && plots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 gap-4">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Establishing Satellite Uplink...</p>
      </div>
    );
  }

  if (plots.length === 0) {
    return (
      <EmptyState
        icon={<MapPin className="h-20 w-20" />}
        title="No units identified"
        description="Add your first geospatial unit to start monitoring your assets and receive real-time intelligence."
        action={{
          label: 'Deploy First Unit',
          onClick: () => navigate('/plots/create'),
        }}
      />
    );
  }

  const currentSensors = selectedPlotId ? sensorData[selectedPlotId] : null;
  const latestAdvisory = advisories[0];

  const getMetrics = () => {
    if (!currentSensors) return [];

    return [
      {
        id: 'moisture',
        label: 'Soil Moisture',
        value: currentSensors.soilMoisture?.value || 0,
        unit: '%',
        icon: Droplets,
        timestamp: 'Just now',
        status: (currentSensors.soilMoisture?.value || 0) < 30 ? 'critical' : (currentSensors.soilMoisture?.value || 0) <= 70 ? 'optimal' : 'normal',
        statusLabel: (currentSensors.soilMoisture?.value || 0) < 30 ? 'Needs Watering' : (currentSensors.soilMoisture?.value || 0) <= 70 ? 'Optimal' : 'Normal',
        colorClass: (currentSensors.soilMoisture?.value || 0) < 30 ? 'rose' : (currentSensors.soilMoisture?.value || 0) <= 70 ? 'emerald' : 'blue',
      },
      {
        id: 'temp',
        label: 'Temperature',
        value: currentSensors.temperature?.value || 0,
        unit: '°C',
        icon: Thermometer,
        timestamp: '2 mins ago',
        status: (currentSensors.temperature?.value || 0) >= 18 && (currentSensors.temperature?.value || 0) <= 28 ? 'optimal' : 'normal',
        statusLabel: (currentSensors.temperature?.value || 0) >= 18 && (currentSensors.temperature?.value || 0) <= 28 ? 'Optimal' : 'Normal',
        colorClass: (currentSensors.temperature?.value || 0) >= 18 && (currentSensors.temperature?.value || 0) <= 28 ? 'emerald' : 'blue',
      },
      {
        id: 'humidity',
        label: 'Humidity',
        value: currentSensors.humidity?.value || 0,
        unit: '%',
        icon: Cloud,
        timestamp: 'Just now',
        status: (currentSensors.humidity?.value || 0) >= 40 && (currentSensors.humidity?.value || 0) <= 70 ? 'normal' : 'optimal',
        statusLabel: (currentSensors.humidity?.value || 0) >= 40 && (currentSensors.humidity?.value || 0) <= 70 ? 'Normal' : 'Optimal',
        colorClass: (currentSensors.humidity?.value || 0) >= 40 && (currentSensors.humidity?.value || 0) <= 70 ? 'blue' : 'emerald',
      },
      {
        id: 'soil-temp',
        label: 'Soil Temp',
        value: currentSensors.soilTemperature?.value || 0,
        unit: '°C',
        icon: Radio,
        timestamp: '5 mins ago',
        status: (currentSensors.soilTemperature?.value || 0) >= 18 && (currentSensors.soilTemperature?.value || 0) <= 26 ? 'optimal' : 'normal',
        statusLabel: (currentSensors.soilTemperature?.value || 0) >= 18 && (currentSensors.soilTemperature?.value || 0) <= 26 ? 'Optimal' : 'Normal',
        colorClass: (currentSensors.soilTemperature?.value || 0) >= 18 && (currentSensors.soilTemperature?.value || 0) <= 26 ? 'emerald' : 'blue',
      }
    ];
  };

  const metrics = getMetrics();

  if (loading) {
    return (
      <div className="px-8 max-w-7xl mx-auto space-y-12 mt-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 max-w-7xl mx-auto space-y-12 mt-8 pb-20 font-inter">
      {/* section: Matured Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100/50 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">System Active</span>
            </div>
            <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
              Refreshed: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
              {selectedPlot?.plotName}
              <span className="block text-2xl lg:text-3xl text-slate-400 font-medium mt-1">
                Prime <span className="text-emerald-600/80 italic font-semibold">{selectedPlot?.cropType}</span> Sector
              </span>
            </h1>
            {selectedPlot?.location && (
              <div className="flex items-center gap-2 text-slate-500">
                <div className="p-1.5 bg-slate-100 rounded-lg">
                  <MapPin size={14} className="text-slate-600" />
                </div>
                <p className="text-sm font-semibold tracking-tight">
                  {selectedPlot.location.district}, {selectedPlot.location.state}
                </p>
              </div>
            )}
          </div>

          <p className="text-slate-600 text-lg font-medium max-w-2xl leading-relaxed">
            Real-time geospatial analytics and sensor telemetry for 
            <span className="text-slate-900 font-bold mx-1">{selectedPlot?.plotName}</span>. 
            Automated monitoring is currently optimizing for climate-specific yield variables.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-4">
            <div className="flex items-center gap-4 bg-white p-3 pr-6 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                 {realWeather ? (
                    <img src={`https://openweathermap.org/img/wn/${realWeather.weather[0].icon}.png`} alt="weather" className="w-10 h-10 object-contain" />
                 ) : <CloudRain size={24} />}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Local Climate</span>
                <span className="text-2xl font-bold text-slate-900 leading-none">
                  {realWeather ? Math.round(realWeather.main.temp) : weather?.temperature}°C
                </span>
              </div>
            </div>

            <div className="h-12 w-px bg-slate-200 hidden sm:block" />

            <div className="flex flex-col min-w-[200px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Switch Deployment</span>
              <div className="relative group">
                <select
                  value={selectedPlotId || ''}
                  onChange={(e) => dispatch(selectPlot(e.target.value))}
                  className="w-full appearance-none pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all cursor-pointer outline-none"
                >
                  {plots.map((plot: any) => (
                    <option key={plot._id} value={plot._id}>
                      {plot.plotName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-3 lg:items-end">
          <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg shadow-emerald-600/20 w-full max-w-sm">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Activity size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Health Index</span>
             </div>
             <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">94</span>
                <span className="text-xl font-medium opacity-60">/100</span>
             </div>
             <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[94%]" />
             </div>
          </div>
        </div>
      </section>

      {/* section: Polished Map View */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Geospatial Topology</h3>
            <p className="text-xs text-slate-400 font-medium">Sat-link NDVI vegetative coverage analysis.</p>
          </div>
        </div>
        <div className="rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200 shadow-sm h-[400px] relative group">
          <img 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" 
            alt="Field sat" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnEG46wjKTwfzJsI-5SiCNM3CtwZcMgI9qZUVzYUX1kKN0HjBXhYsfMRLt07pXnsIdyoX0lB0gxXsGqEyTUuZJMbMGHUNN6hLvGMRBAq_jJgDIqxgz-1jvincfTDkyjISLRky4LyV_bG12Hj8enTNsfYx8-qyabGe3kZxvNbCBahUpE_XHOd_24ddgYpkNm7TWPJJbOCA60Y5IfRApDLi1-PfcbhllbinCqAVlwMdK5fxEjctrxe6vhH-XGimOMZXRtKk4paKLxq8d" 
            referrerPolicy="no-referrer" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />
          
          {/* Glass Controls */}
          <div className="absolute top-6 left-6 flex flex-col gap-2">
             <div className="px-3 py-1.5 bg-white/60 backdrop-blur-md border border-white/40 rounded-xl shadow-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-bold text-slate-900 uppercase">Live Feed</span>
             </div>
          </div>

          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
            <div className="text-white drop-shadow-md">
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-90 mb-1 font-bold">Spectral Analysis</p>
              <h4 className="text-3xl font-bold tracking-tight">Sector Coverage</h4>
            </div>
            <button className="bg-white/80 backdrop-blur-xl border border-white text-slate-900 p-4 rounded-2xl hover:bg-white transition-all shadow-xl hover:scale-110 active:scale-95 group">
              <Maximize className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
            </button>
          </div>
        </div>
      </section>

      {/* section: Matured Metrics Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Sensor Network
            <span className="text-xs font-medium text-slate-400 ml-2">Real-time Data</span>
          </h2>
          <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest underline underline-offset-4 decoration-2">Calibration History</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m) => {
            const Icon = m.icon;
            
            const styles = {
              rose: {
                iconContainer: 'bg-rose-50 text-rose-600 group-hover:bg-rose-600',
                badge: 'bg-rose-50 text-rose-700 border-rose-100',
                progress: 'bg-rose-500'
              },
              emerald: {
                iconContainer: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600',
                badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                progress: 'bg-emerald-500'
              },
              blue: {
                iconContainer: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600',
                badge: 'bg-blue-50 text-blue-700 border-blue-100',
                progress: 'bg-blue-500'
              }
            }[m.colorClass as 'rose' | 'emerald' | 'blue'];
            
            return (
              <motion.div 
                key={m.id}
                whileHover={{ y: -4 }}
                className="group relative bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-xl ${styles.iconContainer} group-hover:text-white transition-all duration-300`}>
                     <Icon size={20} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${styles.badge} border`}>
                      {m.statusLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium">{m.timestamp}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900 tracking-tight">{m.value}</span>
                    <span className="text-lg font-bold text-slate-400">{m.unit}</span>
                  </div>
                </div>
                
                {/* Subtle Progress Bar */}
                <div className="mt-4 h-1 bg-slate-50 rounded-full overflow-hidden">
                   <div 
                    className={`h-full ${styles.progress} transition-all duration-1000`} 
                    style={{ width: `${m.value}%` }}
                   />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* section: Intelligence Advisory Overlay */}
      {latestAdvisory && (
        <section className="relative group">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 sm:p-14 overflow-hidden relative shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50/50 rounded-full -mr-48 -mt-48 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
              <div className="flex-grow space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-3 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold tracking-widest uppercase border border-emerald-100/50">
                  <Brain className="w-4 h-4" />
                  AI Optimization Feed
                </div>
                <h2 className="text-slate-900 text-4xl font-bold tracking-tight leading-tight">
                  {latestAdvisory.title}
                </h2>
                <p className="text-slate-500 max-w-xl text-lg font-medium leading-relaxed">
                  {latestAdvisory.description}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <button
                  disabled={executingAdvisoryId === latestAdvisory.id}
                  onClick={() => {
                    setExecutingAdvisoryId(latestAdvisory.id);
                    toast('Linking Command Protocol...', { icon: <Activity className="text-emerald-500" /> });
                    setTimeout(() => {
                      toast.success('Sequence Optimized & Dispatched');
                      setExecutingAdvisoryId(null);
                      navigate('/advisories');
                    }, 2000);
                  }}
                  className={`px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 ${
                    executingAdvisoryId === latestAdvisory.id
                      ? 'bg-slate-100 text-slate-400 cursor-wait'
                      : 'bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-emerald-600/20'
                  }`}
                >
                  {executingAdvisoryId === latestAdvisory.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Execute Command
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* section: Soil Moisture Trend Chart */}
      {selectedPlotId && trendData[`${selectedPlotId}_soilMoisture`]?.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Soil Moisture Trend</h2>
              <p className="text-xs text-slate-400 font-medium">7-day saturation index from IoT sensor network.</p>
            </div>
            <button
              onClick={() => navigate('/plots')}
              className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest"
            >
              View Plots <ArrowRight size={13} />
            </button>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData[`${selectedPlotId}_soilMoisture`]}>
                  <defs>
                    <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} dy={12} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }} dx={-8} domain={[0, 100]} unit="%" />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Soil Moisture']}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px -8px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 700, padding: '12px 16px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#moistureGradient)" dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t border-slate-50">
              {[{ label: 'Critical', color: 'bg-rose-500', range: '< 30%' }, { label: 'Optimal', color: 'bg-emerald-500', range: '30–70%' }, { label: 'High', color: 'bg-blue-500', range: '> 70%' }].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l.label} {l.range}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* section: Irrigation Advisory */}
      {currentSensors && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Irrigation Advisory</h2>
              <p className="text-xs text-slate-400 font-medium">Real-time recommendation based on soil moisture + weather.</p>
            </div>
          </div>
          {(() => {
            const moisture = currentSensors.soilMoisture?.value || 0;
            const isRaining = (realWeather?.weather[0]?.main || '').toLowerCase().includes('rain');
            const shouldWater = moisture < 40 && !isRaining;
            const windowStart = shouldWater ? '05:30 AM' : '—';
            const windowEnd = shouldWater ? '07:30 AM' : '—';
            return (
              <div className={`rounded-3xl border-2 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 ${
                shouldWater
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-emerald-50 border-emerald-200'
              }`}>
                <div className="flex items-center gap-6">
                  <div className={`p-5 rounded-2xl shadow-lg ${
                    shouldWater ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    <Droplet size={28} />
                  </div>
                  <div className="space-y-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      shouldWater ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        shouldWater ? 'bg-blue-500' : 'bg-emerald-500'
                      }`} />
                      Smart Irrigation
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                      {shouldWater ? '💧 Water Now' : '✅ Wait — No Irrigation Needed'}
                    </h3>
                    <p className="text-slate-600 font-medium text-sm">
                      {shouldWater
                        ? `Soil moisture at ${moisture}% — below optimal threshold. ${isRaining ? '' : 'No rain expected.'}`
                        : isRaining
                          ? `Rain detected in area. Natural precipitation is sufficient (${moisture}% moisture).`
                          : `Soil moisture at ${moisture}% — within optimal range. Next check in 6 hours.`
                      }
                    </p>
                  </div>
                </div>
                {shouldWater && (
                  <div className="flex-shrink-0 text-center bg-white rounded-2xl border border-blue-200 p-6 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2">Suggested Window</p>
                    <p className="text-2xl font-black text-slate-900">{windowStart}</p>
                    <p className="text-xs text-slate-400 font-bold">to {windowEnd}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2">Apply 25mm</p>
                  </div>
                )}
              </div>
            );
          })()}
        </section>
      )}


    </div>
  );
};