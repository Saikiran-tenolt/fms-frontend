import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, X, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { addPlot } from './plotsSlice';
import { Button, Card } from '../../components/ui';
import type { Plot, EnvironmentType } from '../../types';

export const AddPlotPage: React.FC = () => {
  const [plotName, setPlotName] = useState('');
  const [cropType, setCropType] = useState('');
  const [soilType, setSoilType] = useState('');
  const [environmentType, setEnvironmentType] = useState<EnvironmentType>('OPEN_FIELD');
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });
  const [locationMethod, setLocationMethod] = useState<'auto' | 'manual'>('auto');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { plots } = useAppSelector((state) => state.plots);
  const isFirstPlot = plots.length === 0;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGettingLocation(false);
      },
      (error) => {
        setError(`Unable to get location: ${error.message}`);
        setGettingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (location.latitude === 0 && location.longitude === 0) {
      setError('Please provide plot location');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      // Create plot object
      const newPlot: Plot = {
        plotId: `plot-${Date.now()}`,
        plotName,
        cropType,
        soilType,
        environmentType,
        location,
        imageUrl: imagePreview || undefined,
        createdAt: new Date().toISOString(),
      };

      // Add plot to store
      dispatch(addPlot(newPlot));

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-earth-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isFirstPlot ? 'Create Your First Plot' : 'Add New Plot'}
          </h1>
          <p className="text-gray-600">
            {isFirstPlot
              ? 'Set up your first plot to start monitoring your farm'
              : 'Add another plot to your monitoring system'}
          </p>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Plot Name */}
            <div>
              <label htmlFor="plotName" className="block text-sm font-medium text-gray-700 mb-2">
                Plot Name *
              </label>
              <input
                id="plotName"
                type="text"
                value={plotName}
                onChange={(e) => setPlotName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="e.g., North Field"
              />
            </div>

            {/* Crop Type */}
            <div>
              <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-2">
                Crop Type *
              </label>
              <input
                id="cropType"
                type="text"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="e.g., Wheat, Rice, Tomato"
              />
            </div>

            {/* Soil Type */}
            <div>
              <label htmlFor="soilType" className="block text-sm font-medium text-gray-700 mb-2">
                Soil Type *
              </label>
              <select
                id="soilType"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Select soil type</option>
                <option value="Loamy">Loamy</option>
                <option value="Sandy">Sandy</option>
                <option value="Sandy Loam">Sandy Loam</option>
                <option value="Clay">Clay</option>
                <option value="Clay Loam">Clay Loam</option>
                <option value="Silt">Silt</option>
              </select>
            </div>

            {/* Environment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Environment Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="environmentType"
                    value="OPEN_FIELD"
                    checked={environmentType === 'OPEN_FIELD'}
                    onChange={(e) => setEnvironmentType(e.target.value as EnvironmentType)}
                    className="mr-2"
                  />
                  <span>Open Field</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="environmentType"
                    value="INDOOR"
                    checked={environmentType === 'INDOOR'}
                    onChange={(e) => setEnvironmentType(e.target.value as EnvironmentType)}
                    className="mr-2"
                  />
                  <span>Indoor/Greenhouse</span>
                </label>
              </div>
            </div>

            {/* Plot Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plot Image (Optional)
              </label>

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Plot preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4 text-gray-700" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
                >
                  <Upload className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload image</p>
                  <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plot Location *
              </label>

              <div className="flex gap-4 mb-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="locationMethod"
                    value="auto"
                    checked={locationMethod === 'auto'}
                    onChange={(e) => setLocationMethod(e.target.value as 'auto' | 'manual')}
                    className="mr-2"
                  />
                  <span>Use Current Location</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="locationMethod"
                    value="manual"
                    checked={locationMethod === 'manual'}
                    onChange={(e) => setLocationMethod(e.target.value as 'auto' | 'manual')}
                    className="mr-2"
                  />
                  <span>Manual Entry</span>
                </label>
              </div>

              {locationMethod === 'auto' ? (
                <Button
                  type="button"
                  onClick={handleGetLocation}
                  variant="outline"
                  disabled={gettingLocation}
                  className="w-full"
                >
                  {gettingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Current Location
                    </>
                  )}
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="latitude" className="block text-xs text-gray-600 mb-1">
                      Latitude
                    </label>
                    <input
                      id="latitude"
                      type="number"
                      step="any"
                      value={location.latitude}
                      onChange={(e) => setLocation({ ...location, latitude: parseFloat(e.target.value) })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="28.6139"
                    />
                  </div>
                  <div>
                    <label htmlFor="longitude" className="block text-xs text-gray-600 mb-1">
                      Longitude
                    </label>
                    <input
                      id="longitude"
                      type="number"
                      step="any"
                      value={location.longitude}
                      onChange={(e) => setLocation({ ...location, longitude: parseFloat(e.target.value) })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                      placeholder="77.2090"
                    />
                  </div>
                </div>
              )}

              {(location.latitude !== 0 || location.longitude !== 0) && (
                <p className="text-xs text-green-600 mt-2">
                  ✓ Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              {!isFirstPlot && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/plots')}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating Plot...' : 'Create Plot'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
