import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { setSensorData, setTrendData } from '../sensors/sensorsSlice';
import { fetchWeatherAndAdvisories, setAdvisories } from '../advisories/advisoriesSlice';
import { SkeletonDashboard } from '../../components/ui';
import { toast } from 'sonner';
import {
  Droplet,
  IndianRupee,
  MessageSquare,
  Brain,
  Activity,
  LayoutGrid,
  Star,
  ChevronDown
} from 'lucide-react';
import { getWeatherIcon, mapWeatherCode } from '../../shared/utils/weather';
import { getPlotCoordinates } from '../../shared/utils/location';
import {
  generateMockSensorData,
  generateMockTrendData,
  mockAdvisories,
} from '../../services/mockData';
import { selectPlot, fetchAllPlots } from '../plots/plotsSlice';


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
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plots, selectedPlotId, loading: plotsLoading, hasFetched } = useAppSelector((state: any) => state.plots);
  const { sensorData, trendData } = useAppSelector((state: any) => state.sensors);
  const { notifications } = useAppSelector((state: any) => state.notifications);
  const { user } = useAppSelector((state) => state.auth);
  const { weatherData: realWeather, forecastData, advisories } = useAppSelector((state) => state.advisories);

  const forecastDays = React.useMemo(() => forecastData ? getDailyForecast(forecastData) : [], [forecastData]);
  const [loading, setLoading] = useState(false);

  const hasShownNotifications = useRef(false);
  const [timeSinceUpdate, setTimeSinceUpdate] = useState('just now');

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

      const { lat, lon } = getPlotCoordinates(selectedPlot.location);

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

  const trendList = trendData[`${selectedPlotId}_soilMoisture`] || [];

  return (
    <div className="flex-1 bg-[#f5f6f4] min-h-screen text-[#1a1f16]">
      <main className="flex-1 p-[22px] px-6">
        {/* TOPBAR */}
        <div className="flex items-center justify-between mb-[18px]">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Farm Selector (using the same logic as before) */}
            <div className="relative flex items-center hover:opacity-70 transition-opacity">
              <select
                value={selectedPlotId || ''}
                onChange={(e) => dispatch(selectPlot(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              >
                {plots.map((plot: any) => (
                  <option key={plot._id} value={plot._id}>{plot.plotName}</option>
                ))}
              </select>
              <span className="text-base font-semibold text-[#1a1f16]">{selectedPlot?.plotName ?? 'Green Valley'}</span>
              <ChevronDown size={14} className="ml-1 text-[#6b7468]" />
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-[9px] py-[3px] rounded-full border text-[#2d7a4f] bg-[#e8f5ee] border-[#b6dfc8]">
              🌾 {selectedPlot?.cropType?.toUpperCase() ?? 'PADDY'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-[9px] py-[3px] rounded-full border text-[#d97706] bg-[#fef3c7] border-[#fcd34d]">
              ↑ {selectedPlot?.cropStage ? selectedPlot.cropStage.charAt(0) + selectedPlot.cropStage.slice(1).toLowerCase() : 'Sowed'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-[9px] py-[3px] rounded-full border text-[#6b7468] bg-[#f5f6f4] border-[#e8eae5]">
              📍 {selectedPlot?.location?.district ?? 'Hyderabad'}, {selectedPlot?.location?.state ?? 'Telangana'}
            </span>
          </div>
          <div className="flex items-center gap-[5px] text-[11.5px] font-medium text-[#2d7a4f]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4aab72] shadow-[0_0_0_2px_#b6dfc8] animate-[pulse_2s_infinite]" />
            Live
          </div>
        </div>

        {/* SENSOR CARDS */}
        <div className="grid grid-cols-4 gap-[10px] mb-[14px]">
          {/* Soil Moisture */}
          <div className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#9ea89b]">Soil Moisture</span>
              <span className="text-[9.5px] font-semibold px-[7px] py-[2px] rounded-full tracking-[0.04em] uppercase bg-[#e8f5ee] text-[#2d7a4f]">
                {moisture < 30 ? 'Low' : moisture > 70 ? 'High' : 'Optimal'}
              </span>
            </div>
            <div className="text-[26px] font-bold text-[#1a1f16] leading-none">
              {moisture}<span className="text-[13px] text-[#9ea89b] ml-1">%</span>
            </div>
            <div className="text-[10.5px] text-[#9ea89b]">Updated {timeSinceUpdate}</div>
          </div>
          {/* Temperature */}
          <div className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#9ea89b]">Temperature</span>
              <span className="text-[9.5px] font-semibold px-[7px] py-[2px] rounded-full tracking-[0.04em] uppercase bg-[#fef3c7] text-[#d97706]">
                {realWeather && Math.round(realWeather.main.temp) > 35 ? 'High' : 'Optimal'}
              </span>
            </div>
            <div className="text-[26px] font-bold text-[#1a1f16] leading-none">
              {realWeather ? Math.round(realWeather.main.temp) : (currentSensors?.temperature?.value || 22)}<span className="text-[13px] text-[#9ea89b] ml-1">°C</span>
            </div>
            <div className="text-[10.5px] text-[#9ea89b]">Updated {timeSinceUpdate}</div>
          </div>
          {/* Humidity */}
          <div className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#9ea89b]">Humidity</span>
              <span className="text-[9.5px] font-semibold px-[7px] py-[2px] rounded-full tracking-[0.04em] uppercase bg-[#eff6ff] text-[#2563eb]">Normal</span>
            </div>
            <div className="text-[26px] font-bold text-[#1a1f16] leading-none">
              {realWeather ? realWeather.main.humidity : (currentSensors?.humidity?.value || 65)}<span className="text-[13px] text-[#9ea89b] ml-1">%</span>
            </div>
            <div className="text-[10.5px] text-[#9ea89b]">Updated {timeSinceUpdate}</div>
          </div>
          {/* Soil Temp */}
          <div className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#9ea89b]">Soil Temp</span>
              <span className="text-[9.5px] font-semibold px-[7px] py-[2px] rounded-full tracking-[0.04em] uppercase bg-[#e8f5ee] text-[#2d7a4f]">Optimal</span>
            </div>
            <div className="text-[26px] font-bold text-[#1a1f16] leading-none">
              {currentSensors?.soilTemperature?.value || 22}<span className="text-[13px] text-[#9ea89b] ml-1">°C</span>
            </div>
            <div className="text-[10.5px] text-[#9ea89b]">Updated 5 mins ago</div>
          </div>
        </div>

        {/* GROWTH STAGE */}
        <div className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 mb-[14px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="text-[15px] font-semibold text-[#1a1f16] mb-1">Crop Growth Stage</div>
              <div className="text-[12.5px] text-[#9ea89b]">
                {selectedPlot?.cropType ? selectedPlot.cropType.charAt(0).toUpperCase() + selectedPlot.cropType.slice(1).toLowerCase() : 'Paddy'} — 
                Day 34 of ~120 · Currently in {selectedPlot?.cropStage ? selectedPlot.cropStage.charAt(0).toUpperCase() + selectedPlot.cropStage.slice(1).toLowerCase() : 'Tillering'}
              </div>
            </div>
            <div className="bg-[#e8f5ee] text-[#2d7a4f] text-[12px] font-medium px-4 py-2 rounded-full border border-[#b6dfc8]">
              86 days to harvest
            </div>
          </div>
          <div className="flex items-center px-2">
            {[
              { name: "Germination", days: "D1–D7", done: true },
              { name: "Seedling", days: "D8–D20", done: true },
              { name: "Tillering", days: "D21–D40", current: true },
              { name: "Booting", days: "D41–D60" },
              { name: "Heading", days: "D61–D80" },
              { name: "Harvest", days: "D90+" },
            ].map((s, idx, arr) => (
              <div key={s.name} className="flex-1 flex flex-col items-center relative">
                {/* Connecting Line */}
                {idx !== arr.length - 1 && (
                  <div className={`absolute top-[11px] left-1/2 w-full h-[2px] -z-0 ${s.done || (s.current && arr[idx+1].name !== 'Tillering') ? 'bg-[#2d7a4f]' : 'bg-[#f0f0f0]'}`} />
                )}
                
                {/* Node */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mb-2 z-10 transition-all ${
                  s.done ? 'bg-[#2d7a4f] border-[#2d7a4f] text-white' :
                  s.current ? 'bg-[#e8f5ee] border-[#2d7a4f] text-[#2d7a4f] ring-4 ring-[#e8f5ee]' :
                  'bg-white border-[#f0f0f0] text-transparent'
                }`}>
                  {s.done ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : s.current ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2d7a4f]" />
                  ) : null}
                </div>

                {/* Labels */}
                <div className={`text-[11px] font-medium mb-0.5 ${s.current ? 'text-[#2d7a4f]' : 'text-[#9ea89b]'}`}>
                  {s.name}
                </div>
                <div className="text-[10px] text-[#9ea89b] font-medium uppercase tracking-tight">
                  {s.days}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ADVISORY CARDS */}
        <div className="grid grid-cols-2 gap-[10px] mb-[14px]">
          <div className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex flex-col gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0 bg-[#e8f5ee] text-[#2d7a4f]">
                <Droplet size={16} />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#1a1f16] mb-0.5">{shouldWater ? 'Water Now' : 'Optimal Moisture'}</div>
                <div className="text-[12px] text-[#6b7468] leading-relaxed">
                  {shouldWater
                    ? `Soil moisture at ${moisture}% — below optimal threshold. No rain expected.`
                    : `Soil moisture at ${moisture}% — within optimal range. No immediate action needed.`}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div className="text-[10.5px] text-[#9ea89b]">Suggested window: <span className="font-medium text-[#6b7468]">{shouldWater ? '05:30 AM to 07:30 AM' : 'N/A'}</span></div>
              <button
                className="text-[11.5px] font-medium text-[#2d7a4f] border border-[#b6dfc8] bg-[#e8f5ee] px-3 py-[5px] rounded-md hover:bg-[#d4efe1] transition-colors"
                onClick={() => toast.success('Irrigation command sent')}
              >
                Execute Command
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex flex-col gap-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0 bg-[#fef3c7] text-[#d97706]">
                <Brain size={16} />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[#1a1f16] mb-0.5">{latestAdvisory ? latestAdvisory.title : 'Irrigation Recommended'}</div>
                <div className="text-[12px] text-[#6b7468] leading-relaxed line-clamp-2">
                  {latestAdvisory ? latestAdvisory.description : 'Soil moisture levels are below optimal range for rice cultivation.'}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div className="text-[10.5px] text-[#9ea89b]">AI Generated: <span className="font-medium text-[#6b7468]">Optimization Feed</span></div>
              <button
                className="text-[11.5px] font-medium px-3 py-[5px] rounded-md transition-colors border border-[#fcd34d] text-[#d97706] bg-[#fef3c7] hover:bg-[#fde68a] flex items-center gap-1.5"
                onClick={() => {
                  toast('Linking Command Protocol...', { icon: <Activity className="text-emerald-500 w-4 h-4" /> });
                  setTimeout(() => toast.success('Sequence Optimized & Dispatched'), 2000);
                }}
              >
                Review Advisory
              </button>
            </div>
          </div>
        </div>

        {/* WEATHER */}
        {forecastDays.length > 0 && (
          <div className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 mb-[14px]">
            <div className="text-[13px] font-semibold text-[#1a1f16] mb-0.5">7-Day Weather Forecast</div>
            <div className="text-[11px] text-[#9ea89b] mb-3">Based on local telemetry and API</div>
            <div className="grid grid-cols-7 gap-1.5">
              {forecastDays.map((day: any, idx: number) => (
                <div key={idx} className={`flex flex-col items-center gap-[5px] px-1.5 py-2.5 rounded-lg border transition-colors cursor-pointer ${idx === 0 ? 'bg-[#e8f5ee] border-[#b6dfc8]' : 'border-transparent hover:bg-[#f5f6f4] hover:border-[#e8eae5]'}`}>
                  <div className={`text-[10px] font-semibold tracking-[0.06em] uppercase ${idx === 0 ? 'text-[#2d7a4f]' : 'text-[#9ea89b]'}`}>
                    {day.dateStr}
                  </div>
                  <div className="text-[18px] my-1">
                    {getWeatherIcon(day.condition, "w-5 h-5 stroke-[1.5] text-zinc-700")}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[13px] font-semibold text-[#1a1f16]">{Math.round(day.tempMax)}°</span>
                    <span className="text-[11px] text-[#9ea89b]">{Math.round(day.tempMin)}°</span>
                  </div>
                  <div className="text-[9.5px] text-[#9ea89b] text-center leading-tight truncate w-full">
                    {day.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MOISTURE TREND */}
        {trendList.length > 0 && (
          <div className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 mb-[14px]">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-[13px] font-semibold text-[#1a1f16] mb-0.5">Soil Moisture Trend</div>
                <div className="text-[11px] text-[#9ea89b]">7-day saturation index from IoT sensor network</div>
              </div>
              <div className="flex gap-[14px]">
                <div className="flex items-center gap-[5px] text-[10.5px] text-[#6b7468]">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#ef4444]" />Critical &lt;30%
                </div>
                <div className="flex items-center gap-[5px] text-[10.5px] text-[#6b7468]">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#2d7a4f]" />Optimal 30–70%
                </div>
                <div className="flex items-center gap-[5px] text-[10.5px] text-[#6b7468]">
                  <div className="w-[6px] h-[6px] rounded-full bg-[#3b82f6]" />High &gt;70%
                </div>
              </div>
            </div>
            <div className="flex gap-2 items-end h-[90px]">
              {trendList.slice(-7).map((d: any, idx: number) => {
                const maxMoisture = Math.max(...trendList.map((t: any) => t.value), 60);
                const height = `${(d.value / maxMoisture) * 80}px`;
                const color = d.value < 30 ? "#ef4444" : d.value > 70 ? "#3b82f6" : "#2d7a4f";
                
                return (
                  <div className="flex-1 flex flex-col items-center gap-1 group" key={idx}>
                    <div className="text-[10px] font-medium text-[#6b7468]">{d.value}%</div>
                    <div 
                      className="w-full rounded-t-[5px] transition-opacity cursor-pointer opacity-90 group-hover:opacity-100" 
                      style={{ height, background: color }}
                    />
                    <div className="text-[9.5px] text-[#9ea89b] uppercase tracking-[0.04em]">{d.date || `D${idx+1}`}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-4 gap-[10px]">
          <div onClick={() => navigate('/plots')} className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex items-center gap-3 hover:border-[#b6dfc8] hover:bg-[#fafcf9] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(45,122,79,0.07)] transition-all cursor-pointer">
            <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-[16px] shrink-0 bg-[#e8f5ee] text-[#2d7a4f]">
              <LayoutGrid size={16} />
            </div>
            <div>
              <div className="text-[12.5px] font-semibold text-[#1a1f16] mb-0.5">View Plots</div>
              <div className="text-[11px] text-[#9ea89b] leading-[1.3]">Manage farm plots & boundaries</div>
            </div>
          </div>

          <div onClick={() => navigate('/market')} className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex items-center gap-3 hover:border-[#b6dfc8] hover:bg-[#fafcf9] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(45,122,79,0.07)] transition-all cursor-pointer">
            <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-[16px] shrink-0 bg-[#fef3c7] text-[#d97706]">
              <IndianRupee size={16} />
            </div>
            <div>
              <div className="text-[12.5px] font-semibold text-[#1a1f16] mb-0.5">Market Prices</div>
              <div className="text-[11px] text-[#9ea89b] leading-[1.3]">Live mandi & crop price feeds</div>
            </div>
          </div>

          <div onClick={() => navigate('/assistant')} className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex items-center gap-3 hover:border-[#b6dfc8] hover:bg-[#fafcf9] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(45,122,79,0.07)] transition-all cursor-pointer">
            <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-[16px] shrink-0 bg-[#eff6ff] text-[#2563eb]">
              <MessageSquare size={16} />
            </div>
            <div>
              <div className="text-[12.5px] font-semibold text-[#1a1f16] mb-0.5">Smart Assistant</div>
              <div className="text-[11px] text-[#9ea89b] leading-[1.3]">Get AI-powered farm advice</div>
            </div>
          </div>

          <div onClick={() => navigate('/advisories')} className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex items-center gap-3 hover:border-[#b6dfc8] hover:bg-[#fafcf9] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(45,122,79,0.07)] transition-all cursor-pointer">
            <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-[16px] shrink-0 bg-[#fdf4ff] text-[#9333ea]">
              <Star size={16} />
            </div>
            <div>
              <div className="text-[12.5px] font-semibold text-[#1a1f16] mb-0.5">View Advisories</div>
              <div className="text-[11px] text-[#9ea89b] leading-[1.3]">AI crop recommendations</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};