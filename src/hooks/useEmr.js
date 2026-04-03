import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import { API_CONFIG } from '../config/api';
import axiosInstance from '../api/axiosInstance';
import { aiAPI } from '../api/aiApi';

// Use useQuery for fetching visit list data
export const useVisitListQuery = (params) => {
  return useQuery({
    queryKey: ['visitList', params],
    queryFn: async () => {
      const { data } = await axiosInstance.get(API_CONFIG.ENDPOINTS.VISIT_LIST, {
        params: params
      });
      console.log('Visit List Data:', data);
      return data;
    },
    enabled: !!params, // Only run query if params are provided
  });
};
export const useVisitCompleteMutation = () => {
    return useMutation({
      mutationFn: async (payload) => {
        const response = await axiosInstance.post(
          API_CONFIG.ENDPOINTS.VISIT_COMPLETED,
          payload
        );
        return response.data;
      },
    });
  };
// Keep mutation for backward compatibility if needed
export const useVisitListMutation = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.get(API_CONFIG.ENDPOINTS.VISIT_LIST, {
        params: payload
      });
      console.log('Visit List Data:', data);
      return data;
    }
  });
};

// AI Transcription mutation
export const useAiTranscriptionMutation = () => {
  return useMutation({
    mutationFn: async ({ base64AudioString, endpoint }) => {
      const response = await aiAPI.transcribeAudio(base64AudioString, endpoint);
      console.log('AI Transcription Response:', response);
      return response;
    },
    onError: (error) => {
      console.error('AI Transcription Error:', error);
    },
  });
};

// Fetch EMR Data query
export const useEmrDataQuery = (params) => {
  return useQuery({
    queryKey: ['emrData', params],
    queryFn: async () => {
      const { data } = await axiosInstance.get(API_CONFIG.ENDPOINTS.GET_EMR_DATA, {
        params: params
      });
      console.log('Get EMR Data:', data);
      return data;
    },
    enabled: !!(params?.registrationId && params?.visitId && params?.facilityId),
  });
};

// Unsign EMR mutation
export const useUnsignEmrMutation = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post(
        API_CONFIG.ENDPOINTS.UNSIGN_EMR,
        payload
      );
      return response.data;
    },
  });
};

// Update Visit Status mutation
export const useUpdateVisitStatusMutation = () => {
  return useMutation({
    mutationFn: async ({ visitId, visitStatus }) => {
      const url = `${API_CONFIG.ENDPOINTS.UPDATE_VISIT_STATUS}?visitId=${visitId}&visitStatus=${visitStatus}`;
      const response = await axiosInstance.patch(url);
      return response.data;
    },
  });
};

// Save EMR Data mutation
export const useSaveEmrDataMutation = () => {
  return useMutation({
    mutationFn: async ({ registrationId, visitId, facilityId, emrData }) => {
      const url = `${API_CONFIG.ENDPOINTS.SAVE_EMR_DATA}?registrationId=${registrationId}&visitId=${visitId}&facilityId=${facilityId}`;
      console.log('Save EMR Data URL:', url);
      console.log('Save EMR Data Payload:', JSON.stringify(emrData, null, 2));
      
      const response = await axiosInstance.post(url, emrData);
      console.log('Save EMR Data Response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('EMR Data saved successfully:', data);
    },
    onError: (error) => {
      console.error('Save EMR Data Error:', error);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
    },
  });
};