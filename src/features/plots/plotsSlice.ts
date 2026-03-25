import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { PlotsState, Plot } from '../../types';

const initialState: PlotsState = {
  plots: [],
  selectedPlotId: null,
  loading: false,
  error: null,
};

const plotsSlice = createSlice({
  name: 'plots',
  initialState,
  reducers: {
    setPlots: (state, action: PayloadAction<Plot[]>) => {
      state.plots = action.payload;
      // Auto-select first plot if none selected
      if (state.selectedPlotId === null && action.payload.length > 0) {
        state.selectedPlotId = action.payload[0].plotId;
      }
    },
    addPlot: (state, action: PayloadAction<Plot>) => {
      state.plots.push(action.payload);
      // Select the first plot if this is the only plot
      if (state.plots.length === 1) {
        state.selectedPlotId = action.payload.plotId;
      }
    },
    updatePlot: (state, action: PayloadAction<Plot>) => {
      const index = state.plots.findIndex(p => p.plotId === action.payload.plotId);
      if (index !== -1) {
        state.plots[index] = action.payload;
      }
    },
    deletePlot: (state, action: PayloadAction<string>) => {
      state.plots = state.plots.filter(p => p.plotId !== action.payload);
      // If deleted plot was selected, select another
      if (state.selectedPlotId === action.payload) {
        state.selectedPlotId = state.plots.length > 0 ? state.plots[0].plotId : null;
      }
    },
    selectPlot: (state, action: PayloadAction<string>) => {
      state.selectedPlotId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPlots,
  addPlot,
  updatePlot,
  deletePlot,
  selectPlot,
  setLoading,
  setError,
} = plotsSlice.actions;

export default plotsSlice.reducer;
