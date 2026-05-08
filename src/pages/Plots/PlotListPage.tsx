import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Sprout, MapPin, Edit2, Trash2, Wifi, WifiOff, Battery, Signal } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { shallowEqual } from 'react-redux';
import { fetchAllPlots, selectPlot, removePlot } from '@/features/plots/plotsSlice';

import { toast } from 'sonner';
import { SkeletonPlotRow } from '@/components/loaders/Skeleton';
import type { Plot, SensorData } from '@/types';

const stageLabel: Record<string, string> = {
  SEEDLING: 'Sowed',
  VEGETATIVE: 'Growing',
  FLOWERING: 'Harvest ready',
  HARVEST: 'Harvested',
};

const stageColors: Record<string, { bg: string; text: string }> = {
  SEEDLING: { bg: '#eff6ff', text: '#1d4ed8' },
  VEGETATIVE: { bg: '#fefce8', text: '#a16207' },
  FLOWERING: { bg: '#fdf4ff', text: '#7e22ce' },
  HARVEST: { bg: '#f0fdf4', text: '#15803d' },
};

const sensorStatusColor: Record<string, string> = {
  ok: '#22c55e',
  warning: '#f59e0b',
  critical: '#ef4444',
};

interface SensorRow { label: string; key: keyof SensorData; }

const SENSOR_ROWS: SensorRow[] = [
  { label: 'Soil moisture', key: 'soilMoisture' },
  { label: 'Temperature', key: 'temperature' },
  { label: 'Humidity', key: 'humidity' },
  { label: 'Soil temp', key: 'soilTemperature' },
];

const batteryColor = (v?: number) =>
  v === undefined ? '#9ca3af' : v < 20 ? '#ef4444' : v < 50 ? '#f59e0b' : '#22c55e';

interface PlotCardProps {
  plot: Plot;
  sensorData: SensorData | undefined;
}

