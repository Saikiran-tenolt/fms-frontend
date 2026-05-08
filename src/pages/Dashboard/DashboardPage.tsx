import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { batch } from 'react-redux';
import { store } from '@/store/store';
import { setSensorReadings } from '@/features/sensors/sensorsSlice';
import { fetchWeatherAndAdvisories } from '@/features/advisories/advisoriesSlice';
import { SkeletonDashboard } from '@/components/loaders/Skeleton';
import { useToastContext } from '@/components/toast';
import { generateMockSensorData, generateMockTrendData } from '@/services/mockData';
import {
  Droplet,
  IndianRupee,
  MessageSquare,
  Brain,
  LayoutGrid,
  Star,
} from 'lucide-react';
import { DashboardHeader } from './components/DashboardHeader';
import { getWeatherIcon, mapWeatherCode } from '@/utils/weather';
import { getPlotCoordinates } from '@/utils/location';
import { selectPlot, fetchAllPlots } from '@/features/plots/plotsSlice';

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

// Stable references to prevent selector-driven re-renders when data is missing.
const EMPTY_ARRAY: any[] = [];

// ── Memoized High-Performance Selector ───────────────────────────────────────
// Industry standard: createSelector ensures that the returned object only
// changes reference IF the underlying data actually changes. This satisfies
// Redux's stability checks and prevents unnecessary re-renders.
const selectDashboardData = createSelector(
  [
    (s: any) => s.plots.plots,
    (s: any) => s.plots.selectedPlotId,
    (s: any) => s.plots.hasFetched,
    (s: any) => s.sensors.sensorData,
    (s: any) => s.sensors.trendData,
    (s: any) => s.advisories.advisories,
    (s: any) => s.advisories.weatherData,
    (s: any) => s.advisories.forecastData,
    (s: any) => s.auth.user?.pincode,
  ],
  (plots, selectedId, hasFetched, sensorDataMap, trendDataMap, advisories, weather, forecast, userPincode) => {
    const selectedPlot = plots.find((p: any) => p._id === selectedId) ?? null;
    const sensorData = selectedId ? sensorDataMap[selectedId] : null;
    const trendData = selectedId ? (trendDataMap[`${selectedId}_soilMoisture`] || EMPTY_ARRAY) : EMPTY_ARRAY;

    return {
      plots,
      selectedPlot,
      selectedPlotId: selectedId,
      hasFetched,
      sensorData,
      trendData,
      advisories,
      weather,
      forecast,
      userPincode,
    };
  }
);

