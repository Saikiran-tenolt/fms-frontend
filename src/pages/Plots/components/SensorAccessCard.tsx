import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import {
    submitSensorRequest,
    cancelSensorRequest,
} from '@/admin/features/sensorRequests/sensorRequestSlice';
import { useToastContext } from '@/components/toast';

const EMPTY_ARRAY: any[] = [];

// ── Types ─────────────────────────────────────────────────────────────────────

interface SensorDef {
    name: string;
    type: string;   // value sent to backend as sensorType
    desc: string;
}

// ── Available sensor catalogue ────────────────────────────────────────────────

const SENSOR_CATALOGUE: SensorDef[] = [
    { type: 'Temperature Sensor', name: 'Temperature Sensor', desc: 'Ambient and canopy temperature monitoring.' },
    { type: 'Soil Temperature Sensor', name: 'Soil Temperature Sensor', desc: 'Soil temperature monitoring.' },
    { type: 'Soil Moisture Sensor', name: 'Soil Moisture Sensor', desc: 'Volumetric water content in soil.' },
    { type: 'Humidity Sensor', name: 'Humidity Sensor', desc: 'Relative humidity monitoring.' },
];

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'Pending Review', cls: 'border-[#f5c97a] bg-[#fffdf9] text-[#854f0b]' },
    APPROVED: { label: 'Approved', cls: 'border-[#c0dd97] bg-[#f4fae8] text-[#3b6d11]' },
    INSTALLED: { label: 'Active · Live', cls: 'border-[#c0dd97] bg-[#f4fae8] text-[#1d9e75]' },
    DEPLOYED: { label: 'Deployed', cls: 'border-[#c0dd97] bg-[#f4fae8] text-[#1d9e75]' },
    REJECTED: { label: 'Rejected', cls: 'border-[#f5b3ae] bg-[#fff5f5] text-[#b91c1c]' },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
    plotId: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const SensorAccessCard: React.FC<Props> = ({ plotId }) => {
    const dispatch = useAppDispatch();
    const toast = useToastContext();
    const [submitting, setSubmitting] = useState<string | null>(null); // sensorType being submitted

    // Select requests for THIS plot from Redux
    const requests = useAppSelector(
        (s) => s.sensorRequests.byPlot[plotId] ?? EMPTY_ARRAY
    );
    const loading = useAppSelector((s) => s.sensorRequests.loading);
    const actionLoading = useAppSelector((s) => s.sensorRequests.actionLoading);

    // Build a quick lookup: sensorType → request
    const requestMap = React.useMemo(() => {
        const map: Record<string, typeof requests[0]> = {};
        requests.forEach(r => {
            const sName = typeof r.sensorType === 'string' ? r.sensorType : r.sensorType.name;
            map[sName] = r;
        });
        return map;
    }, [requests]);

    const handleRequest = async (sensorType: string) => {
        setSubmitting(sensorType);
        const result = await dispatch(submitSensorRequest({ plotId, sensorType }));
        if (submitSensorRequest.fulfilled.match(result)) {
            toast.success('Request sent!', 'Admin will review your request.');
        } else {
            toast.error(String(result.payload ?? 'Failed to send request'));
        }
        setSubmitting(null);
    };

    const handleCancel = async (requestId: string) => {
        const result = await dispatch(cancelSensorRequest({ requestId, plotId }));
        if (cancelSensorRequest.fulfilled.match(result)) {
            toast.success('Request cancelled');
        } else {
            toast.error('Failed to cancel request');
        }
    };

    return (
        <div
            style={{ background: '#fff', border: '1px solid #e3e3e0', borderRadius: 12, padding: 16 }}
        >
            {/* Header */}
            <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18' }}>
                    Sensor Access Management
                </div>
                <div style={{ fontSize: 11, color: '#b4b2a9', marginTop: 2, marginBottom: 12 }}>
                    Request sensors from the Agricultural Authority.
                    Approved sensors stream live data to your dashboard.
                </div>
            </div>

            {/* Loading skeleton */}
            {loading && requests.length === 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {SENSOR_CATALOGUE.map(s => (
                        <div key={s.type}
                            style={{
                                border: '1px solid #e3e3e0', borderRadius: 10, padding: 14, height: 88,
                                background: 'linear-gradient(90deg,#f5f5f3 25%,#ececea 50%,#f5f5f3 75%)',
                                animation: 'shimmer 1.2s infinite'
                            }} />
                    ))}
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10 }}>
                    {SENSOR_CATALOGUE.map(sensor => {
                        const req = requestMap[sensor.type];
                        const status = req?.status?.toUpperCase();
                        const badge = status ? STATUS_BADGE[status] : null;
                        const isActioning = actionLoading === req?._id;
                        const isSending = submitting === sensor.type;

                        const cardBorder =
                            status === 'PENDING' ? '#f5c97a' :
                                status === 'APPROVED' || status === 'INSTALLED' || status === 'DEPLOYED' ? '#c0dd97' :
                                    status === 'REJECTED' ? '#f5b3ae' :
                                        '#e3e3e0';

                        const cardBg =
                            status === 'PENDING' ? '#fffdf9' :
                                status === 'APPROVED' || status === 'INSTALLED' || status === 'DEPLOYED' ? '#f9fdf4' :
                                    status === 'REJECTED' ? '#fff8f8' :
                                        '#fff';

                        return (
                            <div key={sensor.type}
                                style={{
                                    border: `1px solid ${cardBorder}`, borderRadius: 10, padding: 14,
                                    background: cardBg, transition: 'border-color .2s'
                                }}>

                                <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18', marginBottom: 4 }}>
                                    {sensor.name}
                                </div>
                                <div style={{ fontSize: 11.5, color: '#888780', marginBottom: 12, lineHeight: 1.5 }}>
                                    {sensor.desc}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                    {/* Status badge */}
                                    {badge ? (
                                        <span style={{
                                            fontSize: 10.5, fontWeight: 600, padding: '2px 8px',
                                            borderRadius: 999, border: `1px solid ${cardBorder}`
                                        }}
                                            className={badge.cls}>
                                            {badge.label}
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: 11, color: '#b4b2a9' }}>Not Requested</span>
                                    )}

                                    {/* Action button */}
                                    {(!status || status === 'REJECTED') && (
                                        <button
                                            disabled={isSending}
                                            onClick={() => handleRequest(sensor.type)}
                                            style={{
                                                fontSize: 11, background: '#1a1a18', color: '#fff',
                                                borderRadius: 8, padding: '4px 10px', border: 'none', cursor: 'pointer',
                                                opacity: isSending ? 0.6 : 1, transition: 'opacity .2s'
                                            }}>
                                            {isSending ? 'Sending…' : status === 'REJECTED' ? 'Re-request' : 'Send Request'}
                                        </button>
                                    )}

                                    {status === 'PENDING' && (
                                        <button
                                            disabled={isActioning}
                                            onClick={() => handleCancel(req._id)}
                                            style={{
                                                fontSize: 11, background: 'transparent', color: '#854f0b',
                                                borderRadius: 8, padding: '4px 10px',
                                                border: '1px solid #f5c97a', cursor: 'pointer',
                                                opacity: isActioning ? 0.6 : 1
                                            }}>
                                            {isActioning ? '…' : 'Cancel'}
                                        </button>
                                    )}

                                    {(status === 'APPROVED' || status === 'INSTALLED' || status === 'DEPLOYED') && (
                                        <span style={{ fontSize: 10.5, color: '#1d9e75', fontWeight: 600 }}>
                                            ✓ Live Feed
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};