const PlotCard = React.memo(function PlotCard({ plot, sensorData }: PlotCardProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const sc = stageColors[plot.cropStage] ?? { bg: '#f3f4f6', text: '#6b7280' };
  const label = stageLabel[plot.cropStage] ?? plot.cropStage;
  const activeSensors = SENSOR_ROWS.filter(r => sensorData?.[r.key] != null).length;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const hw = plot.hardwareStatus;

  const handleClick = useCallback(() => {
    dispatch(selectPlot(plot._id));
    navigate(`/plots/${plot._id}`);
  }, [dispatch, navigate, plot._id]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/plots/${plot._id}/edit`);
  }, [navigate, plot._id]);

  const handleDelete = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(false);
    try {
      await dispatch(removePlot(plot._id)).unwrap();
      toast.success(`"${plot.plotName}" deleted`);
    } catch (err: any) {
      toast.error(err || 'Failed to delete plot');
    }
  }, [dispatch, plot._id, plot.plotName]);

  return (
    <div style={{ width: 340, background: '#fff', border: '0.5px solid #e2e2d9', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: '#f9fafb', border: '0.5px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sprout size={14} color="#6b7280" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {plot.plotName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <MapPin size={10} color="#9ca3af" />
            <span style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {[plot.location?.district, plot.location?.state].filter(Boolean).join(', ')}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          {confirmDelete ? (
            <>
              <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '0.5px solid #e5e7eb', background: '#fff', color: '#6b7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>Cancel</button>
              <button onClick={handleDelete} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: 4 }}>Delete</button>
            </>
          ) : (
            <>
              <button title="Edit" onClick={handleEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 6, color: '#9ca3af', display: 'flex' }}><Edit2 size={12} /></button>
              <button title="Delete" onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: 6, color: '#9ca3af', display: 'flex' }}><Trash2 size={12} /></button>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: '0 16px 12px', display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
        {[plot.cropType, `${plot.farmSize} Ha`, plot.environmentType?.replace('_', ' ')].filter(Boolean).map(tag => (
          <span key={tag} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: '#f9fafb', color: '#6b7280', border: '0.5px solid #e5e7eb', whiteSpace: 'nowrap' }}>{tag}</span>
        ))}
        <span style={{ fontSize: 10, padding: '2px 10px', borderRadius: 99, background: sc.bg, color: sc.text, whiteSpace: 'nowrap', fontWeight: 500 }}>{label}</span>
      </div>

      <div style={{ height: '0.5px', background: '#f0f0f0' }} />

      <div style={{ padding: '10px 16px' }}>
        <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Live sensors</div>
        {SENSOR_ROWS.map((row, i) => {
          const reading = sensorData?.[row.key] as { value: number; unit: string; status: string } | undefined;
          const isActive = reading != null;
          const dotColor = isActive ? (sensorStatusColor[reading!.status] ?? '#22c55e') : '#e5e7eb';
          return (
            <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: i < SENSOR_ROWS.length - 1 ? '0.5px solid #f5f5f5' : 'none' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: dotColor }} />
              <span style={{ fontSize: 12, color: isActive ? '#374151' : '#9ca3af', flex: 1 }}>{row.label}</span>
              {isActive ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#111' }}>{reading!.value}<span style={{ fontSize: 10, color: '#6b7280', fontWeight: 400 }}> {reading!.unit}</span></span>
                  <Wifi size={9} color={sensorStatusColor[reading!.status] ?? '#22c55e'} />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, color: '#d1d5db' }}>—</span>
                  <WifiOff size={9} color="#d1d5db" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ height: '0.5px', background: '#f0f0f0' }} />

      {hw && (
        <>
          <div style={{ padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Battery size={11} color={batteryColor(hw.battery)} />
              <span style={{ fontSize: 11, color: '#374151' }}><span style={{ fontWeight: 500, color: batteryColor(hw.battery) }}>{hw.battery}%</span><span style={{ color: '#9ca3af' }}> battery</span></span>
            </div>
            <div style={{ width: '0.5px', background: '#f0f0f0', height: 12 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Signal size={11} color="#3b82f6" />
              <span style={{ fontSize: 11, color: '#374151' }}><span style={{ fontWeight: 500, color: '#3b82f6' }}>{hw.signal}%</span><span style={{ color: '#9ca3af' }}> signal</span></span>
            </div>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 10, color: '#9ca3af' }}>Synced {new Date(hw.lastSync).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div style={{ height: '0.5px', background: '#f0f0f0' }} />
        </>
      )}

      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={handleClick} style={{ fontSize: 11, color: '#374151', cursor: 'pointer', background: 'none', border: 'none', padding: 0, fontWeight: 500 }}>View details →</button>
        <span style={{ fontSize: 10, color: activeSensors > 0 ? '#16a34a' : '#9ca3af', fontWeight: 500 }}>{activeSensors}/{SENSOR_ROWS.length} sensors active</span>
      </div>
    </div>
  );
});

export const PlotListPage: React.FC = React.memo(() => {
  console.count("PlotListPage render");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // FIX 1: shallowEqual on all array/object selectors
  const plots = useAppSelector((state) => state.plots.plots, shallowEqual);
  const loading = useAppSelector((state) => state.plots.loading);
  const hasFetched = useAppSelector((state) => state.plots.hasFetched);
  const sensorData = useAppSelector((state) => state.sensors.sensorData, shallowEqual);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!hasFetched && !loading) {
      dispatch(fetchAllPlots());
    }
  }, [dispatch, hasFetched, loading]);

  const filtered = React.useMemo(() =>
    plots.filter(p =>
      p.plotName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.district?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [plots, searchQuery]
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearSearch = useCallback(() => setSearchQuery(''), []);

  if (loading && plots.length === 0) {
    return (
      <div style={{ background: '#f5f6f4', minHeight: '100vh', padding: '28px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="flex flex-wrap gap-[12px]">
            {[...Array(6)].map((_, i) => <SkeletonPlotRow key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3', fontFamily: "'Inter', -apple-system, sans-serif", padding: '28px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 500, color: '#111', margin: 0 }}>My plots</h1>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>{filtered.length} active plot{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => navigate('/plots/create')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#111', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
            <Plus size={11} />Add plot
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '0.5px solid #e2e2d9', borderRadius: 8, padding: '0 12px', height: 36, marginBottom: 20 }}>
          <Search size={13} color="#9ca3af" />
          <input value={searchQuery} onChange={handleSearch} placeholder="Filter by name or location…" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: '#111', flex: 1 }} />
          {searchQuery && (
            <button onClick={clearSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 16, lineHeight: 1 }}>×</button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: 13 }}>
            {searchQuery ? `No plots match "${searchQuery}"` : 'No plots yet — add your first plot.'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {filtered.map(plot => (
              <PlotCard
                key={plot._id}
                plot={plot}
                sensorData={sensorData[plot._id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

PlotListPage.displayName = 'PlotListPage';

