export interface User {
  id: string;
  name: string;
  email: string;
  role: 'FARMER' | 'ADMIN';
  permanentLocation?: {
    village: string;
    block: string;
    district: string;
    state: string;
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// Plot Types
export type EnvironmentType = 'OPEN_FIELD' | 'INDOOR';

export interface PlotLocation {
  latitude: number;
  longitude: number;
}

export interface Plot {
  plotId: string;
  plotName: string;
  cropType: string;
  soilType: string;
  environmentType: EnvironmentType;
  location: PlotLocation;
  imageUrl?: string;
  createdAt: string;
}

// Sensor Types
export type SensorStatus = 'ok' | 'warning' | 'critical';

export interface SensorReading {
  value: number;
  unit: string;
  status: SensorStatus;
  timestamp: string;
}

export interface SensorData {
  plotId: string;
  soilMoisture?: SensorReading;
  temperature?: SensorReading;
  humidity?: SensorReading;
  soilTemperature?: SensorReading;
  co2?: SensorReading; // Indoor only
  light?: SensorReading; // Indoor only
  rainfall?: SensorReading; // Outdoor only
}

export interface SensorTrendData {
  date: string;
  value: number;
}

// Weather Types
export interface WeatherData {
  plotId: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  timestamp: string;
}

// Advisory Types
export type AdvisorySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Advisory {
  id: string;
  plotId: string;
  title: string;
  description: string;
  severity: AdvisorySeverity;
  recommendedAction: string;
  timestamp: string;
}

// Alert Types
export interface Alert {
  id: string;
  plotId: string;
  plotName: string;
  title: string;
  message: string;
  severity: AdvisorySeverity;
  timestamp: string;
}

// Notification Types
export type NotificationPriority = 'low' | 'medium' | 'high';

export interface Notification {
  id: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  isRead: boolean;
  timestamp: string;
}

// Market Types
export interface MarketPrice {
  id: string;
  cropName: string;
  price: number;
  unit: string;
  change: number; // percentage
  trend: 'up' | 'down' | 'stable';
  mandiName: string;
  timestamp: string;
}

export interface PriceTrendData {
  date: string;
  price: number;
}

// Assistant Types
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  imageUrl?: string;
  timestamp: string;
}

export interface AssistantContext {
  plotName: string;
  cropType: string;
  soilMoisture: number;
  temperature: number;
}

// Redux State Types
export interface PlotsState {
  plots: Plot[];
  selectedPlotId: string | null;
  loading: boolean;
  error: string | null;
}

export interface SensorsState {
  sensorData: Record<string, SensorData>;
  trendData: Record<string, SensorTrendData[]>;
  loading: boolean;
  error: string | null;
}

export interface AdvisoriesState {
  advisories: Advisory[];
  loading: boolean;
  error: string | null;
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

export interface MarketState {
  prices: MarketPrice[];
  trendData: Record<string, PriceTrendData[]>;
  loading: boolean;
  error: string | null;
}

export interface AssistantState {
  messages: ChatMessage[];
  loading: boolean;
  attachedImage: File | null;
}
