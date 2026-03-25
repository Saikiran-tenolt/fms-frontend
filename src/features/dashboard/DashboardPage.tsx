import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Droplets,
  Thermometer,
  Wind,
  AlertTriangle,
  FileText,
  MapPin,
  DollarSign,
  MessageSquare,
  Image as ImageIcon,
  Sprout,
  Sun,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { setSensorData, setTrendData } from '../sensors/sensorsSlice';
import { setAdvisories } from '../advisories/advisoriesSlice';
import { Card, Badge, Button, EmptyState, Loader, SkeletonCard, SkeletonChart } from '../../components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  generateMockSensorData,
  generateMockTrendData,
  generateMockWeather,
  mockAdvisories,
  mockAlerts,
} from '../../services/mockData';
import { selectPlot } from '../plots/plotsSlice';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plots, selectedPlotId } = useAppSelector((state) => state.plots);
  const { sensorData, trendData } = useAppSelector((state) => state.sensors);
  const { advisories } = useAppSelector((state) => state.advisories);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<any>(null);
  
  const selectedPlot = plots.find((p) => p.plotId === selectedPlotId);
  
  useEffect(() => {
    if (plots.length > 0 && selectedPlotId) {
      loadDashboardData();
    }
  }, [selectedPlotId, plots.length]);
  
  const loadDashboardData = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    if (selectedPlot) {
      const sensors = generateMockSensorData(selectedPlot.plotId, selectedPlot.environmentType);
      dispatch(setSensorData({ plotId: selectedPlot.plotId, data: sensors }));
      dispatch(setTrendData({ plotId: selectedPlot.plotId, sensor: 'soilMoisture', data: generateMockTrendData() }));
      dispatch(setTrendData({ plotId: selectedPlot.plotId, sensor: 'temperature', data: generateMockTrendData() }));
      setWeather(generateMockWeather(selectedPlot.plotId));
      dispatch(setAdvisories(mockAdvisories));
    }
    
    setLoading(false);
  };
  
  const handlePlotChange = (plotId: string) => {
    dispatch(selectPlot(plotId));
  };
  
  if (plots.length === 0) {
    return (
      <EmptyState
        icon={<MapPin className="h-20 w-20" />}
        title="No plots found"
        description="Add your first plot to start monitoring your farm and get real-time insights."
        action={{
          label: 'Add Your First Plot',
          onClick: () => navigate('/plots/create'),
        }}
      />
    );
  }
  
  const currentSensors = selectedPlotId ? sensorData[selectedPlotId] : null;
  const soilMoistureTrend = selectedPlotId ? trendData[`${selectedPlotId}_soilMoisture`] : [];
  const temperatureTrend = selectedPlotId ? trendData[`${selectedPlotId}_temperature`] : [];
  const latestAdvisory = advisories[0];
  
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1️⃣ WELCOME HEADER BANNER */}
      <Card className="bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 border-0 shadow-2xl overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Sprout className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">Smart Farm Monitoring</h1>
                    <p className="text-primary-100 text-sm mt-1">Real-time agricultural intelligence</p>
                  </div>
                </div>
                
                {selectedPlot && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <p className="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-1">Active Plot</p>
                      <p className="text-white text-xl font-bold">{selectedPlot.plotName}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <p className="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-1">Crop Type</p>
                      <p className="text-white text-xl font-bold">{selectedPlot.cropType}</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <p className="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-1">Weather</p>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{weather?.icon || '☀️'}</span>
                        <p className="text-white text-xl font-bold">{weather?.temperature || '--'}°C</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {plots.length > 1 && (
                <div className="lg:w-64">
                  <label htmlFor="plotSelector" className="block text-sm font-semibold text-white mb-3">
                    Switch Plot
                  </label>
                  <select
                    id="plotSelector"
                    value={selectedPlotId || ''}
                    onChange={(e) => handlePlotChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white font-semibold focus:ring-4 focus:ring-white/30 focus:border-white/50 outline-none transition-all"
                  >
                    {plots.map((plot) => (
                      <option key={plot.plotId} value={plot.plotId} className="text-gray-900">
                        {plot.plotName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
      
      {loading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </div>
      ) : (
        <>
          {/* 2️⃣ SENSOR KPI CARDS */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <Droplets className="h-5 w-5 text-primary-600" />
              </div>
              Sensor Readings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Soil Moisture */}
              {currentSensors?.soilMoisture && (
                <Card className="bg-gradient-to-br from-blue-50 via-white to-blue-50/30 border-2 border-blue-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-blue-50 group-hover:scale-110 transition-transform">
                      <Droplets className="h-10 w-10 text-blue-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Soil Moisture</p>
                    <div className="mb-2">
                      <span className="text-5xl font-bold text-gray-900">{currentSensors.soilMoisture.value}</span>
                      <span className="text-2xl text-gray-600 ml-1">%</span>
                    </div>
                    <Badge
                      variant={
                        currentSensors.soilMoisture.status === 'ok' ? 'success' :
                        currentSensors.soilMoisture.status === 'warning' ? 'warning' : 'error'
                      }
                      size="md"
                      className="px-4 py-1.5"
                    >
                      {currentSensors.soilMoisture.status.toUpperCase()}
                    </Badge>
                  </div>
                </Card>
              )}
              
              {/* Temperature */}
              {currentSensors?.temperature && (
                <Card className="bg-gradient-to-br from-red-50 via-white to-red-50/30 border-2 border-red-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-red-50 group-hover:scale-110 transition-transform">
                      <Thermometer className="h-10 w-10 text-red-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Temperature</p>
                    <div className="mb-2">
                      <span className="text-5xl font-bold text-gray-900">{currentSensors.temperature.value}</span>
                      <span className="text-2xl text-gray-600 ml-1">°C</span>
                    </div>
                    <Badge
                      variant={
                        currentSensors.temperature.status === 'ok' ? 'success' :
                        currentSensors.temperature.status === 'warning' ? 'warning' : 'error'
                      }
                      size="md"
                      className="px-4 py-1.5"
                    >
                      {currentSensors.temperature.status.toUpperCase()}
                    </Badge>
                  </div>
                </Card>
              )}
              
              {/* Humidity */}
              {currentSensors?.humidity && (
                <Card className="bg-gradient-to-br from-teal-50 via-white to-teal-50/30 border-2 border-teal-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 bg-teal-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-teal-50 group-hover:scale-110 transition-transform">
                      <Wind className="h-10 w-10 text-teal-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Humidity</p>
                    <div className="mb-2">
                      <span className="text-5xl font-bold text-gray-900">{currentSensors.humidity.value}</span>
                      <span className="text-2xl text-gray-600 ml-1">%</span>
                    </div>
                    <Badge
                      variant={
                        currentSensors.humidity.status === 'ok' ? 'success' :
                        currentSensors.humidity.status === 'warning' ? 'warning' : 'error'
                      }
                      size="md"
                      className="px-4 py-1.5"
                    >
                      {currentSensors.humidity.status.toUpperCase()}
                    </Badge>
                  </div>
                </Card>
              )}
              
              {/* Soil Temperature */}
              {currentSensors?.soilTemperature && (
                <Card className="bg-gradient-to-br from-orange-50 via-white to-orange-50/30 border-2 border-orange-200 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer group">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 bg-orange-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-orange-50 group-hover:scale-110 transition-transform">
                      <Sun className="h-10 w-10 text-orange-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Soil Temp</p>
                    <div className="mb-2">
                      <span className="text-5xl font-bold text-gray-900">{currentSensors.soilTemperature.value}</span>
                      <span className="text-2xl text-gray-600 ml-1">°C</span>
                    </div>
                    <Badge
                      variant={
                        currentSensors.soilTemperature.status === 'ok' ? 'success' :
                        currentSensors.soilTemperature.status === 'warning' ? 'warning' : 'error'
                      }
                      size="md"
                      className="px-4 py-1.5"
                    >
                      {currentSensors.soilTemperature.status.toUpperCase()}
                    </Badge>
                  </div>
                </Card>
              )}
            </div>
          </div>
          
          {/* 3️⃣ SENSOR TREND CHARTS */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-600" />
              </div>
              Historical Trends
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-2 border-blue-100 hover:shadow-xl transition-shadow">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Soil Moisture Trend</h3>
                  <p className="text-sm text-gray-600 mt-1">Last 7 days monitoring</p>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={soilMoistureTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid #3b82f6',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              
              <Card className="border-2 border-red-100 hover:shadow-xl transition-shadow">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Temperature Trend</h3>
                  <p className="text-sm text-gray-600 mt-1">Last 7 days monitoring</p>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={temperatureTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid #ef4444',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#ef4444" 
                      strokeWidth={3} 
                      dot={{ r: 5, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
          
          {/* 4️⃣ ALERTS SECTION */}
          {mockAlerts.length > 0 && (
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Active Alerts</h2>
              </div>
              <div className="space-y-4">
                {mockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 p-5 bg-white border-2 border-amber-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-[1.01]"
                  >
                    <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-lg text-gray-900">{alert.title}</p>
                          <p className="text-gray-600 mt-1">{alert.plotName}</p>
                          <p className="text-gray-700 mt-2">{alert.message}</p>
                        </div>
                        <Badge
                          variant={alert.severity === 'high' ? 'error' : 'warning'}
                          size="md"
                          className="flex-shrink-0"
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {/* Latest Advisory */}
          {latestAdvisory && (
            <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FileText className="h-7 w-7 text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">Latest Advisory</h3>
                    <Badge
                      variant={
                        latestAdvisory.severity === 'critical' ? 'error' :
                        latestAdvisory.severity === 'high' ? 'warning' : 'info'
                      }
                      size="md"
                    >
                      {latestAdvisory.severity}
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-lg text-gray-900 mb-2">{latestAdvisory.title}</h4>
                  <p className="text-gray-700 mb-3">{latestAdvisory.description}</p>
                  <div className="bg-white border-l-4 border-primary-500 p-4 rounded-r-xl">
                    <p className="text-sm font-semibold text-primary-900 mb-1">Recommended Action:</p>
                    <p className="text-sm text-primary-800">{latestAdvisory.recommendedAction}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/advisories')}
                    className="mt-4"
                  >
                    View All Advisories →
                  </Button>
                </div>
              </div>
            </Card>
          )}
          
          {/* 5️⃣ QUICK ACTIONS */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="h-10 w-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-primary-600" />
              </div>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <button
                onClick={() => navigate('/plots')}
                className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary-50 to-white border-2 border-primary-200 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              >
                <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="h-8 w-8 text-primary-600" />
                </div>
                <span className="font-bold text-lg text-gray-900 mb-2">View Plots</span>
                <span className="text-sm text-gray-600 text-center">Manage your farm plots</span>
              </button>
              
              <button
                onClick={() => navigate('/market')}
                className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              >
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <span className="font-bold text-lg text-gray-900 mb-2">Market Prices</span>
                <span className="text-sm text-gray-600 text-center">Check crop prices</span>
              </button>
              
              <button
                onClick={() => navigate('/assistant')}
                className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-200 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              >
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <span className="font-bold text-lg text-gray-900 mb-2">Smart Assistant</span>
                <span className="text-sm text-gray-600 text-center">Get AI advice</span>
              </button>
              
              <button
                onClick={() => navigate('/assistant')}
                className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              >
                <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ImageIcon className="h-8 w-8 text-purple-600" />
                </div>
                <span className="font-bold text-lg text-gray-900 mb-2">Upload Image</span>
                <span className="text-sm text-gray-600 text-center">AI crop analysis</span>
              </button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};