import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Sprout } from 'lucide-react';
import { useAppSelector } from '../../hooks';
import { Badge, EmptyState } from '../../components/ui';

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
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Plots</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage your agricultural plots and fields
          </p>
        </div>
        <button
          onClick={() => navigate('/plots/create')}
          className="flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_-2px_rgba(16,185,129,0.4)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Plot
        </button>
      </div>

      {/* Plots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {plots.map((plot) => (
          <div
            key={plot.plotId}
            onClick={() => navigate(`/plots/${plot.plotId}`)}
            className="group relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            {/* Plot Image / Gradient Placeholder */}
            <div className="relative h-64 w-full overflow-hidden">
              {plot.imageUrl ? (
                <img
                  src={plot.imageUrl}
                  alt={plot.plotName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-100 via-emerald-50 to-slate-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                  <Sprout className="h-24 w-24 text-emerald-600/20" />
                </div>
              )}

              {/* Top Right Badge Overlays */}
              <div className="absolute top-4 right-4 z-10">
                <Badge variant="default" size="sm" className="bg-white/80 backdrop-blur-md text-slate-800 border-none shadow-sm uppercase tracking-wider text-[10px] font-bold">
                  {plot.environmentType === 'OPEN_FIELD' ? 'Open Field' : 'Indoor'}
                </Badge>
              </div>

              {/* Glassmorphic Data Overlay Bottom */}
              <div className="absolute inset-x-3 bottom-3 z-10">
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-4 shadow-lg">
                  <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-2 truncate">
                    {plot.plotName}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Crop</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{plot.cropType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Soil</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{plot.soilType}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center text-xs font-semibold text-slate-500">
                    <MapPin className="h-3 w-3 mr-1 text-emerald-500" />
                    {plot.location.latitude.toFixed(4)}, {plot.location.longitude.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
