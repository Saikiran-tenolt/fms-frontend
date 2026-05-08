import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchWeatherByPincode,
  fetchCurrentWeather,
  fetchForecast,
  fetchForecastByPincode,
  WeatherResponse,
  ForecastResponse,
} from '@/services/weatherService';
import { v4 as uuidv4 } from 'uuid';
import type { AdvisoriesState, Advisory } from '@/types';


interface ExtendedAdvisoriesState extends AdvisoriesState {
  weatherData: WeatherResponse | null;
  forecastData: ForecastResponse | null;
}

const initialState: ExtendedAdvisoriesState = {
  advisories: [],
  weatherData: null,
  forecastData: null,
  loading: false,
  error: null,
};

// ── FIX: Return all data from the thunk instead of dispatching inside it ──────
// Previously this thunk dispatched setLoading, setWeatherData, addAdvisory,
// setForecastData, setLoading(false) — each dispatch = one Redux state update =
// one re-render of every connected component. That alone caused 5+ re-renders
// per load cycle. Now we collect everything and return it as one payload.
// RTK dispatches a single `fulfilled` action → one Immer mutation → one render.
export const fetchWeatherAndAdvisories = createAsyncThunk(
  'advisories/fetchWeatherAndAdvisories',
  async (params: { pincode?: string; lat?: number; lon?: number }) => {
    let weather: WeatherResponse | null = null;
    let forecast: ForecastResponse | null = null;
    let newAdvisory: Advisory | null = null;

    try {
      if (params.lat !== undefined && params.lon !== undefined) {
        weather = await fetchCurrentWeather(params.lat, params.lon);
      } else if (params.pincode) {
        weather = await fetchWeatherByPincode(params.pincode);
      }

      if (weather) {
        const condition = weather.weather[0].main.toLowerCase();
        if (
          condition.includes('rain') ||
          condition.includes('drizzle') ||
          condition.includes('thunderstorm')
        ) {
          newAdvisory = {
            id: uuidv4(),
            plotId: 'all',
            title: 'Upcoming Rain Alert',
            description: `Current weather shows ${weather.weather[0].description}.`,
            severity: 'medium',
            recommendedAction: 'Wait before watering your crops. Natural irrigation is expected.',
            timestamp: new Date().toISOString(),
          };
        }
      }
    } catch (error: any) {
      console.error('Weather fetch error:', error.message);
    }

    try {
      if (params.lat !== undefined && params.lon !== undefined) {
        forecast = await fetchForecast(params.lat, params.lon);
      } else if (params.pincode) {
        forecast = await fetchForecastByPincode(params.pincode);
      }
    } catch (error: any) {
      console.error('Forecast fetch error:', error);
    }

    // Single return → single fulfilled action → single render
    return { weather, forecast, newAdvisory };
  }
);

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
      state.advisories = state.advisories.filter((a) => a.id !== action.payload);
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
    setForecastData: (state, action: PayloadAction<any>) => {
      state.forecastData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWeatherAndAdvisories.pending, (state) => {
      // 1 render: loading starts
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchWeatherAndAdvisories.fulfilled, (state, action) => {
      // 1 render: all state updated atomically by Immer in a single action
      state.loading = false;
      if (action.payload.weather) state.weatherData = action.payload.weather;
      if (action.payload.forecast) state.forecastData = action.payload.forecast;
      if (action.payload.newAdvisory) state.advisories.unshift(action.payload.newAdvisory);
    });
    builder.addCase(fetchWeatherAndAdvisories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? 'Failed to fetch weather';
    });
  },
});

export const {
  setAdvisories,
  addAdvisory,
  resolveAdvisory,
  setLoading,
  setError,
  setWeatherData,
  setForecastData,
} = advisoriesSlice.actions;

export default advisoriesSlice.reducer;
