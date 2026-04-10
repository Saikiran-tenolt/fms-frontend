import axios from 'axios';
import type { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://fms-backend-976n.onrender.com/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'An error occurred';

      // Handle 401 Unauthorized - Attempt Token Refresh
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          try {
            // Attempt to refresh token
            const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });

            if (res.data.success) {
              const { accessToken, refreshToken: newRefreshToken } = res.data.data;

              // Store new tokens
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);

              // Update authorization header
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;

              // Retry original request
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }

        // If refresh fails or no token, clear auth and redirect
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
        window.location.href = '/login';
      }

      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('No response from server'));
    } else {
      return Promise.reject(error);
    }
  }
);

export default api;
