import axios from 'axios';

const API_KEY = 'c182db351fd91b465130fdbaf43d7efd';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherResponse {
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
  list: Array<{
    dt: number;
    main: {
      temp: number;
    };
    weather: Array<{
      main: string;
      description: string;
    }>;
    dt_txt: string;
  }>;
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
  const response = await axios.get(`${BASE_URL}/forecast`, {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units: 'metric',
    },
  });
  return response.data;
};

export const fetchWeatherByPincode = async (pincode: string): Promise<WeatherResponse> => {
  // OpenWeather supports zip/pincode search: zip={zip code},{country code}
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
  const response = await axios.get(`${BASE_URL}/forecast`, {
    params: {
      zip: `${pincode},IN`,
      appid: API_KEY,
      units: 'metric',
    },
  });
  return response.data;
};
