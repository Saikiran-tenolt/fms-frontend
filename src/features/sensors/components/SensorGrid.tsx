import React from 'react';
import { Droplets, Thermometer, Cloud, Radio } from 'lucide-react';
import { SensorCard } from './SensorCard';
import styles from './SensorCard.module.css';

interface SensorGridProps {
  data: {
    soilMoisture?: { value: number; unit: string; lastUpdated?: string };
    temperature?: { value: number; unit: string; lastUpdated?: string };
    humidity?: { value: number; unit: string; lastUpdated?: string };
    soilTemperature?: { value: number; unit: string; lastUpdated?: string };
  };
}

export const SensorGrid: React.FC<SensorGridProps> = ({ data }) => {
  const getMoistureStatus = (val: number): 'critical' | 'optimal' | 'normal' => {
    if (val < 30) return 'critical';
    if (val <= 70) return 'optimal';
    return 'normal';
  };

  const getTemperatureStatus = (val: number): 'critical' | 'optimal' | 'normal' => {
    if (val >= 18 && val <= 28) return 'optimal';
    return 'normal';
  };

  const getHumidityStatus = (val: number): 'critical' | 'optimal' | 'normal' => {
    if (val >= 40 && val <= 70) return 'normal';
    return 'optimal';
  };

  const getSoilTempStatus = (val: number): 'critical' | 'optimal' | 'normal' => {
    if (val >= 18 && val <= 26) return 'optimal';
    return 'normal';
  };

  const metrics = [
    {
      type: 'Soil Moisture',
      value: data.soilMoisture?.value || 0,
      unit: '%',
      status: getMoistureStatus(data.soilMoisture?.value || 0),
      icon: <Droplets />,
      lastUpdated: data.soilMoisture?.lastUpdated || 'Just now'
    },
    {
      type: 'Temperature',
      value: data.temperature?.value || 0,
      unit: '°C',
      status: getTemperatureStatus(data.temperature?.value || 0),
      icon: <Thermometer />,
      lastUpdated: data.temperature?.lastUpdated || '2 mins ago'
    },
    {
      type: 'Humidity',
      value: data.humidity?.value || 0,
      unit: '%',
      status: getHumidityStatus(data.humidity?.value || 0),
      icon: <Cloud />,
      lastUpdated: data.humidity?.lastUpdated || 'Just now'
    },
    {
      type: 'Soil Temp',
      value: data.soilTemperature?.value || 0,
      unit: '°C',
      status: getSoilTempStatus(data.soilTemperature?.value || 0),
      icon: <Radio />,
      lastUpdated: data.soilTemperature?.lastUpdated || '5 mins ago'
    }
  ];

  return (
    <div className={styles.gridContainer}>
      {metrics.map((m) => (
        <SensorCard
          key={m.type}
          type={m.type}
          value={m.value}
          unit={m.unit}
          status={m.status}
          icon={m.icon}
          lastUpdated={m.lastUpdated}
        />
      ))}
    </div>
  );
};
