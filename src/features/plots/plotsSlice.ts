import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { PlotsState, Plot } from '../../types';
import plotService, { CreatePlotPayload, UpdatePlotPayload } from '../../services/plotService';

// Extended state type to include hasFetched without breaking existing PlotsState if imported strictly
interface ExtendedPlotsState extends PlotsState {
  hasFetched: boolean;
}

const initialState: ExtendedPlotsState = {
  plots: [],
  selectedPlotId: null,
  loading: false,
  error: null,
  hasFetched: false,
};

// --- Async Thunks ---

export const fetchAllPlots = createAsyncThunk(
  'plots/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await plotService.getPlots();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue('Failed to fetch plots');
    } catch (error: any) {
      console.warn("API Error:", error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch plots');
    }
  }
);

export const fetchOnePlot = createAsyncThunk(
  'plots/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await plotService.getPlotById(id);
      if (response.success) return response.data;
      return rejectWithValue('Failed to fetch plot details');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching plot details');
    }
  }
);

export const createNewPlot = createAsyncThunk(
  'plots/create',
  async (data: CreatePlotPayload, { rejectWithValue }) => {
    try {
      const response = await plotService.createPlot(data);
      if (response.success) return response.data;
      return rejectWithValue(response.message || 'Failed to create plot');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error creating plot');
    }
  }
);

export const updateExistingPlot = createAsyncThunk(
  'plots/update',
  async ({ id, data }: { id: string; data: UpdatePlotPayload }, { rejectWithValue }) => {
    try {
      const response = await plotService.updatePlot(id, data);
      if (response.success) return response.data;
      return rejectWithValue(response.message || 'Failed to update plot');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error updating plot');
    }
  }
);

export const removePlot = createAsyncThunk(
  'plots/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await plotService.deletePlot(id);
      if (response.success) return id;
      return rejectWithValue(response.message || 'Failed to delete plot');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting plot');
    }
  }
);

const plotsSlice = createSlice({
  name: 'plots',
  initialState,
  reducers: {
    selectPlot: (state, action: PayloadAction<string | null>) => {
      state.selectedPlotId = action.payload;
    },
    setPlots: (state, action: PayloadAction<Plot[]>) => {
      state.plots = action.payload;
      state.hasFetched = true;
      if (state.selectedPlotId === null && action.payload.length > 0) {
        state.selectedPlotId = action.payload[0]._id;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // --- Fetch All ---
    builder.addCase(fetchAllPlots.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllPlots.fulfilled, (state, action) => {
      state.loading = false;
      state.hasFetched = true;
      state.plots = action.payload;
      if (state.selectedPlotId === null && action.payload.length > 0) {
        state.selectedPlotId = action.payload[0]._id;
      }
    });
    builder.addCase(fetchAllPlots.rejected, (state, action) => {
      state.loading = false;
      state.hasFetched = true;
      state.error = action.payload as string;
    });

    // --- Fetch One ---
    builder.addCase(fetchOnePlot.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOnePlot.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.plots.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.plots[index] = action.payload;
      } else {
        state.plots.push(action.payload);
      }
      state.selectedPlotId = action.payload._id;
    });
    builder.addCase(fetchOnePlot.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // --- Create ---
    builder.addCase(createNewPlot.fulfilled, (state, action) => {
      state.plots.unshift(action.payload); // Add to beginning (sorted by latest)
      state.selectedPlotId = action.payload._id;
    });

    // --- Update ---
    builder.addCase(updateExistingPlot.fulfilled, (state, action) => {
      const index = state.plots.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.plots[index] = action.payload;
      }
    });

    // --- Delete ---
    builder.addCase(removePlot.fulfilled, (state, action) => {
      state.plots = state.plots.filter(p => p._id !== action.payload);
      if (state.selectedPlotId === action.payload) {
        state.selectedPlotId = state.plots.length > 0 ? state.plots[0]._id : null;
      }
    });
  },
});

export const {
  selectPlot,
  setPlots,
  clearError,
} = plotsSlice.actions;

export default plotsSlice.reducer;
