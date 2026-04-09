import React, { useState } from 'react';
import { 
  FileText, Droplets, Clock, Sparkles, ShieldCheck, 
  MapPin, Info, Volume2, ArrowRight, AlertCircle
} from 'lucide-react';
import { useAppSelector } from '../../hooks';
import { Badge, EmptyState } from '../../components/ui';
import { toast } from 'sonner';

export const AdvisoryPage: React.FC = () => {
  const { advisories } = useAppSelector((state: any) => state.advisories);
  const { plots } = useAppSelector((state: any) => state.plots);
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'plots'>('all');

  const getPlotName = (plotId: string) => {
    const plot = plots.find((p: any) => p.plotId === plotId);
    return plot ? plot.plotName : 'General Field';
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'high':
        return {
          icon: AlertCircle,
          colorClass: 'red',
          label: 'Critical',
          bgClass: 'bg-red-50',
          borderClass: 'border-red-100',
          textClass: 'text-red-600',
          accentClass: 'bg-red-500'
        };
      case 'medium':
        return {
          icon: Droplets,
          colorClass: 'amber',
          label: 'Important',
          bgClass: 'bg-amber-50',
          borderClass: 'border-amber-100',
          textClass: 'text-amber-700',
          accentClass: 'bg-amber-500'
        };
      default:
        return {
          icon: Info,
          colorClass: 'emerald',
          label: 'Optimization',
          bgClass: 'bg-emerald-50',
          borderClass: 'border-emerald-100',
          textClass: 'text-emerald-700',
          accentClass: 'bg-emerald-500'
        };
    }
  };

  const playVoice = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'or-IN';
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
      toast.success('Playing advisory...', { position: 'bottom-center' });
    }
  };

  const filteredAdvisories = advisories.filter((a: any) => {
    if (activeTab === 'critical') return a.severity === 'high' || a.severity === 'critical';
    return true;
  });

  const featuredAdvisory = [...filteredAdvisories].sort((a, b) => {
    const prio: any = { critical: 3, high: 2, medium: 1, low: 0 };
    return prio[b.severity] - prio[a.severity];
  })[0];

  const remainingAdvisories = filteredAdvisories.filter((a: any) => a.id !== featuredAdvisory?.id);

  if (advisories.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-16 w-16" />}
        title="No Active Advisories"
        description="Your AI intelligence hub is quiet. We'll alert you when action is needed."
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-8 px-4 animate-in fade-in duration-500">
      
      {/* Calm Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Advisories</h1>
          <p className="text-slate-500 font-medium">Clear insights and recommended steps based on your plot conditions.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl self-start">
          {[
            { id: 'all', label: 'All' },
            { id: 'critical', label: 'Priority' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Primary Alert (Simplified Featured) */}
      {featuredAdvisory && (
        <section className="animate-in slide-in-from-top-4 duration-700">
          <div className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10 transition-all hover:border-emerald-300">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md">Featured Advisory</Badge>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <MapPin size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{getPlotName(featuredAdvisory.plotId)}</span>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                  {featuredAdvisory.title}
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
                  {featuredAdvisory.description}
                </p>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                   <div className="flex gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm self-start">
                         <Sparkles size={18} className="text-emerald-500" />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recommended Action</p>
                         <p className="text-slate-700 font-medium leading-relaxed">{featuredAdvisory.recommendedAction}</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col justify-end md:justify-start items-center md:items-end gap-3 shrink-0">
                <button 
                  onClick={() => playVoice(featuredAdvisory.recommendedAction)}
                  className="p-4 bg-slate-50 text-slate-600 rounded-2xl border border-slate-100 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                  title="Listen in Odia"
                >
                  <Volume2 size={24} />
                </button>
                <button className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm tracking-wide hover:bg-emerald-600 transition-all shadow-lg shadow-slate-900/10">
                  Take Action
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Secondary Intelligence (Linear Feed) */}
      <section className="space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
           <Info size={14} /> Secondary Advisories
        </h3>

        <div className="divide-y divide-slate-100 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {remainingAdvisories.map((advisory: any) => {
            const config = getSeverityConfig(advisory.severity);
            const Icon = config.icon;
            
            return (
              <div 
                key={advisory.id}
                className="group p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-5">
                  <div className={`mt-1 p-2.5 rounded-xl ${config.bgClass} text-${config.colorClass}-600 shrink-0`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                       <h4 className="font-bold text-slate-900 leading-tight">{advisory.title}</h4>
                       <span className="text-slate-200 text-xl font-thin">/</span>
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getPlotName(advisory.plotId)}</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-1">
                      {advisory.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-slate-300">
                    <Clock size={12} />
                    {new Date(advisory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => playVoice(advisory.description)}
                      className="p-2 text-slate-300 hover:text-emerald-500 transition-colors"
                    >
                      <Volume2 size={18} />
                    </button>
                    <button className="text-xs font-bold text-slate-400 hover:text-slate-900 px-3 py-1 transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {remainingAdvisories.length === 0 && (
             <div className="p-12 text-center">
                <ShieldCheck size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-medium tracking-wide">No additional insights at this time.</p>
             </div>
          )}
        </div>
      </section>
    </div>
  );
};