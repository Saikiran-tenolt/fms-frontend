import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWeatherByPincode } from '../../services/weatherService';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import type { AdvisoriesState, Advisory } from '../../types';

const initialState: AdvisoriesState & { weatherData: any | null } = {
  advisories: [],
  weatherData: null,
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
    resolveAdvisory: (state, action: PayloadAction<string>) => {
      state.advisories = state.advisories.filter(a => a.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setWeatherData: (state, action: PayloadAction<any>) => {
      state.weatherData = action.payload;
    },
  },
});

export const fetchWeatherAndAdvisories = createAsyncThunk(
  'advisories/fetchWeatherAndAdvisories',
  async (pincode: string, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      const weather = await fetchWeatherByPincode(pincode);
      dispatch(setWeatherData(weather));

      // Generate a Risk Advisory if it's raining or storming
      const condition = weather.weather[0].main.toLowerCase();
      if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) {
        dispatch(addAdvisory({
          id: uuidv4(),
          plotId: 'all',
          title: 'Upcoming Rain Alert',
          description: `Current weather in your area shows ${weather.weather[0].description}.`,
          severity: 'medium',
          recommendedAction: 'Wait before watering your crops. Natural irrigation is expected.',
          timestamp: new Date().toISOString(),
        }));
      }

      dispatch(setLoading(false));
    } catch (error: any) {
      if (error.response?.status === 401) {
        dispatch(setError('OpenWeather API Key expired or invalid. Please update the key in weatherService.ts.'));
        toast.error('Weather API Key expired. Please paste a new one.', {
          description: 'Current key: c182db35...7efd',
          duration: 10000,
        });
      } else {
        dispatch(setError(error.message));
      }
      dispatch(setLoading(false));
    }
  }
);

export const { setAdvisories, addAdvisory, resolveAdvisory, setLoading, setError, setWeatherData } = advisoriesSlice.actions;
export default advisoriesSlice.reducer;
