import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';
import { generateHMAC } from '../utils/hmacUtils';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Request interceptor to add auth token and HMAC signature
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // 1. Add Auth Token
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 2. Add HMAC Signature
      const timestamp = Date.now().toString();
      const method = config.method.toUpperCase();
      // Remove baseURL from url if it exists to get the path
      let path = config.url;
      if (path.startsWith(config.baseURL)) {
        path = path.substring(config.baseURL.length);
      }
      // Ensure path starts with /
      if (!path.startsWith('/')) {
        path = `/${path}`;
      }

      const body = config.data ? JSON.stringify(config.data) : '';
      
      console.log('[HMAC Debug] Signing items:', { method, path, timestamp, bodyLen: body.length });
      
      const signature = generateHMAC(method, path, timestamp, body);

      config.headers['x-signature'] = signature;
      config.headers['x-timestamp'] = timestamp;

      console.log(`[HMAC] Signed request: ${method} ${path} | Signature: ${signature}`);
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH_TOKEN}`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          await AsyncStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userInfo']);
        // You can dispatch a logout action here if needed
        console.error('Token refresh failed:', refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;