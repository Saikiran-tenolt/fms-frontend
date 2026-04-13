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
  AlertTriangle,
  MapPin,
  Maximize,
  Brain,
  ChevronDown,
  CloudRain,
  Loader2,
  CheckCircle2,
  Clock,
  Activity,
  Leaf
} from 'lucide-react';
import { motion } from 'framer-motion';
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
  const { sensorData } = useAppSelector((state: any) => state.sensors);
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

      // Fetch real weather using user's pincode
      if (user?.pincode) {
        dispatch(fetchWeatherAndAdvisories(user.pincode) as any);
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
      {/* Hero */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black tracking-widest uppercase rounded">Signal Locked</span>
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">Updated 2 mins ago</h3>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">
            {selectedPlot?.plotName} / <span className="text-emerald-600">{selectedPlot?.cropType}</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
            Precision monitoring active across the field. Current vegetative stage indicates optimal progress.
          </p>
          <div className="flex items-center gap-8 mt-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Atmosphere</span>
              <div className="flex items-center gap-2 text-slate-900 font-black">
                {realWeather ? (
                  <>
                    <img src={`https://openweathermap.org/img/wn/${realWeather.weather[0].icon}.png`} alt="weather" className="w-8 h-8" />
                    <span className="text-2xl">{Math.round(realWeather.main.temp)}°C</span>
                  </>
                ) : (
                  <>
                    <CloudRain className="w-5 h-5 text-blue-500" />
                    <span className="text-2xl">{weather?.temperature}°C</span>
                  </>
                )}
              </div>
            </div>
            <div className="h-10 w-px bg-slate-100 hidden xs:block"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Deployment Unit</span>
              <div className="relative inline-block">
                <select
                  value={selectedPlotId || ''}
                  onChange={(e) => dispatch(selectPlot(e.target.value))}
                  className="appearance-none flex items-center gap-2 pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 hover:bg-white hover:border-emerald-200 transition-all cursor-pointer outline-none shadow-sm uppercase tracking-tight"
                >
                  {plots.map((plot: any) => (
                    <option key={plot._id} value={plot._id}>
                      {plot.plotName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 flex flex-wrap gap-3 lg:justify-end">
          {currentSensors?.soilMoisture?.status && currentSensors.soilMoisture.status !== 'ok' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-xs font-black uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4" />
              Critical: Soil
            </div>
          )}
        </div>
      </section>

      {/* Map View */}
      <section className="rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-xl h-[400px] relative group">
        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="Field sat" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnEG46wjKTwfzJsI-5SiCNM3CtwZcMgI9qZUVzYUX1kKN0HjBXhYsfMRLt07pXnsIdyoX0lB0gxXsGqEyTUuZJMbMGHUNN6hLvGMRBAq_jJgDIqxgz-1jvincfTDkyjISLRky4LyV_bG12Hj8enTNsfYx8-qyabGe3kZxvNbCBahUpE_XHOd_24ddgYpkNm7TWPJJbOCA60Y5IfRApDLi1-PfcbhllbinCqAVlwMdK5fxEjctrxe6vhH-XGimOMZXRtKk4paKLxq8d" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
          <div className="text-white">
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-80 mb-2 font-black">NDVI Analytics Feed</p>
            <h4 className="text-4xl font-black tracking-tighter uppercase">Geospatial Overlay</h4>
          </div>
          <button className="bg-white/10 backdrop-blur-xl border border-white/20 text-white p-4 rounded-2xl hover:bg-white/20 transition-all shadow-lg hover:scale-110">
            <Maximize className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full my-6">
        {metrics.map((m) => {
          const Icon = m.icon;
          const borderClass = m.colorClass === 'rose' ? 'border-l-rose-500' : m.colorClass === 'emerald' ? 'border-l-emerald-500' : 'border-l-blue-500';
          const badgeClass = m.colorClass === 'rose' ? 'bg-rose-50 text-rose-700' : m.colorClass === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700';
          // const fillClass = m.colorClass === 'rose' ? 'bg-rose-500' : m.colorClass === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500';

          return (
            <div key={m.id} className={`relative bg-white border border-slate-200 border-l-[4px] ${borderClass} rounded-2xl p-6 shadow-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-[160px] flex flex-col justify-between group`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors">
                     <Icon size={16} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.label}</span>
                </div>
              </div>

              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{m.value}</span>
                <span className="text-xl font-bold text-slate-400">{m.unit}</span>
              </div>

              <div className="mt-4">
                <div className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${badgeClass}`}>
                  {m.statusLabel}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Advisory */}
      {latestAdvisory && (
        <section className="bg-emerald-950 p-10 sm:p-14 rounded-[3rem] relative overflow-hidden shadow-2xl group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
          <motion.div 
             animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
             transition={{ duration: 15, repeat: Infinity }}
             className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" 
          />
          <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-grow space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-900/50 text-emerald-400 rounded-full text-[10px] font-black tracking-widest uppercase border border-white/5">
                <Brain className="w-4 h-4" />
                Intelligence Feed
              </div>
              <h2 className="text-white text-4xl sm:text-5xl font-black tracking-tighter leading-tight uppercase">
                {latestAdvisory.title}
              </h2>
              <p className="text-emerald-100/60 max-w-xl text-lg font-medium leading-relaxed">
                {latestAdvisory.description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <button
                disabled={executingAdvisoryId === latestAdvisory.id}
                onClick={() => {
                  setExecutingAdvisoryId(latestAdvisory.id);
                  toast('Initializing Command Feed...', { duration: 2000 });
                  setTimeout(() => {
                    toast.success('Sequence Optimized & Deployed.');
                    setExecutingAdvisoryId(null);
                    navigate('/advisories');
                  }, 2500);
                }}
                className={`px-10 py-5 ${executingAdvisoryId === latestAdvisory.id
                    ? 'bg-emerald-900 text-emerald-400 cursor-wait'
                    : 'bg-emerald-400 text-emerald-950 hover:bg-white hover:-translate-y-1'
                  } font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95`}
              >
                {executingAdvisoryId === latestAdvisory.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Execute Optimization
                    <Droplets size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Secondary Panels */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Health History</h3>
                <p className="text-xs text-slate-400 font-medium">Sat-link crop vitality verification log.</p>
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 flex flex-col gap-8 shadow-sm">
            <div className="flex gap-6 relative">
              <div className="absolute left-[21px] top-10 bottom-[-32px] w-0.5 bg-slate-50"></div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-xl shadow-emerald-600/5">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="pt-1">
                <h4 className="font-black text-slate-900 text-base tracking-tight uppercase leading-none">Harvest Ready Unit Identified</h4>
                <p className="text-xs text-slate-500 font-medium mt-1.5">NDVI Signature: 0.98 Peak • Region B4</p>
                <div className="mt-2.5 px-3 py-1 bg-slate-50 rounded-lg inline-block text-[9px] font-black text-slate-400 uppercase tracking-widest">TS: 2D AGO</div>
              </div>
            </div>

            <div className="flex gap-6 relative">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-xl shadow-blue-600/5">
                <Activity className="w-5 h-5" />
              </div>
              <div className="pt-1">
                <h4 className="font-black text-slate-900 text-base tracking-tight uppercase leading-none">Biosphere Normalization</h4>
                <p className="text-xs text-slate-500 font-medium mt-1.5">Optimal progress maintained across deployment.</p>
                <div className="mt-2.5 px-3 py-1 bg-slate-50 rounded-lg inline-block text-[9px] font-black text-slate-400 uppercase tracking-widest">TS: 1W AGO</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Deployment Log</h3>
                <p className="text-xs text-slate-400 font-medium">Automated system optimization events.</p>
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-8 flex items-center justify-between gap-4 bg-emerald-50/20">
              <div className="flex items-center gap-6">
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-lg shadow-emerald-600/10">
                  <CheckCircle2 size={24} className="text-emerald-700" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight opacity-50 line-through">Precision Irrigation (Main)</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Status: Optimized Execution • 05:30 AM</p>
                </div>
              </div>
            </div>

            <div className="p-8 flex items-center justify-between gap-4 border-t border-slate-50">
              <div className="flex items-center gap-6">
                <div className="w-11 h-11 rounded-2xl bg-white border-2 border-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                  <Clock size={24} className="text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm uppercase tracking-tight">System Refresh Cycle</h4>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Status: Scheduled • 06:00 PM Today</p>
                </div>
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};