import React, { useEffect, useState } from 'react';
import {
  Cloud, Droplets, Wind, Eye,
  CloudRain, CloudSnow, Sun, CloudLightning,
  AlertTriangle, Loader2, RefreshCw, MapPin, Volume2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { fetchWeatherAndAdvisories } from '../advisories/advisoriesSlice';
import { fetchForecast, fetchForecastByPincode } from '../../services/weatherService';

// Map OWM icon codes to Lucide components + label + colors
const getWeatherDisplay = (main: string) => {
  const m = main.toLowerCase();
  if (m.includes('thunder')) return { icon: CloudLightning, color: 'text-violet-500', bg: 'bg-violet-50', label: 'Thunderstorm' };
  if (m.includes('rain') || m.includes('drizzle')) return { icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Rainy' };
  if (m.includes('snow')) return { icon: CloudSnow, color: 'text-sky-400', bg: 'bg-sky-50', label: 'Snow' };
  if (m.includes('cloud')) return { icon: Cloud, color: 'text-slate-500', bg: 'bg-slate-100', label: 'Cloudy' };
  return { icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Clear' };
};

const getRiskLevel = (main: string): { level: string; color: string; bg: string; advice: string } => {
  const m = main.toLowerCase();
  if (m.includes('thunder') || m.includes('storm')) return { level: 'HIGH', color: 'text-red-600', bg: 'bg-red-50 border-red-200', advice: 'Avoid field operations. Secure loose equipment and seek shelter.' };
  if (m.includes('rain') || m.includes('drizzle')) return { level: 'MEDIUM', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', advice: 'Delay irrigation. Natural precipitation may be sufficient for crops.' };
  if (m.includes('heat') || m.includes('hot')) return { level: 'MEDIUM', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', advice: 'Schedule irrigation for early morning or evening to reduce evaporation.' };
  return { level: 'LOW', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', advice: 'Conditions are favorable for all standard field operations.' };
};

// Map WMO weather codes (Open-Meteo) to conditions
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

// Transform Open-Meteo forecast into UI format
const transformOpenMeteo = (data: any) => {
  if (!data || !data.daily) return [];
  const { time, weather_code, temperature_2m_max, temperature_2m_min } = data.daily;
  return time.map((t: string, i: number) => {
    const { condition, description } = mapWeatherCode(weather_code[i]);
    return {
      date: t,
      label: new Date(t).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      tempMax: Math.round(temperature_2m_max[i]),
      tempMin: Math.round(temperature_2m_min[i]),
      weatherMain: condition,
      weatherDesc: description,
      icon: null,
    };
  });
};

export const WeatherPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { weatherData } = useAppSelector((state: any) => state.advisories);
  const { plots, selectedPlotId } = useAppSelector((state: any) => state.plots);
  const { user } = useAppSelector((state: any) => state.auth);
  const [forecast, setForecast] = useState<any[]>([]);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const selectedPlot = plots.find((p: any) => p._id === selectedPlotId);

  const loadData = async (silent = false) => {
    if (!silent) setForecastLoading(true);
    else setRefreshing(true);

    const loc = selectedPlot?.location as any;
    const lat = loc?.coordinates?.coordinates?.[1] ?? loc?.lat;
    const lon = loc?.coordinates?.coordinates?.[0] ?? loc?.lng;

    if (lat !== undefined && lon !== undefined) {
      dispatch(fetchWeatherAndAdvisories({ lat, lon }) as any);
      try {
        const res = await fetchForecast(lat, lon);
        setForecast(transformOpenMeteo(res));
      } catch (err) {
        console.error('Forecast fetch error:', err);
        toast.error('Failed to load forecast data');
      }
    } else if (user?.pincode) {
      dispatch(fetchWeatherAndAdvisories({ pincode: user.pincode }) as any);
      try {
        const res = await fetchForecastByPincode(user.pincode);
        setForecast(transformOpenMeteo(res));
      } catch (err) {
        console.error('Forecast fetch error:', err);
        toast.error('Failed to load forecast data for your pincode');
      }
    }

    setForecastLoading(false);
    setRefreshing(false);
    if (silent) toast.success('Weather data refreshed');
  };

  useEffect(() => {
    loadData();
  }, [selectedPlotId]);

  const current = weatherData;
  const riskInfo = current ? getRiskLevel(current.weather[0].main) : getRiskLevel('clear');
  const weatherDisplay = current ? getWeatherDisplay(current.weather[0].main) : getWeatherDisplay('clear');
  const WeatherIcon = weatherDisplay.icon;

  const playVoiceAlert = () => {
    if ('speechSynthesis' in window && current) {
      const text = `Current weather: ${current.weather[0].description}. Temperature ${Math.round(current.main.temp)} degrees Celsius. Humidity ${current.main.humidity} percent. Risk level is ${riskInfo.level}. Advisory: ${riskInfo.advice}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
      toast.success('Playing weather advisory');
    }
  };

  if (forecastLoading && !forecast.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <Loader2 className="h-10 w-10 text-emerald-600 animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Fetching Weather Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-8 px-4 pb-20 font-['Inter']">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Weather & Forecast</h1>
          {selectedPlot && (
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin size={13} className="text-emerald-500" />
              <p className="text-sm font-medium">{selectedPlot.location?.district}, {selectedPlot.location?.state}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={playVoiceAlert} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all" title="Play voice advisory">
            <Volume2 size={18} />
          </button>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </header>

      {/* Current Weather Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full -ml-24 -mb-24 blur-3xl" />

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-8 items-center">
          <div className="sm:col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live Conditions</span>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Current Weather</p>
              <div className="flex items-baseline gap-3">
                <span className="text-8xl font-black tracking-tighter">
                  {current ? Math.round(current.main.temp) : '--'}°
                </span>
                <div>
                  <p className="text-2xl font-bold capitalize">{current?.weather[0].description || 'Loading...'}</p>
                  <p className="text-slate-400 text-sm font-medium">{current?.name || 'Your Location'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Droplets, label: 'Humidity', value: current ? `${current.main.humidity}%` : '--' },
                { icon: Wind, label: 'Wind', value: current ? `${current.wind.speed} m/s` : '--' },
                { icon: Eye, label: 'Pressure', value: current ? `${current.main.pressure} hPa` : '--' },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 backdrop-blur rounded-2xl p-4 text-center border border-white/10">
                  <item.icon size={18} className="text-emerald-400 mx-auto mb-2" />
                  <p className="text-lg font-black">{item.value}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="sm:col-span-5 flex justify-center sm:justify-end">
            <div className={`w-40 h-40 rounded-full ${weatherDisplay.bg} flex items-center justify-center shadow-2xl`}>
              <WeatherIcon size={80} className={weatherDisplay.color} />
            </div>
          </div>
        </div>
      </section>

      {/* Risk Advisory Banner */}
      <section>
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-2xl border-2 ${riskInfo.bg}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-white shadow-sm`}>
              <AlertTriangle size={20} className={riskInfo.color} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <p className={`text-[10px] font-black uppercase tracking-widest ${riskInfo.color}`}>Risk Level: {riskInfo.level}</p>
              </div>
              <p className="text-slate-700 font-medium text-sm leading-relaxed">{riskInfo.advice}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7-Day Forecast */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">7-Day Forecast</h2>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Weather Intelligence</span>
        </div>

        {forecast.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="animate-spin mr-2" size={20} />
            <span className="font-medium text-sm">Loading forecast...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {forecast.map((day, idx) => {
              const disp = getWeatherDisplay(day.weatherMain);
              const DayIcon = disp.icon;
              const isToday = idx === 0;
              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className={`rounded-2xl p-4 text-center transition-all border flex flex-col items-center gap-3 ${isToday
                    ? 'bg-slate-900 text-white border-slate-800 shadow-lg'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md cursor-pointer'
                    }`}
                >
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {isToday ? 'Today' : day.label.split(' ')[0]}
                  </p>
                  <p className={`text-xs font-bold ${isToday ? 'text-slate-300' : 'text-slate-500'}`}>
                    {day.label.split(' ')[1]}
                  </p>

                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isToday ? 'bg-white/10' : disp.bg}`}>
                    <DayIcon size={24} className={isToday ? 'text-white' : disp.color} />
                  </div>

                  <div className="space-y-1">
                    <p className={`text-xl font-black ${isToday ? 'text-white' : 'text-slate-900'}`}>{day.tempMax}°</p>
                    <p className={`text-sm font-bold ${isToday ? 'text-slate-400' : 'text-slate-400'}`}>{day.tempMin}°</p>
                  </div>
                  <p className={`text-[9px] font-bold uppercase tracking-wide capitalize ${isToday ? 'text-slate-400' : 'text-slate-400'}`}>
                    {day.weatherDesc.length > 10 ? day.weatherDesc.slice(0, 10) + '...' : day.weatherDesc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Risk Alert Legend */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { level: 'HIGH RISK', icon: CloudLightning, color: 'text-red-500', bg: 'bg-red-50 border-red-100', desc: 'Storm / Thunderstorm — Suspend all field work' },
          { level: 'MEDIUM RISK', icon: CloudRain, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100', desc: 'Rain / Drizzle — Delay irrigation & spraying' },
          { level: 'LOW RISK', icon: Sun, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100', desc: 'Clear / Mild — Ideal for all operations' },
        ].map((r) => (
          <div key={r.level} className={`flex items-center gap-4 p-4 rounded-2xl border ${r.bg}`}>
            <div className="p-2.5 bg-white rounded-xl shadow-sm">
              <r.icon size={18} className={r.color} />
            </div>
            <div>
              <p className={`text-[9px] font-black uppercase tracking-widest ${r.color}`}>{r.level}</p>
              <p className="text-xs text-slate-600 font-medium mt-0.5">{r.desc}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
