import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, 
  LayoutGrid, List as ListIcon, Filter,
  Loader2, RefreshCw 
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { fetchAllPlots, selectPlot, removePlot } from './plotsSlice';
import { PlotListItem } from './components/PlotListItem';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const PlotListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plots, loading, error } = useAppSelector((state) => state.plots);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchAllPlots());
  }, [dispatch]);

  const filteredPlots = plots.filter(plot =>
    plot.plotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plot.location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await dispatch(removePlot(id)).unwrap();
        toast.success(`${name} deleted successfully`);
      } catch (err: any) {
        toast.error(err || "Failed to delete plot");
      }
    }
  };

  if (loading && plots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-10 font-['Inter']">
      {/* Header section with CTA in Top Right */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
             <div className="h-1 w-8 bg-emerald-600 rounded-full" />
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Resource Overview</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            Plot Management
          </h2>
          <p className="text-sm font-medium text-slate-400">Managing {plots.length} active agricultural assets.</p>
        </div>

        <div className="flex items-center gap-3">
           <button
             onClick={() => dispatch(fetchAllPlots())}
             className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl border border-slate-200 transition-all active:rotate-180 duration-500"
             title="Reload Data"
           >
             <RefreshCw size={18} />
           </button>
           <button
             onClick={() => navigate('/plots/create')}
             className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-emerald-600 hover:-translate-y-0.5 active:translate-y-0 transition-all"
           >
             <Plus size={18} />
             Add New Plot
           </button>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <section className="mb-10">
        <div className="flex flex-col md:flex-row items-center gap-4 p-2 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <input
              type="text"
              placeholder="Filter by plot name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500/10 placeholder:text-slate-300 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 px-2">
             <button className="flex items-center gap-2 px-4 py-3 text-slate-400 hover:text-slate-600 text-[10px] font-black uppercase tracking-widest">
                <Filter size={14} /> Refine
             </button>
             <div className="w-px h-6 bg-slate-100 mx-2" />
             <div className="flex p-1 bg-slate-50 rounded-lg">
                <button className="p-2.5 rounded-md bg-white text-emerald-600 shadow-sm"><ListIcon size={16} /></button>
                <button disabled className="p-2.5 text-slate-300 cursor-not-allowed"><LayoutGrid size={16} /></button>
             </div>
          </div>
        </div>
      </section>

      {/* Plots List */}
      <section className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredPlots.length > 0 ? (
            filteredPlots.map((plot) => (
              <PlotListItem
                key={plot._id}
                plot={plot}
                onClick={() => {
                  dispatch(selectPlot(plot._id));
                  navigate(`/plots/${plot._id}`);
                }}
                onEdit={(e) => {
                  e.stopPropagation();
                  navigate(`/plots/edit/${plot._id}`);
                }}
                onDelete={(e) => {
                  e.stopPropagation();
                  handleDelete(plot._id, plot.plotName);
                }}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-100 rounded-[3rem]"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                <Plus size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 uppercase">No plots found</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-xs">No active assets match your current filter criteria.</p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-6 text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Error State */}
      {error && (
        <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          {error}
        </div>
      )}
    </div>
  );
};
