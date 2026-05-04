import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWeatherByPincode, fetchCurrentWeather, fetchForecast, fetchForecastByPincode, WeatherResponse, ForecastResponse } from '../../services/weatherService';
import { v4 as uuidv4 } from 'uuid';
import type { AdvisoriesState, Advisory } from '../../types';

const initialState: AdvisoriesState & { weatherData: WeatherResponse | null; forecastData: ForecastResponse | null } = {
  advisories: [],
  weatherData: null,
  forecastData: null,
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
    setForecastData: (state, action: PayloadAction<any>) => {
      state.forecastData = action.payload;
    },
  },
});

export const fetchWeatherAndAdvisories = createAsyncThunk(
  'advisories/fetchWeatherAndAdvisories',
  async (params: { pincode?: string; lat?: number; lon?: number }, { dispatch }) => {
    dispatch(setLoading(true));
    
    let weather;
    try {
      if (params.lat !== undefined && params.lon !== undefined) {
        weather = await fetchCurrentWeather(params.lat, params.lon);
      } else if (params.pincode) {
        weather = await fetchWeatherByPincode(params.pincode);
      } else {
        throw new Error('No location parameters provided');
      }
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
    } catch (error: any) {
      dispatch(setError(error.message));
    }

    try {
      let forecast;
      if (params.lat !== undefined && params.lon !== undefined) {
        forecast = await fetchForecast(params.lat, params.lon);
      } else if (params.pincode) {
        forecast = await fetchForecastByPincode(params.pincode);
      }
      if (forecast) {
        dispatch(setForecastData(forecast));
      }
    } catch (error: any) {
      console.error('Forecast fetch error:', error);
    }

    dispatch(setLoading(false));
  }
);

export const { setAdvisories, addAdvisory, resolveAdvisory, setLoading, setError, setWeatherData, setForecastData } = advisoriesSlice.actions;
export default advisoriesSlice.reducer;
