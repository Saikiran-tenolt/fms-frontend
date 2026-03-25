import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SensorsState, SensorData, SensorTrendData } from '../../types';

const initialState: SensorsState = {
  sensorData: {},
  trendData: {},
  loading: false,
  error: null,
};

const sensorsSlice = createSlice({
  name: 'sensors',
  initialState,
  reducers: {
    setSensorData: (state, action: PayloadAction<{ plotId: string; data: SensorData }>) => {
      state.sensorData[action.payload.plotId] = action.payload.data;
    },
    setTrendData: (state, action: PayloadAction<{ plotId: string; sensor: string; data: SensorTrendData[] }>) => {
      const key = `${action.payload.plotId}_${action.payload.sensor}`;
      state.trendData[key] = action.payload.data;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setSensorData, setTrendData, setLoading, setError } = sensorsSlice.actions;
export default sensorsSlice.reducer;
