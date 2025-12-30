// API Configuration
export const API_CONFIG = {
  // Replace with your actual API URL
  // BASE_URL: 'http://192.168.1.24:5003',
  BASE_URL: 'https://api-squbix-his.squbix.com',

  
  // API Endpoints
  ENDPOINTS: {
    LOGIN: '/users/login-user',
    SELECT_TENANT: '/users/select-tenant',
    SELECT_FACILITY: '/users/select-facility',
    REFRESH_TOKEN: '/refresh-token',
    LOGOUT: '/logout',
    
    //emr
    VISIT_LIST: '/emr/visit-list',
    VISIT_HISTORY: '/emr/visit-history',
    VISIT_COMPLETED: '/emr/check-in',
    SAVE_EMR_DATA: '/emr/save-emr-data',

    //dashboard
    DASHBOARD:'/dashboard/get-dashboard'
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};