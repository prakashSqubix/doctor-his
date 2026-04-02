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
      
      // ------ CASE A & ROLE SELECTION ------
      if (responseData.accessToken || responseData.refreshToken || responseData.roleSelectionToken) {
        
        // Check for multiple roles case directly after login
        if (responseData.roleSelectionToken && Array.isArray(responseData.tenants)) {
          const firstTenant = responseData.tenants[0];
          const hasDoctorRole = firstTenant?.roles?.some(r => r.roleName === 'DOCTOR');
          
          if (hasDoctorRole) {
            console.log('Multiple roles found in login response, auto-selecting DOCTOR...');
            const roleRes = await authAPI.selectRole({
              roleSelectionToken: responseData.roleSelectionToken,
              userId: responseData.userId,
              tenantId: firstTenant.tenantId,
              facilityId: firstTenant.facilities?.[0]?.facilityId,
              roleName: 'DOCTOR'
            });

            if (roleRes.statusCode === 200 && roleRes.data.accessToken) {
              const finalData = roleRes.data;
              dispatch(loginSuccess({
                user: {
                  userId: finalData._id || finalData.userId,
                  fullName: finalData.fullName,
                  tenant: finalData.tenant,
                  facility: finalData.facility,
                  roles: finalData.roles || [finalData.role],
                },
                tokens: {
                  accessToken: finalData.accessToken,
                  refreshToken: finalData.refreshToken,
                },
              }));
              dispatch(clearTempData());
              return { type: 'NAVIGATE_TO_DASHBOARD' };
            }
            throw new Error(roleRes.message || 'Failed to auto-select DOCTOR role');
          } else {
            throw new Error('Access denied. Only doctors are allowed.');
          }
        }

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
              userId: responseData.userId,
              fullName: responseData.fullName,
              tenant: responseData.tenants?.[0],
              facility: responseData.tenants?.[0]?.facilities?.[0],
              roles: responseData.tenants?.[0]?.roles || [],
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
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      dispatch(loginFailure(errorMessage));
    },
  });
};



export const useSelectFacilityMutation = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: authAPI.selectFacility,
    onSuccess: async (data) => {

      const { statusCode, data: responseData, message: apiMessage } = data;
      console.log('SELECT FACILITY RESPONSE:', apiMessage, responseData);

      if (statusCode === 200) {
        // CASE: Multiple roles found, need to auto-select DOCTOR
        if (responseData.roleSelectionToken && Array.isArray(responseData.roles)) {
          const hasDoctorRole = responseData.roles.some(r => r.roleName === 'DOCTOR');
          
          if (hasDoctorRole) {
            console.log('Multiple roles found, auto-selecting DOCTOR...');
            const roleRes = await authAPI.selectRole({
              roleSelectionToken: responseData.roleSelectionToken,
              userId: responseData.userId,
              tenantId: responseData.tenantId,
              facilityId: responseData.facilityId,
              roleName: 'DOCTOR'
            });

            if (roleRes.statusCode === 200 && roleRes.data.accessToken) {
              const finalData = roleRes.data;
              dispatch(loginSuccess({
                user: {
                  userId: finalData._id || finalData.userId,
                  fullName: finalData.fullName,
                  tenant: finalData.tenant,
                  facility: finalData.facility,
                  roles: finalData.roles || [finalData.role],
                },
                tokens: {
                  accessToken: finalData.accessToken,
                  refreshToken: finalData.refreshToken,
                },
              }));
              dispatch(clearTempData());
              return { type: 'NAVIGATE_TO_DASHBOARD' };
            }
            throw new Error(roleRes.message || 'Failed to auto-select DOCTOR role');
          } else {
            throw new Error('Access denied. Only doctors are allowed.');
          }
        }

        // CASE: Direct success (single role DOCTOR)
        if (responseData.accessToken) {
          // ROLE CHECK
          const userRoles = responseData.roles || [];
          const isDoctorRole = userRoles.some(role => 
            role.roleName === "DOCTOR" || role === "DOCTOR"
          );

          if (!isDoctorRole) {
            throw new Error("Access denied. Only doctors are allowed.");
          }

          dispatch(loginSuccess({
            user: {
              userId: responseData._id || responseData.userId,
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
      }

      throw new Error('Failed to select facility');

    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to select facility';
      dispatch(loginFailure(errorMessage));
    },
  });
};


export const useSelectTenantMutation = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: authAPI.selectTenant,
    onSuccess: async (data) => {

      const { statusCode, data: responseData } = data;

      if (statusCode === 200) {
        // CASE: Multiple roles found (Case C -> Case Role)
        if (responseData.roleSelectionToken && Array.isArray(responseData.roles)) {
            const hasDoctorRole = responseData.roles.some(r => r.roleName === 'DOCTOR');
            
            if (hasDoctorRole) {
              const roleRes = await authAPI.selectRole({
                roleSelectionToken: responseData.roleSelectionToken,
                userId: responseData.userId,
                tenantId: responseData.tenantId,
                facilityId: responseData.facilityId,
                roleName: 'DOCTOR'
              });
  
              if (roleRes.statusCode === 200 && roleRes.data.accessToken) {
                const finalData = roleRes.data;
                dispatch(loginSuccess({
                  user: {
                    userId: finalData._id || finalData.userId,
                    fullName: finalData.fullName,
                    tenant: finalData.tenant,
                    facility: finalData.facility,
                    roles: finalData.roles || [finalData.role],
                  },
                  tokens: {
                    accessToken: finalData.accessToken,
                    refreshToken: finalData.refreshToken,
                  },
                }));
                dispatch(clearTempData());
                return { type: 'NAVIGATE_TO_DASHBOARD' };
              }
              throw new Error(roleRes.message || 'Failed to auto-select DOCTOR role');
            } else {
              throw new Error('Access denied. Only doctors are allowed.');
            }
        }

        // CASE: Direct success (Single facility)
        if (responseData.accessToken && responseData.facility) {
          // ROLE CHECK
          const userRoles = responseData.roles || [];
          const isDoctorRole = userRoles.some(role => 
            role.roleName === "DOCTOR" || role === "DOCTOR"
          );

          if (!isDoctorRole) {
            throw new Error("Access denied. Only doctors are allowed.");
          }

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

        // CASE: Multiple facilities found (Case C -> Case B)
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
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to select tenant';
      dispatch(loginFailure(errorMessage));
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