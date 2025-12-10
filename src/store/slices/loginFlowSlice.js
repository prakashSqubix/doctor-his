import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // For tenant selection (Case C)
  tenantSelectionToken: null,
  availableTenants: [],
  
  // For facility selection (Case B)
  facilitySelectionToken: null,
  availableFacilities: [],
  selectedTenantId: null,
  
  // Common temporary data
  userId: null,
  fullName: null,
  
  // Flow state
  currentStep: null, // 'TENANT_SELECTION' | 'FACILITY_SELECTION' | null
};

const loginFlowSlice = createSlice({
  name: 'loginFlow',
  initialState,
  reducers: {
    setTenantSelection: (state, action) => {
      const { tenantSelectionToken, userId, fullName, tenants } = action.payload;
      state.tenantSelectionToken = tenantSelectionToken;
      state.availableTenants = tenants || [];
      state.userId = userId;
      state.fullName = fullName;
      state.currentStep = 'TENANT_SELECTION';
      
      // Clear facility data
      state.facilitySelectionToken = null;
      state.availableFacilities = [];
      state.selectedTenantId = null;
    },
    
    setFacilitySelection: (state, action) => {
      const { 
        facilitySelectionToken, 
        userId, 
        tenantId, 
        fullName, 
        facilities 
      } = action.payload;
      
      state.facilitySelectionToken = facilitySelectionToken;
      state.availableFacilities = facilities || [];
      state.selectedTenantId = tenantId;
      state.userId = userId;
      state.fullName = fullName;
      state.currentStep = 'FACILITY_SELECTION';
      
      // Clear tenant selection data
      state.tenantSelectionToken = null;
      state.availableTenants = [];
    },
    
    clearTempData: (state) => {
      return { ...initialState };
    },
    
    updateSelectedTenant: (state, action) => {
      state.selectedTenantId = action.payload;
    },
  },
});

export const {
  setTenantSelection,
  setFacilitySelection,
  clearTempData,
  updateSelectedTenant,
} = loginFlowSlice.actions;

export default loginFlowSlice.reducer;