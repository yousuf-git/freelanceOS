import axios from 'axios';
import useAuthStore from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const http = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor: attach Bearer token + X-Account-Id
http.interceptors.request.use((config) => {
  const { accessToken, accountId } = useAuthStore.getState();
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  if (accountId) {
    config.headers['X-Account-Id'] = accountId;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
}

// Response interceptor: refresh token on 401
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return http(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();
      if (!refreshToken) {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }
      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh } = res.data.data;
        setTokens(newAccess, newRefresh);
        processQueue(null, newAccess);
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`;
        return http(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    // Normalize error shape
    const apiError = new Error(
      error.response?.data?.error?.message || error.message || 'Request failed'
    );
    apiError.status = error.response?.status;
    apiError.code = error.response?.data?.error?.code;
    apiError.details = error.response?.data?.error?.details;
    apiError.data = error.response?.data;
    return Promise.reject(apiError);
  }
);

export default http;
