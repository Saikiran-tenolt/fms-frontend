import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, MapPin, Sprout, Search, Filter, 
  MoreVertical, ChevronRight, Image as ImageIcon 
} from 'lucide-react';
import { useAppSelector } from '../../hooks';
import { EmptyState } from '../../components/ui';
import { motion } from 'framer-motion';
import type { Plot } from '../../types';

// The PlotCard design injected directly from the AgriSmart Pro UI prompt
function PlotCard({ plot, index, onClick }: { plot: Plot, index: number, onClick: () => void }) {
  // Mock status and health depending on index to match the premium layout demo feel
  const status = index % 3 === 0 ? 'Optimal' : index % 3 === 1 ? 'Healthy' : 'Attention';
  const healthScore = status === 'Optimal' ? 98 : status === 'Healthy' ? 88 : 72;
  const statusColors: Record<string, string> = { 
    Healthy: 'bg-emerald-500', 
    Attention: 'bg-amber-500', 
    Optimal: 'bg-blue-500' 
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-3xl group cursor-pointer overflow-hidden flex flex-col relative shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
    >
      <div className="h-32 bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
          <div className={`px-2.5 py-1 ${statusColors[status]} text-white text-[9px] font-bold uppercase tracking-widest rounded-full shadow-sm`}>
            {status}
          </div>
        </div>
        {plot.imageUrl ? (
           <img src={plot.imageUrl} alt={plot.plotName} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 relative z-10" />
        ) : (
           <Sprout className="w-10 h-10 text-emerald-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 relative z-10" />
        )}
      </div>
      
      <div className="p-5 space-y-5 flex-1 flex flex-col relative">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h4 className="text-xl font-display font-bold text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
              {plot.plotName}
            </h4>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${plot.location.latitude},${plot.location.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] uppercase tracking-widest hover:text-emerald-600 transition-colors"
            >
              <MapPin className="w-3 h-3" /> {plot.location.latitude.toFixed(4)}, {plot.location.longitude.toFixed(4)}
            </a>
          </div>
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); }} 
            className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Crop</span>
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <Sprout className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-sm tracking-tight">{plot.cropType}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Soil</span>
            <div className="flex items-center gap-2 font-bold text-slate-700">
              <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-sm tracking-tight">{plot.soilType}</span>
            </div>
          </div>
        </div>

        <div className="pt-1 mt-auto flex items-center justify-between">
          <div className="flex flex-col gap-2 flex-1 max-w-[140px]">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Health</span>
              <span className="text-[9px] font-bold text-emerald-600">{healthScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${healthScore}%` }} className="h-full bg-emerald-500" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 text-[9px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-all duration-300">
            Details <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export const PlotListPage: React.FC = () => {
  const navigate = useNavigate();
  const { plots } = useAppSelector((state) => state.plots);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering plots gracefully for the new feature
  const filteredPlots = plots.filter(plot => 
    plot.plotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plot.cropType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalArea = filteredPlots.length * 15.5; // Contextual mock stat
  const activeCrops = new Set(filteredPlots.map(p => p.cropType)).size;

  if (plots.length === 0 && searchQuery === '') {
    return (
      <EmptyState
        icon={<MapPin className="h-16 w-16" />}
        title="No plots found"
        description="Add your first plot to start monitoring your farm."
        action={{
          label: 'Add Plot',
          onClick: () => navigate('/plots/create'),
        }}
      />
    );
  }

  return (
    <motion.main 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-6 max-w-7xl mx-auto w-full space-y-12"
    >
      {/* List Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-1 bg-emerald-600 rounded-full"></div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em]">Portfolio Overview</span>
          </div>
          <h2 className="text-5xl font-display font-bold text-slate-900 tracking-tight">My Plots</h2>
          <p className="text-slate-400 font-medium mt-2">Manage and monitor your agricultural assets in real-time.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plots..." 
              className="pl-11 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all w-full md:w-72 shadow-sm"
            />
          </div>
          <button className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm group">
            <Filter className="w-5 h-5 group-hover:text-emerald-600 transition-colors" />
          </button>
          <button 
            onClick={() => navigate('/plots/create')}
            className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/30 active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add New Plot
          </button>
        </div>
      </section>

      {/* Quick Stats Banner */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-[2rem] flex flex-col gap-2">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Total Area</span>
          <span className="text-2xl font-display font-bold text-slate-900">{totalArea.toFixed(1)} <span className="text-sm text-slate-400">Acres</span></span>
        </div>
        <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-[2rem] flex flex-col gap-2">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Active Crops</span>
          <span className="text-2xl font-display font-bold text-slate-900">{activeCrops} <span className="text-sm text-slate-400">Varieties</span></span>
        </div>
        <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem] flex flex-col gap-2">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Avg. Health</span>
          <span className="text-2xl font-display font-bold text-slate-900">88% <span className="text-sm text-slate-400">Optimal</span></span>
        </div>
        <div className="bg-purple-50/50 border border-purple-100 p-6 rounded-[2rem] flex flex-col gap-2">
          <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Yield Forecast</span>
          <span className="text-2xl font-display font-bold text-slate-900">+12% <span className="text-sm text-slate-400">vs LY</span></span>
        </div>
      </section>

      {/* Plots Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlots.map((plot, index) => (
          <PlotCard 
            key={plot.plotId} 
            plot={plot} 
            index={index}
            onClick={() => navigate(`/plots/${plot.plotId}`)} 
          />
        ))}
        {filteredPlots.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium">
            No plots match your search criteria.
          </div>
        )}
      </section>
    </motion.main>
  );
};
