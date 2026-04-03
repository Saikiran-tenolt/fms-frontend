import React from 'react';
import { Droplets, Thermometer, Cloud, Radio } from 'lucide-react';
import styles from './SensorMetricCards.module.css';

interface Metric {
  type: 'soilMoisture' | 'temperature' | 'humidity' | 'soilTemperature';
  value: number;
  unit: string;
  status: 'ok' | 'warning' | 'critical';
  lastUpdated: string;
}

interface SensorMetricCardsProps {
  metrics: Metric[];
}

const statusMap = {
  ok: { 
    label: 'Optimal', 
    colorClass: styles.colorOptimal, 
    strokeClass: styles.strokeOptimal, 
    bgClass: styles.bgOptimal 
  },
  warning: { 
    label: 'Warning', 
    colorClass: styles.colorWarning, 
    strokeClass: styles.strokeWarning, 
    bgClass: styles.bgWarning 
  },
  critical: { 
    label: 'Critical', 
    colorClass: styles.colorCritical, 
    strokeClass: styles.strokeCritical, 
    bgClass: styles.bgCritical 
  },
};

const iconMap = {
  soilMoisture: Droplets,
  temperature: Thermometer,
  humidity: Cloud,
  soilTemperature: Radio,
};

const labelMap = {
  soilMoisture: 'Soil Moisture',
  temperature: 'Temperature',
  humidity: 'Humidity',
  soilTemperature: 'Soil Temp',
};

const CircularProgress: React.FC<{ value: number; size: number; strokeWidth: number; className: string }> = ({
  value,
  size,
  strokeWidth,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={styles.ringWrapper}>
      <svg className={styles.ringSvg} height={size} width={size}>
        <circle
          className={styles.ringBg}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className={`${styles.ringFill} ${className}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
  );
};

export const SensorMetricCards: React.FC<SensorMetricCardsProps> = ({ metrics }) => {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {metrics.map((metric) => {
          const Icon = iconMap[metric.type];
          const statusInfo = statusMap[metric.status];
          const labels = labelMap[metric.type];
          
          // For temperature: normalize (0-50 deg), for moisture/humidity (0-100 deg)
          const ringValue = metric.unit === '%' ? metric.value : (metric.value / 50) * 100;

          return (
            <div key={metric.type} className={styles.card}>
              {/* Vertical Status Indicator Strip */}
              <div className={`${styles.statusStrip} ${statusInfo.bgClass}`} />
              
              {/* Header */}
              <div className={styles.topSection}>
                <div className={styles.iconLabel}>
                  <Icon size={18} className={statusInfo.colorClass} />
                  <span className={styles.label}>{labels}</span>
                </div>
                <span className={styles.timestamp}>{metric.lastUpdated}</span>
              </div>

              {/* Main Metric Section */}
              <div className={styles.metricSection}>
                <div className={styles.valueWrapper}>
                  <span className={styles.value}>{metric.value}</span>
                  <span className={styles.unit}>{metric.unit}</span>
                </div>
                
                {/* Circular Progress (96px) */}
                <CircularProgress 
                  value={Math.min(Math.max(ringValue, 0), 100)} 
                  size={96} 
                  strokeWidth={8}
                  className={statusInfo.strokeClass}
                />
              </div>

              {/* Status Footer Text */}
              <div className={`${styles.statusText} ${statusInfo.colorClass}`}>
                {statusInfo.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
