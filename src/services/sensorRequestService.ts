import api from './api';
import type { SensorRequest, SensorType } from '@/types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const sensorRequestService = {
  createRequests: async (payload: { plotId: string; sensorTypes: SensorType[] }): Promise<ApiResponse<SensorRequest[]>> => {
    const { data } = await api.post('/sensor-requests', payload);
    return data;
  },

  getByPlot: async (plotId: string): Promise<ApiResponse<SensorRequest[]>> => {
    const { data } = await api.get(`/plots/${plotId}/sensor-requests`);
    return data;
  },

  cancelRequest: async (requestId: string): Promise<ApiResponse<void>> => {
    const { data } = await api.delete(`/sensor-requests/${requestId}`);
    return data;
  },

  getAll: async (): Promise<ApiResponse<SensorRequest[]>> => {
    const { data } = await api.get('/admin/sensor-requests');
    return data;
  },

  resolveRequest: async (requestId: string, payload: { status: 'APPROVED' | 'REJECTED'; adminNote?: string }): Promise<ApiResponse<SensorRequest>> => {
    const { data } = await api.put(`/admin/sensor-requests/${requestId}/resolve`, payload);
    return data;
  },
};

export default sensorRequestService;
