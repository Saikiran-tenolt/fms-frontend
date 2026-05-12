import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ExternalLink } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { SkeletonPlotDetails } from '@/components/loaders/Skeleton';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { shallowEqual } from 'react-redux';
import { fetchAllPlots, fetchOnePlot } from '@/features/plots/plotsSlice';
import {
  fetchSensorRequests,
  submitSensorRequest,
  cancelSensorRequest,
} from '@/admin/features/sensorRequests/sensorRequestSlice';
import { getPlotCoordinates } from '@/utils/location';
import { toast } from 'sonner';

/* ── tiny primitives ─────────────────────────────────── */
type PillVariant = 'green' | 'amber' | 'blue' | 'red' | 'gray';
const PILL_CLS: Record<PillVariant, string> = {
  green: 'bg-[#eaf3de] border-[#c0dd97] text-[#3b6d11]',
  amber: 'bg-[#faeeda] border-[#f5c97a] text-[#854f0b]',
  blue: 'bg-[#e6f1fb] border-[#9fc8f0] text-[#185fa5]',
  red: 'bg-[#fdecea] border-[#f5b3ae] text-[#b91c1c]',
  gray: 'bg-[#f5f5f3] border-[#e3e3e0] text-[#5f5e5a]',
};
const Pill = ({ children, v = 'gray' }: { children: React.ReactNode; v?: PillVariant }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${PILL_CLS[v]}`}>
    {children}
  </span>
);

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-[#e3e3e0] rounded-xl p-4 ${className}`}>{children}</div>
);

const InfoLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[10px] uppercase tracking-widest text-[#b4b2a9] mb-1">{children}</div>
);

