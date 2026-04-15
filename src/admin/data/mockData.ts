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
  { 
    id: '1', name: 'Ramesh Kumar', village: 'Palakurthi', farmSize: '2.5 Acres', cropType: 'Paddy',
    phone: '+91 98765 43210', joinDate: '12 Jan 2022', status: 'Active', yieldAverage: '22 Quintals/Acre',
    cropHistory: [
      { season: 'Kharif 2023', crop: 'Paddy', yield: '52 Quintals', revenue: '₹1,14,000', rating: 'Excellent' },
      { season: 'Rabi 2022-23', crop: 'Maize', yield: '30 Quintals', revenue: '₹65,000', rating: 'Good' },
      { season: 'Kharif 2022', crop: 'Paddy', yield: '48 Quintals', revenue: '₹1,05,000', rating: 'Good' }
    ]
  },
  { 
    id: '2', name: 'Srinivas Rao', village: 'Devaruppula', farmSize: '4.0 Acres', cropType: 'Cotton',
    phone: '+91 87654 32109', joinDate: '04 Mar 2021', status: 'Active', yieldAverage: '8 Quintals/Acre',
    cropHistory: [
      { season: 'Kharif 2023', crop: 'Cotton', yield: '30 Quintals', revenue: '₹2,10,000', rating: 'Excellent' },
      { season: 'Rabi 2022-23', crop: 'Groundnut', yield: '25 Quintals', revenue: '₹1,20,000', rating: 'Average' },
      { season: 'Kharif 2022', crop: 'Cotton', yield: '28 Quintals', revenue: '₹1,95,000', rating: 'Good' }
    ]
  },
  { 
    id: '3', name: 'Venkatesh Yadav', village: 'Kodakandla', farmSize: '1.5 Acres', cropType: 'Maize',
    phone: '+91 76543 21098', joinDate: '18 Jul 2023', status: 'Under Review', yieldAverage: '15 Quintals/Acre',
    cropHistory: [
      { season: 'Kharif 2023', crop: 'Maize', yield: '22 Quintals', revenue: '₹48,000', rating: 'Average' },
      { season: 'Rabi 2022-23', crop: 'Wheat', yield: '18 Quintals', revenue: '₹38,000', rating: 'Poor' }
    ]
  },
  { 
    id: '4', name: 'Lakshmi Narayana', village: 'Palakurthi', farmSize: '5.2 Acres', cropType: 'Paddy',
    phone: '+91 99887 76655', joinDate: '09 Nov 2020', status: 'Active', yieldAverage: '24 Quintals/Acre',
    cropHistory: [
      { season: 'Kharif 2023', crop: 'Paddy', yield: '120 Quintals', revenue: '₹2,65,000', rating: 'Outstanding' },
      { season: 'Rabi 2022-23', crop: 'Black Gram', yield: '15 Quintals', revenue: '₹95,000', rating: 'Good' },
      { season: 'Kharif 2022', crop: 'Paddy', yield: '115 Quintals', revenue: '₹2,50,000', rating: 'Excellent' }
    ]
  },
  { 
    id: '5', name: 'Narsimha Reddy', village: 'Devaruppula', farmSize: '3.0 Acres', cropType: 'Chilli',
    phone: '+91 88776 65544', joinDate: '25 May 2022', status: 'Active', yieldAverage: '12 Quintals/Acre',
    cropHistory: [
      { season: 'Kharif 2023', crop: 'Chilli', yield: '35 Quintals', revenue: '₹3,50,000', rating: 'Excellent' },
      { season: 'Rabi 2022-23', crop: 'Cotton', yield: '20 Quintals', revenue: '₹1,40,000', rating: 'Average' }
    ]
  },
];

export const sensorStatusData = [
  { id: 'SEN-001', block: 'North Block', crop: 'Paddy', status: 'OK', moisture: '48%', lastUpdated: '10 mins ago' },
  { id: 'SEN-002', block: 'South Block', crop: 'Wheat', status: 'Low', moisture: '22%', lastUpdated: '5 mins ago' },
  { id: 'SEN-003', block: 'East Block', crop: 'Paddy', status: 'High', moisture: '75%', lastUpdated: '12 mins ago' },
  { id: 'SEN-004', block: 'West Block', crop: 'Corn', status: 'OK', moisture: '51%', lastUpdated: '2 mins ago' },
  { id: 'SEN-005', block: 'Central', crop: 'Paddy', status: 'OK', moisture: '45%', lastUpdated: 'Just now' },
];

export const farmerCountByDistrict = [
  { name: 'Warangal', farmers: 1250 },
  { name: 'Karimnagar', farmers: 850 },
  { name: 'Nizamabad', farmers: 1100 },
  { name: 'Khammam', farmers: 650 },
  { name: 'Adilabad', farmers: 435 },
];

export const paddyCultivationStats = [
  { month: 'Jan', area: 10200 },
  { month: 'Feb', area: 11500 },
  { month: 'Mar', area: 12100 },
  { month: 'Apr', area: 12450 },
  { month: 'May', area: 12800 },
];
