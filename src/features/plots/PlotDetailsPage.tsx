import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Sprout, MapPin, Droplets, 
  Image as ImageIcon, ExternalLink, 
  Clock, Trash2, Battery, Signal, Zap, 
  CheckCircle2, RefreshCw, Droplet, Activity, Loader2, Layers
} from 'lucide-react';
import { EmptyState } from '../../components/ui';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

import { useAppSelector, useAppDispatch } from '../../hooks';
import { setSensorData, setTrendData } from '../sensors/sensorsSlice';
import { removePlot, fetchAllPlots, fetchOnePlot } from '../plots/plotsSlice';
import { generateMockSensorData, generateMockTrendData } from '../../services/mockData';

export const PlotDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plots, loading: plotsLoading } = useAppSelector((state) => state.plots);
  const { user } = useAppSelector((state) => state.auth);
  const { trendData } = useAppSelector((state) => state.sensors);
  const [loading, setLoading] = useState(true);
  
  const plot = plots.find((p) => p._id === id);
  const soilMoistureTrend = id ? trendData[`${id}_soilMoisture`] : [];
  // const plotAlerts = mockAlerts.filter(alert => alert.plotId === id);
  
  useEffect(() => {
    if (id && !plot && !plotsLoading) {
      dispatch(fetchOnePlot(id));
    } else if (plots.length === 0 && !plotsLoading) {
      dispatch(fetchAllPlots());
    }
  }, [dispatch, id, plot, plots.length, plotsLoading]);

  useEffect(() => {
    if (plot) {
      loadPlotData();
    }
  }, [plot]);
  
  const loadPlotData = async () => {
    setLoading(true);
    // Simulate complex data fetch for trends/sensors
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    if (plot) {
      // In a real app, this would be an API call to sensors/analytics
      const sensors = generateMockSensorData(plot._id, plot.environmentType);
      dispatch(setSensorData({ plotId: plot._id, data: sensors }));
      dispatch(setTrendData({ plotId: plot._id, sensor: 'soilMoisture', data: generateMockTrendData() }));
      dispatch(setTrendData({ plotId: plot._id, sensor: 'temperature', data: generateMockTrendData() }));
    }
    
    setLoading(false);
  };
  
  const handleDelete = async () => {
    if (!plot) return;
    
    const confirmDelete = window.confirm(`Are you sure you want to delete "${plot.plotName}"? This action can be reversed by administrators.`);
    if (!confirmDelete) return;

    try {
      await dispatch(removePlot(plot._id)).unwrap();
      navigate('/plots');
      toast.success(`Plot "${plot.plotName}" removed from active monitoring.`);
    } catch (error: any) {
      toast.error(error || "Failed to delete plot.");
    }
  };
  
  if (loading || plotsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Accessing Intelligence Feed...</p>
      </div>
    );
  }

  if (!plot) {
    return (
      <EmptyState
        icon={<MapPin className="h-16 w-16" />}
        title="Resource Not Found"
        description="The geospatial unit you are requesting is either offline or does not exist."
        action={{
          label: 'Back to Command Hub',
          onClick: () => navigate('/plots'),
        }}
      />
    );
  }

  const loc = plot.location as any;
  const lat = loc.coordinates?.coordinates?.[1] ?? loc.lat ?? 0;
  const lon = loc.coordinates?.coordinates?.[0] ?? loc.lng ?? 0;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  
  const daysToHarvest = plot.expectedHarvestDate 
    ? Math.ceil((new Date(plot.expectedHarvestDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : '??';

  return (
    <div className="w-full font-['Inter'] selection:bg-emerald-100 selection:text-emerald-900 pb-12 px-4 md:px-0">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 pb-10">
        <div className="flex items-center gap-8">
          <motion.button 
            whileHover={{ x: -4 }}
            onClick={() => navigate('/plots')}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-900" />
          </motion.button>
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter leading-none uppercase">{plot.plotName}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2">
               <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                  <Sprout size={12} />
                  {plot.cropType}
               </div>
               <div className="w-px h-3 bg-slate-200"></div>
               <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clock size={14} className="text-emerald-500" />
                  Cycle: <span className="text-slate-900 font-black">{daysToHarvest}D REMAINING</span>
               </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleDelete} className="p-4 rounded-2xl bg-white border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm group">
            <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
          </button>
          <button onClick={() => navigate(`/plots/${plot._id}/edit`)} className="px-7 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-900 hover:bg-slate-50 transition-all shadow-sm">Refine Config</button>
          <button className="px-7 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10">Export Feed</button>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
           {/* Summary Card */}
           <motion.section 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-white border border-slate-200 rounded-[3rem] p-10 grid grid-cols-1 md:grid-cols-12 gap-12 shadow-sm relative overflow-hidden"
           >
             <div className="md:col-span-4 aspect-square bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-100 relative overflow-hidden group">
               {plot.imageUrl ? (
                 <img src={plot.imageUrl} alt={plot.plotName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
               ) : (
                 <ImageIcon className="w-16 h-16 text-emerald-100 group-hover:rotate-12 transition-transform duration-500" />
               )}
             </div>
             
             <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-12 py-2">
               <InfoItem label="Supervisor" value={user?.name || 'Authorized Personnel'} icon={CheckCircle2} />
               <InfoItem label="Operational Area" value={`${plot.farmSize} Hectares`} icon={Layers} />
               <InfoItem label="Soil Profile" value={plot.soilType} icon={Droplets} />
               <InfoItem label="Environment" value={plot.environmentType.replace('_', ' ')} icon={Globe} />
               
               <div className="col-span-full pt-8 border-t border-slate-50">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] block mb-3">Live Geospatial Link</span>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-100 hover:border-emerald-200 group transition-all">
                    <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600 group-hover:rotate-12 transition-transform">
                       <MapPin size={24} />
                    </div>
                    <div>
                        <span className="text-xl font-black text-slate-900 tracking-tighter block">{plot.location.address || 'Standard Grid Designation'}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Coords: {lat.toFixed(6)}, {lon.toFixed(6)}</span>
                    </div>
                    <ExternalLink size={16} className="text-slate-300 ml-auto group-hover:text-emerald-500" />
                  </a>
               </div>
             </div>
           </motion.section>

           <TrendChart title="Soil Saturation Index (7D)" data={soilMoistureTrend} color="#10B981" />

           {/* Event Log */}
           <section className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm">
             <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Automated Intelligence Log</h4>
                    <p className="text-xs text-slate-400 font-medium">Real-time system events and sensor triggers.</p>
                </div>
                <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all"><RefreshCw size={18} /></button>
             </div>
             <div className="space-y-10 relative">
                <div className="absolute left-[21px] top-2 bottom-8 w-0.5 bg-slate-50"></div>
                {(plot.scanHistory && plot.scanHistory.length > 0) ? plot.scanHistory.map((scan) => (
                  <div key={scan.id} className="flex gap-6 relative">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-xl ${
                      scan.status === 'Optimal' ? 'bg-emerald-600 text-white' : 
                      scan.status === 'Healthy' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'
                    }`}>
                       {scan.result.toLowerCase().includes('irrigation') ? <Droplet size={18} /> : <Zap size={18} />}
                    </div>
                    <div className="pt-1">
                      <p className="text-base font-black text-slate-900 tracking-tight leading-tight">{scan.result}</p>
                      <div className="flex items-center gap-3 mt-1.5 font-bold">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest">{new Date(scan.timestamp).toLocaleString()}</span>
                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className={`text-[10px] uppercase tracking-widest ${
                           scan.status === 'Optimal' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>{scan.status} Analytics</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="py-10 text-center space-y-3">
                     <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto flex items-center justify-center text-slate-200">
                        <Activity size={32} />
                     </div>
                     <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Awaiting Telemetry Stream...</p>
                  </div>
                )}
             </div>
           </section>
        </div>

        <div className="lg:col-span-4 space-y-10">
            {/* NPK */}
            <section className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <motion.div 
                 animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                 transition={{ duration: 5, repeat: Infinity }}
                 className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full -mr-24 -mt-24 blur-[60px]" 
               />
               <div className="relative z-10 space-y-10">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                        <Activity size={20} className="text-emerald-400" />
                     </div>
                     <h4 className="text-xl font-black tracking-tight uppercase">Soil Composition</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-8">
                     <NutrientBar label="Nitrogen (N)" value={plot.npkLevels?.n || 142} max={200} color="emerald" />
                     <NutrientBar label="Phosphorus (P)" value={plot.npkLevels?.p || 58} max={100} color="blue" />
                     <NutrientBar label="Potassium (K)" value={plot.npkLevels?.k || 44} max={100} color="amber" />
                  </div>
                  
                  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl">
                     <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic uppercase tracking-wider">
                        Telemetry data suggests Late-Season split dose of P for optimal yield.
                     </p>
                  </div>
               </div>
            </section>

            {/* Hardware */}
            <div className="p-10 bg-white border border-slate-200 rounded-[3rem] shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                       <Signal size={12} className="text-emerald-500 animate-pulse" />
                       <span className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Telemetry Relay</span>
                   </div>
                   <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black tracking-widest border border-emerald-100">SYNC-ACTIVE</div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group transition-all">
                      <Battery size={20} className={`mb-3 ${plot.hardwareStatus?.battery !== undefined && plot.hardwareStatus.battery < 20 ? 'text-rose-500' : 'text-emerald-500'} group-hover:rotate-12 transition-transform`} />
                      <div className="text-3xl font-black text-slate-900 tracking-tighter">{plot.hardwareStatus?.battery ?? 98}%</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Power</div>
                   </div>
                   <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group transition-all">
                      <Signal size={20} className="mb-3 text-blue-500 group-hover:rotate-12 transition-transform" />
                      <div className="text-3xl font-black text-slate-900 tracking-tighter">{plot.hardwareStatus?.signal || 100}%</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Signal</div>
                   </div>
                </div>
                <p className="text-center text-[9px] font-bold text-slate-300 uppercase tracking-widest">Last Synced: {new Date(plot.updatedAt).toLocaleTimeString()}</p>
            </div>
        </div>
      </div>
    </div>
  );
};

const Globe = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

function InfoItem({ label, value, icon: Icon }: any) {
  return (
    <div className="space-y-3">
      <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] block">{label}</span>
      <div className="flex items-center gap-4">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100"><Icon size={20} className="text-emerald-600" /></div>
        <span className="text-2xl font-black text-slate-900 tracking-tighter leading-none">{value}</span>
      </div>
    </div>
  );
}

function NutrientBar({ label, value, max, color }: any) {
  const colorClasses: any = {
    emerald: 'bg-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)]',
    blue: 'bg-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.5)]',
    amber: 'bg-amber-500 shadow-[0_0_15px_-3px_rgba(245,158,11,0.5)]',
  };
  
  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
          <span className="text-slate-400">{label}</span>
          <span className="text-white bg-white/10 px-3 py-1 rounded-lg">{value} KG/HA</span>
       </div>
       <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(value / max) * 100}%` }}
            className={`h-full ${colorClasses[color]}`}
          />
       </div>
    </div>
  );
}

function TrendChart({ title, data, color }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-[3rem] p-10 space-y-10 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-black text-slate-900 text-2xl tracking-tighter uppercase">{title}</h4>
        <div className="flex p-1 bg-slate-50 rounded-xl">
           <button className="px-4 py-2 bg-white rounded-lg shadow-sm text-[10px] font-black uppercase tracking-widest text-emerald-600">7D Feed</button>
           <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">30D</button>
        </div>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.15}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 900 }} dx={-15} />
            <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold', padding: '16px 20px', textTransform: 'uppercase' }} />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={4} fillOpacity={1} fill={`url(#color${color.replace('#', '')})`} dot={{ r: 5, fill: color, strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
