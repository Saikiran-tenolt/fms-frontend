import axios from 'axios';

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

const mapWmoToOwm = (code: number) => {
  if (code === 0) return { main: 'Clear', description: 'clear sky', icon: '01d' };
  if ([1, 2, 3].includes(code)) return { main: 'Clouds', description: 'partly cloudy', icon: '03d' };
  if ([45, 48].includes(code)) return { main: 'Fog', description: 'foggy', icon: '50d' };
  if ([51, 53, 55, 56, 57].includes(code)) return { main: 'Drizzle', description: 'light drizzle', icon: '09d' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { main: 'Rain', description: 'rain showers', icon: '10d' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { main: 'Snow', description: 'snowfall', icon: '13d' };
  if ([95, 96, 99].includes(code)) return { main: 'Thunderstorm', description: 'thunderstorms', icon: '11d' };
  return { main: 'Clouds', description: 'overcast', icon: '04d' };
};

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
  const weatherMapping = mapWmoToOwm(current.weather_code);

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
