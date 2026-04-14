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
} from '../types';

// Mock User Data
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    phone: '9876543210',
    email: 'rajesh@farmer.com',
    role: 'FARMER',
  },
];

// Mock Plot Data
export const mockPlots: Plot[] = [
  {
    _id: '1',
    userId: 'user1',
    plotName: 'North Field',
    cropType: 'PADDY',
    soilType: 'LOAMY',
    environmentType: 'OPEN_FIELD',
    location: { 
      address: 'Punjab Sector 4, Ludhiana', 
      state: 'Punjab',
      district: 'Ludhiana',
      lat: 28.6139, 
      lng: 77.2090 
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sowingDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    expectedHarvestDate: new Date(Date.now() + 86400000 * 60).toISOString(),
    actualHarvestDate: null,
    cropStage: 'GROWING',
    isActive: true,
    hardwareStatus: {
      battery: 82,
      signal: 94,
      lastSync: new Date().toISOString(),
    },
    npkLevels: {
      n: 110,
      p: 55,
      k: 38,
    },
    farmSize: 4.5,
    scanHistory: [
      {
        id: 's1',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        status: 'Optimal',
        confidence: 0.98,
        result: 'Irrigation successful',
      },
      {
        id: 's2',
        timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
        status: 'Healthy',
        confidence: 0.95,
        result: 'Fertilizer application completed',
      },
    ],
  },
  {
    _id: '2',
    userId: 'user1',
    plotName: 'South Greenhouse',
    cropType: 'PADDY',
    soilType: 'SANDY',
    environmentType: 'INDOOR',
    location: { 
      address: 'South Agri-Park, Unit 12', 
      state: 'Delhi',
      district: 'South Delhi',
      lat: 28.6129, 
      lng: 77.2080 
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sowingDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    expectedHarvestDate: new Date(Date.now() + 86400000 * 80).toISOString(),
    actualHarvestDate: null,
    cropStage: 'GROWING',
    isActive: true,
    hardwareStatus: {
      battery: 45,
      signal: 68,
      lastSync: new Date().toISOString(),
    },
    npkLevels: {
      n: 85,
      p: 42,
      k: 60,
    },
    farmSize: 1.2,
    scanHistory: [
      {
        id: 's3',
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
        status: 'Attention',
        confidence: 0.88,
        result: 'Nutrient adjustment required',
      },
    ],
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
    description: 'Soil moisture levels are below optimal range for rice cultivation.',
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
];

// Mock Market Prices
export const mockMarketPrices: MarketPrice[] = [
  {
    id: '1',
    cropName: 'Rice (Paddy)',
    price: 3100,
    unit: '₹/quintal',
    change: 5.2,
    trend: 'up',
    mandiName: 'Azadpur Mandi',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    cropName: 'Wheat',
    price: 2450,
    unit: '₹/quintal',
    change: -1.2,
    trend: 'down',
    mandiName: 'Ludhiana Mandi',
    timestamp: new Date().toISOString(),
  },
  {
    id: '3',
    cropName: 'Rice (Paddy)',
    price: 2950,
    unit: '₹/quintal',
    change: 2.1,
    trend: 'up',
    mandiName: 'Vashi Mandi',
    timestamp: new Date().toISOString(),
  },
  {
    id: '4',
    cropName: 'Tomato',
    price: 1800,
    unit: '₹/quintal',
    change: 12.5,
    trend: 'up',
    mandiName: 'Koyambedu Market',
    timestamp: new Date().toISOString(),
  },
  {
    id: '5',
    cropName: 'Onion',
    price: 2200,
    unit: '₹/quintal',
    change: 4.8,
    trend: 'stable',
    mandiName: 'Azadpur Mandi',
    timestamp: new Date().toISOString(),
  },
  {
    id: '6',
    cropName: 'Wheat',
    price: 2600,
    unit: '₹/quintal',
    change: 3.4,
    trend: 'up',
    mandiName: 'Azadpur Mandi',
    timestamp: new Date().toISOString(),
  },
  {
    id: '7',
    cropName: 'Tomato',
    price: 1650,
    unit: '₹/quintal',
    change: -2.5,
    trend: 'down',
    mandiName: 'Vashi Mandi',
    timestamp: new Date().toISOString(),
  },
];

// Mock AI Responses
export const mockAIResponses: Record<string, string> = {
  default: "Based on your plot data, I can help you with irrigation scheduling, pest management, and crop health monitoring. What specific aspect would you like to discuss?",
  'soil moisture': "Your soil moisture is currently at {value}%. For rice cultivation, the optimal range is 40-60%. I recommend irrigating within the next 24 hours to prevent crop stress.",
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