const SoilBar = ({ label, val, pct, color }: { label: string; val: string; pct: number; color: string }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-[11.5px] text-[#5f5e5a]">{label}</span>
      <span className="text-[11.5px] font-medium text-[#1a1a18]">{val}</span>
    </div>
    <div className="h-1.5 bg-[#f0efec] rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  </div>
);

const CHART = [
  { d: 'D1', v: 33 }, { d: 'D2', v: 38 }, { d: 'D3', v: 36 },
  { d: 'D4', v: 42 }, { d: 'D5', v: 45 }, { d: 'D6', v: 40 }, { d: 'D7', v: 35 },
];

const MoistureBar = ({ d, v }: { d: string; v: number }) => {
  const h = Math.max(8, Math.round((v / 70) * 72));
  const c = v < 30 ? '#e24b4a' : v > 70 ? '#378add' : '#1d9e75';
  return (
    <div className="flex flex-col items-center flex-1 gap-1">
      <span className="text-[9px] text-[#888780]">{v}%</span>
      <div className="w-full rounded-t-sm" style={{ height: h, background: c, opacity: 0.85 }} />
      <span className="text-[9px] text-[#b4b2a9]">{d}</span>
    </div>
  );
};

// Sensor catalogue — sensorType must match what the backend expects
const SENSOR_CATALOGUE = [
  { name: 'Soil Moisture Sensor', desc: 'Volumetric water content in soil.', sensorType: 'SOIL_MOISTURE' },
  { name: 'Temperature Sensor', desc: 'Ambient and canopy monitoring.', sensorType: 'TEMPERATURE' },
  { name: 'Humidity Sensor', desc: 'Relative humidity monitoring.', sensorType: 'HUMIDITY' },
  { name: 'Soil pH Sensor', desc: 'Continuous pH monitoring.', sensorType: 'SOIL_PH' },
  { name: 'Rainfall Sensor', desc: 'Tipping bucket rain gauge.', sensorType: 'RAINFALL' },
  { name: 'NPK Soil Sensor', desc: 'N, P, K level monitoring.', sensorType: 'NPK' },
];

/* ── main ────────────────────────────────────────────── */
export const PlotDetailsPage: React.FC = React.memo(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const plots = useAppSelector((s) => s.plots.plots, shallowEqual);
  const plotsLoading = useAppSelector((s) => s.plots.loading);

  // Sensor request state
  const sensorRequests = useAppSelector((s) => (id ? (s as any).sensorRequests.byPlot[id] ?? [] : []));
  const requestLoading = useAppSelector((s) => (s as any).sensorRequests.loading);

  const plot = React.useMemo(
    () => plots.find((p) => p._id === id) ?? null,
    [plots, id]
  );

  const fetchedRef = useRef<Set<string>>(new Set());

  // Fetch plot data
  useEffect(() => {
    if (!id) return;
    if (fetchedRef.current.has(id)) return;
    fetchedRef.current.add(id);
    if (!plot && !plotsLoading) {
      if (plots.length === 0) dispatch(fetchAllPlots());
      else dispatch(fetchOnePlot(id));
    }
  }, [id, plot, plots.length, plotsLoading, dispatch]);

  // Fetch sensor requests for this plot
  useEffect(() => {
    if (id) dispatch(fetchSensorRequests(id) as any);
  }, [id, dispatch]);

  // ── Sensor request helpers ─────────────────────────────────────────────────

  /** Returns the request object for a given sensorType, or undefined */
  const getRequest = (sensorType: string) =>
    sensorRequests.find((r: any) => r.sensorType === sensorType);

  const handleSendRequest = async (sensorType: string, sensorName: string) => {
    if (!id) return;
    try {
      await dispatch(submitSensorRequest({ plotId: id, sensorType }) as any).unwrap();
      toast.success(`${sensorName} request submitted`);
    } catch (err: any) {
      toast.error(err || 'Failed to submit request');
    }
  };

  const handleCancelRequest = async (requestId: string, sensorName: string) => {
    if (!id) return;
    try {
      await dispatch(cancelSensorRequest({ requestId, plotId: id }) as any).unwrap();
      toast.info(`${sensorName} request cancelled`);
    } catch (err: any) {
      toast.error(err || 'Failed to cancel request');
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────

  if (plotsLoading) return <SkeletonPlotDetails />;
  if (!plot) return (
    <EmptyState icon={<MapPin className="h-12 w-12" />} title="Plot Not Found"
      description="This plot does not exist."
      action={{ label: 'Back to Plots', onClick: () => navigate('/plots') }} />
  );

  const { lat = 0, lon = 0 } = getPlotCoordinates(plot.location);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
  const daysLeft = plot.expectedHarvestDate
    ? Math.ceil((new Date(plot.expectedHarvestDate).getTime() - Date.now()) / 86400000)
    : null;
  const n = plot.npkLevels?.n ?? 142;
  const p = plot.npkLevels?.p ?? 58;
  const k = plot.npkLevels?.k ?? 44;

  return (
    <div style={{ background: '#f5f5f3', minHeight: '100vh', fontFamily: "'DM Sans',sans-serif" }}>

      {/* ── Topbar ── */}
      <div className="flex items-center px-6 gap-4 z-10" style={{ height: 56 }}>
        <button
          onClick={() => navigate('/plots')}
          className="flex items-center gap-2 border border-[#e8eae5] rounded-full px-4 py-1.5 text-[13px] font-medium text-[#1a1f16] bg-white hover:bg-[#f9fafb] transition-all active:scale-95"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>

        <div className="flex items-center gap-2 text-[13px] text-[#6b7468]">
          <span className="hover:text-[#1a1f16] cursor-pointer" onClick={() => navigate('/plots')}>Plots</span>
          <span className="text-[#9ea89b] text-[11px]">›</span>
          <span className="text-[#1a1f16] font-bold">{plot.plotName}</span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3.5">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-[#1a1a18] tracking-tight">{plot.plotName}</h1>
            <div className="flex items-center flex-wrap gap-2 mt-2">
              <Pill v="green">🌾 {plot.cropType}</Pill>
              <Pill v="gray">{plot.farmSize} Hectares</Pill>
              <Pill v="gray">{plot.soilType}</Pill>
              <Pill v="gray">{plot.environmentType.replace('_', ' ')}</Pill>
              {daysLeft !== null && <Pill v="amber">{daysLeft}D Remaining</Pill>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => navigate(`/plots/${plot._id}/edit`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e3e3e0] text-[#1a1a18] bg-white text-[12.5px] font-medium hover:border-[#c0dd97] transition-colors">
              Refine Config
            </button>
            <button className="px-3 py-2 rounded-lg bg-[#1a1a18] text-white text-[12.5px] font-medium hover:bg-[#2c2c28] transition-colors">
              Export Feed
            </button>
          </div>
        </div>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3.5 items-start">

          {/* LEFT */}
          <div className="flex flex-col gap-3.5">

            {/* Live sensors */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[13px] font-medium text-[#1a1a18]">Live Sensor Readings</div>
                  <div className="text-[11px] text-[#b4b2a9] mt-0.5">Approved & active sensors — real-time telemetry</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1d9e75] animate-pulse" />
                  <span className="text-[11px] text-[#888780]">Live</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  { label: 'Soil Moisture', val: '35', unit: '%', badge: 'Optimal', bv: 'green' as PillVariant, note: 'Updated just now' },
                  { label: 'Temperature', val: '39', unit: '°C', badge: 'High', bv: 'amber' as PillVariant, note: 'Updated just now' },
                  { label: 'Humidity', val: '—', unit: '', badge: 'Pending', bv: 'gray' as PillVariant, note: '🔒 Awaiting approval', dim: true },
                  { label: 'Soil pH', val: '—', unit: '', badge: 'Locked', bv: 'gray' as PillVariant, note: '🔒 Request not sent', dim: true },
                ].map((sc) => (
                  <div key={sc.label}
                    className={`border border-[#e3e3e0] rounded-xl p-3 ${sc.dim ? 'bg-[#fafaf8] opacity-70' : 'bg-white'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-widest text-[#b4b2a9]">{sc.label}</span>
                      <Pill v={sc.bv}>{sc.badge}</Pill>
                    </div>
                    <div className="text-2xl font-medium text-[#1a1a18] leading-none">
                      {sc.val}<span className="text-[12px] text-[#b4b2a9] ml-0.5">{sc.unit}</span>
                    </div>
                    <div className="text-[10.5px] text-[#b4b2a9] mt-1.5">{sc.note}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Saturation chart */}
            <Card>
              <div className="text-[13px] font-medium text-[#1a1a18]">Soil Saturation Index</div>
              <div className="text-[11px] text-[#b4b2a9] mt-0.5 mb-3">7-day trend from active IoT sensor</div>
              <div className="flex items-end gap-2 h-20">
                {CHART.map((pt) => <MoistureBar key={pt.d} d={pt.d} v={pt.v} />)}
              </div>
              <div className="h-px bg-[#e3e3e0] mt-1 mb-2.5" />
              <div className="flex gap-4">
                {[['#e24b4a', 'Critical <30%'], ['#1d9e75', 'Optimal 30–70%'], ['#378add', 'High >70%']].map(([c, l]) => (
                  <div key={l} className="flex items-center gap-1.5 text-[10.5px] text-[#888780]">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />{l}
                  </div>
                ))}
              </div>
            </Card>

            {/* ── Sensor Access Management — WIRED ── */}
            <Card>
              <div className="flex items-center justify-between mb-1">
                <div className="text-[13px] font-medium text-[#1a1a18]">Sensor Access Management</div>
              </div>
              <div className="text-[11px] text-[#b4b2a9] mb-3">
                Request sensors from the Agricultural Authority. Approved sensors stream live data.
              </div>

              {requestLoading && sensorRequests.length === 0 ? (
                <div className="text-[12px] text-[#888780] py-4 text-center">Loading sensor status...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {SENSOR_CATALOGUE.map((sensor) => {
                    const req = getRequest(sensor.sensorType);
                    const status = req?.status ?? 'none';

                    return (
                      <div
                        key={sensor.sensorType}
                        className={`border rounded-xl p-3.5 ${status === 'pending' ? 'border-[#f5c97a] bg-[#fffdf9]' :
                            status === 'active' ? 'border-[#c0dd97]' :
                              status === 'rejected' ? 'border-[#f5b3ae] bg-[#fdecea]/30' :
                                'border-[#e3e3e0] bg-white'
                          }`}
                      >
                        <div className="text-[13px] font-medium text-[#1a1a18] mb-1">{sensor.name}</div>
                        <div className="text-[11.5px] text-[#888780] mb-3 leading-relaxed">{sensor.desc}</div>

                        <div className="flex items-center justify-between">
                          {/* Status badge */}
                          {status === 'active' && <Pill v="green">Active · Live Feed</Pill>}
                          {status === 'pending' && <Pill v="amber">Pending Review</Pill>}
                          {status === 'rejected' && <Pill v="red">Rejected</Pill>}
                          {status === 'none' && <span className="text-[11px] text-[#b4b2a9]">Not Requested</span>}

                          {/* Action button */}
                          {status === 'active' && (
                            <button className="text-[11px] border border-[#e3e3e0] rounded-lg px-2.5 py-1 text-[#5f5e5a] hover:border-[#c0dd97] transition-colors">
                              View Data
                            </button>
                          )}
                          {status === 'pending' && (
                            <button
                              disabled={requestLoading}
                              onClick={() => handleCancelRequest(req!._id, sensor.name)}
                              className="text-[11px] border border-[#f5c97a] rounded-lg px-2.5 py-1 text-[#854f0b] hover:bg-[#faeeda] transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                          {status === 'rejected' && (
                            <button
                              disabled={requestLoading}
                              onClick={() => handleSendRequest(sensor.sensorType, sensor.name)}
                              className="text-[11px] bg-[#1a1a18] text-white rounded-lg px-2.5 py-1 hover:bg-[#2c2c28] transition-colors disabled:opacity-50"
                            >
                              Re-request
                            </button>
                          )}
                          {status === 'none' && (
                            <button
                              disabled={requestLoading}
                              onClick={() => handleSendRequest(sensor.sensorType, sensor.name)}
                              className="text-[11px] bg-[#1a1a18] text-white rounded-lg px-2.5 py-1 hover:bg-[#2c2c28] transition-colors disabled:opacity-50"
                            >
                              Send Request
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Map */}
            <Card>
              <div className="text-[13px] font-medium text-[#1a1a18] mb-3">Geospatial Link</div>
              <div className="h-36 rounded-lg bg-[#f0efec] border border-[#e3e3e0] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-40"
                  style={{ backgroundImage: 'linear-gradient(#e3e3e0 1px,transparent 1px),linear-gradient(90deg,#e3e3e0 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#3b6d11] opacity-70" />
                  <span className="text-[11px] text-[#5f5e5a] font-medium">Standard Grid Designation</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div>
                  <InfoLabel>Coordinates</InfoLabel>
                  <div className="font-mono text-[11.5px] text-[#5f5e5a]">
                    {Number(lat).toFixed(6)}, {Number(lon).toFixed(6)}
                  </div>
                </div>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[11.5px] border border-[#e3e3e0] rounded-lg px-2.5 py-1.5 text-[#5f5e5a] hover:border-[#c0dd97] hover:text-[#3b6d11] transition-colors">
                  <ExternalLink size={11} /> Open Map
                </a>
              </div>
            </Card>

          </div>{/* /LEFT */}

          {/* RIGHT */}
          <div className="flex flex-col gap-3.5">

            {/* Soil composition */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[13px] font-medium text-[#1a1a18]">Soil Composition</div>
                <Pill v="gray">Last tested: Today</Pill>
              </div>
              <div className="flex flex-col gap-3">
                <SoilBar label="Nitrogen (N)" val={`${n} kg/ha`} pct={Math.round((n / 200) * 100)} color="#1d9e75" />
                <SoilBar label="Phosphorus (P)" val={`${p} kg/ha`} pct={Math.round((p / 100) * 100)} color="#378add" />
                <SoilBar label="Potassium (K)" val={`${k} kg/ha`} pct={Math.round((k / 100) * 100)} color="#d97706" />
                <SoilBar label="Organic Matter" val="2.3%" pct={46} color="#94a3b8" />
              </div>
              <div className="mt-3 p-2.5 bg-[#fafaf8] border border-[#e3e3e0] rounded-lg text-[11.5px] text-[#888780] leading-relaxed">
                <strong className="text-[#5f5e5a] font-medium">Advisory:</strong> Telemetry suggests late-season split dose of P for optimal yield.
              </div>
            </Card>

            {/* Telemetry */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="text-[13px] font-medium text-[#1a1a18]">Telemetry Relay</div>
                <Pill v="green">Sync Active</Pill>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[
                  ['Power', plot.hardwareStatus?.battery ?? 98],
                  ['Signal', plot.hardwareStatus?.signal ?? 100],
                ].map(([label, pct]) => (
                  <div key={String(label)}>
                    <InfoLabel>{label}</InfoLabel>
                    <div className="text-xl font-medium text-[#1a1a18] mb-1.5">{pct}%</div>
                    <div className="h-1.5 bg-[#f0efec] rounded-full overflow-hidden">
                      <div className="h-full bg-[#1d9e75] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[10.5px] text-[#b4b2a9]">
                Last synced: {new Date(plot.updatedAt).toLocaleTimeString()} · {new Date(plot.updatedAt).toLocaleDateString()}
              </div>
            </Card>

            {/* Activity log — dynamic from sensorRequests */}
            <Card>
              <div className="text-[13px] font-medium text-[#1a1a18] mb-3">Activity Log</div>
              {sensorRequests.length === 0 ? (
                <div className="text-[12px] text-[#b4b2a9] py-2">No activity yet.</div>
              ) : (
                <div>
                  {[...sensorRequests]
                    .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .map((req: any, i: number, arr: any[]) => {
                      const color =
                        req.status === 'active' ? '#1d9e75' :
                          req.status === 'pending' ? '#854f0b' :
                            req.status === 'rejected' ? '#e24b4a' : '#888780';
                      const msg =
                        req.status === 'active'
                          ? `${req.sensorType} approved and streaming live data.`
                          : req.status === 'pending'
                            ? `${req.sensorType} request submitted. Awaiting review.`
                            : req.status === 'rejected'
                              ? `${req.sensorType} request rejected.`
                              : `${req.sensorType} request updated.`;
                      const time = new Date(req.updatedAt).toLocaleString();

                      return (
                        <div key={req._id} className={`flex gap-3 py-2.5 ${i < arr.length - 1 ? 'border-b border-[#f0efec]' : ''}`}>
                          <div className="pt-1.5 flex-shrink-0">
                            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                          </div>
                          <div>
                            <div className="text-[12px] text-[#5f5e5a] leading-relaxed">{msg}</div>
                            <div className="text-[10.5px] text-[#b4b2a9] mt-0.5">{time}</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </Card>

          </div>{/* /RIGHT */}
        </div>
      </div>
    </div>
  );
});

PlotDetailsPage.displayName = 'PlotDetailsPage';