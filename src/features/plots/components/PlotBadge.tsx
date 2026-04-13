import React from 'react';

interface PlotBadgeProps {
  label: string;
  type?: 'soil' | 'environment' | 'status';
}

const THEMES: Record<string, string> = {
  SANDY: 'bg-amber-50 text-amber-700 border-amber-100',
  LOAMY: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  CLAY: 'bg-orange-50 text-orange-700 border-orange-100',
  OPEN_FIELD: 'bg-blue-50 text-blue-700 border-blue-100',
  INDOOR: 'bg-purple-50 text-purple-700 border-purple-100',
  ACTIVE: 'bg-green-50 text-green-700 border-green-100',
  INACTIVE: 'bg-slate-50 text-slate-500 border-slate-100',
};

export const PlotBadge: React.FC<PlotBadgeProps> = ({ label }) => {
  const theme = THEMES[label.toUpperCase()] || 'bg-slate-50 text-slate-500 border-slate-100';
  
  return (
    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${theme} transition-all duration-300`}>
      {label.replace('_', ' ')}
    </span>
  );
};
