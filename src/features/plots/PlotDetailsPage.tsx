import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Droplets, Thermometer, Wind, 
  Sun, CloudRain, AlertTriangle, MessageSquare, 
  TrendingUp, Image as ImageIcon, Sprout 
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { Card, Badge, Button, EmptyState, Loader } from '../../components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { setSensorData, setTrendData } from '../sensors/sensorsSlice';
import { generateMockSensorData, generateMockTrendData, mockAlerts } from '../../services/mockData';

export const PlotDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plots } = useAppSelector((state) => state.plots);
  const { sensorData, trendData } = useAppSelector((state) => state.sensors);
  const [loading, setLoading] = useState(true);
  
  const plot = plots.find((p) => p.plotId === id);
  const currentSensors = id ? sensorData[id] : null;
  const soilMoistureTrend = id ? trendData[`${id}_soilMoisture`] : [];
  const temperatureTrend = id ? trendData[`${id}_temperature`] : [];
  const plotAlerts = mockAlerts.filter(alert => alert.plotId === id);
  
  useEffect(() => {
    if (plot) {
      loadPlotData();
    }
  }, [plot]);
  
  const loadPlotData = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    if (plot) {
      const sensors = generateMockSensorData(plot.plotId, plot.environmentType);
      dispatch(setSensorData({ plotId: plot.plotId, data: sensors }));
      dispatch(setTrendData({ plotId: plot.plotId, sensor: 'soilMoisture', data: generateMockTrendData() }));
      dispatch(setTrendData({ plotId: plot.plotId, sensor: 'temperature', data: generateMockTrendData() }));
    }
    
    setLoading(false);
  };
  
  if (!plot) {
    return (
      <EmptyState
        icon={<MapPin className="h-16 w-16" />}
        title="Plot not found"
        description="The plot you're looking for doesn't exist."
        action={{
          label: 'Back to Plots',
          onClick: () => navigate('/plots'),
        }}
      />
    );
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader size="lg" text="Loading plot data..." />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/plots')} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{plot.plotName}</h1>
          <p className="text-sm text-gray-600 mt-1">Detailed plot monitoring and insights</p>
        </div>
      </div>
      
      {/* SECTION 1 - Plot Header */}
      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plot Image */}
          <div className="lg:col-span-1">
            {plot.imageUrl ? (
              <img
                src={plot.imageUrl}
                alt={plot.plotName}
                className="w-full h-64 object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-primary-100 to-earth-100 rounded-lg border border-gray-200 flex items-center justify-center">
                <Sprout className="h-20 w-20 text-primary-600 opacity-50" />
              </div>
            )}
          </div>
          
          {/* Plot Information */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Plot Name</p>
              <p className="text-lg font-semibold text-gray-900">{plot.plotName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Crop Type</p>
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-primary-600" />
                <p className="text-lg font-semibold text-gray-900">{plot.cropType}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Soil Type</p>
              <p className="text-lg font-semibold text-gray-900">{plot.soilType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium mb-1">Environment Type</p>
              <Badge variant="default" size="md">
                {plot.environmentType === 'OPEN_FIELD' ? '🌾 Open Field' : '🏠 Indoor/Greenhouse'}
              </Badge>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-gray-600 font-medium mb-1">Location</p>
              <div className="flex items-center gap-2 text-gray-900">
                <MapPin className="h-4 w-4 text-primary-600" />
                <p className="text-sm">
                  Lat: {plot.location.latitude.toFixed(4)}, Lon: {plot.location.longitude.toFixed(4)}
                </p>
              </div>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-gray-600 font-medium mb-1">Created On</p>
              <p className="text-sm text-gray-900">
                {new Date(plot.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      {/* SECTION 2 - Sensor Readings */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Current Sensor Readings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Soil Moisture */}
          {currentSensors?.soilMoisture && (
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    <p className="text-sm font-medium text-gray-700">Soil Moisture</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {currentSensors.soilMoisture.value}%
                  </p>
                  <Badge
                    variant={
                      currentSensors.soilMoisture.status === 'ok'
                        ? 'success'
                        : currentSensors.soilMoisture.status === 'warning'
                        ? 'warning'
                        : 'error'
                    }
                    size="sm"
                    className="mt-2"
                  >
                    {currentSensors.soilMoisture.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>
          )}
          
          {/* Temperature */}
          {currentSensors?.temperature && (
            <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="h-5 w-5 text-red-600" />
                    <p className="text-sm font-medium text-gray-700">Temperature</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {currentSensors.temperature.value}°C
                  </p>
                  <Badge
                    variant={
                      currentSensors.temperature.status === 'ok'
                        ? 'success'
                        : currentSensors.temperature.status === 'warning'
                        ? 'warning'
                        : 'error'
                    }
                    size="sm"
                    className="mt-2"
                  >
                    {currentSensors.temperature.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>
          )}
          
          {/* Humidity */}
          {currentSensors?.humidity && (
            <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="h-5 w-5 text-teal-600" />
                    <p className="text-sm font-medium text-gray-700">Humidity</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {currentSensors.humidity.value}%
                  </p>
                  <Badge
                    variant={
                      currentSensors.humidity.status === 'ok'
                        ? 'success'
                        : currentSensors.humidity.status === 'warning'
                        ? 'warning'
                        : 'error'
                    }
                    size="sm"
                    className="mt-2"
                  >
                    {currentSensors.humidity.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>
          )}
          
          {/* Soil Temperature */}
          {currentSensors?.soilTemperature && (
            <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Thermometer className="h-5 w-5 text-orange-600" />
                    <p className="text-sm font-medium text-gray-700">Soil Temp</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {currentSensors.soilTemperature.value}°C
                  </p>
                  <Badge
                    variant={
                      currentSensors.soilTemperature.status === 'ok'
                        ? 'success'
                        : currentSensors.soilTemperature.status === 'warning'
                        ? 'warning'
                        : 'error'
                    }
                    size="sm"
                    className="mt-2"
                  >
                    {currentSensors.soilTemperature.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>
          )}
          
          {/* Indoor-specific sensors */}
          {plot.environmentType === 'INDOOR' && (
            <>
              {currentSensors?.co2 && (
                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Wind className="h-5 w-5 text-purple-600" />
                        <p className="text-sm font-medium text-gray-700">CO2 Level</p>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">
                        {currentSensors.co2.value}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">ppm</p>
                      <Badge variant="success" size="sm" className="mt-2">
                        {currentSensors.co2.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </Card>
              )}
              
              {currentSensors?.light && (
                <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="h-5 w-5 text-yellow-600" />
                        <p className="text-sm font-medium text-gray-700">Light</p>
                      </div>
                      <p className="text-3xl font-bold text-gray-900">
                        {currentSensors.light.value}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">lux</p>
                      <Badge variant="success" size="sm" className="mt-2">
                        {currentSensors.light.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
          
          {/* Outdoor-specific sensors */}
          {plot.environmentType === 'OPEN_FIELD' && currentSensors?.rainfall && (
            <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CloudRain className="h-5 w-5 text-indigo-600" />
                    <p className="text-sm font-medium text-gray-700">Rainfall</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {currentSensors.rainfall.value}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">mm</p>
                  <Badge variant="success" size="sm" className="mt-2">
                    {currentSensors.rainfall.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* SECTION 3 - Sensor Charts */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Historical Trends</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Soil Moisture Trend */}
          <Card title="Soil Moisture (7 Days)">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={soilMoistureTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          
          {/* Temperature Trend */}
          <Card title="Temperature (7 Days)">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={temperatureTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
      
      {/* SECTION 4 - Plot Alerts */}
      {plotAlerts.length > 0 && (
        <Card title="Active Alerts for this Plot">
          <div className="space-y-3">
            {plotAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg"
              >
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{alert.title}</p>
                  <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant={alert.severity === 'high' ? 'error' : 'warning'}
                  size="sm"
                >
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
      
      {/* SECTION 5 - Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/assistant')} 
            className="flex flex-col items-center justify-center py-8 h-auto hover:shadow-md transition-shadow"
          >
            <MessageSquare className="h-10 w-10 mb-3 text-blue-600" />
            <span className="font-semibold">Open Smart Assistant</span>
            <span className="text-xs text-gray-600 mt-1">Get AI-powered advice</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/market')} 
            className="flex flex-col items-center justify-center py-8 h-auto hover:shadow-md transition-shadow"
          >
            <TrendingUp className="h-10 w-10 mb-3 text-green-600" />
            <span className="font-semibold">View Market Prices</span>
            <span className="text-xs text-gray-600 mt-1">Check crop prices</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/assistant')} 
            className="flex flex-col items-center justify-center py-8 h-auto hover:shadow-md transition-shadow"
          >
            <ImageIcon className="h-10 w-10 mb-3 text-purple-600" />
            <span className="font-semibold">Upload Crop Image</span>
            <span className="text-xs text-gray-600 mt-1">AI image analysis</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
