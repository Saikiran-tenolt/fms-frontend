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

// Response interceptor - handle token refresh on 401
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If it's a 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          console.log('[API] Access token expired, refreshing...');
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });

          if (res.data.success) {
            const { accessToken, refreshToken: newRefreshToken } = res.data.data;

            // Store new tokens in localStorage
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            console.log('[API] Token refreshed successfully');

            // Update the failed request's auth header
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // Process any queued requests
            processQueue(null, accessToken);
            isRefreshing = false;

            // Retry the original request
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('[API] Token refresh failed:', refreshError);
          processQueue(refreshError, null);
          isRefreshing = false;
        }
      }

      // If refresh fails or no refresh token, clear auth and redirect
      console.log('[API] Session expired, redirecting to login...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('authUser');
      window.location.href = '/login';
      return Promise.reject(new Error('Session expired'));
    }

    // For non-401 errors
    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      const err = new Error(message) as any;
      err.errors = error.response.data?.errors;
      err.status = error.response.status;
      return Promise.reject(err);
    } else if (error.request) {
      return Promise.reject(new Error('No response from server'));
    } else {
      return Promise.reject(error);
    }
  }
);

export default api;
