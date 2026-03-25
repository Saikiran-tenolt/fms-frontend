import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Sprout } from 'lucide-react';
import { useAppSelector } from '../../hooks';
import { Card, Badge, Button, EmptyState } from '../../components/ui';

export const PlotListPage: React.FC = () => {
  const navigate = useNavigate();
  const { plots } = useAppSelector((state) => state.plots);
  
  if (plots.length === 0) {
    return (
      <EmptyState
        icon={<MapPin className="h-16 w-16" />}
        title="No plots found"
        description="Add your first plot to start monitoring your farm."
        action={{
          label: 'Add Plot',
          onClick: () => navigate('/plots/create'),
        }}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Plots</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your agricultural plots
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/plots/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Plot
        </Button>
      </div>
      
      {/* Plots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {plots.map((plot) => (
          <Card
            key={plot.plotId}
            className="overflow-hidden p-0"
            hoverable={true}
            onClick={() => navigate(`/plots/${plot.plotId}`)}
          >
            {/* Plot Image */}
            {plot.imageUrl ? (
              <img
                src={plot.imageUrl}
                alt={plot.plotName}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-earth-100 flex items-center justify-center">
                <Sprout className="h-16 w-16 text-primary-600 opacity-50" />
              </div>
            )}
            
            {/* Plot Info */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {plot.plotName}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Crop:</span>
                  <span className="font-semibold text-gray-900">{plot.cropType}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Soil:</span>
                  <span className="font-semibold text-gray-900">{plot.soilType}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">Type:</span>
                  <Badge variant="default" size="sm">
                    {plot.environmentType === 'OPEN_FIELD' ? 'Open Field' : 'Indoor'}
                  </Badge>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    {plot.location.latitude.toFixed(2)}, {plot.location.longitude.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
