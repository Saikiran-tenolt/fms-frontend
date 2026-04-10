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
  name?: string;
  email?: string;
  permanentLocation?: Location;
  pincode?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'FARMER' | 'ADMIN';
  permanentLocation?: Location;
  assignedBlock?: string;
}

export interface AuthVerifyResponse {
  success: boolean;
  data: {
    type: 'LOGIN' | 'SIGNUP_REQUIRED' | 'SIGNUP';
    user?: User;
    accessToken?: string;
    refreshToken?: string;
    message?: string;
  };
}

const authService = {
  sendOtp: async (phone: string) => {
    const response = await api.post('/auth/send-otp', { phone });
    return response.data;
  },

  verifyOtp: async (payload: VerifyPayload): Promise<AuthVerifyResponse> => {
    const response = await api.post('/auth/verify-otp', payload);
    const result = response.data as AuthVerifyResponse;

    if (result.success && (result.data.type === 'LOGIN' || result.data.type === 'SIGNUP')) {
      const { accessToken, refreshToken, user } = result.data;
      if (accessToken && user) {
        // Standardize User mapping
        const mappedUser: User = {
          ...user,
          id: (user as any)._id || user.id,
          role: user.role || 'FARMER' // Default to FARMER if not provided
        };

        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('authUser', JSON.stringify(mappedUser));

        // Update user property in response for frontend consumption
        result.data.user = mappedUser;
      }
    }

    return result;
  },

  refreshTokens: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async (refreshToken: string) => {
    try {
      const response = await api.post('/auth/logout', { refreshToken });
      return response.data;
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');
    }
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/auth/me');
    const result = response.data;

    if (result.success && result.user) {
      // Standardize User mapping
      result.user = {
        ...result.user,
        id: (result.user as any)._id || result.user.id,
        role: result.user.role || 'FARMER'
      };
    }

    return result;
  },

  updateProfile: async (data: Partial<User>): Promise<{ success: boolean; user: User }> => {
    const response = await api.patch('/auth/profile', data);
    return response.data;
  },
};

export default authService;
