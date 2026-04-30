import React, { useState, useEffect, useRef } from 'react';
import { Navigation, X, Image as ImageIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { SoilType, EnvironmentType, Plot, CropStage, CropType } from '../../../types';

interface PlotFormProps {
  initialData?: Plot;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

/* ─── tiny primitives ─────────────────────────────── */
const Req = () => <span style={{ color: '#c0392b', fontWeight: 700 }}>*</span>;

const OptTag = () => (
  <span style={{
    fontSize: 9.5, fontWeight: 500, background: '#f5f5f3',
    border: '0.5px solid #e3e3e0', color: '#888780',
    borderRadius: 4, padding: '1px 5px', textTransform: 'none', letterSpacing: '.02em',
  }}>
    Optional
  </span>
);

/* ─── shared style tokens ─────────────────────────── */
const S = {
  card: {
    background: '#fff',
    border: '0.5px solid #e3e3e0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  } as React.CSSProperties,

  sectionHd: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '11px 18px',
    borderBottom: '0.5px solid #e3e3e0',
    background: '#f5f5f3',
  } as React.CSSProperties,

  sectionBody: {
    padding: 18,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 14,
  } as React.CSSProperties,

  fieldLabel: {
    fontSize: 10.5, fontWeight: 600, color: '#5f5e5a',
    letterSpacing: '.06em', textTransform: 'uppercase' as const,
    display: 'flex', alignItems: 'center', gap: 5,
    marginBottom: 5,
  } as React.CSSProperties,

  input: {
    border: '0.5px solid #e3e3e0', borderRadius: 8,
    background: '#fff', fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: 13, color: '#1a1a18',
    padding: '9px 12px', outline: 'none', width: '100%',
    boxSizing: 'border-box' as const,
    transition: 'border-color .15s, box-shadow .15s',
    appearance: 'none' as const,
  } as React.CSSProperties,
};

/* ─── sub-components ──────────────────────────────── */
const SectionHeader = ({ tag, title }: { tag: string; title: string }) => (
  <div style={S.sectionHd}>
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#888780', textTransform: 'uppercase' }}>{tag}</span>
    <div style={{ width: 18, height: '0.5px', background: '#e3e3e0' }} />
    <span style={{ fontSize: 11, fontWeight: 500, color: '#5f5e5a', letterSpacing: '.04em', textTransform: 'uppercase' }}>{title}</span>
  </div>
);

const FieldHint = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontSize: 10.5, color: '#b4b2a9' }}>{children}</span>
);

