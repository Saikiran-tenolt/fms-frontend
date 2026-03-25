import type {
  User,
  Plot,
  SensorData,
  SensorTrendData,
  WeatherData,
  Advisory,
  Alert,
  Notification,
  MarketPrice,
  PriceTrendData,
  ChatMessage,
} from '../types';

// Mock User Data
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    email: 'rajesh@farmer.com',
    role: 'FARMER',
  },
];

// Mock Plot Data
export const mockPlots: Plot[] = [
  {
    plotId: '1',
    plotName: 'North Field',
    cropType: 'Wheat',
    soilType: 'Loamy',
    environmentType: 'OPEN_FIELD',
    location: { latitude: 28.6139, longitude: 77.2090 },
    createdAt: new Date().toISOString(),
  },
  {
    plotId: '2',
    plotName: 'South Greenhouse',
    cropType: 'Tomato',
    soilType: 'Sandy Loam',
    environmentType: 'INDOOR',
    location: { latitude: 28.6129, longitude: 77.2080 },
    createdAt: new Date().toISOString(),
  },
];

// Mock Sensor Data Generator
export const generateMockSensorData = (plotId: string, environmentType: 'OPEN_FIELD' | 'INDOOR'): SensorData => {
  const baseData: SensorData = {
    plotId,
    soilMoisture: {
      value: Math.floor(Math.random() * 40) + 30,
      unit: '%',
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    temperature: {
      value: Math.floor(Math.random() * 15) + 20,
      unit: '°C',
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    humidity: {
      value: Math.floor(Math.random() * 30) + 50,
      unit: '%',
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    soilTemperature: {
      value: Math.floor(Math.random() * 10) + 18,
      unit: '°C',
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  };

  // Add environment-specific sensors
  if (environmentType === 'INDOOR') {
    baseData.co2 = {
      value: Math.floor(Math.random() * 200) + 400,
      unit: 'ppm',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
    baseData.light = {
      value: Math.floor(Math.random() * 20000) + 10000,
      unit: 'lux',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  } else {
    baseData.rainfall = {
      value: Math.floor(Math.random() * 10),
      unit: 'mm',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  // Randomly set some sensors to warning or critical
  if (baseData.soilMoisture && baseData.soilMoisture.value < 35) {
    baseData.soilMoisture.status = 'warning';
  }
  if (baseData.soilMoisture && baseData.soilMoisture.value < 30) {
    baseData.soilMoisture.status = 'critical';
  }
  if (baseData.temperature && baseData.temperature.value > 32) {
    baseData.temperature.status = 'warning';
  }

  return baseData;
};

// Mock Trend Data Generator
export const generateMockTrendData = (): SensorTrendData[] => {
  return Array.from({ length: 7 }, (_, i) => ({
    date: `Day ${i + 1}`,
    value: Math.floor(Math.random() * 20) + 30,
  }));
};

// Mock Weather Data
export const generateMockWeather = (plotId: string): WeatherData => {
  const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'];
  const icons = ['☀️', '⛅', '☁️', '🌧️'];
  const randomIndex = Math.floor(Math.random() * conditions.length);

  return {
    plotId,
    temperature: Math.floor(Math.random() * 15) + 20,
    condition: conditions[randomIndex],
    humidity: Math.floor(Math.random() * 30) + 50,
    windSpeed: Math.floor(Math.random() * 20) + 5,
    icon: icons[randomIndex],
    timestamp: new Date().toISOString(),
  };
};

// Mock Advisories
export const mockAdvisories: Advisory[] = [
  {
    id: '1',
    plotId: '1',
    title: 'Irrigation Recommended',
    description: 'Soil moisture levels are below optimal range for wheat cultivation.',
    severity: 'medium',
    recommendedAction: 'Irrigate the field tomorrow morning between 6-8 AM. Apply 25mm water.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    plotId: '2',
    title: 'Temperature Alert',
    description: 'Greenhouse temperature is approaching upper threshold.',
    severity: 'high',
    recommendedAction: 'Increase ventilation and check cooling system operation.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    plotId: '1',
    title: 'Pest Prevention',
    description: 'Weather conditions favorable for pest activity in the coming days.',
    severity: 'low',
    recommendedAction: 'Inspect crops regularly and consider preventive spray if needed.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: '1',
    plotId: '1',
    plotName: 'North Field',
    title: 'Low Soil Moisture',
    message: 'Soil moisture has dropped to 28%',
    severity: 'high',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '2',
    plotId: '2',
    plotName: 'South Greenhouse',
    title: 'High Temperature',
    message: 'Temperature reached 34°C',
    severity: 'medium',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Advisory Available',
    message: 'Irrigation recommended for North Field',
    priority: 'high',
    isRead: false,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    title: 'Sensor Update',
    message: 'All sensors reporting normally',
    priority: 'low',
    isRead: false,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    title: 'Market Update',
    message: 'Wheat prices increased by 5%',
    priority: 'medium',
    isRead: true,
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Mock Market Prices
export const mockMarketPrices: MarketPrice[] = [
  {
    id: '1',
    cropName: 'Wheat',
    price: 2450,
    unit: '₹/quintal',
    change: 5.2,
    trend: 'up',
    mandiName: 'Azadpur Mandi',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    cropName: 'Rice',
    price: 3100,
    unit: '₹/quintal',
    change: -2.1,
    trend: 'down',
    mandiName: 'Azadpur Mandi',
    timestamp: new Date().toISOString(),
  },
  {
    id: '3',
    cropName: 'Tomato',
    price: 1800,
    unit: '₹/quintal',
    change: 0.5,
    trend: 'stable',
    mandiName: 'Azadpur Mandi',
    timestamp: new Date().toISOString(),
  },
  {
    id: '4',
    cropName: 'Onion',
    price: 2200,
    unit: '₹/quintal',
    change: 8.3,
    trend: 'up',
    mandiName: 'Azadpur Mandi',
    timestamp: new Date().toISOString(),
  },
];

// Mock Price Trend Data
export const generateMockPriceTrend = (): PriceTrendData[] => {
  return Array.from({ length: 7 }, (_, i) => ({
    date: `Day ${i + 1}`,
    price: Math.floor(Math.random() * 500) + 2000,
  }));
};

// Mock AI Responses
export const mockAIResponses: Record<string, string> = {
  default: "Based on your plot data, I can help you with irrigation scheduling, pest management, and crop health monitoring. What specific aspect would you like to discuss?",
  'soil moisture': "Your soil moisture is currently at {value}%. For wheat cultivation, the optimal range is 40-60%. I recommend irrigating within the next 24 hours to prevent crop stress.",
  'irrigation': "Based on current soil moisture levels and weather forecast, I recommend irrigating tomorrow morning between 6-8 AM. Apply approximately 25mm of water. This will bring soil moisture to optimal levels.",
  'advisory': "Today's advisory suggests irrigation for your North Field. The soil moisture has been declining over the past 3 days. Early morning irrigation is most efficient, reducing water loss to evaporation.",
  'temperature': "The current temperature is {value}°C. This is within normal range for this season. However, if temperatures exceed 35°C, consider providing shade or increasing irrigation frequency.",
  'fertilizer': "For wheat at current growth stage, consider applying NPK fertilizer in ratio 120:60:40 kg/ha. Apply nitrogen in split doses for better efficiency.",
  'pest': "Regular field inspection is recommended. Look for signs of aphids or rust. Neem-based organic pesticides are effective for early-stage infestations.",
  'weather': "The weather forecast shows {condition} conditions with temperature around {temp}°C. Humidity will be around {humidity}%. Good conditions for crop growth.",
};

// Mock AI Response Generator
export const generateAIResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const [key, response] of Object.entries(mockAIResponses)) {
    if (lowerMessage.includes(key)) {
      return response;
    }
  }
  
  return mockAIResponses.default;
};

// Helper: Simulate API delay
export const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));
