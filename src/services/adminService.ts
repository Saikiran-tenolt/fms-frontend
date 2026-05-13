import api from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

// Backend may return array directly OR { success, data: [] } — handle both
const toList = (d: any): { success: boolean; data: any[] } => {
  if (Array.isArray(d)) return { success: true, data: d };
  return { success: d.success ?? true, data: d.data ?? d };
};

// ─── Service ──────────────────────────────────────────────────────────────────

const adminService = {

  // 1. POST /admin/login  →  { success: true, token: "jwt_admin_token" }
  login: async (payload: AdminLoginPayload): Promise<AdminLoginResponse> => {
    const res = await api.post('admin/login', payload);
    return res.data;
  },

  // 2. GET /admin/all-plots  (Authorization: Bearer <ADMIN_TOKEN>)
  getAllPlots: async () => toList((await api.get('/admin/all-plots')).data),

  // 3. GET /admin/sensor-requests
  getSensorRequests: async () => toList((await api.get('/admin/sensor-requests')).data),

  // 4. PATCH /admin/sensor-requests/:id  →  { success, message }
  updateSensorRequest: async (
    id: string,
    status: string
  ): Promise<{ success: boolean; message?: string }> => {
    const res = await api.patch(`/admin/sensor-requests/${id}`, { status });
    return res.data;
  },

  // 5. POST /admin/sensor-types  →  { success, data }
  createSensorType: async (payload: {
    name: string;
    key: string;
    supportedSiteTypes: string[];
  }): Promise<{ success: boolean; data?: any }> => {
    const res = await api.post('/admin/sensor-types', payload);
    return res.data;
  },

  // 6. GET /admin/sensor-types
  getSensorTypes: async () => toList((await api.get('/admin/sensor-types')).data),

  // 7. POST /admin/sensor-parameters
  createSensorParameter: async (payload: {
    displayName: string;
    parameterKey: string;
    unit: string;
    sensorTypeId: string;
    minValue: number;
    maxValue: number;
    description?: string;
  }): Promise<{ success: boolean; data?: any }> => {
    const res = await api.post('/admin/sensor-parameters', payload);
    return res.data;
  },

  // 8. GET /admin/sensor-parameters
  getSensorParameters: async () => toList((await api.get('/admin/sensor-parameters')).data),

  // 9. POST /admin/sensor-mappings
  createSensorMapping: async (payload: {
    sensorType: string;
    parameterKey: string;
  }): Promise<{ success: boolean; data?: any }> => {
    const res = await api.post('/admin/sensor-mappings', payload);
    return res.data;
  },

  // 10. GET /admin/sensor-mappings
  getSensorMappings: async () => toList((await api.get('/admin/sensor-mappings')).data),
};

export default adminService;