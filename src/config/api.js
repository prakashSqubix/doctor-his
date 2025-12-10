// API Configuration
export const API_CONFIG = {
  // Replace with your actual API URL
  BASE_URL: 'http://192.168.1.17:5003',
  
  // API Endpoints
  ENDPOINTS: {
    LOGIN: '/users/login-user',
    SELECT_TENANT: '/users/select-tenant',
    SELECT_FACILITY: '/select-facility',
    REFRESH_TOKEN: '/refresh-token',
    LOGOUT: '/logout',
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};