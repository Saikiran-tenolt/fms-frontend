import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { setSensorData, setTrendData } from '../sensors/sensorsSlice';
import { setAdvisories } from '../advisories/advisoriesSlice';
import { EmptyState, SkeletonCard, SkeletonChart } from '../../components/ui';
import { toast } from 'sonner';
import {
  Droplets,
  Thermometer,
  Cloud,
  Radio,
  AlertTriangle,
  MapPin,
  IndianRupee,
  MessageSquare,
  Image as ImageIcon,
  Maximize,
  Brain,
  ChevronDown,
  CloudRain,
  Loader2,
  Leaf,
  CalendarClock,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  generateMockSensorData,
  generateMockTrendData,
  generateMockWeather,
  mockAdvisories,
} from '../../services/mockData';
import { selectPlot } from '../plots/plotsSlice';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plots, selectedPlotId } = useAppSelector((state: any) => state.plots);
  const { sensorData } = useAppSelector((state: any) => state.sensors);
  const { notifications } = useAppSelector((state: any) => state.notifications);
  const { advisories } = useAppSelector((state: any) => state.advisories);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);
  const [executingAdvisoryId, setExecutingAdvisoryId] = useState<string | null>(null);
  const hasShownNotifications = useRef(false);

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

  const selectedPlot = plots.find((p: any) => p.plotId === selectedPlotId);

  useEffect(() => {
    if (plots.length > 0 && selectedPlotId) {
      loadDashboardData();
    }
  }, [selectedPlotId, plots.length]);

  const loadDashboardData = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (selectedPlot) {
      const sensors = generateMockSensorData(selectedPlot.plotId, selectedPlot.environmentType);
      dispatch(setSensorData({ plotId: selectedPlot.plotId, data: sensors }));
      dispatch(setTrendData({ plotId: selectedPlot.plotId, sensor: 'soilMoisture', data: generateMockTrendData() }));
      dispatch(setTrendData({ plotId: selectedPlot.plotId, sensor: 'temperature', data: generateMockTrendData() }));
      dispatch(setTrendData({ plotId: selectedPlot.plotId, sensor: 'humidity', data: generateMockTrendData() }));
      dispatch(setTrendData({ plotId: selectedPlot.plotId, sensor: 'soilTemperature', data: generateMockTrendData() }));
      setWeather(generateMockWeather(selectedPlot.plotId));
      dispatch(setAdvisories(mockAdvisories));
    }

    setLoading(false);
  };

  if (plots.length === 0) {
    return (
      <EmptyState
        icon={<MapPin className="h-20 w-20" />}
        title="No plots found"
        description="Add your first plot to start monitoring your farm and get real-time insights."
        action={{
          label: 'Add Your First Plot',
          onClick: () => navigate('/plots/create'),
        }}
      />
    );
  }

  const currentSensors = selectedPlotId ? sensorData[selectedPlotId] : null;
  const latestAdvisory = advisories[0];

  // Refined Sensor Data Mapping & Logic
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
    <div className="px-4 sm:px-8 max-w-7xl mx-auto space-y-12 mt-8 pb-20 font-manrope">
      {/* Hero Section: Real-time Field Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold tracking-widest uppercase rounded">Active Field</span>
            <h3 className="text-on-surface-variant text-sm font-medium">Updated 2 mins ago</h3>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-primary-900 tracking-tighter leading-none">
            {selectedPlot?.plotName} / <span className="text-primary-500">{selectedPlot?.cropType}</span>
          </h1>
          <p className="text-on-surface-variant max-w-lg leading-relaxed">
            Precision monitoring active across the field. Current vegetative stage indicates optimal progress.
          </p>
          <div className="flex items-center gap-8 mt-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Local Weather</span>
              <div className="flex items-center gap-2 text-primary-900 font-bold">
                <CloudRain className="w-5 h-5 text-blue-500" />
                <span className="text-xl">{weather?.temperature}°C</span>
              </div>
            </div>
            <div className="h-8 w-px bg-outline-variant/30 hidden xs:block"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Switch Plot</span>
              <div className="relative inline-block">
                <select
                  value={selectedPlotId || ''}
                  onChange={(e) => dispatch(selectPlot(e.target.value))}
                  className="appearance-none flex items-center gap-2 pl-3 pr-8 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-lg text-sm font-bold text-primary-900 hover:bg-surface-container transition-colors cursor-pointer outline-none"
                >
                  {plots.map((plot: any) => (
                    <option key={plot.plotId} value={plot.plotId}>
                      {plot.plotName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-black/70" />
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-5 flex flex-wrap gap-3 lg:justify-end">
          {currentSensors?.soilMoisture?.status && currentSensors.soilMoisture.status !== 'ok' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-error-container text-on-error-container rounded-lg text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              Soil Alert: {currentSensors.soilMoisture.status}
            </div>
          )}
          {currentSensors?.temperature?.status && currentSensors.temperature.status !== 'ok' && (
            <div className="flex items-center gap-2 px-4 py-2 bg-error-container text-on-error-container rounded-lg text-xs font-bold">
              <Thermometer className="w-4 h-4" />
              Temp Alert: {currentSensors.temperature.status}
            </div>
          )}
        </div>
      </section>

      {/* Field Map View */}
      <section className="rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10 shadow-md h-[400px] relative group">
        <img className="w-full h-full object-cover grayscale-[0.2] group-hover:scale-105 transition-transform duration-1000" alt="Field sat" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnEG46wjKTwfzJsI-5SiCNM3CtwZcMgI9qZUVzYUX1kKN0HjBXhYsfMRLt07pXnsIdyoX0lB0gxXsGqEyTUuZJMbMGHUNN6hLvGMRBAq_jJgDIqxgz-1jvincfTDkyjISLRky4LyV_bG12Hj8enTNsfYx8-qyabGe3kZxvNbCBahUpE_XHOd_24ddgYpkNm7TWPJJbOCA60Y5IfRApDLi1-PfcbhllbinCqAVlwMdK5fxEjctrxe6vhH-XGimOMZXRtKk4paKLxq8d" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
          <div className="text-white">
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-80 mb-2 font-bold">Live Satellite Feed</p>
            <h4 className="text-3xl font-extrabold tracking-tight">Thermal Analysis Map</h4>
          </div>
          <button className="bg-white/10 backdrop-blur-xl border border-white/20 text-white p-3 rounded-xl hover:bg-white/20 transition-all shadow-lg hover:scale-110">
            <Maximize className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute top-8 left-8 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-xl shadow-xl flex items-center gap-3 border border-white/50">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">Active NDVI: 0.82</span>
        </div>
      </section>

      {/* Sensor Monitoring Grid: Pure Tailwind Tailwind Manual Logic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full my-6">
        {metrics.map((m) => {
          const Icon = m.icon;
          // Dynamically resolve Tailwind colors based on colorClass
          const borderClass = m.colorClass === 'rose' ? 'border-l-rose-500' : m.colorClass === 'emerald' ? 'border-l-emerald-500' : 'border-l-blue-500';
          const badgeClass = m.colorClass === 'rose' ? 'bg-rose-50 text-rose-700' : m.colorClass === 'emerald' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700';
          const fillClass = m.colorClass === 'rose' ? 'bg-rose-500' : m.colorClass === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500';
          const iconClass = m.colorClass === 'rose' ? 'text-rose-500' : 'text-slate-400';

          return (
            <div key={m.id} className={`relative bg-white border border-slate-200 border-l-[4px] ${borderClass} rounded-xl p-5 shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md h-[140px] flex flex-col justify-between group`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={16} className={iconClass} />
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</span>
                </div>
                <span className="text-[10px] text-slate-300 font-normal">{m.timestamp}</span>
              </div>

              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-bold text-slate-800 tracking-tight">{m.value}</span>
                <span className="text-lg font-medium text-slate-500">{m.unit}</span>
              </div>

              <div>
                <div className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                  {m.statusLabel}
                </div>
              </div>

              <div className="mt-auto h-[2px] w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${fillClass} rounded-full transition-all duration-700`}
                  style={{ width: `${m.unit === '%' ? m.value : (m.value / 50) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Support Section */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <h3 className="text-2xl font-bold text-primary-900 tracking-tight">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => navigate('/plots')}
              className="relative flex flex-col items-center justify-center p-8 bg-white border border-slate-200 shadow-sm rounded-2xl hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-200/50 hover:border-emerald-200 group transition-all duration-300 overflow-hidden"
            >
              <div className="h-14 w-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                <MapPin size={28} className="text-black/70 group-hover:text-emerald-500 transition-colors" />
              </div>
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Manage Plots</span>
              <div className="absolute bottom-0 left-0 h-[3px] w-full bg-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </button>
            <button
              onClick={() => navigate('/market')}
              className="relative flex flex-col items-center justify-center p-8 bg-white border border-slate-200 shadow-sm rounded-2xl hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-200/50 hover:border-amber-200 group transition-all duration-300 overflow-hidden"
            >
              <div className="h-14 w-14 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                <IndianRupee size={28} className="text-black/70 group-hover:text-amber-500 transition-colors" />
              </div>
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Market Prices</span>
              <div className="absolute bottom-0 left-0 h-[3px] w-full bg-amber-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </button>
            <button
              onClick={() => navigate('/assistant')}
              className="relative flex flex-col items-center justify-center p-8 bg-white border border-slate-200 shadow-sm rounded-2xl hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200/50 hover:border-blue-200 group transition-all duration-300 overflow-hidden"
            >
              <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                <MessageSquare size={28} className="text-black/70 group-hover:text-blue-500 transition-colors" />
              </div>
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Ask Assistant</span>
              <div className="absolute bottom-0 left-0 h-[3px] w-full bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </button>
            <button
              onClick={() => navigate('/assistant')}
              className="relative flex flex-col items-center justify-center p-8 bg-white border border-slate-200 shadow-sm rounded-2xl hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-200/50 hover:border-purple-200 group transition-all duration-300 overflow-hidden"
            >
              <div className="h-14 w-14 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform mb-4">
                <ImageIcon size={28} className="text-black/70 group-hover:text-purple-500 transition-colors" />
              </div>
              <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Crop Scanner</span>
              <div className="absolute bottom-0 left-0 h-[3px] w-full bg-purple-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
            </button>
        </div>
      </section>

      {/* Refined AI Advisory Section */}
      {latestAdvisory && (
        <section className="bg-[#012d1d] p-8 sm:p-12 rounded-2xl relative overflow-hidden shadow-2xl">
          {/* Abstract Texture Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern height="40" id="grid" patternUnits="userSpaceOnUse" width="40">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"></path>
                </pattern>
              </defs>
              <rect fill="url(#grid)" height="100%" width="100%"></rect>
            </svg>
          </div>
          <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
            <div className="flex-grow space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1b4332] text-emerald-200 rounded-full text-xs font-bold tracking-widest uppercase">
                <Brain className="w-4 h-4" />
                AI Advisory Insight
              </div>
              <h2 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                {latestAdvisory.title}
              </h2>
              <p className="text-emerald-100/70 max-w-xl text-lg leading-relaxed">
                {latestAdvisory.description}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <button
                disabled={executingAdvisoryId === latestAdvisory.id}
                onClick={() => {
                  setExecutingAdvisoryId(latestAdvisory.id);
                  toast('Initializing sequence...', { duration: 2000 });
                  setTimeout(() => {
                    toast.success('Sequence deployed and optimized.');
                    setExecutingAdvisoryId(null);
                    navigate('/advisories');
                  }, 2500);
                }}
                className={`px-8 py-4 ${
                  executingAdvisoryId === latestAdvisory.id 
                    ? 'bg-[#1b4332] text-emerald-200 cursor-wait' 
                    : 'bg-[#c1ecd4] text-[#002114] hover:scale-95 active:opacity-80'
                } font-bold rounded-xl transition-all flex items-center justify-center gap-2 whitespace-nowrap`}
              >
                {executingAdvisoryId === latestAdvisory.id ? (
                  <>
                    Executing...
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </>
                ) : (
                  <>
                    Execute Recommendation
                    <Droplets className="w-5 h-5" />
                  </>
                )}
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all whitespace-nowrap">
                Review Details
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Bottom Section: Farmer Specific Panels */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Crop Health History */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-bold text-primary-900 tracking-tight">Crop Health History</h3>
            <button className="text-emerald-600 font-bold text-sm hover:underline">View All Scans</button>
          </div>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-8 flex flex-col gap-6">
            
            <div className="flex gap-4 relative">
              <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-emerald-100"></div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-sm">
                <Leaf className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Harvest Ready Zone Detected</h4>
                <p className="text-xs text-on-surface-variant mb-1">AI Prediction: 98% Confidence • Sector 4</p>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">2 days ago</span>
              </div>
            </div>

            <div className="flex gap-4 relative">
              <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-blue-100"></div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-sm">
                <Leaf className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Vegetative Stage Progressing</h4>
                <p className="text-xs text-on-surface-variant mb-1">AI Prediction: Optimal Growth • Sector 1</p>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">1 week ago</span>
              </div>
            </div>

            <div className="flex gap-4 relative">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Mild Leaf Blight Spotted</h4>
                <p className="text-xs text-on-surface-variant mb-1">Action taken: Bio-fungicide applied • Sector 2</p>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">3 weeks ago</span>
              </div>
            </div>

          </div>
        </div>

        {/* Upcoming Irrigation Schedule */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="text-xl font-bold text-primary-900 tracking-tight">Irrigation Schedule</h3>
            <button className="text-emerald-600 font-bold text-sm hover:underline">Manage Rules</button>
          </div>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 divide-y divide-outline-variant/10 overflow-hidden">
            
            <div className="p-6 flex items-center justify-between gap-4 bg-emerald-50/30">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm line-through opacity-70">Morning Soak (Zone A)</h4>
                  <p className="text-xs text-slate-500">Completed automatically at 05:30 AM</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">Done</span>
            </div>

            <div className="p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border-2 border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Evening Refresh (Zone B)</h4>
                  <p className="text-xs text-on-surface-variant">Scheduled for today • 06:00 PM</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">Upcoming</span>
            </div>

            <div className="p-6 flex items-center justify-between gap-4 opacity-60 grayscale">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <CalendarClock className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Deep Root Soak (Zone A)</h4>
                  <p className="text-xs text-slate-500">Scheduled for tomorrow • 05:00 AM</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">Queued</span>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};