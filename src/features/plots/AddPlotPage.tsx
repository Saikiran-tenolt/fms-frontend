/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { addPlot, updatePlot } from './plotsSlice';
import type { Plot } from '../../types';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

import { 
  MapPin, 
  Sprout, 
  Layers, 
  Upload, 
  ChevronRight, 
  CheckCircle2,
  Navigation,
  Globe,
  Warehouse,
  ArrowRight,
  ArrowLeft,
  Info,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type EnvironmentType = 'open' | 'indoor';
type LocationMethod = 'current' | 'manual';

interface PlotData {
  name: string;
  crop: string;
  soil: string;
  environment: EnvironmentType;
  locationMethod: LocationMethod;
  image: File | null;
  latitude?: string;
  longitude?: string;
}

// --- Components ---

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <React.Fragment key={i}>
        <div className="flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
            i + 1 <= currentStep 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' 
              : 'bg-slate-100 text-slate-400'
          }`}>
            {i + 1 < currentStep ? <Check size={18} /> : i + 1}
          </div>
        </div>
        {i < totalSteps - 1 && (
          <div className="flex-1 h-[2px] min-w-[40px] bg-slate-100 relative overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: i + 1 < currentStep ? '100%' : '0%' }}
              className="absolute inset-0 bg-emerald-600"
              transition={{ duration: 0.5 }}
            />
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);

const InputField = ({ label, icon: Icon, placeholder, value, onChange, required = false, type = "text" }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-2"
  >
    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
      <Icon size={12} className="text-emerald-500" />
      {label} {required && <span className="text-emerald-500">*</span>}
    </label>
    <div className="relative group">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300 text-sm shadow-sm group-hover:border-slate-300"
      />
    </div>
  </motion.div>
);

const SelectableCard = ({ active, onClick, icon: Icon, title, description }: any) => (
  <motion.div 
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative flex flex-col gap-4 p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 group ${
      active 
        ? 'border-emerald-500 bg-emerald-50/30 shadow-xl shadow-emerald-600/5' 
        : 'border-slate-100 bg-white hover:border-emerald-200 hover:shadow-md'
    }`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
      active ? 'bg-emerald-600 text-white rotate-6' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'
    }`}>
      <Icon size={24} />
    </div>
    <div>
      <h4 className={`text-base font-bold ${active ? 'text-emerald-900' : 'text-slate-700'}`}>{title}</h4>
      <p className="text-xs text-slate-400 leading-relaxed mt-1">{description}</p>
    </div>
    {active && (
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute top-4 right-4"
      >
        <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg">
          <Check size={14} strokeWidth={3} />
        </div>
      </motion.div>
    )}
  </motion.div>
);

const MapSelector = ({ latitude, longitude, onChange }: { latitude?: string, longitude?: string, onChange: (lat: string, lng: string) => void }) => {
  const defaultCenter = { lat: 20.5937, lng: 78.9629 };
  const position = latitude && longitude ? { lat: parseFloat(latitude), lng: parseFloat(longitude) } : null;

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        onChange(e.latlng.lat.toFixed(6), e.latlng.lng.toFixed(6));
      },
    });

    return position === null ? null : (
      <Marker position={position} />
    );
  };

  return (
    <div className="h-[250px] w-full rounded-[20px] overflow-hidden border-2 border-slate-200">
      <MapContainer 
        center={position || defaultCenter} 
        zoom={position ? 15 : 4} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

export const AddPlotPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { plots } = useAppSelector((state) => state.plots);
  const existingPlot = id ? plots.find(p => p.plotId === id) : null;
  const isFirstPlot = plots.length === 0 && !existingPlot;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PlotData>({
    name: '',
    crop: '',
    soil: '',
    environment: 'open',
    locationMethod: 'current',
    image: null,
    latitude: '',
    longitude: ''
  });

  React.useEffect(() => {
    if (existingPlot) {
      setFormData({
        name: existingPlot.plotName,
        crop: existingPlot.cropType,
        soil: existingPlot.soilType,
        environment: existingPlot.environmentType === 'OPEN_FIELD' ? 'open' : 'indoor',
        locationMethod: 'manual',
        image: null,
        latitude: existingPlot.location.latitude.toString(),
        longitude: existingPlot.location.longitude.toString()
      });
    }
  }, [existingPlot]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData(prev => ({ ...prev, image: file }));
  };

  const fetchLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({ 
          ...prev, 
          latitude: position.coords.latitude.toString(), 
          longitude: position.coords.longitude.toString() 
        }));
        setIsFetchingLocation(false);
      },
      (error) => {
        alert(`Unable to get location: ${error.message}`);
        setIsFetchingLocation(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent premature submission on Enter press; advance step instead
    if (step < 3) {
      if (canProceed()) nextStep();
      return;
    }
    
    // Safety check just in case
    if (!canProceed()) return;

    setIsSubmitting(true);

    try {
      let imageUrl: string | undefined = undefined;
      if (formData.image) {
        const reader = new FileReader();
        imageUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(formData.image!);
        });
      }

      const plotDataToSave: Plot = {
        plotId: existingPlot ? existingPlot.plotId : `plot-${Date.now()}`,
        plotName: formData.name,
        cropType: formData.crop,
        soilType: formData.soil,
        environmentType: formData.environment === 'open' ? 'OPEN_FIELD' : 'INDOOR',
        location: {
          latitude: parseFloat(formData.latitude || '0'),
          longitude: parseFloat(formData.longitude || '0')
        },
        imageUrl: imageUrl || existingPlot?.imageUrl,
        createdAt: existingPlot ? existingPlot.createdAt : new Date().toISOString()
      };

      if (existingPlot) {
        dispatch(updatePlot(plotDataToSave));
      } else {
        dispatch(addPlot(plotDataToSave));
      }
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  
  const canProceed = () => {
    if (step === 1) return formData.name && formData.crop && formData.soil;
    if (step === 2) return true;
    if (step === 3) return formData.locationMethod === 'manual' ? !!(formData.latitude && formData.longitude) : !!formData.latitude;
    return true;
  };

  return (
    <div className="w-full font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <div className="max-w-3xl mx-auto pb-12">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form-container"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                  {existingPlot ? 'Edit Plot Details' : isFirstPlot ? 'Create Your First Plot' : 'Create New Plot'}
                </h1>
                <p className="text-slate-500 mt-3 text-lg">
                  {isFirstPlot 
                    ? 'Set up your first plot to start monitoring your farm.'
                    : 'Follow the steps to register your land in the monitoring system.'}
                </p>
              </div>

              <StepIndicator currentStep={step} totalSteps={3} />

              <form onSubmit={handleSubmit} className="relative">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8 bg-white p-10 rounded-[40px] border border-slate-200/60 shadow-xl shadow-slate-200/40"
                    >
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900">Basic Configuration</h3>
                        <p className="text-sm text-slate-400">Define the primary identifiers for this plot.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <InputField 
                          label="Plot Identification" 
                          icon={Layers} 
                          placeholder="e.g., Sector 7G - North" 
                          value={formData.name}
                          onChange={(v: string) => setFormData(p => ({ ...p, name: v }))}
                          required
                        />
                        <InputField 
                          label="Primary Crop" 
                          icon={Sprout} 
                          placeholder="e.g., Winter Wheat" 
                          value={formData.crop}
                          onChange={(v: string) => setFormData(p => ({ ...p, crop: v }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
                          <Info size={12} className="text-emerald-500" />
                          Soil Composition <span className="text-emerald-500">*</span>
                        </label>
                        <div className="relative">
                          <select 
                            className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm appearance-none cursor-pointer shadow-sm"
                            value={formData.soil}
                            onChange={(e) => setFormData(p => ({ ...p, soil: e.target.value }))}
                          >
                            <option value="">Select soil profile</option>
                            <option value="loamy">Loamy (High Nutrient)</option>
                            <option value="clay">Clay (Water Retentive)</option>
                            <option value="sandy">Sandy (High Drainage)</option>
                            <option value="silty">Silty (Fine Texture)</option>
                          </select>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <ChevronRight size={16} className="rotate-90" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-10"
                    >
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-slate-900">Environmental Context</h3>
                          <p className="text-sm text-slate-400">Select the atmospheric conditions of the plot.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <SelectableCard 
                            active={formData.environment === 'open'}
                            onClick={() => setFormData(p => ({ ...p, environment: 'open' }))}
                            icon={Globe}
                            title="Open Field"
                            description="Natural exposure to weather and sunlight."
                          />
                          <SelectableCard 
                            active={formData.environment === 'indoor'}
                            onClick={() => setFormData(p => ({ ...p, environment: 'indoor' }))}
                            icon={Warehouse}
                            title="Controlled Environment"
                            description="Greenhouse or indoor facility with regulation."
                          />
                        </div>
                      </div>

                      <div className="bg-white p-10 rounded-[40px] border border-slate-200/60 shadow-xl shadow-slate-200/40 space-y-6">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-slate-900">Visual Documentation</h3>
                          <p className="text-sm text-slate-400">Upload a high-resolution image of the plot.</p>
                        </div>

                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className={`group border-2 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center gap-6 cursor-pointer transition-all duration-500 ${
                            formData.image ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'
                          }`}
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleImageUpload}
                            accept="image/*"
                          />
                          
                          <AnimatePresence mode="wait">
                            {formData.image ? (
                              <motion.div 
                                key="preview"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center gap-4"
                              >
                                <div className="w-24 h-24 bg-emerald-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-emerald-600/30">
                                  <Check size={40} strokeWidth={3} />
                                </div>
                                <div className="text-center">
                                  <p className="text-base font-bold text-slate-900">{formData.image.name}</p>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setFormData(p => ({ ...p, image: null })); }}
                                    className="text-xs text-rose-500 font-bold mt-2 hover:underline tracking-wide uppercase"
                                  >
                                    Remove and replace
                                  </button>
                                </div>
                              </motion.div>
                            ) : (
                              <motion.div 
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center gap-4"
                              >
                                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-[20px] flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                  <Upload size={28} />
                                </div>
                                <div className="text-center">
                                  <p className="text-base font-bold text-slate-900">Upload Plot Image</p>
                                  <p className="text-sm text-slate-400 mt-1">Drag files here or click to browse</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-10"
                    >
                      <div className="space-y-8">
                        <div className="space-y-6">
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold text-slate-900">Geospatial Mapping</h3>
                            <p className="text-sm text-slate-400">How should we determine the plot coordinates?</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <SelectableCard 
                              active={formData.locationMethod === 'current'}
                              onClick={() => setFormData(p => ({ ...p, locationMethod: 'current' }))}
                              icon={Navigation}
                              title="GPS Auto-detect"
                              description="Use device sensors for precise mapping."
                            />
                            <SelectableCard 
                              active={formData.locationMethod === 'manual'}
                              onClick={() => setFormData(p => ({ ...p, locationMethod: 'manual' }))}
                              icon={MapPin}
                              title="Manual Entry"
                              description="Input coordinates manually for precision."
                            />
                          </div>
                        </div>

                        <AnimatePresence mode="wait">
                          {formData.locationMethod === 'current' ? (
                            <motion.div
                              key="gps-action"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-lg shadow-slate-200/20 flex flex-col items-center gap-6"
                            >
                              {formData.latitude ? (
                                <div className="flex flex-col items-center gap-4">
                                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                                    <CheckCircle2 size={32} />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm font-bold text-slate-900 tracking-tight">Coordinates Locked</p>
                                    <p className="text-xs text-slate-400 mt-1 font-mono">{formData.latitude}, {formData.longitude}</p>
                                  </div>
                                  <button 
                                    type="button"
                                    onClick={fetchLocation}
                                    className="text-xs font-bold text-emerald-600 uppercase tracking-widest hover:underline"
                                  >
                                    Refresh Location
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
                                    <Navigation size={24} />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm font-bold text-slate-900">Ready to sync</p>
                                    <p className="text-xs text-slate-400 mt-1">Click below to fetch your current GPS data.</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={fetchLocation}
                                    disabled={isFetchingLocation}
                                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                  >
                                    {isFetchingLocation ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Accessing GPS...
                                      </>
                                    ) : (
                                      <>
                                        <Navigation size={16} />
                                        Get Current Location
                                      </>
                                    )}
                                  </button>
                                </>
                              )}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="manual-action"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="bg-white p-6 rounded-[32px] border border-slate-200/60 shadow-lg shadow-slate-200/20 space-y-6"
                            >
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-900">Interactive Map Selection</p>
                                <p className="text-xs text-slate-400">Navigate the map and click to pin your plot's exact location.</p>
                              </div>
                              
                              <MapSelector 
                                latitude={formData.latitude}
                                longitude={formData.longitude}
                                onChange={(lat, lng) => setFormData(p => ({ ...p, latitude: lat, longitude: lng }))}
                              />

                              <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 group focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Latitude</p>
                                  <input 
                                    type="number" 
                                    step="any"
                                    value={formData.latitude} 
                                    onChange={(e) => setFormData(p => ({ ...p, latitude: e.target.value }))}
                                    placeholder="e.g. 28.6139"
                                    className="w-full bg-transparent text-sm font-mono text-slate-700 outline-none placeholder:text-slate-300"
                                  />
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 group focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Longitude</p>
                                  <input 
                                    type="number" 
                                    step="any"
                                    value={formData.longitude} 
                                    onChange={(e) => setFormData(p => ({ ...p, longitude: e.target.value }))}
                                    placeholder="e.g. 77.2090"
                                    className="w-full bg-transparent text-sm font-mono text-slate-700 outline-none placeholder:text-slate-300"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="bg-emerald-900 p-10 rounded-[40px] text-white space-y-6 shadow-2xl shadow-emerald-900/40 relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-800 rounded-full blur-3xl opacity-50" />
                        <div className="relative z-10">
                          <h3 className="text-xl font-bold">Ready for deployment?</h3>
                          <p className="text-emerald-100/70 text-sm mt-2 max-w-md">
                            Ensure all data is accurate. Once created, the plot will begin real-time data streaming to your dashboard.
                          </p>
                          
                          <div className="mt-8 grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-widest text-emerald-400">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={14} />
                              Satellite Sync
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={14} />
                              Soil Analysis
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-200/60">
                  <button 
                    type="button"
                    onClick={prevStep}
                    disabled={step === 1}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                      step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <ArrowLeft size={18} />
                    Back
                  </button>

                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => navigate('/plots')}
                      className="px-6 py-4 font-bold text-sm text-slate-500 hover:text-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    {step < 3 ? (
                      <button 
                        type="button"
                        onClick={nextStep}
                        disabled={!canProceed()}
                        className="flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue
                        <ArrowRight size={18} />
                      </button>
                    ) : (
                      <button 
                        type="submit"
                        disabled={isSubmitting || !canProceed()}
                        className="flex items-center gap-3 px-12 py-4 bg-emerald-600 text-white rounded-[20px] font-bold text-sm shadow-xl shadow-emerald-600/30 hover:bg-emerald-700 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                            {existingPlot ? 'Saving Details...' : 'Deploying Plot...'}
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={18} />
                            {existingPlot ? 'Save Changes' : 'Finalize & Deploy'}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-[40px] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-600/10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                >
                  <CheckCircle2 size={64} strokeWidth={3} />
                </motion.div>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">{existingPlot ? 'Changes Applied!' : 'Plot Deployed!'}</h2>
              <p className="text-slate-500 mt-4 text-lg max-w-md">
                Your plot <span className="text-emerald-600 font-bold">"{formData.name}"</span> has been successfully {existingPlot ? 'updated' : 'registered'} and is now syncing with our satellites.
              </p>
              <div className="flex gap-4 mt-12">
                {!existingPlot && (
                  <button 
                    onClick={() => { setIsSuccess(false); setStep(1); setFormData({ name: '', crop: '', soil: '', environment: 'open', locationMethod: 'current', image: null, latitude: '', longitude: '' }); }}
                    className="px-8 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    Add Another
                  </button>
                )}
                <button 
                  onClick={() => navigate(existingPlot ? `/plots/${existingPlot.plotId}` : '/dashboard')}
                  className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all"
                >
                  {existingPlot ? 'Back to Plot' : 'View Dashboard'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
