import axiosInstance from './axiosInstance';

import { API_CONFIG } from '../config/api';

export const authAPI = {
  // Login user
  loginUser: async (credentials) => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
    return response.data;
  },

  // Select facility (for Case B)
  selectFacility: async (facilityData) => {
    const { facilitySelectionToken, ...bodyData } = facilityData;
    console.log('payload',bodyData);
    
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.SELECT_FACILITY, 
      bodyData,
      {
        headers: {
          Authorization: `Bearer ${facilitySelectionToken}`,
        },
      }
    );
    return response.data;
  },

  // Select tenant (for Case C)
  selectTenant: async (tenantData) => {
    const { tenantSelectionToken, ...bodyData } = tenantData;
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.SELECT_TENANT, 
      bodyData,
      {
        headers: {
          Authorization: `Bearer ${tenantSelectionToken}`,
        },
      }
    );
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.REFRESH_TOKEN, { refreshToken });
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await axiosInstance.post(API_CONFIG.ENDPOINTS.LOGOUT);
    return response.data;
  },
};