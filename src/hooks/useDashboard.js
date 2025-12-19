import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import { API_CONFIG } from '../config/api';
import axiosInstance from '../api/axiosInstance';

export const useDashboardQuery = (params) => {
    return useQuery({
      queryKey: ['dashboard', params],
      queryFn: async () => {
        const { data } = await axiosInstance.get(API_CONFIG.ENDPOINTS.DASHBOARD, {
          params: params
        });
        return data;
      },
    });
  };