/* ─── main component ──────────────────────────────── */
export const PlotForm: React.FC<PlotFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    plotName: '',
    farmSize: '',
    soilType: 'LOAMY' as SoilType,
    environmentType: 'OPEN_FIELD' as EnvironmentType,
    sowingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    location: { address: '', state: '', district: '', lat: '', lng: '' },
    cropStage: 'SOWED' as CropStage,
    actualHarvestDate: '',
    imageUrl: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);
  const [focusedId, setFocusedId] = useState<string | null>(null);

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
        setGpsDetected(true);
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

  /* input style with focus state */
  const inputStyle = (id: string, extra?: React.CSSProperties): React.CSSProperties => ({
    ...S.input,
    borderColor: focusedId === id ? '#93c5fd' : '#e3e3e0',
    boxShadow: focusedId === id ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none',
    ...extra,
  });

  const selectArrow = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888780' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`;

  return (
    <form onSubmit={handleFormSubmit} style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── A: PLOT IDENTITY ─────────────────────────── */}
      <div style={S.card}>
        <SectionHeader tag="A" title="Plot Identity" />
        <div style={S.sectionBody}>

          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={S.fieldLabel}>Plot Name <Req /></div>
              <input
                id="plotName" type="text" required
                placeholder="e.g. Green Valley – Sector A"
                value={formData.plotName}
                onChange={e => setFormData(p => ({ ...p, plotName: e.target.value }))}
                onFocus={() => setFocusedId('plotName')}
                onBlur={() => setFocusedId(null)}
                style={inputStyle('plotName')}
              />
            </div>
            <div>
              <div style={S.fieldLabel}>
                Farm Size&nbsp;<FieldHint>(hectares)</FieldHint>&nbsp;<Req />
              </div>
              <input
                id="farmSize" type="number" step="any" required
                placeholder="e.g. 3.5"
                value={formData.farmSize}
                onChange={e => setFormData(p => ({ ...p, farmSize: e.target.value }))}
                onFocus={() => setFocusedId('farmSize')}
                onBlur={() => setFocusedId(null)}
                style={inputStyle('farmSize')}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={S.fieldLabel}>Soil Type <Req /></div>
              <select
                id="soilType" required
                value={formData.soilType}
                onChange={e => setFormData(p => ({ ...p, soilType: e.target.value as SoilType }))}
                onFocus={() => setFocusedId('soilType')}
                onBlur={() => setFocusedId(null)}
                style={{
                  ...inputStyle('soilType'),
                  backgroundImage: selectArrow,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: 32,
                  cursor: 'pointer',
                }}
              >
                <option value="">Select soil type</option>
                <option value="SANDY">Sandy – Well Draining</option>
                <option value="LOAMY">Loamy – High Organic</option>
                <option value="CLAY">Clay – High Retention</option>
              </select>
            </div>
            <div>
              <div style={S.fieldLabel}>Environment Type <OptTag /></div>
              {/* Toggle group */}
              <div style={{
                display: 'flex',
                border: '0.5px solid #e3e3e0',
                borderRadius: 8,
                overflow: 'hidden',
              }}>
                {(['OPEN_FIELD', 'INDOOR'] as EnvironmentType[]).map((val, i) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, environmentType: val }))}
                    style={{
                      flex: 1,
                      padding: '9px 10px',
                      fontSize: 12.5,
                      fontWeight: 500,
                      cursor: 'pointer',
                      border: 'none',
                      borderLeft: i > 0 ? '0.5px solid #e3e3e0' : 'none',
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      transition: 'background .15s, color .15s',
                      background: formData.environmentType === val ? '#1d4ed8' : '#fff',
                      color: formData.environmentType === val ? '#fff' : '#888780',
                    }}
                  >
                    {val === 'OPEN_FIELD' ? 'Open Field' : 'Greenhouse'}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── B: SCHEDULE ──────────────────────────────── */}
      <div style={S.card}>
        <SectionHeader tag="B" title="Schedule" />
        <div style={S.sectionBody}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={S.fieldLabel}>Sowing Date <Req /></div>
              <input
                id="sowingDate" type="date" required
                value={formData.sowingDate}
                onChange={e => setFormData(p => ({ ...p, sowingDate: e.target.value }))}
                onFocus={() => setFocusedId('sowingDate')}
                onBlur={() => setFocusedId(null)}
                style={inputStyle('sowingDate')}
              />
            </div>
            <div>
              <div style={S.fieldLabel}>Expected Harvest Date <OptTag /></div>
              <input
                id="expectedHarvestDate" type="date"
                value={formData.expectedHarvestDate}
                onChange={e => setFormData(p => ({ ...p, expectedHarvestDate: e.target.value }))}
                onFocus={() => setFocusedId('expectedHarvestDate')}
                onBlur={() => setFocusedId(null)}
                style={inputStyle('expectedHarvestDate')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── C: LOCATION ──────────────────────────────── */}
      <div style={S.card}>
        <SectionHeader tag="C" title="Location" />
        <div style={S.sectionBody}>

          <div>
            <div style={S.fieldLabel}>Address <Req /></div>
            <input
              id="address" type="text" required
              placeholder="Village, Block, District"
              value={formData.location.address}
              onChange={e => setFormData(p => ({ ...p, location: { ...p.location, address: e.target.value } }))}
              onFocus={() => setFocusedId('address')}
              onBlur={() => setFocusedId(null)}
              style={inputStyle('address')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={S.fieldLabel}>State <Req /></div>
              <input
                id="state" type="text" required placeholder="e.g. Telangana"
                value={formData.location.state}
                onChange={e => setFormData(p => ({ ...p, location: { ...p.location, state: e.target.value } }))}
                onFocus={() => setFocusedId('state')}
                onBlur={() => setFocusedId(null)}
                style={inputStyle('state')}
              />
            </div>
            <div>
              <div style={S.fieldLabel}>District <Req /></div>
              <input
                id="district" type="text" required placeholder="e.g. Nalgonda"
                value={formData.location.district}
                onChange={e => setFormData(p => ({ ...p, location: { ...p.location, district: e.target.value } }))}
                onFocus={() => setFocusedId('district')}
                onBlur={() => setFocusedId(null)}
                style={inputStyle('district')}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={S.fieldLabel}>Latitude <Req /></div>
              <input
                id="lat" type="number" step="any" required placeholder="0.000000"
                value={formData.location.lat}
                onChange={e => setFormData(p => ({ ...p, location: { ...p.location, lat: e.target.value } }))}
                onFocus={() => setFocusedId('lat')}
                onBlur={() => setFocusedId(null)}
                style={inputStyle('lat')}
              />
            </div>
            <div>
              <div style={S.fieldLabel}>Longitude <Req /></div>
              <input
                id="lng" type="number" step="any" required placeholder="0.000000"
                value={formData.location.lng}
                onChange={e => setFormData(p => ({ ...p, location: { ...p.location, lng: e.target.value } }))}
                onFocus={() => setFocusedId('lng')}
                onBlur={() => setFocusedId(null)}
                style={inputStyle('lng')}
              />
            </div>
          </div>

          {/* GPS button */}
          <div>
            <button
              type="button"
              onClick={fetchLocation}
              disabled={isFetchingLocation}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                border: gpsDetected ? '0.5px solid #93c5fd' : '0.5px solid #e3e3e0',
                borderRadius: 7,
                background: '#fff',
                padding: '7px 13px',
                fontSize: 12, fontWeight: 500,
                color: gpsDetected ? '#1d4ed8' : '#5f5e5a',
                cursor: isFetchingLocation ? 'not-allowed' : 'pointer',
                opacity: isFetchingLocation ? 0.7 : 1,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                transition: 'border-color .15s, color .15s',
              }}
            >
              {isFetchingLocation ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              ) : gpsDetected ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <Navigation size={13} />
              )}
              {isFetchingLocation ? 'Detecting…' : gpsDetected ? 'GPS Detected' : 'Auto-Detect GPS'}
            </button>
          </div>
        </div>
      </div>

      {/* ── D: FIELD PHOTO ───────────────────────────── */}
      <div style={S.card}>
        <SectionHeader tag="D" title="Field Photograph" />
        <div style={{ ...S.sectionBody }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            <div style={{
              position: 'relative', height: 110, width: 156,
              border: `1.5px dashed ${imagePreview ? '#93c5fd' : '#d1d5db'}`,
              borderRadius: 8, display: 'flex', alignItems: 'center',
              justifyContent: 'center', overflow: 'hidden', flexShrink: 0,
              background: '#f9fafb',
            }}>
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={handleRemoveImage} style={{
                    position: 'absolute', top: 6, right: 6, padding: 4,
                    background: '#fff', border: '0.5px solid #e3e3e0',
                    borderRadius: 5, color: '#5f5e5a', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                  }}>
                    <X size={11} />
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: '#d1d5db' }}>
                  <ImageIcon size={22} />
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>No file</span>
                </div>
              )}
            </div>
            <div style={{ paddingTop: 4 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#1a1a18', marginBottom: 4 }}>Upload Field Photograph</p>
              <p style={{ fontSize: 11, color: '#888780', lineHeight: 1.6, maxWidth: 260, marginBottom: 10 }}>
                Attach a clear photograph of the field for official records. Max size: 5MB.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  border: '0.5px solid #e3e3e0', borderRadius: 7,
                  background: '#fff', padding: '7px 13px',
                  fontSize: 12, fontWeight: 500, color: '#5f5e5a',
                  cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif",
                }}
              >
                <Plus size={13} />
                {imagePreview ? 'Replace Photo' : 'Choose File'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── E: HARVEST RECORD (edit only) ────────────── */}
      {initialData && (
        <div style={S.card}>
          <SectionHeader tag="E" title="Harvest Record" />
          <div style={S.sectionBody}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={S.fieldLabel}>Actual Harvest Date <Req /></div>
                <input
                  id="actualHarvestDate" type="date" required
                  value={formData.actualHarvestDate}
                  onChange={e => setFormData(p => ({ ...p, actualHarvestDate: e.target.value }))}
                  onFocus={() => setFocusedId('actualHarvestDate')}
                  onBlur={() => setFocusedId(null)}
                  style={inputStyle('actualHarvestDate')}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ───────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 6, marginTop: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#b4b2a9' }}>
          <span style={{ color: '#c0392b', fontWeight: 700 }}>*</span> Required
          <div style={{ width: '0.5px', height: 11, background: '#e3e3e0', margin: '0 2px' }} />
          <OptTag /> fields can be updated later
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '8px 18px', fontSize: 13, fontWeight: 500,
              border: '0.5px solid #e3e3e0', borderRadius: 7,
              background: '#fff', color: '#5f5e5a',
              cursor: 'pointer', fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 20px', fontSize: 13, fontWeight: 600,
              border: 'none', borderRadius: 7,
              background: isSubmitting ? '#93c5fd' : '#1d4ed8',
              color: '#fff', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', system-ui, sans-serif",
              transition: 'background .15s',
            }}
          >
            {isSubmitting && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
            )}
            {isSubmitting ? 'Saving…' : initialData ? 'Update Record' : 'Register Plot'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
};
