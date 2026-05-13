// ─────────────────────────────────────────────────────────────────────────────
// NEW FILE: src/admin/pages/AdminSensorRequestsPage.tsx
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { fetchAllPendingRequests, approveSensorRequest, rejectSensorRequest } from '@/admin/features/sensorRequests/sensorRequestSlice';
import type { SensorRequest, SensorRequestStatus } from '@/admin/features/sensorRequests/sensorRequestSlice';
import { toast } from 'sonner';

/* ── status config ────────────────────────────────── */
const STATUS: Record<SensorRequestStatus, { label: string; bg: string; color: string; border: string }> = {
    PENDING: { label: 'Pending', bg: '#fffbeb', color: '#b45309', border: '#fcd34d' },
    APPROVED: { label: 'Approved', bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
    REJECTED: { label: 'Rejected', bg: '#fef2f2', color: '#b91c1c', border: '#fca5a5' },
    INSTALLED: { label: 'Installed', bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
    DEPLOYED: { label: 'Deployed', bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
    none: { label: 'None', bg: '#f5f5f3', color: '#5f5e5a', border: '#e3e3e0' },
};

const SENSOR_LABELS: Record<string, string> = {
    'Temperature Sensor': '🌡️ Temperature',
    'Soil Temperature Sensor': '🌡️ Soil Temperature',
    'Soil Moisture Sensor': '💧 Soil Moisture',
    'Humidity Sensor': '🌫️ Humidity',
    'TEMPERATURE': '🌡️ Temperature',
    'SOIL_TEMPERATURE': '🌡️ Soil Temperature',
    'SOIL_MOISTURE': '💧 Soil Moisture',
    'HUMIDITY': '🌫️ Humidity',
};

/* ── tiny components ──────────────────────────────── */
const StatusPill = ({ status }: { status: SensorRequestStatus }) => {
    const s = STATUS[status];
    return (
        <span style={{
            fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
            background: s.bg, color: s.color, border: `0.5px solid ${s.border}`,
            letterSpacing: '0.03em',
        }}>
            {s.label}
        </span>
    );
};

/* ── resolve modal ────────────────────────────────── */
interface ResolveModalProps {
    request: SensorRequest;
    onClose: () => void;
    onConfirm: (status: 'APPROVED' | 'REJECTED', note: string) => Promise<void>;
}
const ResolveModal: React.FC<ResolveModalProps> = ({ request, onClose, onConfirm }) => {
    const [action, setAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        await onConfirm(action, note);
        setLoading(false);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
            <div style={{
                background: '#fff', borderRadius: 14, padding: 24,
                width: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a18', marginBottom: 4 }}>
                    Resolve Request
                </div>
                <div style={{ fontSize: 12, color: '#888780', marginBottom: 18 }}>
                    {(() => {
                        const sName = typeof request.sensorType === 'string' ? request.sensorType : request.sensorType.name;
                        const pName = typeof request.plotId === 'string' ? request.plotId : (request.plotId as any).plotName;
                        return `${SENSOR_LABELS[sName] ?? sName} — ${pName ?? 'Unknown Plot'}`;
                    })()}
                </div>

                {/* Action toggle */}
                <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: '#5f5e5a', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Decision
                    </div>
                    <div style={{ display: 'flex', border: '0.5px solid #e3e3e0', borderRadius: 8, overflow: 'hidden' }}>
                        {(['APPROVED', 'REJECTED'] as const).map((val, i) => (
                            <button key={val} type="button" onClick={() => setAction(val)}
                                style={{
                                    flex: 1, padding: '9px 10px', fontSize: 13, fontWeight: 500,
                                    border: 'none', borderLeft: i > 0 ? '0.5px solid #e3e3e0' : 'none',
                                    fontFamily: "'DM Sans', system-ui, sans-serif", cursor: 'pointer',
                                    transition: 'background .15s, color .15s',
                                    background: action === val
                                        ? (val === 'APPROVED' ? '#3b6d11' : '#b91c1c')
                                        : '#fff',
                                    color: action === val ? '#fff' : '#888780',
                                }}
                            >
                                {val === 'APPROVED' ? '✓ Approve' : '✕ Reject'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Note */}
                <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 600, color: '#5f5e5a', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Admin Note <span style={{ fontSize: 9.5, color: '#b4b2a9', fontWeight: 400, textTransform: 'none' }}>(optional)</span>
                    </div>
                    <textarea
                        placeholder={action === 'APPROVED' ? 'e.g. Sensor assigned: SM-104' : 'e.g. Plot area too small for this sensor type'}
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={2}
                        style={{
                            width: '100%', resize: 'none', border: '0.5px solid #e3e3e0',
                            borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#1a1a18',
                            fontFamily: "'DM Sans', system-ui, sans-serif", outline: 'none',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button onClick={onClose} disabled={loading}
                        style={{
                            padding: '7px 16px', fontSize: 13, border: '0.5px solid #e3e3e0',
                            borderRadius: 7, background: '#fff', color: '#5f5e5a',
                            cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif",
                        }}
                    >
                        Cancel
                    </button>
                    <button onClick={handleConfirm} disabled={loading}
                        style={{
                            padding: '7px 18px', fontSize: 13, fontWeight: 600, border: 'none',
                            borderRadius: 7, cursor: loading ? 'not-allowed' : 'pointer',
                            background: loading ? '#9ca3af' : action === 'APPROVED' ? '#3b6d11' : '#b91c1c',
                            color: '#fff', fontFamily: "'DM Sans', system-ui, sans-serif",
                            display: 'flex', alignItems: 'center', gap: 6,
                        }}
                    >
                        {loading && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                style={{ animation: 'spin 1s linear infinite' }}>
                                <path d="M21 12a9 9 0 11-6.219-8.56" />
                            </svg>
                        )}
                        {loading ? 'Saving…' : `Confirm ${action === 'APPROVED' ? 'Approval' : 'Rejection'}`}
                    </button>
                </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

/* ── main page ────────────────────────────────────── */
export const AdminSensorRequestsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { allPending: requests, loading } = useAppSelector((s) => s.sensorRequests);

    const [filterStatus, setFilterStatus] = useState<SensorRequestStatus | 'ALL'>('ALL');
    const [resolving, setResolving] = useState<SensorRequest | null>(null);

    useEffect(() => {
        dispatch(fetchAllPendingRequests());
    }, [dispatch]);

    const filtered = filterStatus === 'ALL'
        ? requests
        : requests.filter((r) => r.status === filterStatus);

    const handleResolve = useCallback(
        async (status: 'APPROVED' | 'REJECTED') => {
            if (!resolving) return;
            try {
                if (status === 'APPROVED') {
                    await dispatch(approveSensorRequest(resolving._id)).unwrap();
                } else {
                    await dispatch(rejectSensorRequest(resolving._id)).unwrap();
                }
                const sName = typeof resolving.sensorType === 'string' ? resolving.sensorType : resolving.sensorType.name;
                toast.success(`Request ${status === 'APPROVED' ? 'approved' : 'rejected'} — ${SENSOR_LABELS[sName] ?? sName}`);
                setResolving(null);
            } catch (err: any) {
                toast.error(err || 'Failed to resolve request');
            }
        },
        [dispatch, resolving]
    );

    const pending = requests.filter((r) => r.status === 'PENDING').length;

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f3', fontFamily: "'DM Sans', system-ui, sans-serif", padding: '28px 32px' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <h1 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a18', margin: 0 }}>
                            Sensor Access Requests
                        </h1>
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>
                            {pending > 0 ? (
                                <span style={{ color: '#b45309', fontWeight: 500 }}>{pending} pending</span>
                            ) : 'All requests resolved'} · {requests.length} total
                        </p>
                    </div>
                    <button
                        onClick={() => dispatch(fetchAllPendingRequests())}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            background: '#fff', border: '0.5px solid #e2e2d9', borderRadius: 8,
                            padding: '7px 14px', fontSize: 12, fontWeight: 500, color: '#5f5e5a',
                            cursor: 'pointer',
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* Filter tabs */}
                <div style={{
                    display: 'flex', gap: 0, background: '#fff',
                    border: '0.5px solid #e2e2d9', borderRadius: 9,
                    overflow: 'hidden', marginBottom: 16, width: 'fit-content',
                }}>
                    {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'INSTALLED', 'DEPLOYED'] as const).map((s, i) => {
                        const count = s === 'ALL' ? requests.length : requests.filter(r => r.status === s).length;
                        return (
                            <button key={s} onClick={() => setFilterStatus(s)}
                                style={{
                                    padding: '7px 16px', fontSize: 12, fontWeight: 500,
                                    border: 'none', borderLeft: i > 0 ? '0.5px solid #e3e3e0' : 'none',
                                    cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif",
                                    background: filterStatus === s ? '#1a1a18' : '#fff',
                                    color: filterStatus === s ? '#fff' : '#6b7280',
                                    transition: 'background .15s, color .15s',
                                }}
                            >
                                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Table */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: 13 }}>
                        Loading requests…
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: 13 }}>
                        {filterStatus === 'PENDING' ? 'No pending requests 🎉' : 'No requests found'}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {filtered.map((req) => (
                            <div key={req._id}
                                style={{
                                    background: '#fff', border: '0.5px solid #e2e2d9', borderRadius: 10,
                                    padding: '12px 16px', display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 140px 120px auto',
                                    alignItems: 'center', gap: 12,
                                }}
                            >
                                {/* Sensor */}
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: '#111', marginBottom: 2 }}>
                                        {(() => {
                                            const sName = typeof req.sensorType === 'string' ? req.sensorType : req.sensorType.name;
                                            return SENSOR_LABELS[sName] ?? sName;
                                        })()}
                                    </div>
                                    <div style={{ fontSize: 10.5, color: '#9ca3af' }}>
                                        {new Date(req.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>

                                {/* Plot + user */}
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>
                                        {typeof req.plotId === 'string' ? req.plotId : (req.plotId as any).plotName || '—'}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                                        {req.userId?.name || '—'}
                                    </div>
                                </div>

                                {/* Status */}
                                <div><StatusPill status={req.status} /></div>

                                {/* Admin note */}
                                <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {/* Admin note removed */}
                                </div>

                                {/* Action */}
                                <div>
                                    {req.status === 'PENDING' ? (
                                        <button
                                            onClick={() => setResolving(req)}
                                            style={{
                                                fontSize: 11, fontWeight: 600, padding: '5px 12px',
                                                borderRadius: 7, border: '0.5px solid #e2e2d9',
                                                background: '#fff', color: '#374151', cursor: 'pointer',
                                                fontFamily: "'DM Sans', system-ui, sans-serif",
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            Review →
                                        </button>
                                    ) : (
                                        <span style={{ fontSize: 10.5, color: '#9ca3af' }}>
                                            {req.updatedAt
                                                ? new Date(req.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                                                : '—'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Resolve modal */}
            {resolving && (
                <ResolveModal
                    request={resolving}
                    onClose={() => setResolving(null)}
                    onConfirm={handleResolve}
                />
            )}
        </div>
    );
};