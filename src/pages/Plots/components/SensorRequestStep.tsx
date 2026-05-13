import React from 'react';
import { SensorType } from '@/types';

interface SensorRequestStepProps {
  selected: SensorType[];
  onChange: (sensors: SensorType[]) => void;
  environmentType: string;
  isEditMode: boolean;
}

const SENSOR_CATALOGUE = [
  { type: 'Temperature Sensor', name: 'Temperature Sensor', desc: 'Ambient temperature monitoring.', outdoorOnly: false },
  { type: 'Soil Temperature Sensor', name: 'Soil Temperature Sensor', desc: 'Soil temperature monitoring.', outdoorOnly: true },
  { type: 'Soil Moisture Sensor', name: 'Soil Moisture Sensor', desc: 'Volumetric water content in soil.', outdoorOnly: true },
  { type: 'Humidity Sensor', name: 'Humidity Sensor', desc: 'Relative humidity monitoring.', outdoorOnly: false },
];

export const SensorRequestStep: React.FC<SensorRequestStepProps> = ({
  selected,
  onChange,
  environmentType,
  isEditMode,
}) => {
  if (isEditMode) return null;

  const toggleSensor = (type: SensorType) => {
    if (selected.includes(type)) {
      onChange(selected.filter((s) => s !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  const availableSensors = SENSOR_CATALOGUE.filter(s => 
    !(s.outdoorOnly && environmentType === 'INDOOR')
  );

  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid #e3e3e0',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 10,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '11px 18px',
        borderBottom: '0.5px solid #e3e3e0',
        background: '#f5f5f3',
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#888780', textTransform: 'uppercase' }}>E</span>
        <div style={{ width: 18, height: '0.5px', background: '#e3e3e0' }} />
        <span style={{ fontSize: 11, fontWeight: 500, color: '#5f5e5a', letterSpacing: '.04em', textTransform: 'uppercase' }}>Sensor Requests (Optional)</span>
      </div>

      <div style={{ padding: 18 }}>
        <p style={{ fontSize: 12, color: '#888780', marginBottom: 14 }}>
          Select sensors to request for this plot. Requests will be sent to the Agricultural Authority for approval.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {availableSensors.map((sensor) => {
            const isSelected = selected.includes(sensor.type as SensorType);
            return (
              <div
                key={sensor.type}
                onClick={() => toggleSensor(sensor.type as SensorType)}
                style={{
                  border: isSelected ? '1.5px solid #3b6d11' : '1px solid #e3e3e0',
                  borderRadius: 8,
                  padding: 12,
                  background: isSelected ? '#f4fae8' : '#fff',
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18' }}>{sensor.name}</span>
                  <div style={{
                    width: 16, height: 16, borderRadius: 4,
                    border: isSelected ? 'none' : '1px solid #d1d5db',
                    background: isSelected ? '#3b6d11' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: '#888780', lineHeight: 1.4 }}>
                  {sensor.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
