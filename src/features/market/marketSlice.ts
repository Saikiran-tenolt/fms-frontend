import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { MarketState, MarketPrice, PriceTrendData } from '../../types';

const initialState: MarketState = {
  prices: [],
  trendData: {},
  loading: false,
  error: null,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    setPrices: (state, action: PayloadAction<MarketPrice[]>) => {
      state.prices = action.payload;
    },
    setTrendData: (state, action: PayloadAction<{ cropId: string; data: PriceTrendData[] }>) => {
      state.trendData[action.payload.cropId] = action.payload.data;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setPrices, setTrendData, setLoading, setError } = marketSlice.actions;
export default marketSlice.reducer;
