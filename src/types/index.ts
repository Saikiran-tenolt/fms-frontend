export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'FARMER' | 'ADMIN';
  assignedBlock?: string;
  pincode?: string;
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

export type EnvironmentType = 'OPEN_FIELD' | 'INDOOR';
export type SoilType = 'SANDY' | 'LOAMY' | 'CLAY';
export type CropStage = 'SOWED' | 'GROWING' | 'HARVEST_READY' | 'HARVESTED';

export interface PlotLocation {
  address: string;
  lat: number;
  lng: number;
}

export interface CropScan {
  id: string;
  timestamp: string;
  status: 'Optimal' | 'Healthy' | 'Attention' | 'Critical';
  confidence: number;
  result: string;
  imageUrl?: string;
}

export interface HardwareStatus {
  battery: number;
  signal: number; // 0-100
  lastSync: string;
}

export interface Plot {
  _id: string;
  userId: string;
  plotName: string;
  cropType: 'PADDY';
  soilType: SoilType;
  environmentType: EnvironmentType;
  sowingDate: string;
  expectedHarvestDate: string | null;
  actualHarvestDate: string | null;
  cropStage: CropStage;
  location: PlotLocation;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Frontend/Extended fields (might be merged later)
  imageUrl?: string;
  hardwareStatus?: HardwareStatus;
  npkLevels?: {
    n: number;
    p: number;
    k: number;
  };
  farmSize: number; // Number as per spec
  scanHistory?: CropScan[];
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
