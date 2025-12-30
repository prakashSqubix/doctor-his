import axiosInstance from './axiosInstance';
import { API_CONFIG } from '../config/api';

export const getVisitHistory = async (registrationId, visitId, page = 1, limit = 50) => {
  try {
    const response = await axiosInstance.get(API_CONFIG.ENDPOINTS.VISIT_HISTORY, {
      params: {
        registrationId,
        visitId, 
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Failed to fetch visit history');
    }
    throw error;
  }
};
