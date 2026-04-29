import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Wifi, WifiOff, Edit2, Trash2, ChevronDown, ChevronUp, MapPin, Sprout } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { fetchAllPlots, selectPlot, removePlot } from './plotsSlice';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { SkeletonPlotRow } from '../../components/ui';
import type { Plot } from '../../types';

const STAGES = ['SEEDLING', 'VEGETATIVE', 'FLOWERING', 'HARVEST'];

const stageLabel: Record<string, string> = {
  SEEDLING: 'Sowed',
  VEGETATIVE: 'Growing',
  FLOWERING: 'Harvest ready',
  HARVEST: 'Harvested',
};

const stageColors: Record<string, { bg: string; text: string; border: string }> = {
  SEEDLING: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  VEGETATIVE: { bg: '#fefce8', text: '#a16207', border: '#fde68a' },
  FLOWERING: { bg: '#fdf4ff', text: '#7e22ce', border: '#e9d5ff' },
  HARVEST: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
};

// Map sensor state badge
const sensorBadge = (value: number | null, type: string) => {
  if (value === null) return { label: '—', bg: '#f9fafb', text: '#9ca3af', border: '#e5e7eb' };
  if (type === 'moisture') {
    if (value < 30) return { label: 'Low', bg: '#fef2f2', text: '#dc2626', border: '#fecaca' };
    if (value <= 70) return { label: 'Optimal', bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
    return { label: 'High', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
  }
  if (type === 'temp') {
    if (value > 35) return { label: 'High', bg: '#fefce8', text: '#a16207', border: '#fde68a' };
    return { label: 'Optimal', bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
  }
  return { label: 'Normal', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
};

function StagePip({ state }: { state: 'done' | 'active' | 'idle' }) {
  if (state === 'done') return (
    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', border: '1.5px solid #16a34a' }} />
  );
  if (state === 'active') return (
    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', border: '2px solid #22c55e', outline: '2px solid #dcfce7', outlineOffset: 1 }} />
  );
  return (
    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f3f4f6', border: '1.5px solid #d1d5db' }} />
  );
}

function StageBar({ stage }: { stage: string }) {
  const ci = STAGES.indexOf(stage);
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderTop: '0.5px solid #f0f0f0' }}>
      {STAGES.map((s, i) => {
        const state = i < ci ? 'done' : i === ci ? 'active' : 'idle';
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <StagePip state={state} />
              <span style={{
                fontSize: 9, whiteSpace: 'nowrap',
                color: state === 'done' ? '#15803d' : state === 'active' ? '#111' : '#d1d5db',
                fontWeight: state === 'active' ? 600 : 400,
              }}>{stageLabel[s] || s}</span>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{
                flex: 1, height: '0.5px', margin: '0 5px', marginBottom: 14,
                background: i < ci ? '#22c55e' : '#e5e7eb',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface PlotCardProps {
  plot: Plot;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onClick: () => void;
}

function PlotCard({ plot, onEdit, onDelete, onClick }: PlotCardProps) {
  const [expanded, setExpanded] = useState(false);

  const moisture = null; // From sensors — placeholder
  const temp = null;
  const humidity = null;
  const soilTemp = null;

  const sensors = [
    { label: 'Soil moisture', value: moisture, unit: '%', type: 'moisture' },
    { label: 'Temperature', value: temp, unit: '°C', type: 'temp' },
    { label: 'Humidity', value: humidity, unit: '%', type: 'humidity' },
    { label: 'Soil temp', value: soilTemp, unit: '°C', type: 'temp' },
  ];

  const activeSensors = sensors.filter(s => s.value !== null).length;
  const stageStyle = stageColors[plot.cropStage] || stageColors['SEEDLING'];

  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid #e2e2d9',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 8,
    }}>
      {/* Header row */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Icon */}
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: '#f9fafb', border: '0.5px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sprout size={13} color="#6b7280" />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 2 }}>{plot.plotName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <MapPin size={10} color="#9ca3af" />
            <span style={{ fontSize: 11, color: '#9ca3af' }}>{plot.location?.district}, {plot.location?.state}</span>
            {[plot.soilType, `${plot.farmSize} Ha`].map(t => (
              <span key={t} style={{
                fontSize: 10, padding: '1px 7px', borderRadius: 99,
                background: '#f9fafb', color: '#6b7280', border: '0.5px solid #e5e7eb',
              }}>{t}</span>
            ))}
            <span style={{
              fontSize: 10, padding: '1px 7px', borderRadius: 99,
              background: stageStyle.bg, color: stageStyle.text, border: `0.5px solid ${stageStyle.border}`,
            }}>{stageLabel[plot.cropStage] || plot.cropStage}</span>
          </div>
        </div>

        {/* Date */}
        <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap', flexShrink: 0 }}>
          Sown {new Date(plot.sowingDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          <button onClick={(e) => { e.stopPropagation(); onEdit(e); }} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center', color: '#9ca3af',
          }}>
            <Edit2 size={13} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(e); }} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 6, borderRadius: 6, display: 'flex', alignItems: 'center', color: '#9ca3af',
          }}>
            <Trash2 size={13} />
          </button>
          <div style={{ padding: 4, color: '#9ca3af' }}>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>
        </div>
      </div>

      {/* Sensor summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: '0.5px solid #f0f0f0' }}>
        {sensors.map((s, i) => {
          const badge = sensorBadge(s.value, s.type);
          const active = s.value !== null;
          return (
            <div key={s.label} style={{
              padding: '9px 14px',
              borderRight: i < 3 ? '0.5px solid #f0f0f0' : 'none',
            }}>
              <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: active ? '#111' : '#d1d5db', marginBottom: 2 }}>
                {active ? s.value : '—'}<span style={{ fontSize: 10, color: '#9ca3af' }}>{active ? ` ${s.unit}` : ''}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {active ? (
                  <Wifi size={9} color="#22c55e" />
                ) : (
                  <WifiOff size={9} color="#d1d5db" />
                )}
                <span style={{
                  fontSize: 9, padding: '1px 5px', borderRadius: 99,
                  background: badge.bg, color: badge.text, border: `0.5px solid ${badge.border}`,
                  opacity: active ? 1 : 0.4,
                }}>{badge.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stage progress */}
      <StageBar stage={plot.cropStage} />

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '0.5px solid #f0f0f0', padding: '14px 16px' }}>
          {/* Sensor status */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#111' }}>Sensors</span>
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 99,
              background: activeSensors > 0 ? '#f0fdf4' : '#f9fafb',
              color: activeSensors > 0 ? '#15803d' : '#9ca3af',
              border: `0.5px solid ${activeSensors > 0 ? '#bbf7d0' : '#e5e7eb'}`,
            }}>{activeSensors} of {sensors.length} active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {sensors.map(s => {
              const active = s.value !== null;
              const badge = sensorBadge(s.value, s.type);
              return (
                <div key={s.label} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '7px 10px', borderRadius: 8,
                  background: '#f9fafb', border: '0.5px solid #f0f0f0',
                }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                    background: active ? '#22c55e' : '#e5e7eb',
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#111', flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: 12, color: active ? '#374151' : '#d1d5db', minWidth: 50, textAlign: 'right' }}>
                    {active ? `${s.value} ${s.unit}` : 'Not activated'}
                  </span>
                  {active ? (
                    <span style={{
                      fontSize: 9, padding: '2px 7px', borderRadius: 99,
                      background: badge.bg, color: badge.text, border: `0.5px solid ${badge.border}`,
                    }}>{badge.label}</span>
                  ) : (
                    <span style={{
                      fontSize: 9, padding: '2px 7px', borderRadius: 99,
                      background: '#f9fafb', color: '#9ca3af', border: '0.5px solid #e5e7eb',
                    }}>Offline</span>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={{
              marginTop: 12, width: '100%', fontSize: 11, padding: '8px 0',
              borderRadius: 8, border: '0.5px solid #e5e7eb',
              background: 'transparent', color: '#374151', cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            View full details →
          </button>
        </div>
      )}
    </div>
  );
}

export const PlotListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plots, loading } = useAppSelector((state) => state.plots);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchAllPlots());
  }, [dispatch]);

  const filtered = plots.filter(p =>
    p.plotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.location?.district?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      try {
        await dispatch(removePlot(id)).unwrap();
        toast.success(`${name} deleted`);
      } catch (err: any) {
        toast.error(err || 'Failed to delete plot');
      }
    }
  };

  if (loading && plots.length === 0) {
    return (
      <div style={{ background: '#f5f5f3', minHeight: '100vh', padding: '28px 32px', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {[...Array(3)].map((_, i) => <SkeletonPlotRow key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f5f3',
      fontFamily: "'Inter', -apple-system, sans-serif",
      padding: '28px 32px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 500, color: '#111', margin: 0 }}>Plot management</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4, margin: 0 }}>
              {filtered.length} active plot{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/plots/create')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#111', color: '#fff', border: 'none',
              borderRadius: 8, padding: '8px 14px',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <Plus size={12} />
            Add plot
          </button>
        </div>

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '0.5px solid #e2e2d9',
          borderRadius: 8, padding: '0 12px', height: 36, marginBottom: 14,
        }}>
          <Search size={13} color="#9ca3af" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter by plot name or location..."
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 13, color: '#111', flex: 1,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 16, lineHeight: 1 }}
            >×</button>
          )}
        </div>

        {/* Plot cards */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: 13 }}>
            {searchQuery ? `No plots match "${searchQuery}"` : 'No plots yet. Add your first plot.'}
          </div>
        ) : (
          filtered.map(plot => (
            <PlotCard
              key={plot._id}
              plot={plot}
              onClick={() => { dispatch(selectPlot(plot._id)); navigate(`/plots/${plot._id}`); }}
              onEdit={(e) => { e.stopPropagation(); navigate(`/plots/edit/${plot._id}`); }}
              onDelete={(e) => { e.stopPropagation(); handleDelete(plot._id, plot.plotName); }}
            />
          ))
        )}
      </div>
    </div>
  );
};
