import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createNewPlot, updateExistingPlot, fetchOnePlot } from './plotsSlice';
import { PlotForm } from './components/PlotForm';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, Sparkles, Layout } from 'lucide-react';

export const AddPlotPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id: string }>();
  const { plots, loading: plotsLoading } = useAppSelector((state) => state.plots);
  
  const existingPlot = id ? plots.find(p => p._id === id) : undefined;
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (id && !existingPlot && !plotsLoading) {
      dispatch(fetchOnePlot(id));
    }
  }, [dispatch, id, existingPlot, plotsLoading]);

  const handleSubmit = async (payload: any) => {
    setIsSubmitting(true);
    try {
      if (existingPlot) {
        await dispatch(updateExistingPlot({ id: existingPlot._id, data: payload })).unwrap();
        toast.success(`"${payload.plotName}" updated successfully`);
      } else {
        await dispatch(createNewPlot(payload)).unwrap();
        toast.success(`"${payload.plotName}" deployed successfully`);
      }
      navigate('/plots');
    } catch (err: any) {
      toast.error(err || "Failed to save plot intelligence");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (id && !existingPlot && plotsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
        <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Retrieving Plot Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 font-['Inter']">
      {/* Header */}
      <header className="mb-12 space-y-6">
        <button
          onClick={() => navigate('/plots')}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <ArrowLeft size={14} /> Back to Hub
        </button>

        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-600 rounded-lg text-white shadow-lg shadow-emerald-600/20">
                <Sparkles size={20} />
             </div>
             <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">Asset Configurator</span>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            {existingPlot ? 'Refine Intelligence' : 'Deploy New Asset'}
          </h2>
          <p className="text-lg font-medium text-slate-400 max-w-xl">
            {existingPlot 
              ? `Calibrating parameters for "${existingPlot.plotName}". Ensure geospatial data is accurate.`
              : 'Initialize a new cultivation zone with precision parameters for real-time monitoring.'}
          </p>
        </div>
      </header>

      {/* Form Section */}
      <section className="relative">
        {/* Subtle background decoration */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10" />

        <div className="bg-white/50 backdrop-blur-sm border border-slate-100 rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-slate-200/20">
          <PlotForm
            initialData={existingPlot}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/plots')}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Info Box */}
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.5 }}
           className="mt-10 flex items-start gap-4 p-6 bg-slate-950 rounded-[2rem] text-white shadow-2xl shadow-slate-950/20"
        >
           <div className="p-3 bg-white/10 rounded-2xl">
              <Layout size={20} className="text-emerald-400" />
           </div>
           <div>
              <p className="text-xs font-bold text-emerald-50 uppercase tracking-widest mb-1">System Note</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                All coordinates are processed through our proprietary geospatial engine. Once deployed, telemetry data will begin streaming within 5-10 minutes.
              </p>
           </div>
        </motion.div>
      </section>
    </div>
  );
};
