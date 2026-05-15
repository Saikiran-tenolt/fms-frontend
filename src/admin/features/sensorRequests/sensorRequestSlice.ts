import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SensorRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'INSTALLED' | 'DEPLOYED' | 'none';

export interface SensorRequest {
    _id: string;
    userId?: { _id: string; name: string; phone: string };
    plotId: string | { _id: string; plotName: string; cropType: string };
    sensorType: string | { _id: string; name: string };
    quantity?: number;
    placement?: string;
    status: SensorRequestStatus;
    adminComment?: string;
    reviewedAt?: string;
    reviewedBy?: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

interface SensorRequestState {
    byPlot: Record<string, SensorRequest[]>;
    allPending: SensorRequest[];
    loading: boolean;
    actionLoading: string | null;
    error: string | null;
}

const initialState: SensorRequestState = {
    byPlot: {},
    allPending: [],
    loading: false,
    actionLoading: null,
    error: null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const toArray = (d: any): SensorRequest[] => {
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.data?.requests)) return d.data.requests;
    if (Array.isArray(d?.data)) return d.data;
    if (Array.isArray(d?.requests)) return d.requests;
    return [];
};

// ── Thunks ────────────────────────────────────────────────────────────────────

/** Farmer: fetch sensor requests for a specific plot */
export const fetchSensorRequests = createAsyncThunk(
    '/admin/sensorRequests/fetchByPlot',
    async (plotId: string, { rejectWithValue }) => {
        try {
            // GET /plot/:plotId/sensor-requests
            const res = await api.get(`/plot/${plotId}/sensor-requests`);
            return { plotId, data: toArray(res.data) };
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to fetch sensor requests');
        }
    }
);

/** Farmer: submit a new sensor request */
export const submitSensorRequest = createAsyncThunk(
    '/admin/sensorRequests/submit',
    async (
        payload: { plotId: string; sensorType: string },
        { rejectWithValue }
    ) => {
        try {
            // POST /sensor-requests (farmer endpoint — NOT /admin/sensor-requests)
            const res = await api.post('/sensor-requests', {
                plotId: payload.plotId,
                sensorTypes: [payload.sensorType]
            });
            const data = res.data.data ?? res.data;
            // The backend might return an array if we send multiple types, 
            // but here we send one, so handle accordingly
            return (Array.isArray(data) ? data[0] : data) as SensorRequest;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to submit sensor request');
        }
    }
);

/** Farmer: cancel a pending request */
export const cancelSensorRequest = createAsyncThunk(
    'sensorRequests/cancel',
    async (
        { requestId, plotId }: { requestId: string; plotId: string },
        { rejectWithValue }
    ) => {
        try {
            // DELETE /sensor-requests/:id (farmer cancels their own request)
            await api.delete(`/sensor-requests/${requestId}`);
            return { requestId, plotId };
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to cancel request');
        }
    }
);

/** Admin: fetch ALL sensor requests */
export const fetchAllPendingRequests = createAsyncThunk(
    'sensorRequests/fetchAllPending',
    async (_, { rejectWithValue }) => {
        try {
            // GET /sensor-requests (matches USER spec for Admin)
            const res = await api.get('/admin/sensor-requests');
            return toArray(res.data);
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to fetch requests');
        }
    }
);

/** Admin: approve a sensor request (optionally with a note) */
export const approveSensorRequest = createAsyncThunk(
    'sensorRequests/approve',
    async ({ requestId, adminNote }: { requestId: string; adminNote?: string }, { rejectWithValue }) => {
        try {
            const res = await api.patch(`/admin/sensor-requests/${requestId}`, {
                status: 'APPROVED',
                ...(adminNote ? { adminNote } : {}),
            });
            return (res.data.data ?? res.data) as SensorRequest;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to approve request');
        }
    }
);

