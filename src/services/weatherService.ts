import axios from 'axios';

const API_KEY = 'c182db351fd91b465130fdbaf43d7efd';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

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
  };
}

export const fetchCurrentWeather = async (lat: number, lon: number): Promise<WeatherResponse> => {
  const response = await axios.get(`${BASE_URL}/weather`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric',
    },
  });
  return response.data;
};

export const fetchForecast = async (lat: number, lon: number): Promise<ForecastResponse> => {
  const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
    params: {
      latitude: lat,
      longitude: lon,
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      timezone: 'auto'
    }
  });
  return response.data;
};

export const fetchWeatherByPincode = async (pincode: string): Promise<WeatherResponse> => {
  const response = await axios.get(`${BASE_URL}/weather`, {
    params: {
      zip: `${pincode},IN`,
      appid: API_KEY,
      units: 'metric',
    },
  });
  return response.data;
};

export const fetchForecastByPincode = async (pincode: string): Promise<ForecastResponse> => {
  const weather = await fetchWeatherByPincode(pincode);
  if (weather.coord) {
    return fetchForecast(weather.coord.lat, weather.coord.lon);
  }
  throw new Error('Could not determine coordinates for pincode');
};
