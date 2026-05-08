import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SensorsState, SensorData, SensorTrendData } from '@/types';



const initialState: SensorsState = {
  sensorData: {},
  trendData: {},
  lastUpdated: null,
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
    // Combined action: mutates sensorData + trendData in ONE Immer pass.
    // Replaces two separate dispatches (setSensorData + setTrendData) with one,
    // halving the Redux updates — and therefore the re-renders — per data load.
    setSensorReadings: (state, action: PayloadAction<{
      plotId: string;
      sensorData: SensorData;
      trendSensor: string;
      trendData: SensorTrendData[];
    }>) => {
      state.sensorData[action.payload.plotId] = action.payload.sensorData;
      const key = `${action.payload.plotId}_${action.payload.trendSensor}`;
      state.trendData[key] = action.payload.trendData;
      state.lastUpdated = new Date().toISOString();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setSensorData, setTrendData, setSensorReadings, setLoading, setError } = sensorsSlice.actions;
export default sensorsSlice.reducer;

