import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, MapPin, Sprout, Search,
  ChevronRight, Map as MapIcon,
  LayoutGrid, Droplets, Clock, Activity, TrendingUp, Layers, Zap, Leaf
} from 'lucide-react';
import { useAppSelector } from '../../hooks';
import { EmptyState } from '../../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Plot } from '../../types';

// Fix Leaflet icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// --- Components ---

const StatTile = ({ label, value, sub, icon: Icon, color }: any) => {
  const themes: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white border border-slate-100 p-6 rounded-[2rem] flex items-center justify-between shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</span>
        <div className="text-2xl font-black text-slate-900 leading-none">{value}</div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
      </div>
      <div className={`p-3.5 rounded-2xl ${themes[color]} border shadow-inner`}>
        <Icon size={20} />
      </div>
    </motion.div>
  );
};

const PlotCard = ({ plot, index, onClick }: { plot: Plot, index: number, onClick: () => void }) => {
  const daysToHarvest = Math.ceil((new Date(plot.expectedHarvestDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  const healthScore = plot.npkLevels.n > 120 ? 96 : 84;
  const isHealthy = healthScore > 90;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -10 }}
      onClick={onClick}
      className="group relative bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl hover:border-emerald-200 transition-all duration-500 flex flex-col h-[420px]"
    >
      {/* Decorative Accent */}
      <div className={`absolute top-0 left-0 w-full h-1.5 ${isHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`} />

      {/* Media & Overlay Stats */}
      <div className="relative h-48 overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {plot.imageUrl ? (
          <img src={plot.imageUrl} alt={plot.plotName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Sprout className="w-12 h-12 text-emerald-100 group-hover:rotate-12 transition-transform duration-500" />
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          <div className="px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-full flex items-center gap-2 border border-white/50 shadow-sm">
            <Clock className="w-3 h-3 text-emerald-600" />
            <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{daysToHarvest}D REMAIN</span>
          </div>
        </div>

        <div className="absolute bottom-4 right-4 z-20">
          <div className={`px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg border border-white/50 shadow-lg`}>
            <div className="flex items-center gap-1.5">
              <Zap className={`w-3 h-3 ${isHealthy ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="text-[10px] font-black text-slate-900 uppercase">{healthScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-7 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{plot.cropType}</span>
              <div className="w-1 h-1 bg-slate-200 rounded-full" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{plot.area}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter group-hover:text-emerald-600 transition-colors uppercase">
              {plot.plotName}
            </h3>
          </div>
          <div className="p-2 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:rotate-12">
            <ChevronRight size={18} />
          </div>
        </div>

        {/* HUD Elements */}
        <div className="mt-auto space-y-5">
          <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Moisture</span>
                <span className="text-blue-600">32%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '32%' }} className="h-full bg-blue-500" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Soil NPK</span>
                <span className="text-emerald-600">High</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '88%' }} className="h-full bg-emerald-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-emerald-500" />
              <span className="font-mono tracking-tight">{plot.location.latitude.toFixed(3)}, {plot.location.longitude.toFixed(3)}</span>
            </div>
            <span className="bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">REV: 02</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const PlotListPage: React.FC = () => {
  const navigate = useNavigate();
  const { plots } = useAppSelector((state) => state.plots);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const filteredPlots = plots.filter(plot =>
    plot.plotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plot.cropType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAreaValue = filteredPlots.reduce((sum, p) => sum + parseFloat(p.area.split(' ')[0] || '0'), 0);
  const activeCropsCount = new Set(filteredPlots.map(p => p.cropType)).size;

  return (
    <div className="w-full font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20">
      {/* Minimal Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16">
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-1 bg-emerald-600 rounded-full" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.5em]">Command Hub</span>
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-7xl font-black text-slate-900 tracking-tighter leading-none">My Plots</h2>
            <p className="text-slate-400 font-medium text-xl max-w-xl leading-relaxed">
              Managing agricultural assets with real-time geospatial intelligence.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-[2rem] shadow-sm">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="pl-11 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-0 w-full md:w-56 placeholder:text-slate-300 transition-all focus:md:w-72"
              />
            </div>
            <div className="w-px h-8 bg-slate-100 mx-1 hidden sm:block" />
            <div className="flex p-1 bg-slate-50 rounded-2xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'map' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400'}`}
              >
                <MapIcon size={18} />
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/plots/add')}
            className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm hover:bg-emerald-600 hover:-translate-y-1 transition-all shadow-xl shadow-slate-900/10 active:translate-y-0 whitespace-nowrap"
          >
            <Plus size={18} />
            Add Plots
          </button>
        </div>
      </section>

      {/* High-End Stat Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <StatTile label="Managed" value={`${totalAreaValue.toFixed(1)}Ac`} sub="Geospatial Area" icon={Layers} color="emerald" />
        <StatTile label="Biodiversity" value={activeCropsCount} sub="Crop Varieties" icon={Leaf} color="blue" />
        <StatTile label="Vitality" value="94.2%" sub="Soil Health" icon={Zap} color="amber" />
        <StatTile label="Projects" value="+12.4%" sub="Yield Increase" icon={TrendingUp} color="purple" />
      </section>

      {/* Portfolio Matrix */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.section
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {filteredPlots.length > 0 ? (
              filteredPlots.map((plot, index) => (
                <PlotCard
                  key={plot.plotId}
                  plot={plot}
                  index={index}
                  onClick={() => navigate(`/plots/${plot.plotId}`)}
                />
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <EmptyState
                  icon={<MapPin className="h-16 w-16" />}
                  title="No units found"
                  description="Adjust your search parameters or add a new deployment."
                  action={{ label: "Show All Units", onClick: () => setSearchQuery('') }}
                />
              </div>
            )}
          </motion.section>
        ) : (
          <motion.section
            key="map"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            className="h-[750px] w-full bg-slate-50 border border-slate-200 rounded-[3rem] overflow-hidden shadow-2xl relative"
          >
            <MapContainer
              center={plots.length > 0 ? [plots[0].location.latitude, plots[0].location.longitude] : [20.5937, 78.9629]}
              zoom={13}
              style={{ height: '100%', width: '100%', zIndex: 0 }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {filteredPlots.map((plot) => (
                <Marker key={plot.plotId} position={[plot.location.latitude, plot.location.longitude]}>
                  <Popup className="custom-popup">
                    <div className="p-3 space-y-4">
                      <h4 className="font-black text-slate-900 border-b pb-3 uppercase tracking-tighter text-sm">{plot.plotName}</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-[10px] font-black text-slate-400 tracking-widest uppercase">
                          <span>Status</span>
                          <span className="text-emerald-600">Optimal</span>
                        </div>
                        <button
                          onClick={() => navigate(`/plots/${plot.plotId}`)}
                          className="w-full py-3 bg-slate-900 text-white text-[10px] font-black uppercase rounded-xl hover:bg-emerald-600 transition-colors tracking-widest"
                        >
                          Open Unit Dashboard
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Map HUD Overlay */}
            <div className="absolute top-8 left-8 z-10 space-y-4 pointer-events-none">
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/50 shadow-2xl max-w-[240px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Active Monitoring</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Integrated satellite feed active. markers represent live sensor clusters across your deployments.
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};
