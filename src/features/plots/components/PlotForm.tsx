import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation, X, Image as ImageIcon, Plus, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import type { SoilType, EnvironmentType, Plot, CropStage, CropType } from '../../../types';

interface PlotFormProps {
  initialData?: Plot;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const RequiredMark = () => (
  <span className="text-red-600 text-sm font-bold ml-0.5">*</span>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
    {children}
  </label>
);

const inputClasses =
  'w-full px-3 py-2.5 bg-white border border-slate-300 rounded text-sm text-slate-800 font-medium placeholder:text-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors';

export const PlotForm: React.FC<PlotFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    plotName: '',
    farmSize: '',
    soilType: 'LOAMY' as SoilType,
    environmentType: 'OPEN_FIELD' as EnvironmentType,
    sowingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    location: {
      address: '',
      state: '',
      district: '',
      lat: '',
      lng: '',
    },
    cropStage: 'SOWED' as CropStage,
    actualHarvestDate: '',
    imageUrl: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        plotName: initialData.plotName,
        farmSize: initialData.farmSize.toString(),
        soilType: initialData.soilType,
        environmentType: initialData.environmentType,
        sowingDate: initialData.sowingDate.split('T')[0],
        expectedHarvestDate: initialData.expectedHarvestDate ? initialData.expectedHarvestDate.split('T')[0] : '',
        location: {
          address: initialData.location.address || '',
          state: initialData.location.state || '',
          district: initialData.location.district || '',
          lat: ((initialData.location as any).coordinates?.coordinates?.[1] ?? initialData.location.lat ?? '').toString(),
          lng: ((initialData.location as any).coordinates?.coordinates?.[0] ?? initialData.location.lng ?? '').toString(),
        },
        cropStage: initialData.cropStage || 'SOWED',
        actualHarvestDate: initialData.actualHarvestDate ? initialData.actualHarvestDate.split('T')[0] : '',
        imageUrl: initialData.imageUrl || '',
      });
      if (initialData.imageUrl) setImagePreview(initialData.imageUrl);
    }
  }, [initialData]);

  const fetchLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          location: { ...prev.location, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) },
        }));
        setIsFetchingLocation(false);
        toast.success('GPS coordinates captured');
      },
      (err) => { toast.error(`GPS sync failed: ${err.message}`); setIsFetchingLocation(false); }
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result as string;
        setImagePreview(b64);
        setFormData(prev => ({ ...prev, imageUrl: b64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(formData.location.lat) || 0;
    const lngNum = parseFloat(formData.location.lng) || 0;

    const payload: any = {
      plotName: formData.plotName || 'Unnamed Plot',
      farmSize: parseFloat(formData.farmSize) || 0,
      soilType: formData.soilType,
      environmentType: formData.environmentType,
      sowingDate: formData.sowingDate ? new Date(formData.sowingDate).toISOString() : new Date().toISOString(),
      location: {
        address: formData.location.address || 'Unknown',
        state: formData.location.state || 'Unknown',
        district: formData.location.district || 'Unknown',
        coordinates: { type: 'Point', coordinates: [lngNum, latNum] },
      },
      cropStage: formData.cropStage,
      cropType: 'PADDY' as CropType,
      imageUrl: formData.imageUrl,
      expectedHarvestDate: formData.expectedHarvestDate ? new Date(formData.expectedHarvestDate).toISOString() : null,
      actualHarvestDate: formData.actualHarvestDate ? new Date(formData.actualHarvestDate).toISOString() : null,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-0">

      {/* Section 1: Plot Identity */}
      <div className="border border-slate-200 rounded-t overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Section A</span>
          <span className="text-slate-300 text-xs">—</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700">Plot Identity</span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 bg-white">
          <div>
            <FieldLabel>Plot Name / Identification <RequiredMark /></FieldLabel>
            <input
              type="text" required
              placeholder="e.g. Green Valley – Sector A"
              value={formData.plotName}
              onChange={e => setFormData(p => ({ ...p, plotName: e.target.value }))}
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel>Farm Area (Hectares) <RequiredMark /></FieldLabel>
            <input
              type="number" step="any" required
              placeholder="e.g. 3.5"
              value={formData.farmSize}
              onChange={e => setFormData(p => ({ ...p, farmSize: e.target.value }))}
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel>Soil Type <RequiredMark /></FieldLabel>
            <div className="relative">
              <select
                required
                value={formData.soilType}
                onChange={e => setFormData(p => ({ ...p, soilType: e.target.value as SoilType }))}
                className={`${inputClasses} appearance-none cursor-pointer`}
              >
                <option value="LOAMY">Loamy – High Organic Content</option>
                <option value="SANDY">Sandy – High Drainage</option>
                <option value="CLAY">Clay – Water Retentive</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <FieldLabel>Environment Type <RequiredMark /></FieldLabel>
            <div className="flex border border-slate-300 rounded overflow-hidden">
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, environmentType: 'OPEN_FIELD' }))}
                className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  formData.environmentType === 'OPEN_FIELD'
                    ? 'bg-blue-700 text-white'
                    : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                Open Field
              </button>
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, environmentType: 'INDOOR' }))}
                className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest border-l border-slate-300 transition-colors ${
                  formData.environmentType === 'INDOOR'
                    ? 'bg-blue-700 text-white border-l-blue-700'
                    : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                Indoor / Greenhouse
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Cultivation Schedule */}
      <div className="border-x border-b border-slate-200">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Section B</span>
          <span className="text-slate-300 text-xs">—</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700">Cultivation Schedule</span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5 bg-white">
          <div>
            <FieldLabel>Sowing Date <RequiredMark /></FieldLabel>
            <input
              type="date" required
              value={formData.sowingDate}
              onChange={e => setFormData(p => ({ ...p, sowingDate: e.target.value }))}
              className={inputClasses}
            />
          </div>
          <div>
            <FieldLabel>Expected Harvest Date <RequiredMark /></FieldLabel>
            <input
              type="date" required
              value={formData.expectedHarvestDate}
              onChange={e => setFormData(p => ({ ...p, expectedHarvestDate: e.target.value }))}
              className={inputClasses}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Location */}
      <div className="border-x border-b border-slate-200">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Section C</span>
          <span className="text-slate-300 text-xs">—</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700">Geospatial Location</span>
        </div>
        <div className="p-5 space-y-5 bg-white">
          <div>
            <FieldLabel>Full Address <RequiredMark /></FieldLabel>
            <input
              type="text" required
              placeholder="Village, Block, District"
              value={formData.location.address}
              onChange={e => setFormData(p => ({ ...p, location: { ...p.location, address: e.target.value } }))}
              className={inputClasses}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <FieldLabel>State <RequiredMark /></FieldLabel>
              <input
                type="text" required placeholder="e.g. Telangana"
                value={formData.location.state}
                onChange={e => setFormData(p => ({ ...p, location: { ...p.location, state: e.target.value } }))}
                className={inputClasses}
              />
            </div>
            <div>
              <FieldLabel>District <RequiredMark /></FieldLabel>
              <input
                type="text" required placeholder="e.g. Nalgonda"
                value={formData.location.district}
                onChange={e => setFormData(p => ({ ...p, location: { ...p.location, district: e.target.value } }))}
                className={inputClasses}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <FieldLabel>Latitude <RequiredMark /></FieldLabel>
              <input
                type="number" step="any" required placeholder="0.000000"
                value={formData.location.lat}
                onChange={e => setFormData(p => ({ ...p, location: { ...p.location, lat: e.target.value } }))}
                className={inputClasses}
              />
            </div>
            <div>
              <FieldLabel>Longitude <RequiredMark /></FieldLabel>
              <input
                type="number" step="any" required placeholder="0.000000"
                value={formData.location.lng}
                onChange={e => setFormData(p => ({ ...p, location: { ...p.location, lng: e.target.value } }))}
                className={inputClasses}
              />
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={fetchLocation}
              disabled={isFetchingLocation}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:border-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all disabled:opacity-50"
            >
              {isFetchingLocation ? (
                <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <Navigation size={13} />
              )}
              Auto-Detect GPS Coordinates
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Field Photo */}
      <div className="border-x border-b border-slate-200 rounded-b">
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Section D</span>
          <span className="text-slate-300 text-xs">—</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700">Field Photograph <RequiredMark /></span>
        </div>
        <div className="p-5 bg-white">
          <div className="flex items-start gap-6">
            <div className={`relative h-28 w-40 border-2 border-dashed rounded flex items-center justify-center overflow-hidden shrink-0 bg-slate-50 ${imagePreview ? 'border-blue-400' : 'border-slate-300 hover:border-blue-400'} transition-colors`}>
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1.5 right-1.5 p-1 bg-white border border-slate-300 rounded text-slate-600 hover:bg-red-50 hover:border-red-400 hover:text-red-600 transition-all"
                  >
                    <X size={11} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-slate-300">
                  <ImageIcon size={22} />
                  <span className="text-[9px] font-bold uppercase tracking-widest">No file</span>
                </div>
              )}
            </div>
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-slate-700">Upload Field Photograph</p>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs">
                Attach a clear photograph of the field for official records and visual verification. Max size: 5MB.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:border-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all mt-1"
              >
                <Plus size={13} />
                {imagePreview ? 'Replace Photo' : 'Choose File'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </div>
          </div>
        </div>
      </div>

      {/* Edit-only: Crop Stage & Actual Harvest */}
      {initialData && (
        <div className="border-x border-b border-slate-200 rounded-b mt-0">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">Section E</span>
            <span className="text-slate-300 text-xs">—</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-700">Harvest Record</span>
          </div>
          <div className="p-5 grid grid-cols-2 gap-5 bg-white">
            <div>
              <FieldLabel>Crop Stage <RequiredMark /></FieldLabel>
              <div className="relative">
                <select
                  required value={formData.cropStage}
                  onChange={e => setFormData(p => ({ ...p, cropStage: e.target.value as CropStage }))}
                  className={`${inputClasses} appearance-none cursor-pointer`}
                >
                  <option value="SOWED">Sowed</option>
                  <option value="GROWING">Growing</option>
                  <option value="HARVEST_READY">Harvest Ready</option>
                  <option value="HARVESTED">Harvested</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <FieldLabel>Actual Harvest Date <RequiredMark /></FieldLabel>
              <input
                type="date" required
                value={formData.actualHarvestDate}
                onChange={e => setFormData(p => ({ ...p, actualHarvestDate: e.target.value }))}
                className={inputClasses}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer: Action Buttons */}
      <div className="flex items-center justify-between pt-6">
        <p className="text-[10px] text-slate-400 font-medium">
          <span className="text-red-600 font-bold">*</span> All marked fields are mandatory
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-slate-300 rounded text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-700 text-white rounded text-[11px] font-bold uppercase tracking-widest hover:bg-blue-800 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {initialData ? 'Update Record' : 'Register Plot'}
          </button>
        </div>
      </div>
    </form>
  );
};
