import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Sprout, MapPin, Droplets, 
  Image as ImageIcon, ExternalLink, 
  Clock, AlertCircle, Trash2, Battery, Signal, Zap, 
  Settings2, CheckCircle2, Leaf, RefreshCw, Sun, Droplet, Activity
} from 'lucide-react';
import { EmptyState, Loader } from '../../components/ui';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

import { useAppSelector, useAppDispatch } from '../../hooks';
import { setSensorData, setTrendData } from '../sensors/sensorsSlice';
import { deletePlot, addPlot } from '../plots/plotsSlice';
import { generateMockSensorData, generateMockTrendData, mockAlerts } from '../../services/mockData';

export const PlotDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plots } = useAppSelector((state) => state.plots);
  const { user } = useAppSelector((state) => state.auth);
  const { trendData } = useAppSelector((state) => state.sensors);
  const [loading, setLoading] = useState(true);
  
  const plot = plots.find((p) => p.plotId === id);
  const soilMoistureTrend = id ? trendData[`${id}_soilMoisture`] : [];
  const plotAlerts = mockAlerts.filter(alert => alert.plotId === id);
  
  useEffect(() => {
    if (plot) {
      loadPlotData();
    }
  }, [plot]);
  
  const loadPlotData = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    if (plot) {
      const sensors = generateMockSensorData(plot.plotId, plot.environmentType);
      dispatch(setSensorData({ plotId: plot.plotId, data: sensors }));
      dispatch(setTrendData({ plotId: plot.plotId, sensor: 'soilMoisture', data: generateMockTrendData() }));
      dispatch(setTrendData({ plotId: plot.plotId, sensor: 'temperature', data: generateMockTrendData() }));
    }
    
    setLoading(false);
  };
  
  const handleDelete = () => {
    if (!plot) return;
    const plotToDelete = { ...plot };
    dispatch(deletePlot(plot.plotId));
    navigate('/plots');
    toast.warning(`Plot "${plot.plotName}" deleted`, {
      description: 'You can undo this action within 5 seconds.',
      action: {
        label: 'Undo',
        onClick: () => {
          dispatch(addPlot(plotToDelete));
          toast.success(`Restored "${plotToDelete.plotName}"`);
        },
      },
      duration: 5000,
    });
  };
  
  if (!plot) {
    return (
      <EmptyState
        icon={<MapPin className="h-16 w-16" />}
        title="Plot not found"
        description="The plot you're looking for doesn't exist."
        action={{
          label: 'Back to Plots',
          onClick: () => navigate('/plots'),
        }}
      />
    );
  }
  
  if (loading) {
    return <div className="flex items-center justify-center h-full py-20"><Loader size="lg" text="Loading plot data..." /></div>;
  }

  const lat = plot.location.latitude;
  const lon = plot.location.longitude;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  
  const daysToHarvest = Math.ceil((new Date(plot.expectedHarvestDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  return (
    <div className="w-full font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-12">
      {/* Plot Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
        <div className="flex items-center gap-6">
          <motion.button 
            whileHover={{ x: -4 }}
            onClick={() => navigate('/plots')}
            className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </motion.button>
          <div className="space-y-1">
            <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{plot.plotName}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2">
               <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                  <Sprout className="w-3 h-3" />
                  {plot.cropType}
               </div>
               <div className="w-px h-3 bg-slate-200"></div>
               <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Harvest in <span className="text-emerald-600 font-extrabold">{daysToHarvest} Days</span>
               </span>
               
               {plotAlerts.length > 0 && (
                 <>
                   <div className="w-px h-3 bg-slate-200"></div>
                   <div className="flex items-center gap-2 text-rose-500 animate-pulse">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{plotAlerts.length} Critical Alert(s)</span>
                   </div>
                 </>
               )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-6 mr-6">
             {plotAlerts.length > 0 ? (
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest animate-pulse">Action Required</span>
                  <span className="text-xs font-bold text-slate-900">{plotAlerts[0].title}</span>
               </div>
             ) : (
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth Phase</span>
                  <span className="text-xs font-bold text-emerald-600">Late Vegetative Stage</span>
               </div>
             )}
             <div className="w-px h-8 bg-slate-100"></div>
          </div>
          <button onClick={handleDelete} className="p-3 rounded-xl bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 transition-all shadow-sm group">
            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <button onClick={() => navigate(`/plots/${plot.plotId}/edit`)} className="px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap">Edit</button>
          <button className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 whitespace-nowrap">Report</button>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Core Data */}
        <div className="lg:col-span-8 space-y-8">
           {/* Land & Profile Section */}
           <motion.section 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-white border border-slate-200 rounded-[2rem] p-8 grid grid-cols-1 md:grid-cols-3 gap-10 shadow-sm"
           >
             <div className="aspect-square bg-emerald-50/50 rounded-3xl flex items-center justify-center border border-emerald-100/20 relative overflow-hidden group">
               {plot.imageUrl ? (
                 <img src={plot.imageUrl} alt={plot.plotName} className="w-full h-full object-cover rounded-3xl" />
               ) : (
                 <ImageIcon className="w-16 h-16 text-emerald-200" />
               )}
             </div>
             
             <div className="md:col-span-2 grid grid-cols-2 gap-y-8 gap-x-10">
               <InfoItem label="Land Manager" value={user?.name || 'Owner'} icon={CheckCircle2} />
               <InfoItem label="Total Area" value={plot.area} icon={MapPin} />
               <InfoItem label="Soil Profile" value={plot.soilType} icon={Droplets} />
               
               <div className="col-span-2 pt-6 border-t border-slate-50 mt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Primary Location</span>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-900 hover:text-emerald-600 transition-colors">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span className="text-lg font-display font-bold tracking-tight">Lat: {lat.toFixed(4)}, Lon: {lon.toFixed(4)}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 ml-auto" />
                  </a>
               </div>
             </div>
           </motion.section>

           {/* Trend Chart */}
           <TrendChart title="Soil Moisture Trends (7D)" data={soilMoistureTrend} color="#10B981" />

           {/* Activity History */}
           <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
             <div className="flex items-center justify-between mb-8">
                <h4 className="text-lg font-bold text-slate-900 tracking-tight">Activity History</h4>
                <button className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline">Download Log</button>
             </div>
             <div className="space-y-8 relative">
                <div className="absolute left-[19px] top-2 bottom-6 w-0.5 bg-slate-100"></div>
                {plot.scanHistory.map((scan) => (
                  <div key={scan.id} className="flex gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-4 border-white shadow-md ${
                      scan.status === 'Optimal' ? 'bg-emerald-100 text-emerald-600' : 
                      scan.status === 'Healthy' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                       {scan.result.toLowerCase().includes('irrigation') ? <Droplet className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 tracking-tight">{scan.result}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{new Date(scan.timestamp).toLocaleString()} • {scan.status}</p>
                    </div>
                  </div>
                ))}
             </div>
           </section>
        </div>

        {/* Right Column: Nutrients & Hardware */}
        <div className="lg:col-span-4 space-y-8">
            {/* Soil Nutrients (NPK HUD) */}
            <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-white/10 rounded-xl">
                        <Activity className="w-5 h-5 text-emerald-400" />
                     </div>
                     <h4 className="text-lg font-bold tracking-tight">Soil Nutrients</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                     <NutrientBar label="Nitrogen (N)" value={plot.npkLevels.n} max={200} color="emerald" />
                     <NutrientBar label="Phosphorus (P)" value={plot.npkLevels.p} max={100} color="blue" />
                     <NutrientBar label="Potassium (K)" value={plot.npkLevels.k} max={100} color="amber" />
                  </div>
                  
                  <div className="pt-6 border-t border-white/10">
                     <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                        Values in kg/ha based on latest soil topology scan. Nitrogen split-dose recommended.
                     </p>
                  </div>
               </div>
            </section>

            {/* Smart Irrigation Automation */}
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Settings2 className="w-5 h-5" /></div>
                     <h4 className="text-lg font-bold text-slate-900 tracking-tight">Automation</h4>
                  </div>
                  <div className="w-10 h-5 bg-emerald-100 rounded-full flex items-center px-1">
                     <div className="w-3.5 h-3.5 bg-emerald-600 rounded-full shadow-sm ml-auto"></div>
                  </div>
               </div>
               <div className="space-y-8">
                  <div className="space-y-4">
                     <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Moisture Threshold</span>
                        <span className="text-sm font-bold text-blue-600">25%</span>
                     </div>
                     <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                        <div className="absolute left-0 top-0 h-full w-[25%] bg-blue-500 rounded-full"></div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Max Temperature</span>
                        <span className="text-sm font-bold text-rose-500">38°C</span>
                     </div>
                     <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                        <div className="absolute left-0 top-0 h-full w-[65%] bg-rose-500 rounded-full"></div>
                     </div>
                  </div>
               </div>
            </section>

            {/* Hardware Telemetry */}
            <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                   <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Device Health</span>
                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-extrabold border border-emerald-100">ONLINE</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Battery className={`w-4 h-4 mb-2 ${plot.hardwareStatus.battery < 20 ? 'text-rose-500' : 'text-emerald-500'}`} />
                      <div className="text-lg font-bold text-slate-900">{plot.hardwareStatus.battery}%</div>
                      <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Battery</div>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Signal className="w-4 h-4 mb-2 text-blue-500" />
                      <div className="text-lg font-bold text-slate-900">{plot.hardwareStatus.signal}%</div>
                      <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Signal</div>
                   </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

function InfoItem({ label, value, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</span>
      <div className="flex items-center gap-3">
        {Icon && <div className="p-2 bg-emerald-50 rounded-xl"><Icon className="w-4 h-4 text-emerald-600" /></div>}
        <span className="text-lg font-display font-bold text-slate-900 tracking-tight">{value}</span>
      </div>
    </div>
  );
}

function NutrientBar({ label, value, max, color }: any) {
  const colorClasses: any = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
  };
  
  return (
    <div className="space-y-3">
       <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
          <span className="text-slate-400">{label}</span>
          <span className="text-white">{value} kg/ha</span>
       </div>
       <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
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
    <div className="bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-10 space-y-8 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-display font-bold text-slate-900 text-xl">{title}</h4>
        <select className="bg-slate-50 border-none rounded-xl text-[10px] font-bold uppercase tracking-widest px-4 py-2 focus:ring-2 focus:ring-emerald-500/20 outline-none">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
        </select>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.1}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} dy={15} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 700 }} dx={-15} />
            <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold', padding: '12px 16px' }} />
            <Area type="monotone" dataKey="value" stroke={color} strokeWidth={4} fillOpacity={1} fill={`url(#color${color.replace('#', '')})`} dot={{ r: 4, fill: color, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
