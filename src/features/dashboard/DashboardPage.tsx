import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { setSensorData, setTrendData } from '../sensors/sensorsSlice';
import { fetchWeatherAndAdvisories, setAdvisories } from '../advisories/advisoriesSlice';
import { EmptyState, SkeletonDashboard } from '../../components/ui';
import { toast } from 'sonner';
import {
  Droplet,
  MapPin,
  CloudRain,
  Sun,
  CloudLightning,
  CloudSnow,
  Cloud as CloudIcon,
  IndianRupee,
  MessageSquare,
  Brain,
  Thermometer,
  Radio,
  Activity,
  Loader2,
  ChevronDown,
  Clock,
  Sprout,
  LayoutGrid,
  Star
} from 'lucide-react';
import {
  generateMockSensorData,
  generateMockTrendData,
  mockAdvisories,
} from '../../services/mockData';
import { selectPlot, fetchAllPlots } from '../plots/plotsSlice';

const getWeatherIcon = (condition: string, className = "w-6 h-6") => {
  const lowerCondition = condition?.toLowerCase() || '';
  if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) return <CloudRain className={className} />;
  if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return <Sun className={className} />;
  if (lowerCondition.includes('thunder')) return <CloudLightning className={className} />;
  if (lowerCondition.includes('snow')) return <CloudSnow className={className} />;
  return <CloudIcon className={className} />;
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plots, selectedPlotId, loading: plotsLoading, hasFetched } = useAppSelector((state: any) => state.plots);
  const { sensorData, trendData } = useAppSelector((state: any) => state.sensors);
  const { notifications } = useAppSelector((state: any) => state.notifications);
  const { user } = useAppSelector((state: any) => state.auth);
  const { weatherData: realWeather, forecastData, advisories } = useAppSelector((state: any) => state.advisories);

  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const hasShownNotifications = useRef(false);
  const [timeSinceUpdate, setTimeSinceUpdate] = useState('just now');
  const [executingAdvisoryId, setExecutingAdvisoryId] = useState<string | null>(null);

  useEffect(() => {
    if (plots.length === 0 && !plotsLoading && !hasFetched) {
      dispatch(fetchAllPlots());
    }
  }, [dispatch, plots.length, plotsLoading, hasFetched]);

  useEffect(() => {
    if (plots.length > 0 && !selectedPlotId) {
      dispatch(selectPlot(plots[0]._id));
    }
  }, [plots, selectedPlotId, dispatch]);

  useEffect(() => {
    if (hasFetched && plots.length === 0) {
      navigate('/plots/create', { replace: true });
    }
  }, [hasFetched, plots.length, navigate]);

  useEffect(() => {
    if (!loading && notifications.length > 0 && !hasShownNotifications.current) {
      const unread = notifications.filter((n: any) => !n.isRead);
      if (unread.length > 0) {
        unread.forEach((n: any, index: number) => {
          setTimeout(() => {
            toast(n.title, { description: n.message, duration: 5000 });
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
    } else if (!plotsLoading && plots.length === 0) {
      setLoading(false);
    }
  }, [selectedPlotId, plots.length, plotsLoading]);

  const loadDashboardData = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (selectedPlot) {
      const sensors = generateMockSensorData(selectedPlot._id, selectedPlot.environmentType);
      dispatch(setSensorData({ plotId: selectedPlot._id, data: sensors }));
      dispatch(setTrendData({ plotId: selectedPlot._id, sensor: 'soilMoisture', data: generateMockTrendData() }));

      const loc = selectedPlot.location as any;
      const lat = loc?.coordinates?.coordinates?.[1] ?? loc?.lat;
      const lon = loc?.coordinates?.coordinates?.[0] ?? loc?.lng;

      if (lat !== undefined && lon !== undefined) {
        dispatch(fetchWeatherAndAdvisories({ lat, lon }) as any);
      } else if (user?.pincode) {
        dispatch(fetchWeatherAndAdvisories({ pincode: user.pincode }) as any);
      }

      dispatch(setAdvisories(mockAdvisories));
    }
    setLoading(false);
    setTimeSinceUpdate('just now');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSinceUpdate('1 min ago');
    }, 60000);
    return () => clearInterval(timer);
  }, [selectedPlotId]);

  if (plotsLoading || (plots.length === 0 && !hasFetched)) {
    return <SkeletonDashboard />;
  }

  if (plots.length === 0) {
    // A fallback while the useEffect redirects
    return <SkeletonDashboard />;
  }

  if (loading) return <SkeletonDashboard />;

  const currentSensors = selectedPlotId ? sensorData[selectedPlotId] : null;
  const moisture = currentSensors?.soilMoisture?.value || 0;
  const isRaining = (realWeather?.weather?.[0]?.main || '').toLowerCase().includes('rain');
  const shouldWater = moisture < 40 && !isRaining;
  const latestAdvisory = advisories?.[0];

  const getBadge = (val: number, type: 'moisture' | 'temp') => {
    if (type === 'moisture') {
      if (val < 30) return <span className="bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/10 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Low</span>;
      if (val <= 70) return <span className="bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Optimal</span>;
      return <span className="bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/10 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">High</span>;
    }
    if (val > 35) return <span className="bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">High</span>;
    return <span className="bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Optimal</span>;
  };

  const mapWeatherCode = (code: number) => {
    if (code === 0) return { condition: 'Clear', description: 'clear sky' };
    if ([1, 2, 3].includes(code)) return { condition: 'Clouds', description: 'partly cloudy' };
    if ([45, 48].includes(code)) return { condition: 'Fog', description: 'foggy' };
    if ([51, 53, 55, 56, 57].includes(code)) return { condition: 'Drizzle', description: 'light drizzle' };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { condition: 'Rain', description: 'rain showers' };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: 'Snow', description: 'snowfall' };
    if ([95, 96, 99].includes(code)) return { condition: 'Thunderstorm', description: 'thunderstorms' };
    return { condition: 'Clouds', description: 'overcast' };
  };

  const getDailyForecast = (data: any) => {
    if (!data || !data.daily) return [];
    const daily = [];
    const { time, weather_code, temperature_2m_max, temperature_2m_min } = data.daily;

    for (let i = 0; i < Math.min(7, time.length); i++) {
      const date = new Date(time[i]);
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const { condition, description } = mapWeatherCode(weather_code[i]);

      daily.push({
        dateStr: dayStr,
        tempMax: temperature_2m_max[i],
        tempMin: temperature_2m_min[i],
        condition,
        description,
      });
    }
    return daily;
  };

  const forecastDays = forecastData ? getDailyForecast(forecastData) : [];
  const trendList = trendData[`${selectedPlotId}_soilMoisture`] || [];

  return (
    <div className="flex flex-col flex-1 h-full font-inter bg-[#f5f5f3] text-zinc-900">
      {/* Header */}
      <div className="px-6 pt-5">
        <div className="flex items-center h-20 bg-white border border-[#e2e2d9] rounded-xl px-5">

          {/* Plot selector */}
          <div className="relative flex items-center h-full pr-5 hover:opacity-70 transition-opacity">
            <select
              value={selectedPlotId || ''}
              onChange={(e) => dispatch(selectPlot(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            >
              {plots.map((plot: any) => (
                <option key={plot._id} value={plot._id}>{plot.plotName}</option>
              ))}
            </select>
            <div className="flex items-center gap-2.5">
              <div className="w-[30px] h-[30px] rounded-[7px] bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                <Sprout size={14} className="text-green-700" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900 leading-tight">{selectedPlot?.plotName ?? 'Select Plot'}</p>
              </div>
              <ChevronDown size={13} className="text-gray-300 ml-0.5" />
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-7 bg-gray-100 flex-shrink-0" />

          {/* Pills */}
          <div className="flex items-center gap-1.5 flex-1 px-5">
            <span className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-800 text-[11.5px] font-medium rounded-full px-2.5 py-1">
              <Sprout size={10} />
              {selectedPlot?.cropType ?? 'Crop'}
            </span>
            <span className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11.5px] font-medium rounded-full px-2.5 py-1">
              <Activity size={10} />
              {selectedPlot?.cropStage ? selectedPlot.cropStage.charAt(0) + selectedPlot.cropStage.slice(1).toLowerCase() : 'Growth Stage'}
            </span>
            <span className="flex items-center gap-1 bg-gray-50 border border-[#e2e2d9] text-gray-500 text-[11.5px] rounded-full px-2.5 py-1">
              <MapPin size={10} />
              {selectedPlot?.location?.district ?? '—'}{selectedPlot?.location?.state ? `, ${selectedPlot.location.state}` : ''}
            </span>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 pl-5 border-l border-[#e2e2d9] h-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11.5px] text-gray-400">Live</span>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 md:p-8 max-w-[1400px] w-full mx-auto pb-24 space-y-5">
        {/* Farm Header */}


        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Soil Moisture */}
          <div className="bg-white/80 backdrop-blur-md border border-[#e2e2d9] rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                <Droplet className="w-4 h-4 text-emerald-600" />
                Soil Moisture
              </div>
              {getBadge(moisture, 'moisture')}
            </div>
            <div>
              <div className="text-4xl font-semibold text-zinc-900 tracking-tight">
                {moisture}<span className="text-xl text-zinc-400 font-medium ml-1">%</span>
              </div>
              <div className="text-xs font-medium text-zinc-400 mt-2">Updated {timeSinceUpdate}</div>
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-white/80 backdrop-blur-md border border-[#e2e2d9] rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                <Thermometer className="w-4 h-4 text-amber-600" />
                Temperature
              </div>
              {getBadge(realWeather ? Math.round(realWeather.main.temp) : (currentSensors?.temperature?.value || 22), 'temp')}
            </div>
            <div>
              <div className="text-4xl font-semibold text-zinc-900 tracking-tight">
                {realWeather ? Math.round(realWeather.main.temp) : (currentSensors?.temperature?.value || 22)}<span className="text-xl text-zinc-400 font-medium ml-1">°C</span>
              </div>
              <div className="text-xs font-medium text-zinc-400 mt-2">
                Updated {timeSinceUpdate}
              </div>
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-white/80 backdrop-blur-md border border-[#e2e2d9] rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                <CloudRain className="w-4 h-4 text-sky-600" />
                Humidity
              </div>
              <span className="bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/10 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Normal</span>
            </div>
            <div>
              <div className="text-4xl font-semibold text-zinc-900 tracking-tight">
                {realWeather ? realWeather.main.humidity : (currentSensors?.humidity?.value || 65)}<span className="text-xl text-zinc-400 font-medium ml-1">%</span>
              </div>
              <div className="text-xs font-medium text-zinc-400 mt-2">
                Updated {timeSinceUpdate}
              </div>
            </div>
          </div>

          {/* Soil Temp */}
          <div className="bg-white/80 backdrop-blur-md border border-[#e2e2d9] rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                <Radio className="w-4 h-4 text-purple-600" />
                Soil Temp
              </div>
              {getBadge(currentSensors?.soilTemperature?.value || 22, 'temp')}
            </div>
            <div>
              <div className="text-4xl font-semibold text-zinc-900 tracking-tight">
                {currentSensors?.soilTemperature?.value || 22}<span className="text-xl text-zinc-400 font-medium ml-1">°C</span>
              </div>
              <div className="text-xs font-medium text-zinc-400 mt-2">Updated 5 mins ago</div>
            </div>
          </div>
        </div>

        {/* 7-Day Weather Forecast */}
        {forecastDays.length > 0 && (
          <div className="bg-white/80 backdrop-blur-md border border-[#e2e2d9] rounded-xl p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-bold tracking-tight text-zinc-900">7-Day Weather Forecast</h3>
              <p className="text-[13px] text-zinc-500">Based on local telemetry and API</p>
            </div>
            <div className="flex w-full divide-x divide-zinc-200 overflow-x-auto rounded-xl border border-[#e2e2d9] bg-white">
              {forecastDays.map((day, idx) => (
                <div key={idx} className={`flex-1 min-w-[100px] flex flex-col items-center justify-center p-3 transition-colors ${idx === 0 ? 'bg-[#f5f5f3] rounded-lg' : ''}`}>
                  <div className={`text-[10px] font-bold mb-2 uppercase tracking-wider ${idx === 0 ? 'text-zinc-900' : 'text-zinc-400'}`}>
                    {day.dateStr}
                  </div>
                  <div className="mb-2 text-zinc-600">
                    {getWeatherIcon(day.condition, "w-6 h-6 stroke-[1.5]")}
                  </div>
                  <div className="text-[15px] font-semibold text-zinc-900 flex items-center gap-1">
                    {Math.round(day.tempMax)}° <span className="text-zinc-400 text-xs">{Math.round(day.tempMin)}°</span>
                  </div>
                  <div className={`text-[11px] mt-1 capitalize text-center leading-tight truncate w-full ${idx === 0 ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>
                    {day.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alert / Recommendation */}
          <div className="bg-white/80 backdrop-blur-md border border-[#e2e2d9] rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center shrink-0">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-tight text-zinc-900">
                    {shouldWater ? 'Water Now' : 'Optimal Moisture'}
                  </h3>
                  <p className="text-[13px] text-zinc-500">
                    {shouldWater
                      ? `Soil moisture at ${moisture}% — below optimal threshold. No rain expected.`
                      : `Soil moisture at ${moisture}% — within optimal range. No immediate action needed.`}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-[#e2e2d9] flex justify-between items-center">
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Suggested Window
                <span className="block font-semibold tracking-tight text-[13px] text-zinc-900 mt-1 normal-case">
                  {shouldWater ? '05:30 AM to 07:30 AM' : 'N/A'}
                </span>
              </div>
              <button
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${shouldWater
                  ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none'
                  }`}
                disabled={!shouldWater}
                onClick={() => {
                  toast.success('Irrigation command sent to control unit');
                }}
              >
                Execute Command
              </button>
            </div>
          </div>

          {/* AI Crop Advisory */}
          {latestAdvisory ? (
            <div className="bg-white/80 backdrop-blur-md border border-[#e2e2d9] rounded-xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-16 -mt-16 opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity duration-500"></div>
              <div>
                <div className="flex items-center gap-4 mb-3 relative z-10">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-zinc-900">
                      {latestAdvisory.title}
                    </h3>
                    <p className="text-[13px] text-zinc-500 line-clamp-2">
                      {latestAdvisory.description}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-[#e2e2d9] flex justify-between items-center relative z-10">
                <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                  AI Generated
                  <span className="block font-semibold tracking-tight text-[13px] text-zinc-900 mt-1 normal-case">
                    Optimization Feed
                  </span>
                </div>
                <button
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-2 ${executingAdvisoryId === latestAdvisory.id
                    ? 'bg-zinc-100 text-zinc-400 cursor-wait shadow-none'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-1 ring-inset ring-emerald-600/10'
                    }`}
                  disabled={executingAdvisoryId === latestAdvisory.id}
                  onClick={() => {
                    setExecutingAdvisoryId(latestAdvisory.id);
                    toast('Linking Command Protocol...', { icon: <Activity className="text-emerald-500 w-4 h-4" /> });
                    setTimeout(() => {
                      toast.success('Sequence Optimized & Dispatched');
                      setExecutingAdvisoryId(null);
                      navigate('/advisories');
                    }, 2000);
                  }}
                >
                  {executingAdvisoryId === latestAdvisory.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Review Advisory'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-50 border border-[#e2e2d9] rounded-xl p-6 shadow-sm flex items-center justify-center text-zinc-400">
              No active advisories
            </div>
          )}
        </div>

        {/* Chart Section */}
        {trendList.length > 0 && (
          <div className="bg-white/80 backdrop-blur-md border border-[#e2e2d9] rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h3 className="text-base font-bold tracking-tight text-zinc-900">Soil Moisture Trend</h3>
                <p className="text-[13px] text-zinc-500 mt-0.5">7-day saturation index from IoT sensor network</p>
              </div>
              <div className="flex gap-4 text-[11px] font-semibold tracking-wider uppercase text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>Critical &lt; 30%
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>Optimal 30-70%
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500"></span>High &gt; 70%
                </div>
              </div>
            </div>

            <div className="h-[200px] flex items-end gap-6 px-2 border-b border-[#e2e2d9] pb-1">
              {trendList.map((d: any, idx: number) => {
                const height = `${Math.max(10, d.value)}%`;
                return (
                  <div
                    key={idx}
                    className="flex-1 rounded-t-md relative transition-all hover:opacity-100 group flex justify-center shadow-sm"
                    style={{
                      height,
                      background: 'linear-gradient(180deg, #6fd3a3 0%, #1d9e75 100%)',
                      opacity: 0.9
                    }}
                  >
                    <span className="absolute -top-7 text-[11px] font-bold tracking-tight text-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-2 py-0.5 rounded-md shadow-sm border border-[#e2e2d9]">
                      {d.value}%
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-6 px-2 pt-4 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
              {trendList.map((d: any, idx: number) => (
                <div key={idx} className="flex-1 text-center truncate">{d.date}</div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <button
            onClick={() => navigate('/plots')}
            className="bg-white border border-[#e2e2d9] rounded-xl p-6 flex items-center gap-4 hover:border-green-200 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#eaf3de' }}>
              <LayoutGrid size={18} strokeWidth={1.8} className="text-[#3b6d11]" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900">View Plots</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Manage farm plots & boundaries</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/market')}
            className="bg-white border border-[#e2e2d9] rounded-xl p-6 flex items-center gap-4 hover:border-amber-200 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#faeeda' }}>
              <IndianRupee size={18} strokeWidth={1.8} className="text-[#854f0b]" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900">Market Prices</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Live mandi & crop price feeds</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/assistant')}
            className="bg-white border border-[#e2e2d9] rounded-xl p-6 flex items-center gap-4 hover:border-blue-200 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#e6f1fb' }}>
              <MessageSquare size={18} strokeWidth={1.8} className="text-[#185fa5]" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900">Smart Assistant</p>
              <p className="text-[12px] text-gray-400 mt-0.5">Get AI-powered farm advice</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/advisories')}
            className="bg-white border border-[#e2e2d9] rounded-xl p-6 flex items-center gap-4 hover:border-emerald-200 hover:shadow-md transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#e1f5ee' }}>
              <Star size={18} strokeWidth={1.8} className="text-[#0f6e56]" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900">View Advisories</p>
              <p className="text-[12px] text-gray-400 mt-0.5">AI crop recommendations</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};