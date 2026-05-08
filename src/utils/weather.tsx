import { Cloud, CloudRain, CloudSnow, Sun, CloudLightning } from 'lucide-react';

export const mapWeatherCode = (code: number) => {
  if (code === 0) return { condition: 'Clear', main: 'Clear', description: 'clear sky', icon: '01d' };
  if ([1, 2, 3].includes(code)) return { condition: 'Clouds', main: 'Clouds', description: 'partly cloudy', icon: '03d' };
  if ([45, 48].includes(code)) return { condition: 'Fog', main: 'Fog', description: 'foggy', icon: '50d' };
  if ([51, 53, 55, 56, 57].includes(code)) return { condition: 'Drizzle', main: 'Drizzle', description: 'light drizzle', icon: '09d' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { condition: 'Rain', main: 'Rain', description: 'rain showers', icon: '10d' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { condition: 'Snow', main: 'Snow', description: 'snowfall', icon: '13d' };
  if ([95, 96, 99].includes(code)) return { condition: 'Thunderstorm', main: 'Thunderstorm', description: 'thunderstorms', icon: '11d' };
  return { condition: 'Clouds', main: 'Clouds', description: 'overcast', icon: '04d' };
};

export const getWeatherDisplay = (main: string) => {
  const m = main?.toLowerCase() || '';
  if (m.includes('thunder')) return { icon: CloudLightning, color: 'text-violet-500', bg: 'bg-violet-50', label: 'Thunderstorm' };
  if (m.includes('rain') || m.includes('drizzle')) return { icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Rainy' };
  if (m.includes('snow')) return { icon: CloudSnow, color: 'text-sky-400', bg: 'bg-sky-50', label: 'Snow' };
  if (m.includes('cloud')) return { icon: Cloud, color: 'text-slate-500', bg: 'bg-slate-100', label: 'Cloudy' };
  return { icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Clear' };
};

export const getWeatherIcon = (condition: string, className = "w-6 h-6") => {
  const disp = getWeatherDisplay(condition);
  const Icon = disp.icon;
  return <Icon className={className} />;
};