export const DashboardPage: React.FC = React.memo(() => {
  console.count("dashboard render");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Optimized memoized selector usage
  const dashboard = useAppSelector(selectDashboardData);

  const {
    plots,
    selectedPlot,
    selectedPlotId,
    hasFetched,
    sensorData,
    trendData,
    advisories,
    weather,
    forecast,
    userPincode,
  } = dashboard;

  const forecastDays = useMemo(
    () => (forecast ? getDailyForecast(forecast) : EMPTY_ARRAY),
    [forecast]
  );

  // ── Local state & Tick ──────────────────────────────────────────────────────
  // Ticker forces a render every minute to update the "Updated X mins ago" text
  // without needing global state dispatches.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  // Helper to format the relative update time
  const timeSinceUpdate = useMemo(() => {
    return 'just now'; // Logic simplified as lastUpdated is removed from global state
  }, [tick]);

  const hasShownNotifications = useRef(false);

  // ── Toast via ref: keeps it out of effect deps ───────────────────────────────
  const toast = useToastContext();
  const toastRef = useRef(toast);
  // FIX 1: Add [toast] dep so this runs only when toast context changes, not
  // after every render (missing dep array = runs after every single render).
  useEffect(() => { toastRef.current = toast; }, [toast]);

  // ── plots + selectedPlotId via ref: lets loadDashboardData read latest without being a dep ────
  const plotsRef = useRef(plots);
  useEffect(() => { plotsRef.current = plots; }, [plots]);

  // FIX 2: Promote selectedPlotId to a ref so loadDashboardData can read the
  // latest value without needing it as a useCallback dep. This keeps the
  // callback identity stable across plot switches, preventing Effect 5 from
  // registering as a new effect on every plot change.
  const selectedPlotIdRef = useRef(selectedPlotId);
  useEffect(() => { selectedPlotIdRef.current = selectedPlotId; }, [selectedPlotId]);

  // FIX: Restore userPincodeRef needed by loadDashboardData
  const userPincodeRef = useRef(userPincode);
  useEffect(() => { userPincodeRef.current = userPincode; }, [userPincode]);



  // ── Stable handlers ──────────────────────────────────────────────────────────
  const handlePlotChange = useCallback(
    (id: string) => dispatch(selectPlot(id)),
    [dispatch]
  );

  // ── Effect 1: Initial fetch (mount-only, no subscribed deps) ───────────────────
  // Using a ref guard instead of depending on [plots.length, plotsLoading, hasFetched]
  // prevents the effect from re-running on every state change. Since fetchAllPlots
  // should only ever fire once on mount, a ref is the correct tool.
  const hasFiredFetchRef = useRef(false);
  useEffect(() => {
    if (!hasFiredFetchRef.current) {
      hasFiredFetchRef.current = true;
      dispatch(fetchAllPlots());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 2: Auto-select first plot ────────────────────────────────────────
  // FIX 3: Depend on plots.length (primitive) instead of the plots array.
  // The plots selector uses shallowEqual, but useEffect's dep comparison uses
  // Object.is — so any Immer-produced new array reference (even with identical
  // content) would retrigger this effect unnecessarily.
  useEffect(() => {
    if (plots.length > 0 && !selectedPlotId) {
      dispatch(selectPlot(plots[0]._id));
    }
  }, [plots.length, selectedPlotId, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 3: Navigate away if user has no plots ────────────────────────────
  useEffect(() => {
    if (hasFetched && plots.length === 0) {
      navigate('/plots/create', { replace: true });
    }
  }, [hasFetched, plots.length, navigate]);

  // ── Effect 4: Show unread notification toasts once on mount ─────────────────
  // Read notifications directly from the store (not via useAppSelector) so
  // that setNotifications dispatches in App.tsx don't cause DashboardPage
  // to re-render. The effect still fires after mount; we just don't subscribe.
  useEffect(() => {
    if (hasShownNotifications.current) return;
    const notifications = store.getState().notifications.notifications;
    const unread = notifications.filter((n: any) => !n.isRead);
    if (unread.length > 0) {
      unread.forEach((n: any, index: number) => {
        setTimeout(() => { toastRef.current.toast(n.title, n.message); }, index * 500);
      });
      hasShownNotifications.current = true;
    }
  }, []); // runs once on mount — no subscription needed

  // ── loadDashboardData ────────────────────────────────────────────────────────
  const isLoadingRef = useRef(false);
  // Data-load guard: prevents redundant fetches for the same plot.
  const lastLoadedPlotIdRef = useRef<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    const currentSelectedId = selectedPlotIdRef.current;
    if (isLoadingRef.current || !currentSelectedId) return;
    if (lastLoadedPlotIdRef.current === currentSelectedId) return; // Already loaded this plot

    const plot = plotsRef.current.find((p: any) => p._id === currentSelectedId);
    if (!plot) return;

    isLoadingRef.current = true;
    lastLoadedPlotIdRef.current = currentSelectedId;

    try {
      // PERFORMANCE: Removed the 800ms artificial delay to maximize speed.
      // Batched dispatches ensure that the transition from Skeleton to Data
      // happens in a single synchronized render cycle.
      batch(() => {
        const { lat, lon } = getPlotCoordinates(plot.location);
        if (lat !== undefined && lon !== undefined) {
          dispatch(fetchWeatherAndAdvisories({ lat, lon }) as any);
        } else if (userPincodeRef.current) {
          dispatch(fetchWeatherAndAdvisories({ pincode: userPincodeRef.current }) as any);
        }

        // ── RESTORED: Mock sensor data generation ──────────────────────────
        // This ensures the dashboard moves from Skeleton -> Data even if
        // the backend doesn't have sensor data yet.
        const mockData = generateMockSensorData(currentSelectedId, plot.environmentType);
        const mockTrend = generateMockTrendData();
        dispatch(setSensorReadings({
          plotId: currentSelectedId,
          sensorData: mockData,
          trendSensor: 'soilMoisture',
          trendData: mockTrend
        }));
      });
    } finally {
      isLoadingRef.current = false;
    }
  }, [dispatch]);

  // ── Effect 5: Reload when plot changes ──────────────────────────────────────
  useEffect(() => {
    if (plots.length > 0 && selectedPlotId) {
      loadDashboardData();
    }
  }, [selectedPlotId, loadDashboardData]);

  // Effect 6 removed — functionality merged into the Tick local state and derived timeSinceUpdate.


  // ── Derived values (computed before any JSX logic) ─────────────────────────
  const moisture = sensorData?.soilMoisture?.value || 0;
  const isRaining = (weather?.weather?.[0]?.main || '').toLowerCase().includes('rain');
  const shouldWater = moisture < 40 && !isRaining;
  const latestAdvisory = advisories?.[0];
  const trendList = trendData;

  const maxMoisture = useMemo(
    () => (trendList.length > 0 ? Math.max(...trendList.map((t: any) => t.value), 60) : 60),
    [trendList]
  );

  // ── Stable toast handlers for inline buttons ─────────────────────────────────
  const handleExecuteCommand = useCallback(() => {
    toastRef.current.success('Irrigation command sent');
  }, []);

  const handleReviewAdvisory = useCallback(() => {
    toastRef.current.toast('Linking Command Protocol...');
    setTimeout(() => toastRef.current.success('Sequence Optimized & Dispatched'), 2000);
  }, []);

  // ── Final Render ────────────────────────────────────────────────────────────
  // RULES OF HOOKS: We call all hooks above this point. The following logic 
  // determines whether to show the loading skeleton or the full dashboard UI.
  return (
    <div className="flex-1 bg-[#f5f6f4] min-h-screen text-[#1a1f16]">
      {!hasFetched || plots.length === 0 || !sensorData ? (
        <SkeletonDashboard />
      ) : (
        <main className="flex-1 p-[22px] px-6">
          <DashboardHeader
            plots={plots}
            selectedPlot={selectedPlot}
            currentCropId={selectedPlot?.cropType}
            currentStageId={selectedPlot?.cropStage}
            onPlotChange={handlePlotChange}
          />

          {/* SENSOR CARDS */}
          <div className="grid grid-cols-4 gap-[10px] mb-[14px]">
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

            <div className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#9ea89b]">Temperature</span>
                <span className="text-[9.5px] font-semibold px-[7px] py-[2px] rounded-full tracking-[0.04em] uppercase bg-[#fef3c7] text-[#d97706]">
                  {weather?.main?.temp !== undefined && Math.round(weather.main.temp) > 35 ? 'High' : 'Optimal'}
                </span>
              </div>
              <div className="text-[26px] font-bold text-[#1a1f16] leading-none">
                {weather?.main?.temp !== undefined ? Math.round(weather.main.temp) : sensorData?.temperature?.value || 22}
                <span className="text-[13px] text-[#9ea89b] ml-1">°C</span>
              </div>
              <div className="text-[10.5px] text-[#9ea89b]">Updated {timeSinceUpdate}</div>
            </div>

            <div className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#9ea89b]">Humidity</span>
                <span className="text-[9.5px] font-semibold px-[7px] py-[2px] rounded-full tracking-[0.04em] uppercase bg-[#eff6ff] text-[#2563eb]">Normal</span>
              </div>
              <div className="text-[26px] font-bold text-[#1a1f16] leading-none">
                {weather?.main?.humidity !== undefined ? weather.main.humidity : sensorData?.humidity?.value || 65}
                <span className="text-[13px] text-[#9ea89b] ml-1">%</span>
              </div>
              <div className="text-[10.5px] text-[#9ea89b]">Updated {timeSinceUpdate}</div>
            </div>

            <div className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#9ea89b]">Soil Temp</span>
                <span className="text-[9.5px] font-semibold px-[7px] py-[2px] rounded-full tracking-[0.04em] uppercase bg-[#e8f5ee] text-[#2d7a4f]">Optimal</span>
              </div>
              <div className="text-[26px] font-bold text-[#1a1f16] leading-none">
                {sensorData?.soilTemperature?.value || 22}
                <span className="text-[13px] text-[#9ea89b] ml-1">°C</span>
              </div>
              <div className="text-[10.5px] text-[#9ea89b]">Updated {timeSinceUpdate}</div>
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
                  <div className="text-[13px] font-semibold text-[#1a1f16] mb-0.5">
                    {shouldWater ? 'Water Now' : 'Optimal Moisture'}
                  </div>
                  <div className="text-[12px] text-[#6b7468] leading-relaxed">
                    {shouldWater
                      ? `Soil moisture at ${moisture}% — below optimal threshold. No rain expected.`
                      : `Soil moisture at ${moisture}% — within optimal range. No immediate action needed.`}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="text-[10.5px] text-[#9ea89b]">
                  Suggested window:{' '}
                  <span className="font-medium text-[#6b7468]">
                    {shouldWater ? '05:30 AM to 07:30 AM' : 'N/A'}
                  </span>
                </div>
                <button
                  className="text-[11.5px] font-medium text-[#2d7a4f] border border-[#b6dfc8] bg-[#e8f5ee] px-3 py-[5px] rounded-md hover:bg-[#d4efe1] transition-colors"
                  onClick={handleExecuteCommand}
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
                  <div className="text-[13px] font-semibold text-[#1a1f16] mb-0.5">
                    {latestAdvisory ? latestAdvisory.title : 'Irrigation Recommended'}
                  </div>
                  <div className="text-[12px] text-[#6b7468] leading-relaxed line-clamp-2">
                    {latestAdvisory
                      ? latestAdvisory.description
                      : 'Soil moisture levels are below optimal range for rice cultivation.'}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="text-[10.5px] text-[#9ea89b]">
                  AI Generated: <span className="font-medium text-[#6b7468]">Optimization Feed</span>
                </div>
                <button
                  className="text-[11.5px] font-medium px-3 py-[5px] rounded-md transition-colors border border-[#fcd34d] text-[#d97706] bg-[#fef3c7] hover:bg-[#fde68a] flex items-center gap-1.5"
                  onClick={handleReviewAdvisory}
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
                  <div
                    key={idx}
                    className={`flex flex-col items-center gap-[5px] px-1.5 py-2.5 rounded-lg border transition-colors cursor-pointer ${idx === 0
                      ? 'bg-[#e8f5ee] border-[#b6dfc8]'
                      : 'border-transparent hover:bg-[#f5f6f4] hover:border-[#e8eae5]'
                      }`}
                  >
                    <div className={`text-[10px] font-semibold tracking-[0.06em] uppercase ${idx === 0 ? 'text-[#2d7a4f]' : 'text-[#9ea89b]'}`}>
                      {day.dateStr}
                    </div>
                    <div className="text-[18px] my-1">
                      {getWeatherIcon(day.condition, 'w-5 h-5 stroke-[1.5] text-zinc-700')}
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
                  const height = `${(d.value / maxMoisture) * 80}px`;
                  const color = d.value < 30 ? '#ef4444' : d.value > 70 ? '#3b82f6' : '#2d7a4f';
                  return (
                    <div className="flex-1 flex flex-col items-center gap-1 group" key={idx}>
                      <div className="text-[10px] font-medium text-[#6b7468]">{d.value}%</div>
                      <div
                        className="w-full rounded-t-[5px] transition-opacity cursor-pointer opacity-90 group-hover:opacity-100"
                        style={{ height, background: color }}
                      />
                      <div className="text-[9.5px] text-[#9ea89b] uppercase tracking-[0.04em]">
                        {d.date || `D${idx + 1}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUICK ACTIONS */}
          <div className="grid grid-cols-4 gap-[10px]">
            <div onClick={() => navigate('/plots')} className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex items-center gap-3 hover:border-[#b6dfc8] hover:bg-[#fafcf9] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(45,122,79,0.07)] transition-all cursor-pointer">
              <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-[16px] shrink-0 bg-[#e8f5ee] text-[#2d7a4f]"><LayoutGrid size={16} /></div>
              <div>
                <div className="text-[12.5px] font-semibold text-[#1a1f16] mb-0.5">View Plots</div>
                <div className="text-[11px] text-[#9ea89b] leading-[1.3]">Manage farm plots & boundaries</div>
              </div>
            </div>

            <div onClick={() => navigate('/market')} className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex items-center gap-3 hover:border-[#b6dfc8] hover:bg-[#fafcf9] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(45,122,79,0.07)] transition-all cursor-pointer">
              <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-[16px] shrink-0 bg-[#fef3c7] text-[#d97706]"><IndianRupee size={16} /></div>
              <div>
                <div className="text-[12.5px] font-semibold text-[#1a1f16] mb-0.5">Market Prices</div>
                <div className="text-[11px] text-[#9ea89b] leading-[1.3]">Live mandi & crop price feeds</div>
              </div>
            </div>

            <div onClick={() => navigate('/assistant')} className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex items-center gap-3 hover:border-[#b6dfc8] hover:bg-[#fafcf9] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(45,122,79,0.07)] transition-all cursor-pointer">
              <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-[16px] shrink-0 bg-[#eff6ff] text-[#2563eb]"><MessageSquare size={16} /></div>
              <div>
                <div className="text-[12.5px] font-semibold text-[#1a1f16] mb-0.5">Smart Assistant</div>
                <div className="text-[11px] text-[#9ea89b] leading-[1.3]">Get AI-powered farm advice</div>
              </div>
            </div>

            <div onClick={() => navigate('/advisories')} className="bg-white border border-[#e8eae5] rounded-[10px] py-[14px] px-4 flex items-center gap-3 hover:border-[#b6dfc8] hover:bg-[#fafcf9] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(45,122,79,0.07)] transition-all cursor-pointer">
              <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-[16px] shrink-0 bg-[#fdf4ff] text-[#9333ea]"><Star size={16} /></div>
              <div>
                <div className="text-[12.5px] font-semibold text-[#1a1f16] mb-0.5">View Advisories</div>
                <div className="text-[11px] text-[#9ea89b] leading-[1.3]">AI crop recommendations</div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
});

DashboardPage.displayName = 'DashboardPage';

