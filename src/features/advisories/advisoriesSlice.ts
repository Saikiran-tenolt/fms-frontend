import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdvisoriesState, Advisory } from '../../types';

const initialState: AdvisoriesState = {
  advisories: [],
  loading: false,
  error: null,
};

const advisoriesSlice = createSlice({
  name: 'advisories',
  initialState,
  reducers: {
    setAdvisories: (state, action: PayloadAction<Advisory[]>) => {
      state.advisories = action.payload;
    },
    addAdvisory: (state, action: PayloadAction<Advisory>) => {
      state.advisories.unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setAdvisories, addAdvisory, setLoading, setError } = advisoriesSlice.actions;
export default advisoriesSlice.reducer;
