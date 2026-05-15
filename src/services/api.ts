import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { store } from '../store/store';
import { updateTokens, logout } from '../features/auth/authSlice';

const API_BASE_URL = 'https://fms-backend-976n.onrender.com/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s — accounts for Render free tier cold start (can take 30-60s)
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

      // Admin tokens have no refresh token — skip refresh, clear session immediately
      if (!refreshToken) {
        processQueue(new Error('No refresh token'), null);
        isRefreshing = false;
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired'));
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });

        if (res.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;

          // Update Redux store (also persists to localStorage via authSlice)
          store.dispatch(updateTokens({ accessToken, refreshToken: newRefreshToken }));

          // Update the failed request's auth header
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Process any queued requests and retry original
          processQueue(null, accessToken);
          isRefreshing = false;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('[API] Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;
      }

      // Refresh failed — clear auth and redirect
      store.dispatch(logout());
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