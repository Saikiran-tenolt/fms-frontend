import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SensorRequestStatus = 'none' | 'pending' | 'active' | 'rejected';

export interface SensorRequest {
    _id: string;
    plotId: string;
    plotName?: string;
    farmerName?: string;
    sensorType: string;
    status: SensorRequestStatus;
    createdAt: string;
    updatedAt: string;
}

interface SensorRequestState {
    // keyed by plotId → array of requests for that plot
    byPlot: Record<string, SensorRequest[]>;
    // admin view — all pending requests across all plots
    allPending: SensorRequest[];
    loading: boolean;
    actionLoading: string | null; // requestId currently being actioned
    error: string | null;
}

const initialState: SensorRequestState = {
    byPlot: {},
    allPending: [],
    loading: false,
    actionLoading: null,
    error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

/** Farmer: fetch sensor requests for a specific plot */
export const fetchSensorRequests = createAsyncThunk(
    '/admin/sensorRequests/fetchByPlot',
    async (plotId: string, { rejectWithValue }) => {
        try {
            const res = await api.get(`/admin/sensor-request/${plotId}`);
            return { plotId, data: res.data.data as SensorRequest[] };
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to fetch sensor requests');
        }
    }
);

/** Farmer: submit a new sensor request */
export const submitSensorRequest = createAsyncThunk(
    'admin/sensorRequests/submit',
    async (
        payload: { plotId: string; sensorType: string },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.post('/admin/sensor-request', payload);
            return res.data.data as SensorRequest;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to submit sensor request');
        }
    }
);

/** Farmer: cancel a pending request */
export const cancelSensorRequest = createAsyncThunk(
    '/admin/sensorRequests/cancel',
    async (
        { requestId, plotId }: { requestId: string; plotId: string },
        { rejectWithValue }
    ) => {
        try {
            await api.delete(`admin/sensor-request/${requestId}`);
            return { requestId, plotId };
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to cancel request');
        }
    }
);

/** Admin: fetch all pending sensor requests */
export const fetchAllPendingRequests = createAsyncThunk(
    '/admin/sensorRequests/fetchAllPending',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/admin/sensor-requests');
            return res.data.data as SensorRequest[];
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to fetch pending requests');
        }
    }
);

/** Admin: approve a sensor request */
export const approveSensorRequest = createAsyncThunk(
    '/admin/sensorRequests/approve',
    async (requestId: string, { rejectWithValue }) => {
        try {
            const res = await api.patch(`/admin/sensor-requests/${requestId}/approve`);
            return res.data.data as SensorRequest;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to approve request');
        }
    }
);

/** Admin: reject a sensor request */
export const rejectSensorRequest = createAsyncThunk(
    '/admin/sensorRequests/reject',
    async (requestId: string, { rejectWithValue }) => {
        try {
            const res = await api.patch(`/admin/sensor-requests/${requestId}/reject`);
            return res.data.data as SensorRequest;
        } catch (err: any) {
            return rejectWithValue(err.message || 'Failed to reject request');
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const sensorRequestSlice = createSlice({
    name: 'sensorRequests',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {

        // ── fetchSensorRequests ──────────────────────────────────────────────────
        builder.addCase(fetchSensorRequests.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchSensorRequests.fulfilled, (state, action) => {
            state.loading = false;
            state.byPlot[action.payload.plotId] = action.payload.data;
        });
        builder.addCase(fetchSensorRequests.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // ── submitSensorRequest ──────────────────────────────────────────────────
        builder.addCase(submitSensorRequest.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(submitSensorRequest.fulfilled, (state, action) => {
            state.loading = false;
            const { plotId } = action.payload;
            if (!state.byPlot[plotId]) state.byPlot[plotId] = [];
            state.byPlot[plotId].push(action.payload);
        });
        builder.addCase(submitSensorRequest.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // ── cancelSensorRequest ──────────────────────────────────────────────────
        builder.addCase(cancelSensorRequest.fulfilled, (state, action) => {
            const { requestId, plotId } = action.payload;
            if (state.byPlot[plotId]) {
                state.byPlot[plotId] = state.byPlot[plotId].filter(
                    (r) => r._id !== requestId
                );
            }
        });

        // ── fetchAllPendingRequests ──────────────────────────────────────────────
        builder.addCase(fetchAllPendingRequests.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAllPendingRequests.fulfilled, (state, action) => {
            state.loading = false;
            state.allPending = action.payload;
        });
        builder.addCase(fetchAllPendingRequests.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });

        // ── approveSensorRequest ─────────────────────────────────────────────────
        builder.addCase(approveSensorRequest.pending, (state, action) => {
            state.actionLoading = action.meta.arg;
        });
        builder.addCase(approveSensorRequest.fulfilled, (state, action) => {
            state.actionLoading = null;
            // remove from pending list
            state.allPending = state.allPending.filter(
                (r) => r._id !== action.payload._id
            );
            // update byPlot if present
            const { plotId } = action.payload;
            if (plotId && state.byPlot[plotId]) {
                const idx = state.byPlot[plotId].findIndex(
                    (r) => r._id === action.payload._id
                );
                if (idx !== -1) state.byPlot[plotId][idx] = action.payload;
            }
        });
        builder.addCase(approveSensorRequest.rejected, (state, action) => {
            state.actionLoading = null;
            state.error = action.payload as string;
        });

        // ── rejectSensorRequest ──────────────────────────────────────────────────
        builder.addCase(rejectSensorRequest.pending, (state, action) => {
            state.actionLoading = action.meta.arg;
        });
        builder.addCase(rejectSensorRequest.fulfilled, (state, action) => {
            state.actionLoading = null;
            state.allPending = state.allPending.filter(
                (r) => r._id !== action.payload._id
            );
            const { plotId } = action.payload;
            if (plotId && state.byPlot[plotId]) {
                const idx = state.byPlot[plotId].findIndex(
                    (r) => r._id === action.payload._id
                );
                if (idx !== -1) state.byPlot[plotId][idx] = action.payload;
            }
        });
        builder.addCase(rejectSensorRequest.rejected, (state, action) => {
            state.actionLoading = null;
            state.error = action.payload as string;
        });
    },
});

export const { clearError } = sensorRequestSlice.actions;
export default sensorRequestSlice.reducer;