import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createNewPlot, updateExistingPlot, fetchOnePlot } from './plotsSlice';
import { PlotForm } from './components/PlotForm';
import { toast } from 'sonner';
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

  /* ── skeleton ── */
  if (id && !existingPlot && plotsLoading) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 40px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <Skeleton className="h-4 w-20 rounded mb-6" />
        <Skeleton className="h-6 w-56 rounded mb-8" />
        {[...Array(3)].map((_, i) => (
          <div key={i} style={{ background: '#fff', border: '0.5px solid #e3e3e0', borderRadius: 12, marginBottom: 10, overflow: 'hidden' }}>
            <Skeleton className="h-9 w-full rounded-none" />
            <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Skeleton className="h-9 rounded" />
              <Skeleton className="h-9 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 40px', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── page header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* back button */}
          <button
            onClick={() => navigate('/plots')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 7,
              border: '0.5px solid #e3e3e0', background: '#fff',
              cursor: 'pointer', color: '#888780',
              transition: 'border-color .15s, color .15s',
              flexShrink: 0,
            }}
            title="Back to Plots"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div style={{ width: '0.5px', height: 18, background: '#e3e3e0' }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a18' }}>
            {existingPlot ? `Update: ${existingPlot.plotName}` : 'Plot Registration'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#b4b2a9' }}>
            {existingPlot ? 'Edit mode' : `${id ? '4' : '4'} sections`}
          </span>
          <div style={{ width: '0.5px', height: 11, background: '#e3e3e0' }} />
          <span style={{ fontSize: 11, color: '#b4b2a9' }}>
            {existingPlot ? 'changes logged' : '6 required fields'}
          </span>
        </div>
      </div>

      {/* ── form ── */}
      <PlotForm
        initialData={existingPlot}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/plots')}
        isSubmitting={isSubmitting}
      />

    </div>
  );
};
