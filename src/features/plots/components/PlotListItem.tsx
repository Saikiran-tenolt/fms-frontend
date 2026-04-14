import React from 'react';
import { MapPin, Maximize2, Calendar, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Plot } from '../../../types';
import { PlotProgressBar } from './PlotProgressBar';
import { PlotBadge } from './PlotBadge';

interface PlotListItemProps {
  plot: Plot;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const PlotListItem = React.forwardRef<HTMLDivElement, PlotListItemProps>(({ plot, onClick, onEdit, onDelete }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.002, backgroundColor: 'rgba(248, 250, 252, 0.5)' }}
      onClick={onClick}
      className="group flex flex-col sm:flex-row items-center gap-6 p-6 bg-white border border-slate-100 rounded-2xl cursor-pointer transition-all duration-300 hover:border-emerald-200 shadow-sm hover:shadow-md"
    >
      {/* Plot Info & Visual */}
      <div className="flex items-center gap-4 flex-shrink-0 w-full sm:w-64">
        {plot.imageUrl ? (
          <div className="h-12 w-12 rounded-xl border border-slate-100 overflow-hidden shadow-sm flex-shrink-0 bg-slate-50">
            <img src={plot.imageUrl} alt={plot.plotName} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-xl border-2 border-dashed border-slate-100 flex items-center justify-center flex-shrink-0 bg-slate-50 text-slate-200">
            <ImageIcon size={18} />
          </div>
        )}
        <div className="space-y-1 overflow-hidden">
          <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase group-hover:text-emerald-600 transition-colors truncate">
            {plot.plotName}
          </h3>
          <div className="flex items-center gap-2 text-slate-400">
            <MapPin size={12} className="text-emerald-500" />
            <span className="text-[10px] font-bold truncate">{plot.location.address}</span>
          </div>
        </div>
      </div>

      {/* Stats & Badges */}
      <div className="flex flex-wrap items-center gap-3 min-w-[180px]">
        <PlotBadge label={plot.soilType} />
        <PlotBadge label={plot.environmentType} />
        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded text-slate-500 border border-slate-100">
          <Maximize2 size={10} />
          <span className="text-[10px] font-bold tracking-tighter">{plot.farmSize} Ha</span>
        </div>
      </div>

      {/* Progress Section */}
      <div className="flex-1 w-full min-w-[200px]">
        <PlotProgressBar stage={plot.cropStage} />
      </div>

      {/* Date & Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sown On</span>
          <div className="flex items-center gap-1.5 text-slate-600">
            <Calendar size={12} className="text-slate-300" />
            <span className="text-[10px] font-bold">{new Date(plot.sowingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all active:scale-90"
            title="Edit Plot"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all active:scale-90"
            title="Delete Plot"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
});
