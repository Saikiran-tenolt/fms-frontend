export const harvestReadinessData = [
  { name: 'Jan', ready: 150, approaching: 200, notReady: 50 },
  { name: 'Feb', ready: 180, approaching: 210, notReady: 70 },
  { name: 'Mar', ready: 220, approaching: 180, notReady: 90 },
  { name: 'Apr', ready: 280, approaching: 150, notReady: 120 },
  { name: 'May', ready: 350, approaching: 100, notReady: 80 },
];

export const soilMoistureData = [
  { name: 'Optimal / OK', value: 72, fill: '#10b981' }, // Emerald-500
  { name: 'High Moisture', value: 18, fill: '#3b82f6' }, // Blue-500
  { name: 'Low / Critical', value: 10, fill: '#ef4444' }, // Red-500
];

export const recentFarmersData = [
  { id: '1', name: 'Ramesh Kumar', village: 'Palakurthi', farmSize: '2.5 Acres', cropType: 'Paddy' },
  { id: '2', name: 'Srinivas Rao', village: 'Devaruppula', farmSize: '4.0 Acres', cropType: 'Cotton' },
  { id: '3', name: 'Venkatesh Yadav', village: 'Kodakandla', farmSize: '1.5 Acres', cropType: 'Maize' },
  { id: '4', name: 'Lakshmi Narayana', village: 'Palakurthi', farmSize: '5.2 Acres', cropType: 'Paddy' },
  { id: '5', name: 'Narsimha Reddy', village: 'Devaruppula', farmSize: '3.0 Acres', cropType: 'Chilli' },
];

export const sensorStatusData = [
  { id: 'SEN-001', block: 'North Block', crop: 'Paddy', status: 'OK', moisture: '48%', lastUpdated: '10 mins ago' },
  { id: 'SEN-002', block: 'South Block', crop: 'Wheat', status: 'Low', moisture: '22%', lastUpdated: '5 mins ago' },
  { id: 'SEN-003', block: 'East Block', crop: 'Paddy', status: 'High', moisture: '75%', lastUpdated: '12 mins ago' },
  { id: 'SEN-004', block: 'West Block', crop: 'Corn', status: 'OK', moisture: '51%', lastUpdated: '2 mins ago' },
  { id: 'SEN-005', block: 'Central', crop: 'Paddy', status: 'OK', moisture: '45%', lastUpdated: 'Just now' },
];
