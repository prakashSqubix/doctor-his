import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { authAPI } from '../api/authApi';
import { 
  loginSuccess, 
  loginFailure, 
  logout as logoutAction,
  clearLoginFlow 
} from '../store/slices/authSlice';
import { 
  setTenantSelection, 
  setFacilitySelection,
  clearTempData 
} from '../store/slices/loginFlowSlice';

export const useLoginMutation = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await authAPI.loginUser(payload);
      const { statusCode, message, data: responseData } = res;

      if (statusCode !== 200) {
        throw new Error(message || "Login failed");
      }


      // ROLE CHECK
      
      // ------ CASE A ------
      if (responseData.accessToken && responseData.refreshToken) {
        const userRoles = responseData?.tenants?.flatMap(r=>r?.roles) || [];
        
        const isDoctorRole = userRoles.some(role =>
          role.roleName === "DOCTOR" || role === "DOCTOR"
        );
  
        if (!isDoctorRole) {
          throw new Error("Access denied. Only doctors are allowed.");
        }
        dispatch(
          loginSuccess({
            user: {
              userId: responseData._id,
              fullName: responseData.fullName,
              tenant: responseData.tenant,
              facility: responseData.facility,
              roles: responseData.roles,
            },
            tokens: {
              accessToken: responseData.accessToken,
              refreshToken: responseData.refreshToken,
            },
          })
        );

        dispatch(clearTempData());

        return { type: "NAVIGATE_TO_DASHBOARD" };
      }

      // ------ CASE B ------
      if (responseData.facilitySelectionToken && Array.isArray(responseData.facilities)) {
        dispatch(
          setFacilitySelection({
            facilitySelectionToken: responseData.facilitySelectionToken,
            userId: responseData.userId,
            tenantId: responseData.tenantId,
            fullName: responseData.fullName,
            facilities: responseData.facilities,
          })
        );

        return { type: "NAVIGATE_TO_FACILITY_SELECTION" };
      }

      // ------ CASE C ------
      if (responseData.tenantSelectionToken && responseData.tenants) {
        dispatch(
          setTenantSelection({
            tenantSelectionToken: responseData.tenantSelectionToken,
            userId: responseData.userId,
            fullName: responseData.fullName,
            tenants: responseData.tenants,
          })
        );

        return { type: "NAVIGATE_TO_TENANT_SELECTION" };
      }

      throw new Error("Invalid response format from server");
    },

    onError: (error) => {
      dispatch(loginFailure(error.message || "Login failed"));
    },
  });
};


export const useSelectFacilityMutation = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: authAPI.selectFacility,
    onSuccess: (data) => {
      const { statusCode, data: responseData } = data;

      if (statusCode === 200 && responseData.accessToken) {
        dispatch(loginSuccess({
          user: {
            userId: responseData._id,
            fullName: responseData.fullName,
            tenant: responseData.tenant,
            facility: responseData.facility,
            roles: responseData.roles,
          },
          tokens: {
            accessToken: responseData.accessToken,
            refreshToken: responseData.refreshToken,
          },
        }));
        dispatch(clearTempData());
        return { type: 'NAVIGATE_TO_DASHBOARD' };
      }

      throw new Error('Failed to select facility');
    },
  });
};

export const useSelectTenantMutation = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: authAPI.selectTenant,
    onSuccess: (data) => {
      const { statusCode, data: responseData } = data;

      if (statusCode === 200) {
        // Check if this is a single facility case (has accessToken and facility)
        if (responseData.accessToken && responseData.facility) {
          dispatch(loginSuccess({
            user: {
              userId: responseData.userId,
              fullName: responseData.fullName,
              tenant: responseData.tenant,
              facility: responseData.facility,
              roles: responseData.roles,
            },
            tokens: {
              accessToken: responseData.accessToken,
              refreshToken: responseData.refreshToken,
            },
          }));
          dispatch(clearTempData());
          return { type: 'NAVIGATE_TO_DASHBOARD' };
        }

        // If multiple facilities, should get facilitySelectionToken and facilities array
        if (responseData.facilitySelectionToken && responseData.facilities) {
          dispatch(setFacilitySelection({
            facilitySelectionToken: responseData.facilitySelectionToken,
            userId: responseData.userId,
            tenantId: responseData.tenant?.tenantId || responseData.tenantId,
            fullName: responseData.fullName,
            facilities: responseData.facilities,
          }));
          return { type: 'NAVIGATE_TO_FACILITY_SELECTION' };
        }
      }

      throw new Error('Failed to select tenant');
    },
  });
};

export const useLogoutMutation = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      dispatch(logoutAction());
      dispatch(clearTempData());
      queryClient.clear();
    },
    onError: () => {
      // Even if logout API fails, clear local data
      dispatch(logoutAction());
      dispatch(clearTempData());
      queryClient.clear();
    },
  });
};