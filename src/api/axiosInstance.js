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
        // Use bracket notation or .set() for AxiosHeaders compatibility
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      // 2. Add HMAC Signature
      const timestamp = Date.now().toString();
      const method = config.method ? config.method.toUpperCase() : 'GET';
      
      // Remove baseURL from url if it exists to get the path
      let path = config.url || '';
      if (path.startsWith(API_CONFIG.BASE_URL)) {
        path = path.substring(API_CONFIG.BASE_URL.length);
      }
      
      // Ensure path starts with /
      if (!path.startsWith('/')) {
        path = `/${path}`;
      }

      // Handle data stringification carefully
      let body = '';
      if (config.data) {
        body = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
      }
      
      console.log('[HMAC Debug] Signing items:', { method, path, timestamp, bodyLen: body.length });
      
      const signature = generateHMAC(method, path, timestamp, body);

      config.headers['x-signature'] = signature;
      config.headers['x-timestamp'] = timestamp;

      console.log(`[HMAC] Signed request: ${method} ${path} | Signature: ${signature}`);
    } catch (error) {
      console.error('Error in request interceptor:', error);
      // Even if HMAC fails, we should try to send the request if it has a token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Variable to track if token is being refreshed
let isRefreshing = false;
// Queue to hold requests that failed with 401 while token is being refreshed
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  async (response) => {
    // Extract x-refresh-token from headers if present
    const newRefreshToken = response.headers['x-refresh-token'];
    if (newRefreshToken) {
      console.log('[Auth] New refresh token found in headers, storing...');
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {

      // Concept: Refresh token only in production case
      if (__DEV__) {
        console.warn('[Auth] 401 Unauthorized in Development. Logging out.');
        
        // Use require to avoid circular dependency at top-level
        const { store: reduxStore } = require('../store/store');
        const { logout: logoutAction } = require('../store/slices/authSlice');
        
        reduxStore.dispatch(logoutAction());
        return Promise.reject(error);
      }
      
      // If the request was already retried and still failed with 401, logout
      if (originalRequest._retry) {
        console.error('[Auth] 401 still occurring after retry. Logging out.');
        const { store: reduxStore } = require('../store/store');
        const { logout: logoutAction } = require('../store/slices/authSlice');
        reduxStore.dispatch(logoutAction());
        return Promise.reject(error);
      }

      // If already refreshing, add this request to the queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('[Auth] Attempting to refresh token...');
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH_TOKEN}`,
            {},
            {
              headers: {
                'Cookie': `refreshToken=${refreshToken}`,
              },
            }
          );

          console.log('[Auth] Token refresh response:', response.data);
          
          // Check for new refresh token in the refresh response headers
          const newRefreshToken = response.headers['x-refresh-token'];
          if (newRefreshToken) {
            console.log('[Auth] New refresh token found in refresh headers, updating...');
            await AsyncStorage.setItem('refreshToken', newRefreshToken);
          }

          const accessToken = response.data?.data?.accessToken;

          if (accessToken) {
            await AsyncStorage.setItem('accessToken', accessToken);

            // Update Authorization header for the original request
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            
            // Process all pending requests in the queue
            processQueue(null, accessToken);
            
            // Resume the original request
            return axiosInstance(originalRequest);
          } else {
            throw new Error('No access token in refresh response');
          }
        } else {
          throw new Error('No refresh token available');
        }
      } catch (refreshError) {
        console.error('[Auth] Token refresh failed:', refreshError);
        
        // Notify all queued requests that refresh failed
        processQueue(refreshError, null);
        
        // Refresh failed, clear session and log out
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userInfo']);
        
        // Trigger global logout to refresh UI and navigate to login
        const { store: reduxStore } = require('../store/store');
        const { logout: logoutAction } = require('../store/slices/authSlice');
        reduxStore.dispatch(logoutAction());
        
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;