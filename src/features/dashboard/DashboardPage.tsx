import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { shallowEqual } from 'react-redux';
import { setSensorData, setTrendData } from '../sensors/sensorsSlice';
import { fetchWeatherAndAdvisories, setAdvisories } from '../advisories/advisoriesSlice';
import { SkeletonDashboard } from '../../components/ui';
import { useToastContext } from '../../components/toast';
import {
  Droplet,
  IndianRupee,
  MessageSquare,
  Brain,
  LayoutGrid,
  Star,
} from 'lucide-react';
import { DashboardHeader } from './components/DashboardHeader';
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

export const DashboardPage: React.FC = React.memo(() => {
  console.count('DashboardPage rendered');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // ── Granular selectors ───────────────────────────────────────────────────────
  // Primitives: default ref-equality is sufficient.
  // Arrays: shallowEqual prevents re-renders when Immer produces a new array
  // reference with identical contents (happens on every unrelated dispatch).
  const plots = useAppSelector((state: any) => state.plots.plots, shallowEqual);
  const selectedPlotId = useAppSelector((state: any) => state.plots.selectedPlotId);
  const plotsLoading = useAppSelector((state: any) => state.plots.loading);
  const hasFetched = useAppSelector((state: any) => state.plots.hasFetched);

  const sensorData = useAppSelector((state: any) => state.sensors.sensorData);
  const trendData = useAppSelector((state: any) => state.sensors.trendData);

  const notifications = useAppSelector((state: any) => state.notifications.notifications, shallowEqual);

  const realWeather = useAppSelector((state: any) => state.advisories.weatherData);
  const forecastData = useAppSelector((state: any) => state.advisories.forecastData);
  const advisories = useAppSelector((state: any) => state.advisories.advisories, shallowEqual);

  const userPincode = useAppSelector((state: any) => state.auth.user?.pincode);

  const forecastDays = useMemo(
    () => (forecastData ? getDailyForecast(forecastData) : []),
    [forecastData]
  );

  // ── Merged local state: one setState = one render ────────────────────────────
  const [dashState, setDashState] = useState({ loading: false, timeSinceUpdate: 'just now' });
  const loading = dashState.loading;
  const timeSinceUpdate = dashState.timeSinceUpdate;

  const hasShownNotifications = useRef(false);

  // ── Toast ref: keeps toast out of effect deps to prevent re-render loop ──────
  const toast = useToastContext();
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; });

  // ── Plots ref: lets loadDashboardData read latest plots without listing
  //    the array in useCallback deps (new array ref on every Immer update) ──────
  const plotsRef = useRef(plots);
  useEffect(() => { plotsRef.current = plots; }, [plots]);

  const selectedPlot = useMemo(
    () => plots.find((p: any) => p._id === selectedPlotId) ?? null,
    [plots, selectedPlotId]
  );

  // ── Stable plot-change handler ───────────────────────────────────────────────
  // Previously passed as an inline arrow `(id) => dispatch(selectPlot(id))`.
  // That created a new function reference on every DashboardPage render, which
  // bypassed DashboardHeader's React.memo — causing it to re-render even when
  // plots and selectedPlot hadn't changed. useCallback fixes this.
  const handlePlotChange = useCallback(
    (id: string) => dispatch(selectPlot(id)),
    [dispatch]
  );

  // ── Effect 1: Initial fetch ──────────────────────────────────────────────────
  useEffect(() => {
    if (plots.length === 0 && !plotsLoading && !hasFetched) {
      dispatch(fetchAllPlots());
    }
  }, [dispatch, plots.length, plotsLoading, hasFetched]);

  // ── Effect 2: Auto-select first plot ────────────────────────────────────────
  useEffect(() => {
    if (plots.length > 0 && !selectedPlotId) {
      dispatch(selectPlot(plots[0]._id));
    }
  }, [plots, selectedPlotId, dispatch]);

  // ── Effect 3: Navigate away if user has no plots ─────────────────────────────
  useEffect(() => {
    if (hasFetched && !plotsLoading && plots.length === 0) {
      navigate('/plots/create', { replace: true });
    }
  }, [hasFetched, plotsLoading, plots.length, navigate]);

  // ── Effect 4: Show unread notification toasts once on mount ─────────────────
  useEffect(() => {
    if (!loading && notifications.length > 0 && !hasShownNotifications.current) {
      const unread = notifications.filter((n: any) => !n.isRead);
      if (unread.length > 0) {
        unread.forEach((n: any, index: number) => {
          setTimeout(() => {
            toastRef.current.toast(n.title, n.message);
          }, index * 500);
        });
        hasShownNotifications.current = true;
      }
    }
  }, [loading, notifications]); // toast read via ref — intentionally omitted from deps

  // ── loadDashboardData ────────────────────────────────────────────────────────
  // Deps: [selectedPlotId, userPincode, dispatch]
  // - selectedPlot object excluded: new reference on every Immer update
  // - plots array excluded: read via plotsRef to avoid callback recreation
  const loadDashboardData = useCallback(async () => {
    const plot = plotsRef.current.find((p: any) => p._id === selectedPlotId);
    if (!plot) return;

    setDashState({ loading: true, timeSinceUpdate: 'just now' });
    await new Promise((resolve) => setTimeout(resolve, 800));

    dispatch(setSensorData({ plotId: plot._id, data: generateMockSensorData(plot._id, plot.environmentType) }));
    dispatch(setTrendData({ plotId: plot._id, sensor: 'soilMoisture', data: generateMockTrendData() }));

    const { lat, lon } = getPlotCoordinates(plot.location);
    if (lat !== undefined && lon !== undefined) {
      dispatch(fetchWeatherAndAdvisories({ lat, lon }) as any);
    } else if (userPincode) {
      dispatch(fetchWeatherAndAdvisories({ pincode: userPincode }) as any);
    }

    dispatch(setAdvisories(mockAdvisories));
    setDashState({ loading: false, timeSinceUpdate: 'just now' });
  }, [selectedPlotId, userPincode, dispatch]);

  // ── Effect 5: Reload data when selected plot changes ────────────────────────
  // plotsLoading excluded: cycles false→true→false during fetchAllPlots,
  //   causing 2–3 extra loadDashboardData calls per page load.
  // loadDashboardData excluded: selectedPlotId already covers it;
  //   including both caused a double-fire on every plot change.
  useEffect(() => {
    if (plots.length > 0 && selectedPlotId) {
      loadDashboardData();
    } else if (!plotsLoading && plots.length === 0) {
      setDashState((prev) => ({ ...prev, loading: false }));
    }
  }, [selectedPlotId, plots.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effect 6: 1-minute freshness ticker ─────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => {
      setDashState((prev) => ({ ...prev, timeSinceUpdate: '1 min ago' }));
    }, 60000);
    return () => clearInterval(timer);
  }, [selectedPlotId]);

  // ── Derived data (all hooks above — Rules of Hooks) ──────────────────────────
  const currentSensors = selectedPlotId ? sensorData[selectedPlotId] : null;
  const moisture = currentSensors?.soilMoisture?.value || 0;
  const isRaining = (realWeather?.weather?.[0]?.main || '').toLowerCase().includes('rain');
  const shouldWater = moisture < 40 && !isRaining;
  const latestAdvisory = advisories?.[0];
  const trendList = trendData[`${selectedPlotId}_soilMoisture`] || [];

  const maxMoisture = useMemo(
    () => (trendList.length > 0 ? Math.max(...trendList.map((t: any) => t.value), 60) : 60),
    [trendList]
  );

  // ── Early returns (after all hooks) ─────────────────────────────────────────
  if (plotsLoading || (plots.length === 0 && !hasFetched)) return <SkeletonDashboard />;
  if (plots.length === 0) return <SkeletonDashboard />;
  if (loading) return <SkeletonDashboard />;

  return (
    <div className="flex-1 bg-[#f5f6f4] min-h-screen text-[#1a1f16]">
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
                {realWeather && Math.round(realWeather.main.temp) > 35 ? 'High' : 'Optimal'}
              </span>
            </div>
            <div className="text-[26px] font-bold text-[#1a1f16] leading-none">
              {realWeather ? Math.round(realWeather.main.temp) : currentSensors?.temperature?.value || 22}
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
              {realWeather ? realWeather.main.humidity : currentSensors?.humidity?.value || 65}
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
              {currentSensors?.soilTemperature?.value || 22}
              <span className="text-[13px] text-[#9ea89b] ml-1">°C</span>
            </div>
            <div className="text-[10.5px] text-[#9ea89b]">Updated 5 mins ago</div>
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
                onClick={() => {
                  toast.toast('Linking Command Protocol...');
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
    </div>
  );
});

DashboardPage.displayName = 'DashboardPage';