/** Admin: reject a sensor request (optionally with a note) */
export const rejectSensorRequest = createAsyncThunk(
    'sensorRequests/reject',
    async ({ requestId, adminNote }: { requestId: string; adminNote?: string }, { rejectWithValue }) => {
        try {
            const res = await api.patch(`/admin/sensor-requests/${requestId}`, {
                status: 'REJECTED',
                ...(adminNote ? { adminNote } : {}),
            });
            return (res.data.data ?? res.data) as SensorRequest;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to reject request');
        }
    }
);

// ── Helpers (private) ─────────────────────────────────────────────────────────

/**
 * Shared update logic for approve & reject fulfilled cases.
 * Updates the request in both `allPending` and the `byPlot` cache.
 */
const updateRequestInState = (state: SensorRequestState, payload: SensorRequest) => {
    const idx = state.allPending.findIndex(r => r._id === payload._id);
    if (idx !== -1) state.allPending[idx] = payload;

    const plotIdStr = typeof payload.plotId === 'string' ? payload.plotId : payload.plotId?._id;
    if (plotIdStr && state.byPlot[plotIdStr]) {
        const pidx = state.byPlot[plotIdStr].findIndex(r => r._id === payload._id);
        if (pidx !== -1) state.byPlot[plotIdStr][pidx] = payload;
    }
};

// ── Slice ─────────────────────────────────────────────────────────────────────

const sensorRequestSlice = createSlice({
    name: 'sensorRequests',
    initialState,
    reducers: {
        clearError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {

        // fetchSensorRequests
        builder.addCase(fetchSensorRequests.pending, (state) => {
            state.loading = true; state.error = null;
        });
        builder.addCase(fetchSensorRequests.fulfilled, (state, action) => {
            state.loading = false;
            state.byPlot[action.payload.plotId] = action.payload.data;
        });
        builder.addCase(fetchSensorRequests.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // submitSensorRequest
        builder.addCase(submitSensorRequest.pending, (state) => {
            state.loading = true; state.error = null;
        });
        builder.addCase(submitSensorRequest.fulfilled, (state, action) => {
            state.loading = false;
            const { plotId } = action.payload;
            const plotIdStr = typeof plotId === 'string' ? plotId : plotId._id;
            if (plotIdStr) {
                if (!state.byPlot[plotIdStr]) state.byPlot[plotIdStr] = [];
                state.byPlot[plotIdStr].push(action.payload);
            }
        });
        builder.addCase(submitSensorRequest.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // cancelSensorRequest
        builder.addCase(cancelSensorRequest.fulfilled, (state, action) => {
            const { requestId, plotId } = action.payload;
            if (state.byPlot[plotId]) {
                state.byPlot[plotId] = state.byPlot[plotId].filter(r => r._id !== requestId);
            }
        });

        // fetchAllPendingRequests
        builder.addCase(fetchAllPendingRequests.pending, (state) => {
            state.loading = true; state.error = null;
        });
        builder.addCase(fetchAllPendingRequests.fulfilled, (state, action) => {
            state.loading = false;
            state.allPending = action.payload;
        });
        builder.addCase(fetchAllPendingRequests.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // approveSensorRequest
        builder.addCase(approveSensorRequest.pending, (state, action) => {
            state.actionLoading = action.meta.arg.requestId;
        });
        builder.addCase(approveSensorRequest.fulfilled, (state, action) => {
            state.actionLoading = null;
            updateRequestInState(state, action.payload);
        });
        builder.addCase(approveSensorRequest.rejected, (state, action) => {
            state.actionLoading = null;
            state.error = action.payload as string;
        });

        // rejectSensorRequest
        builder.addCase(rejectSensorRequest.pending, (state, action) => {
            state.actionLoading = action.meta.arg.requestId;
        });
        builder.addCase(rejectSensorRequest.fulfilled, (state, action) => {
            state.actionLoading = null;
            updateRequestInState(state, action.payload);
        });
        builder.addCase(rejectSensorRequest.rejected, (state, action) => {
            state.actionLoading = null;
            state.error = action.payload as string;
        });
    },
});

export const { clearError } = sensorRequestSlice.actions;
export default sensorRequestSlice.reducer;