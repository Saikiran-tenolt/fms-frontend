import React, { useState, useEffect, useRef } from 'react';
import { 
  Layers, MapPin, Calendar, Info, 
  Map as MapIcon, Globe, Warehouse, 
  Navigation, Save, Camera, X, Image as ImageIcon, Plus, ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import type { SoilType, EnvironmentType, Plot, CropStage, CropType } from '../../../types';

interface PlotFormProps {
  initialData?: Plot;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

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
      lng: ''
    },
    cropStage: 'SOWED' as CropStage,
    actualHarvestDate: '',
    imageUrl: ''
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          lng: ((initialData.location as any).coordinates?.coordinates?.[0] ?? initialData.location.lng ?? '').toString()
        },
        cropStage: initialData.cropStage || 'SOWED',
        actualHarvestDate: initialData.actualHarvestDate ? initialData.actualHarvestDate.split('T')[0] : '',
        imageUrl: initialData.imageUrl || ''
      });
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
    }
  }, [initialData]);

  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6)
          }
        }));
        setIsFetchingLocation(false);
        toast.success("Location coordinates synchronized");
      },
      (error) => {
        toast.error(`Location sync failed: ${error.message}`);
        setIsFetchingLocation(false);
      }
    );
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, imageUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const latNum = parseFloat(formData.location.lat) || 0;
    const lngNum = parseFloat(formData.location.lng) || 0;

    // Prepare API payload (Constructed strictly based on backend allowed fields)
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
        coordinates: {
          type: 'Point',
          coordinates: [lngNum, latNum]
        }
      },
      cropStage: formData.cropStage,
      cropType: 'PADDY' as CropType,
      imageUrl: formData.imageUrl
    };

    if (formData.expectedHarvestDate) {
      payload.expectedHarvestDate = new Date(formData.expectedHarvestDate).toISOString();
    } else {
      payload.expectedHarvestDate = null;
    }
    
    if (formData.actualHarvestDate) {
      payload.actualHarvestDate = new Date(formData.actualHarvestDate).toISOString();
    } else {
      payload.actualHarvestDate = null;
    }

    // Note: plotService.ts will handle stripping imageUrl for the final API call
    onSubmit(payload);
  };

  const inputClasses = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all text-sm font-medium placeholder:text-slate-300";
  const labelClasses = "text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 mb-1.5 ml-1";

  return (
    <form onSubmit={handleFormSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* section: General Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-1">
             <label className={labelClasses}><Layers size={12} className="text-emerald-500" /> Plot Identification</label>
             <input
               type="text"
               required
               placeholder="e.g. Green Valley - Sector A"
               value={formData.plotName}
               onChange={(e) => setFormData(p => ({ ...p, plotName: e.target.value }))}
               className={inputClasses}
             />
          </div>
          <div className="space-y-1">
             <label className={labelClasses}><MapPin size={12} className="text-emerald-500" /> Farm Size (Ha)</label>
             <input
               type="number"
               step="any"
               required
               placeholder="e.g. 3.5"
               value={formData.farmSize}
               onChange={(e) => setFormData(p => ({ ...p, farmSize: e.target.value }))}
               className={inputClasses}
             />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
             <label className={labelClasses}><Info size={12} className="text-emerald-500" /> Soil Topology</label>
             <select
               value={formData.soilType}
               onChange={(e) => setFormData(p => ({ ...p, soilType: e.target.value as SoilType }))}
               className={`${inputClasses} appearance-none cursor-pointer`}
             >
               <option value="LOAMY">Loamy (High Organic)</option>
               <option value="SANDY">Sandy (High Drainage)</option>
               <option value="CLAY">Clay (Water Retentive)</option>
             </select>
          </div>
          <div className="space-y-1">
             <label className={labelClasses}><Globe size={12} className="text-emerald-500" /> Environment</label>
             <div className="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, environmentType: 'OPEN_FIELD' }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
                    formData.environmentType === 'OPEN_FIELD' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Globe size={14} /> Open Field
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, environmentType: 'INDOOR' }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
                    formData.environmentType === 'INDOOR' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Warehouse size={14} /> Indoor
                </button>
             </div>
          </div>
        </div>
      </div>
      
      {initialData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
           <div className="space-y-1">
             <label className={labelClasses}>Crop Stage</label>
             <div className="relative">
               <select
                 value={formData.cropStage}
                 onChange={(e) => setFormData(p => ({ ...p, cropStage: e.target.value as CropStage }))}
                 className={inputClasses}
               >
                 <option value="SOWED">Sowed</option>
                 <option value="GROWING">Growing</option>
                 <option value="HARVEST_READY">Harvest Ready</option>
                 <option value="HARVESTED">Harvested</option>
               </select>
               <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
             </div>
           </div>
           <div className="space-y-1">
             <label className={labelClasses}>Actual Harvest Date</label>
             <input
               type="date"
               value={formData.actualHarvestDate}
               onChange={(e) => setFormData(p => ({ ...p, actualHarvestDate: e.target.value }))}
               className={inputClasses}
             />
           </div>
        </div>
      )}

      {/* section: Image Upload (Reference: Assistant module) */}
      <div className="pt-4 border-t border-slate-100">
         <label className={labelClasses}><Camera size={12} className="text-emerald-500" /> Farm Asset Photo</label>
         <div className="mt-4 flex flex-col sm:flex-row items-center gap-8">
            <div className={`relative h-32 w-48 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center overflow-hidden bg-slate-50 ${imagePreview ? 'border-emerald-500/30' : 'border-slate-200 hover:border-emerald-400'}`}>
               {imagePreview ? (
                 <>
                   <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                   <button
                     type="button"
                     onClick={handleRemoveImage}
                     className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-full hover:bg-rose-500 transition-all backdrop-blur-sm"
                   >
                     <X size={12} />
                   </button>
                 </>
               ) : (
                 <div className="flex flex-col items-center gap-2 text-slate-400">
                   <ImageIcon size={24} className="opacity-20" />
                   <span className="text-[9px] font-bold uppercase tracking-widest">No Visual Set</span>
                 </div>
               )}
            </div>

            <div className="flex-1 space-y-3 text-center sm:text-left">
               <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">Environmental Snapshot</p>
               <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                 Attach a high-resolution photo of your field for visual verification and growth records.
               </p>
               <button
                 type="button"
                 onClick={() => fileInputRef.current?.click()}
                 className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-emerald-600 hover:text-emerald-600 transition-all"
               >
                 <Plus size={14} /> {imagePreview ? 'Replace Photo' : 'Upload Visual'}
               </button>
               <input
                 ref={fileInputRef}
                 type="file"
                 accept="image/*"
                 onChange={handleImageSelect}
                 className="hidden"
               />
            </div>
         </div>
      </div>

      {/* section: Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
        <div className="space-y-1">
           <label className={labelClasses}><Calendar size={12} className="text-emerald-500" /> Sowing Date</label>
           <input
             type="date"
             required
             value={formData.sowingDate}
             onChange={(e) => setFormData(p => ({ ...p, sowingDate: e.target.value }))}
             className={inputClasses}
           />
        </div>
        <div className="space-y-1">
           <label className={labelClasses}><Calendar size={12} className="text-slate-300" /> Expected Harvest (Optional)</label>
           <input
             type="date"
             value={formData.expectedHarvestDate}
             onChange={(e) => setFormData(p => ({ ...p, expectedHarvestDate: e.target.value }))}
             className={inputClasses}
           />
        </div>
      </div>

      {/* section: Geospatial */}
      <div className="space-y-6 pt-4 border-t border-slate-100">
        <div className="space-y-1">
           <label className={labelClasses}><MapIcon size={12} className="text-emerald-500" /> Physical Address</label>
           <input
             type="text"
             required
             placeholder="e.g. Village North, Block B, District West"
             value={formData.location.address || ''}
             onChange={(e) => setFormData(p => ({ ...p, location: { ...p.location, address: e.target.value } }))}
             className={inputClasses}
           />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="space-y-1">
             <label className={labelClasses}>State</label>
             <input
               type="text"
               required
               placeholder="e.g. Telangana"
               value={formData.location.state || ''}
               onChange={(e) => setFormData(p => ({ ...p, location: { ...p.location, state: e.target.value } }))}
               className={inputClasses}
             />
           </div>
           <div className="space-y-1">
             <label className={labelClasses}>District</label>
             <input
               type="text"
               required
               placeholder="e.g. Hyderabad"
               value={formData.location.district || ''}
               onChange={(e) => setFormData(p => ({ ...p, location: { ...p.location, district: e.target.value } }))}
               className={inputClasses}
             />
           </div>
         </div>
        
        <div className="flex flex-col sm:row items-end gap-6">
          <div className="grid grid-cols-2 gap-4 flex-1 w-full">
            <div className="space-y-1">
              <label className={labelClasses}>Latitude</label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.0000"
                value={formData.location.lat}
                onChange={(e) => setFormData(p => ({ ...p, location: { ...p.location, lat: e.target.value } }))}
                className={inputClasses}
              />
            </div>
            <div className="space-y-1">
              <label className={labelClasses}>Longitude</label>
              <input
                type="number"
                step="any"
                required
                placeholder="0.0000"
                value={formData.location.lng}
                onChange={(e) => setFormData(p => ({ ...p, location: { ...p.location, lng: e.target.value } }))}
                className={inputClasses}
              />
            </div>
          </div>
          
          <button
            type="button"
            onClick={fetchLocation}
            disabled={isFetchingLocation}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {isFetchingLocation ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Navigation size={14} />
            )}
            Sync GPS
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-end gap-4 pt-10 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-3.5 text-slate-400 hover:text-slate-900 text-[10px] font-black uppercase tracking-widest transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-3 px-10 py-3.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
             <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save size={14} />
              {initialData ? 'Update Intelligence' : 'Deploy Asset'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};
