import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets,
  Thermometer,
  Wind,
  AlertTriangle,
  FileText,
  MapPin,
  IndianRupee,
  MessageSquare,
  Image as ImageIcon,
  Sprout,
  Sun,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { setSensorData, setTrendData } from '../sensors/sensorsSlice';
import { setAdvisories } from '../advisories/advisoriesSlice';
import { Badge, EmptyState, SkeletonCard, SkeletonChart } from '../../components/ui';
import { toast } from 'sonner';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
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
          }, index * 500); // Stagger toasts slightly to appear one after another
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
      setWeather(generateMockWeather(selectedPlot.plotId));
      dispatch(setAdvisories(mockAdvisories));
    }

    setLoading(false);
  };

  const handlePlotChange = (plotId: string) => {
    dispatch(selectPlot(plotId));
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
  const humidityTrend = selectedPlotId ? trendData[`${selectedPlotId}_soilMoisture`] : []; // Reusing mock since we just need visuals
  const soilTempTrend = selectedPlotId ? trendData[`${selectedPlotId}_temperature`] : []; // Reusing mock
  const latestAdvisory = advisories[0];

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* 1️⃣ WELCOME HEADER BANNER */}
      <div className="bg-white/70 backdrop-blur-xl border border-gray shadow-sm rounded-2xl overflow-hidden relative">
        <div className="absolute -top-24 -right-12 p-12 opacity-5 pointer-events-none text-emerald-900">
          <Sprout className="w-96 h-96" />
        </div>
        <div className="relative p-8 px-8 sm:px-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-white flex items-center justify-center rounded-xl shadow-sm border border-slate-100">
                  <Sprout className="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Real-time Field Overview</h1>
                  <p className="text-slate-500 text-sm font-medium mt-1">Smart agricultural intelligence</p>
                </div>
              </div>

              {selectedPlot && (
                <div className="flex flex-wrap gap-8 mt-8">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Active Plot</p>
                    <p className="text-xl font-bold tracking-tight text-slate-900">{selectedPlot.plotName}</p>
                  </div>
                  <div className="w-px bg-slate-200 hidden sm:block"></div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Crop Type</p>
                    <p className="text-xl font-bold tracking-tight text-slate-900">{selectedPlot.cropType}</p>
                  </div>
                  <div className="w-px bg-slate-200 hidden sm:block"></div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Local Weather</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{weather?.icon || '☀️'}</span>
                      <p className="text-xl font-bold tracking-tight text-slate-900">{weather?.temperature || '--'}°C</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {plots.length > 1 && (
              <div className="lg:w-64">
                <label htmlFor="plotSelector" className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Switch Plot
                </label>
                <select
                  id="plotSelector"
                  value={selectedPlotId || ''}
                  onChange={(e) => handlePlotChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm cursor-pointer"
                >
                  {plots.map((plot) => (
                    <option key={plot.plotId} value={plot.plotId}>
                      {plot.plotName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
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
      ) : (
        <div className="space-y-8">
          {/* 2️⃣ SENSOR KPI CARDS WITH SPARKLINES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Soil Moisture */}
            {currentSensors?.soilMoisture && (
              <div className="bg-white/70 backdrop-blur-xl border border-gray shadow-sm rounded-2xl p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Droplets className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Soil Moisture</p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold tracking-tight text-slate-900 text-3xl">{currentSensors.soilMoisture.value}</span>
                        <span className="text-slate-500 font-medium">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto h-16 w-full -mx-2 -mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={soilMoistureTrend}>
                      <defs>
                        <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMoisture)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="absolute top-6 right-6 z-10">
                  <div className={`h-2.5 w-2.5 rounded-full ${currentSensors.soilMoisture.status === 'ok' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                    currentSensors.soilMoisture.status === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    }`}></div>
                </div>
              </div>
            )}

            {/* Temperature */}
            {currentSensors?.temperature && (
              <div className="bg-white/70 backdrop-blur-xl border border-gray shadow-sm rounded-2xl p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Thermometer className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Temperature</p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold tracking-tight text-slate-900 text-3xl">{currentSensors.temperature.value}</span>
                        <span className="text-slate-500 font-medium">°C</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto h-16 w-full -mx-2 -mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={temperatureTrend}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTemp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="absolute top-6 right-6 z-10">
                  <div className={`h-2.5 w-2.5 rounded-full ${currentSensors.temperature.status === 'ok' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                    currentSensors.temperature.status === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    }`}></div>
                </div>
              </div>
            )}

            {/* Humidity */}
            {currentSensors?.humidity && (
              <div className="bg-white/70 backdrop-blur-xl border border-gray shadow-sm rounded-2xl p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Wind className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Humidity</p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold tracking-tight text-slate-900 text-3xl">{currentSensors.humidity.value}</span>
                        <span className="text-slate-500 font-medium">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto h-16 w-full -mx-2 -mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={humidityTrend}>
                      <defs>
                        <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHumidity)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="absolute top-6 right-6 z-10">
                  <div className={`h-2.5 w-2.5 rounded-full ${currentSensors.humidity.status === 'ok' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                    currentSensors.humidity.status === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    }`}></div>
                </div>
              </div>
            )}

            {/* Soil Temperature */}
            {currentSensors?.soilTemperature && (
              <div className="bg-white/70 backdrop-blur-xl border border-gray shadow-sm rounded-2xl p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sun className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Soil Temp</p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold tracking-tight text-slate-900 text-3xl">{currentSensors.soilTemperature.value}</span>
                        <span className="text-slate-500 font-medium">°C</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto h-16 w-full -mx-2 -mb-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={soilTempTrend}>
                      <defs>
                        <linearGradient id="colorSoilTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSoilTemp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="absolute top-6 right-6 z-10">
                  <div className={`h-2.5 w-2.5 rounded-full ${currentSensors.soilTemperature.status === 'ok' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                    currentSensors.soilTemperature.status === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    }`}></div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 3️⃣ ALERTS & ADVISORIES SECTION */}
            <div className="lg:col-span-2 space-y-6">
              {mockAlerts.length > 0 && (
                <div className="bg-white/70 backdrop-blur-xl border border-gray shadow-sm rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">Active Alerts</h2>
                    <Badge variant="warning">{mockAlerts.length} Issues</Badge>
                  </div>
                  <div className="space-y-4">
                    {mockAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:shadow-sm transition-all"
                      >
                        <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-bold tracking-tight text-slate-900">{alert.title}</p>
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">{alert.plotName}</p>
                              <p className="text-sm text-slate-600 mt-2">{alert.message}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Latest Advisory */}
              {latestAdvisory && (
                <div className="bg-white/70 backdrop-blur-xl border border-gray shadow-sm rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">AI Advisory</h2>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold tracking-tight text-slate-900 mb-1">{latestAdvisory.title}</h4>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">{latestAdvisory.description}</p>
                      <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 mb-1">Recommended Action</p>
                        <p className="text-sm font-medium text-emerald-900">{latestAdvisory.recommendedAction}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4️⃣ QUICK ACTIONS */}
            <div className="space-y-6">
              <div className="bg-white/40 backdrop-blur-md border border-gray shadow-sm rounded-2xl p-6">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/plots')}
                    className="relative flex flex-col items-center justify-center p-6 bg-white border border-slate-200 shadow-sm rounded-xl hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-200 hover:border-emerald-200 group transition-all duration-300 overflow-hidden"
                  >
                    <MapPin size={28} className="text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all duration-300 mb-4" />
                    <span className="text-sm font-medium text-slate-600">Plots</span>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-6 bg-emerald-500 rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <button
                    onClick={() => navigate('/market')}
                    className="relative flex flex-col items-center justify-center p-6 bg-white border border-slate-200 shadow-sm rounded-xl hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-200 hover:border-amber-200 group transition-all duration-300 overflow-hidden"
                  >
                    <IndianRupee size={28} className="text-slate-400 group-hover:text-amber-500 group-hover:scale-110 transition-all duration-300 mb-4" />
                    <span className="text-sm font-medium text-slate-600">Market</span>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-6 bg-amber-500 rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <button
                    onClick={() => navigate('/assistant')}
                    className="relative flex flex-col items-center justify-center p-6 bg-white border border-slate-200 shadow-sm rounded-xl hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200 hover:border-blue-200 group transition-all duration-300 overflow-hidden"
                  >
                    <MessageSquare size={28} className="text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300 mb-4" />
                    <span className="text-sm font-medium text-slate-600">Assistant</span>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-6 bg-blue-500 rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <button
                    onClick={() => navigate('/assistant')}
                    className="relative flex flex-col items-center justify-center p-6 bg-white border border-slate-200 shadow-sm rounded-xl hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-200 hover:border-purple-200 group transition-all duration-300 overflow-hidden"
                  >
                    <ImageIcon size={28} className="text-slate-400 group-hover:text-purple-500 group-hover:scale-110 transition-all duration-300 mb-4" />
                    <span className="text-sm font-medium text-slate-600">Scan</span>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-6 bg-purple-500 rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};