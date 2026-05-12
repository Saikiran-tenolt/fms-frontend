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

const EMPTY_ARRAY: any[] = [];

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
    return { plots, selectedPlot, selectedPlotId: selectedId, hasFetched, sensorData, trendData, advisories, weather, forecast, userPincode };
  }
);

export const DashboardPage: React.FC = React.memo(() => {
  console.count('dashboard render');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const dashboard = useAppSelector(selectDashboardData);
  const { plots, selectedPlot, selectedPlotId, hasFetched, sensorData, trendData, advisories, weather, forecast, userPincode } = dashboard;

  const forecastDays = useMemo(() => (forecast ? getDailyForecast(forecast) : EMPTY_ARRAY), [forecast]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const timeSinceUpdate = useMemo(() => 'just now', [tick]);

  const hasShownNotifications = useRef(false);
  const toast = useToastContext();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; }, [toast]);

  const plotsRef = useRef(plots);
  useEffect(() => { plotsRef.current = plots; }, [plots]);

  const selectedPlotIdRef = useRef(selectedPlotId);
  useEffect(() => { selectedPlotIdRef.current = selectedPlotId; }, [selectedPlotId]);

  const userPincodeRef = useRef(userPincode);
  useEffect(() => { userPincodeRef.current = userPincode; }, [userPincode]);

  const handlePlotChange = useCallback((id: string) => dispatch(selectPlot(id)), [dispatch]);

  const hasFiredFetchRef = useRef(false);
  useEffect(() => {
    if (!hasFiredFetchRef.current) {
      hasFiredFetchRef.current = true;
      dispatch(fetchAllPlots());
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (plots.length > 0 && !selectedPlotId) dispatch(selectPlot(plots[0]._id));
  }, [plots.length, selectedPlotId, dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (hasFetched && plots.length === 0) navigate('/plots/create', { replace: true });
  }, [hasFetched, plots.length, navigate]);

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
  }, []);

  const isLoadingRef = useRef(false);
  const lastLoadedPlotIdRef = useRef<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    const currentSelectedId = selectedPlotIdRef.current;
    if (isLoadingRef.current || !currentSelectedId) return;
    if (lastLoadedPlotIdRef.current === currentSelectedId) return;
    const plot = plotsRef.current.find((p: any) => p._id === currentSelectedId);
    if (!plot) return;
    isLoadingRef.current = true;
    lastLoadedPlotIdRef.current = currentSelectedId;
    try {
      batch(() => {
        const { lat, lon } = getPlotCoordinates(plot.location);
        if (lat !== undefined && lon !== undefined) {
          dispatch(fetchWeatherAndAdvisories({ lat, lon }) as any);
        } else if (userPincodeRef.current) {
          dispatch(fetchWeatherAndAdvisories({ pincode: userPincodeRef.current }) as any);
        }
        const mockData = generateMockSensorData(currentSelectedId, plot.environmentType);
        const mockTrend = generateMockTrendData();
        dispatch(setSensorReadings({ plotId: currentSelectedId, sensorData: mockData, trendSensor: 'soilMoisture', trendData: mockTrend }));
      });
    } finally {
      isLoadingRef.current = false;
    }
  }, [dispatch]);

  useEffect(() => {
    if (plots.length > 0 && selectedPlotId) loadDashboardData();
  }, [selectedPlotId, loadDashboardData]);

  const moisture = sensorData?.soilMoisture?.value || 0;
  const isRaining = (weather?.weather?.[0]?.main || '').toLowerCase().includes('rain');
  const shouldWater = moisture < 40 && !isRaining;
  const latestAdvisory = advisories?.[0];
  const trendList = trendData;

  const maxMoisture = useMemo(
    () => (trendList.length > 0 ? Math.max(...trendList.map((t: any) => t.value), 60) : 60),
    [trendList]
  );

  const handleExecuteCommand = useCallback(() => { toastRef.current.success('Irrigation command sent'); }, []);
  const handleReviewAdvisory = useCallback(() => {
    toastRef.current.toast('Linking Command Protocol...');
    setTimeout(() => toastRef.current.success('Sequence Optimized & Dispatched'), 2000);
  }, []);

  // ── Shared class tokens ────────────────────────────────────────────────────
  const card = 'bg-white border border-[#e8eae5] rounded-[10px] p-4';
  const sectionTitle = 'text-[13px] font-semibold text-[#1a1f16]';
  const sectionSub = 'text-[11px] text-[#9ea89b] mt-0.5 mb-3';
  const badgeBase = 'text-[9.5px] font-semibold px-[7px] py-[2px] rounded-full tracking-[0.04em] uppercase';
  const quickCard = 'bg-white border border-[#e8eae5] rounded-[10px] p-6 min-h-[90px] flex items-center gap-4 cursor-pointer hover:border-[#b6dfc8] hover:bg-[#fafcf9] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(45,122,79,0.07)] transition-all';
  const quickIcon = 'w-[34px] h-[34px] rounded-lg flex items-center justify-center shrink-0';

  return (
    <div className="flex-1 bg-[#f5f6f4] min-h-screen text-[#1a1f16]">
      {!hasFetched || plots.length === 0 || !sensorData ? (
        <SkeletonDashboard />
      ) : (
        <main className="p-6 flex flex-col gap-3">
          <DashboardHeader
            plots={plots}
            selectedPlot={selectedPlot}
            currentCropId={selectedPlot?.cropType}
            currentStageId={selectedPlot?.cropStage}
            onPlotChange={handlePlotChange}
          />

          {/* ── SENSOR CARDS ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-3">
            {/* Soil Moisture */}
            <div className={card}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#9ea89b]">Soil Moisture</span>
                <span className={`${badgeBase} bg-[#e8f5ee] text-[#2d7a4f]`}>
                  {moisture < 30 ? 'Low' : moisture > 70 ? 'High' : 'Optimal'}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[26px] font-bold text-[#1a1f16] leading-none">{moisture}</span>
                <span className="text-[13px] text-[#9ea89b]">%</span>
              </div>
              <div className="text-[10.5px] text-[#9ea89b]">Updated {timeSinceUpdate}</div>
            </div>

            {/* Temperature */}
            <div className={card}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#9ea89b]">Temperature</span>
                <span className={`${badgeBase} bg-[#fef3c7] text-[#d97706]`}>
                  {weather?.main?.temp !== undefined && Math.round(weather.main.temp) > 35 ? 'High' : 'Optimal'}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[26px] font-bold text-[#1a1f16] leading-none">
                  {weather?.main?.temp !== undefined ? Math.round(weather.main.temp) : sensorData?.temperature?.value || 22}
                </span>
                <span className="text-[13px] text-[#9ea89b]">°C</span>
              </div>
              <div className="text-[10.5px] text-[#9ea89b]">Updated {timeSinceUpdate}</div>
            </div>

            {/* Humidity */}
            <div className={card}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#9ea89b]">Humidity</span>
                <span className={`${badgeBase} bg-[#eff6ff] text-[#2563eb]`}>Normal</span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[26px] font-bold text-[#1a1f16] leading-none">
                  {weather?.main?.humidity !== undefined ? weather.main.humidity : sensorData?.humidity?.value || 65}
                </span>
                <span className="text-[13px] text-[#9ea89b]">%</span>
              </div>
              <div className="text-[10.5px] text-[#9ea89b]">Updated {timeSinceUpdate}</div>
            </div>

            {/* Soil Temp */}
            <div className={card}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold tracking-[0.08em] uppercase text-[#9ea89b]">Soil Temp</span>
                <span className={`${badgeBase} bg-[#e8f5ee] text-[#2d7a4f]`}>Optimal</span>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[26px] font-bold text-[#1a1f16] leading-none">
                  {sensorData?.soilTemperature?.value || 22}
                </span>
                <span className="text-[13px] text-[#9ea89b]">°C</span>
              </div>
              <div className="text-[10.5px] text-[#9ea89b]">Updated {timeSinceUpdate}</div>
            </div>
          </div>

          {/* ── ADVISORY CARDS ───────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            {/* Water Now */}
            <div className={`${card} flex flex-col gap-3`}>
              <div className="flex items-start gap-3">
                <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center shrink-0 bg-[#e8f5ee] text-[#2d7a4f]">
                  <Droplet size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#1a1f16] mb-0.5">
                    {shouldWater ? 'Water Now' : 'Optimal Moisture'}
                  </div>
                  <div className="text-[11.5px] text-[#6b7468] leading-relaxed">
                    {shouldWater
                      ? `Soil moisture at ${moisture}% — below optimal threshold. No rain expected.`
                      : `Soil moisture at ${moisture}% — within optimal range. No immediate action needed.`}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#f0f1ee]">
                <span className="text-[10.5px] text-[#9ea89b]">
                  Suggested window:{' '}
                  <span className="font-medium text-[#6b7468]">{shouldWater ? '05:30 AM to 07:30 AM' : 'N/A'}</span>
                </span>
                <button
                  onClick={handleExecuteCommand}
                  className="text-[11.5px] font-medium text-[#2d7a4f] border border-[#b6dfc8] bg-[#e8f5ee] px-3 py-[5px] rounded-md hover:bg-[#d4efe1] transition-colors"
                >
                  Execute Command
                </button>
              </div>
            </div>

            {/* AI Advisory */}
            <div className={`${card} flex flex-col gap-3`}>
              <div className="flex items-start gap-3">
                <div className="w-[32px] h-[32px] rounded-lg flex items-center justify-center shrink-0 bg-[#fef3c7] text-[#d97706]">
                  <Brain size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#1a1f16] mb-0.5">
                    {latestAdvisory ? latestAdvisory.title : 'Irrigation Recommended'}
                  </div>
                  <div className="text-[11.5px] text-[#6b7468] leading-relaxed line-clamp-2">
                    {latestAdvisory
                      ? latestAdvisory.description
                      : 'Soil moisture levels are below optimal range for rice cultivation.'}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#f0f1ee]">
                <span className="text-[10.5px] text-[#9ea89b]">
                  AI Generated: <span className="font-medium text-[#6b7468]">Optimization Feed</span>
                </span>
                <button
                  onClick={handleReviewAdvisory}
                  className="text-[11.5px] font-medium px-3 py-[5px] rounded-md transition-colors border border-[#fcd34d] text-[#d97706] bg-[#fef3c7] hover:bg-[#fde68a]"
                >
                  Review Advisory
                </button>
              </div>
            </div>
          </div>

          {/* ── WEATHER FORECAST ─────────────────────────────────────────── */}
          {forecastDays.length > 0 && (
            <div className={card}>
              <div className={sectionTitle}>7-Day Weather Forecast</div>
              <div className={sectionSub}>Based on local telemetry and API</div>
              <div className="grid grid-cols-7 gap-2">
                {forecastDays.map((day: any, idx: number) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center gap-1 px-1.5 py-2.5 rounded-lg border transition-colors cursor-pointer ${idx === 0
                        ? 'bg-[#e8f5ee] border-[#b6dfc8]'
                        : 'border-transparent hover:bg-[#f5f6f4] hover:border-[#e8eae5]'
                      }`}
                  >
                    <span className={`text-[10px] font-semibold tracking-[0.06em] uppercase ${idx === 0 ? 'text-[#2d7a4f]' : 'text-[#9ea89b]'}`}>
                      {day.dateStr}
                    </span>
                    <span className="text-[18px] my-1">
                      {getWeatherIcon(day.condition, 'w-5 h-5 stroke-[1.5] text-zinc-700')}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[13px] font-semibold text-[#1a1f16]">{Math.round(day.tempMax)}°</span>
                      <span className="text-[11px] text-[#9ea89b]">{Math.round(day.tempMin)}°</span>
                    </div>
                    <span className="text-[9.5px] text-[#9ea89b] text-center leading-tight truncate w-full">
                      {day.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SOIL MOISTURE TREND ──────────────────────────────────────── */}
          {trendList.length > 0 && (
            <div className="bg-white border border-[#e8eae5] rounded-[10px] p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className={sectionTitle}>Soil Moisture Trend</div>
                  <div className="text-[11px] text-[#9ea89b] mt-0.5">7-day saturation index from IoT sensor network</div>
                </div>
                <div className="flex items-center gap-4 pt-0.5">
                  <div className="flex items-center gap-1.5 text-[10.5px] text-[#6b7468]">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#ef4444] shrink-0" />Critical &lt;30%
                  </div>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-[#6b7468]">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#2d7a4f] shrink-0" />Optimal 30–70%
                  </div>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-[#6b7468]">
                    <span className="w-[6px] h-[6px] rounded-full bg-[#3b82f6] shrink-0" />High &gt;70%
                  </div>
                </div>
              </div>
              <div className="flex gap-3 items-end h-[140px]">
                {trendList.slice(-7).map((d: any, idx: number) => {
                  const height = `${(d.value / maxMoisture) * 100}px`;
                  const color = d.value < 30 ? '#ef4444' : d.value > 70 ? '#3b82f6' : '#2d7a4f';
                  return (
                    <div className="flex-1 flex flex-col items-center gap-1.5 group" key={idx}>
                      <span className="text-[11px] font-medium text-[#6b7468] mb-1">{d.value}%</span>
                      <div
                        className="w-full rounded-t-[5px] opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer"
                        style={{ height, background: color }}
                      />
                      <span className="text-[10px] text-[#9ea89b] uppercase tracking-[0.04em] mt-1">
                        {d.date || `D${idx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── QUICK ACTIONS ────────────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-3">
            <div onClick={() => navigate('/plots')} className={quickCard}>
              <div className={`${quickIcon} bg-[#e8f5ee] text-[#2d7a4f]`}><LayoutGrid size={16} /></div>
              <div>
                <div className="text-[12.5px] font-semibold text-[#1a1f16]">View Plots</div>
                <div className="text-[11px] text-[#9ea89b] leading-[1.3] mt-0.5">Manage farm plots & boundaries</div>
              </div>
            </div>

            <div onClick={() => navigate('/market')} className={quickCard}>
              <div className={`${quickIcon} bg-[#fef3c7] text-[#d97706]`}><IndianRupee size={16} /></div>
              <div>
                <div className="text-[12.5px] font-semibold text-[#1a1f16]">Market Prices</div>
                <div className="text-[11px] text-[#9ea89b] leading-[1.3] mt-0.5">Live mandi & crop price feeds</div>
              </div>
            </div>

            <div onClick={() => navigate('/assistant')} className={quickCard}>
              <div className={`${quickIcon} bg-[#eff6ff] text-[#2563eb]`}><MessageSquare size={16} /></div>
              <div>
                <div className="text-[12.5px] font-semibold text-[#1a1f16]">Smart Assistant</div>
                <div className="text-[11px] text-[#9ea89b] leading-[1.3] mt-0.5">Get AI-powered farm advice</div>
              </div>
            </div>

            <div onClick={() => navigate('/advisories')} className={quickCard}>
              <div className={`${quickIcon} bg-[#fdf4ff] text-[#9333ea]`}><Star size={16} /></div>
              <div>
                <div className="text-[12.5px] font-semibold text-[#1a1f16]">View Advisories</div>
                <div className="text-[11px] text-[#9ea89b] leading-[1.3] mt-0.5">AI crop recommendations</div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
});

DashboardPage.displayName = 'DashboardPage';