import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createNewPlot, updateExistingPlot, fetchOnePlot } from './plotsSlice';
import { PlotForm } from './components/PlotForm';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Skeleton } from '../../components/ui';

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
        toast.success(`Plot "${payload.plotName}" updated successfully`);
      } else {
        await dispatch(createNewPlot(payload)).unwrap();
        toast.success(`Plot "${payload.plotName}" registered successfully`);
      }
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err || 'Failed to save plot');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (id && !existingPlot && plotsLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10 animate-pulse">
        <Skeleton className="h-4 w-24 rounded mb-6" />
        <Skeleton className="h-8 w-72 rounded mb-2" />
        <Skeleton className="h-4 w-96 rounded mb-10" />
        <div className="border border-slate-200 rounded space-y-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border-b border-slate-100 last:border-0">
              <Skeleton className="h-9 w-full rounded-none" />
              <div className="p-5 grid grid-cols-2 gap-5">
                <Skeleton className="h-10 rounded" />
                <Skeleton className="h-10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Page Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/plots')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-[11px] font-semibold uppercase tracking-widest transition-colors mb-6"
        >
          <ArrowLeft size={13} /> Back to Plots
        </button>

        <div className="border-b border-slate-200 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {existingPlot ? 'Edit Record' : 'New Registration'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-2">
            {existingPlot ? `Update: ${existingPlot.plotName}` : 'Agricultural Plot Registration'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {existingPlot
              ? 'Modify the plot details below. All changes will be logged.'
              : 'Complete all sections to register a new agricultural plot in the system.'}
          </p>
        </div>
      </div>

      {/* Form */}
      <PlotForm
        initialData={existingPlot}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/plots')}
        isSubmitting={isSubmitting}
      />

    </div>
  );
};
