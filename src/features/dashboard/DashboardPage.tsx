import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  MapPin,
  IndianRupee,
  MessageSquare,
  Image as ImageIcon,
  Droplets,
  Thermometer,
  Maximize,
  Brain,
  Radio,
  ChevronDown,
  CloudRain
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { setSensorData, setTrendData } from '../sensors/sensorsSlice';
import { setAdvisories } from '../advisories/advisoriesSlice';
import { EmptyState, SkeletonCard, SkeletonChart } from '../../components/ui';
import { SensorGrid } from '../sensors/components/SensorGrid';
import { toast } from 'sonner';
import {
  generateMockSensorData,
  generateMockTrendData,
  generateMockWeather,
  mockAdvisories,
  mockAlerts,
} from '../../services/mockData';
import { selectPlot } from '../plots/plotsSlice';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plots, selectedPlotId } = useAppSelector((state) => state.plots);
  const { sensorData, trendData } = useAppSelector((state) => state.sensors);
  const { notifications } = useAppSelector((state) => state.notifications);
  const { advisories } = useAppSelector((state) => state.advisories);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);
  const hasShownNotifications = useRef(false);

  useEffect(() => {
    if (!loading && notifications.length > 0 && !hasShownNotifications.current) {
      const unread = notifications.filter(n => !n.isRead);
      if (unread.length > 0) {
        unread.forEach((n, index) => {
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

  const selectedPlot = plots.find((p) => p.plotId === selectedPlotId);

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
  const soilMoistureTrend = selectedPlotId ? trendData[`${selectedPlotId}_soilMoisture`] : [];
  const temperatureTrend = selectedPlotId ? trendData[`${selectedPlotId}_temperature`] : [];
  const latestAdvisory = advisories[0];

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
                  {plots.map((plot) => (
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

      {/* Sensor Monitoring Grid: Modern Light SaaS Design */}
      {currentSensors && <SensorGrid data={currentSensors} />}

      {/* Quick Actions Support Section */}
      <section className="space-y-6">
        <div className="bg-white/40 backdrop-blur-md border border-outline-variant/10 shadow-sm rounded-2xl p-8">
          <h2 className="text-xl font-bold tracking-tight text-primary-900 mb-8 px-2">Quick Actions</h2>
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
                onClick={() => toast.success('Irrigation sequence deployed.')}
                className="px-8 py-4 bg-[#c1ecd4] text-[#002114] font-bold rounded-xl hover:scale-95 active:opacity-80 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                Execute Recommendation
                <Droplets className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all whitespace-nowrap">
                Review Details
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Bottom Section: Detailed Field Status */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <h3 className="text-2xl font-bold text-primary-900 tracking-tight">System Status Log</h3>
          <button className="text-emerald-600 font-bold text-sm hover:underline">View Full Logs</button>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 divide-y divide-outline-variant/10 overflow-hidden">
          {mockAlerts.map((alert) => (
            <div key={alert.id} className="p-6 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                  <Radio className={`w-5 h-5 ${alert.severity === 'critical' ? 'text-red-500' : 'text-emerald-500'}`} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{alert.title}</h4>
                  <p className="text-xs text-on-surface-variant">{alert.message} • Sector {alert.plotId.slice(-2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant uppercase tracking-tighter">Status</p>
                  <p className={`text-sm font-bold ${alert.severity === 'critical' ? 'text-red-500' : 'text-emerald-600'}`}>
                    {alert.severity === 'critical' ? 'Critical' : 'Alert'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${alert.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                  Monitoring
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};