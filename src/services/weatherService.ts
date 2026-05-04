import axios from 'axios';
import { mapWeatherCode } from '../shared/utils/weather';

export interface WeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  main: {
    temp: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
}

export interface ForecastResponse {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    relative_humidity_2m_max: number[];
  };
}



export const fetchCurrentWeather = async (lat: number, lon: number): Promise<WeatherResponse> => {
  const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
    params: {
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure',
      timezone: 'auto'
    }
  });

  const { current } = response.data;
  const weatherMapping = mapWeatherCode(current.weather_code);

  return {
    coord: { lat, lon },
    main: {
      temp: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      pressure: current.surface_pressure,
    },
    weather: [weatherMapping],
    wind: {
      speed: current.wind_speed_10m,
    },
    name: 'Current Location',
  };
};

export const fetchForecast = async (lat: number, lon: number): Promise<ForecastResponse> => {
  const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
    params: {
      latitude: lat,
      longitude: lon,
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_max',
      timezone: 'auto'
    }
  });
  return response.data;
};

export const fetchWeatherByPincode = async (pincode: string): Promise<WeatherResponse> => {
  // Use Open-Meteo Geocoding API to get lat/lon from pincode
  const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search`, {
    params: {
      name: pincode,
      count: 1,
      language: 'en',
      format: 'json'
    }
  });

  if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
    throw new Error('Location not found');
  }

  const { latitude, longitude, name } = geoResponse.data.results[0];
  const weather = await fetchCurrentWeather(latitude, longitude);
  return { ...weather, name };
};

export const fetchForecastByPincode = async (pincode: string): Promise<ForecastResponse> => {
  const geoResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search`, {
    params: {
      name: pincode,
      count: 1,
      language: 'en',
      format: 'json'
    }
  });

  if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
    throw new Error('Location not found');
  }

  const { latitude, longitude } = geoResponse.data.results[0];
  return fetchForecast(latitude, longitude);
};
