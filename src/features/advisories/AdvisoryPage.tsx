import React from 'react';
import { 
  FileText, Droplets, ThermometerSun, Clock, Sparkles, ShieldCheck, 
  MapPin, Info 
} from 'lucide-react';
import { useAppSelector } from '../../hooks';
import { EmptyState } from '../../components/ui';

export const AdvisoryPage: React.FC = () => {
  const { advisories } = useAppSelector((state) => state.advisories);
  const { plots } = useAppSelector((state) => state.plots);

  const getPlotName = (plotId: string) => {
    const plot = plots.find(p => p.plotId === plotId);
    return plot ? plot.plotName : 'Unknown Field';
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return {
          icon: ThermometerSun,
          colorClass: 'red',
          label: 'High Priority',
          bgClass: 'bg-red-50',
          borderClass: 'border-red-100/50',
          textClass: 'text-red-600',
          accentClass: 'bg-red-400'
        };
      case 'medium':
        return {
          icon: Droplets,
          colorClass: 'amber',
          label: 'Medium Priority',
          bgClass: 'bg-amber-50',
          borderClass: 'border-amber-100/50',
          textClass: 'text-amber-600',
          accentClass: 'bg-amber-400'
        };
      default:
        return {
          icon: Info,
          colorClass: 'emerald',
          label: 'Normal Priority',
          bgClass: 'bg-emerald-50',
          borderClass: 'border-emerald-100/50',
          textClass: 'text-emerald-600',
          accentClass: 'bg-emerald-400'
        };
    }
  };

  if (advisories.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-16 w-16" />}
        title="No advisories"
        description="You'll see farming advisories and recommendations here."
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Active Advisories</h2>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">AI-driven insights and recommended actions for your crops.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100/50 self-start shadow-sm shadow-emerald-500/5">
          <ShieldCheck className="w-4 h-4" />
          System Healthy
        </div>
      </div>

      <div className="space-y-6">
        {advisories.map((advisory) => {
          const config = getSeverityConfig(advisory.severity);
          const Icon = config.icon;
          const plotName = getPlotName(advisory.plotId);
          
          return (
            <div 
              key={advisory.id}
              className="group relative bg-white rounded-[2rem] border border-slate-200/60 p-1 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-500"
            >
              <div className={`absolute top-0 left-8 w-16 h-px bg-gradient-to-r from-transparent via-${config.colorClass}-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              
              <div className="p-6 sm:p-8">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl ${config.bgClass} flex items-center justify-center shrink-0 border ${config.borderClass} shadow-inner`}>
                      <Icon className={`w-5 h-5 ${config.textClass}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">{advisory.title}</h3>
                      <div className="flex items-center gap-2.5 mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${config.textClass}`}>{config.label}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{plotName}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(advisory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[15px] text-slate-600 mb-6 leading-relaxed font-medium">
                  {advisory.description}
                </p>

                {/* AI Box */}
                <div className="bg-gradient-to-br from-slate-50/50 to-white rounded-2xl border border-slate-200/60 p-5 relative overflow-hidden shadow-inner">
                  <div className={`absolute top-0 left-0 w-1 h-full ${config.accentClass} rounded-l-2xl`} />
                  <div className="flex gap-4">
                    <div className={`p-2 rounded-xl bg-white border border-slate-100 shadow-sm shrink-0 mt-0.5`}>
                      <Sparkles className={`w-4 h-4 ${config.textClass}`} />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 mb-2">Recommended Action</h4>
                      <p className="text-[14px] text-slate-700 leading-relaxed font-medium">
                        {advisory.recommendedAction}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button className={`px-6 py-2.5 ${config.colorClass === 'red' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'} text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg`}>
                    Take Action
                  </button>
                  <button className="px-6 py-2.5 bg-white text-slate-700 text-[11px] font-bold uppercase tracking-widest rounded-xl border border-slate-200/60 hover:bg-slate-50 transition-all hover:border-slate-300">
                    See Details
                  </button>
                  <button className="sm:ml-auto px-4 py-2 text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-colors font-sans">
                    Dismiss Advisory
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};