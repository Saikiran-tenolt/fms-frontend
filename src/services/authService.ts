import api from './api';

export interface Location {
  village: string;
  block: string;
  district: string;
  state: string;
}

export interface VerifyPayload {
  phone: string;
  otp: string;
  name: string;
  email: string;
  permanentLocation: Location;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'FARMER' | 'ADMIN';
    permanentLocation?: Location;
  };
}

const authService = {
  sendOtp: async (phone: string) => {
    const response = await api.post('/auth/send-otp', { phone });
    return response.data;
  },

  verifyOtp: async (payload: VerifyPayload): Promise<AuthResponse> => {
    const response = await api.post('/auth/verify-otp', payload);

    // Final key validation: handle nested data object if present
    const backendData = response.data.data || response.data;
    const accessToken = backendData.accessToken || backendData.token;
    const refreshToken = backendData.refreshToken || '';
    
    // SMART DATA MERGE:
    // If the backend returns a user, we use it. 
    // BUT we ensure that if name/email are present in the login payload, we reflect those
    // if the backend returns a generic or missing user (common in mock/sandbox modes).
    const backendUser = backendData.user || {};
    const user = {
      id: backendUser.id || payload.phone,
      name: payload.name || backendUser.name || 'Farmer',
      email: payload.email || backendUser.email || '',
      role: backendUser.role || 'FARMER',
      permanentLocation: payload.permanentLocation || backendUser.permanentLocation
    };

    if (!accessToken) {
      throw new Error('Authentication failed: Missing token');
    }

    // Standardize storage
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('authUser', JSON.stringify(user));

    // Remove legacy keys
    localStorage.removeItem('authToken');
    localStorage.removeItem('mock-token');

    return {
      accessToken,
      refreshToken,
      user
    } as any;
  },

  getMe: async (): Promise<{ user: AuthResponse['user'] }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (data: Partial<AuthResponse['user']>): Promise<{ user: AuthResponse['user'] }> => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },
};

export default authService;
