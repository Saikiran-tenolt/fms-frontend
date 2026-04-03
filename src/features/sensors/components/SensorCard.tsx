import React, { ReactNode } from 'react';
import styles from './SensorCard.module.css';

interface SensorCardProps {
  type: string;
  value: number;
  unit: string;
  status: 'critical' | 'optimal' | 'normal';
  icon: ReactNode;
  lastUpdated: string;
}

const statusMap = {
  critical: {
    border: styles.criticalBorder,
    badge: styles.badgeCritical,
    fill: styles.fillCritical,
    icon: styles.iconCritical,
    label: 'Needs Watering'
  },
  optimal: {
    border: styles.optimalBorder,
    badge: styles.badgeOptimal,
    fill: styles.fillOptimal,
    icon: styles.iconDefault,
    label: 'Optimal'
  },
  normal: {
    border: styles.normalBorder,
    badge: styles.badgeNormal,
    fill: styles.fillNormal,
    icon: styles.iconDefault,
    label: 'Normal'
  },
};

export const SensorCard: React.FC<SensorCardProps> = ({
  type,
  value,
  unit,
  status,
  icon,
  lastUpdated,
}) => {
  const currentStatus = statusMap[status];
  
  // Normalization for micro-bar
  const fillPercentage = unit === '%' ? value : (value / 50) * 100;

  return (
    <div className={styles.card} aria-label={`${type} metric card`}>
      {/* 4px LEFT border status indicator */}
      <div className={`${styles.leftBorder} ${currentStatus.border}`} />

      {/* Top Header: Icon, Label, Timestamp */}
      <div className={styles.topSection}>
        <div className={styles.iconLabel}>
          <div className={currentStatus.icon} style={{ width: 16, height: 16, display: 'flex' }}>
            {/* Clone icon to set custom size if it's a Lucide icon */}
            {React.isValidElement(icon) ? React.cloneElement(icon as any, { size: 16 }) : icon}
          </div>
          <span className={styles.label}>{type}</span>
        </div>
        <span className={styles.timestamp}>{lastUpdated}</span>
      </div>

      {/* Main Value and Unit */}
      <div className={styles.metricSection}>
        <span className={styles.value}>{value}</span>
        <span className={styles.unit}>{unit}</span>
      </div>

      {/* Status Badge: Tight spacing below value */}
      <div>
        <div className={`${styles.statusBadge} ${currentStatus.badge}`}>
          {currentStatus.label}
        </div>
      </div>

      {/* Micro-Bar: 2px thin horizontal line at the bottom */}
      <div className={styles.microBarTrack}>
        <div 
          className={`${styles.microBarFill} ${currentStatus.fill}`} 
          style={{ width: `${Math.min(Math.max(fillPercentage, 0), 100)}%` }} 
        />
      </div>
    </div>
  );
};
