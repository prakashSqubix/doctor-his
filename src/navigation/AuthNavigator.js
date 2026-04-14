import React from 'react';
import { useSelector } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/auth/LoginScreen';
import TenantSelectionScreen from '../screens/tenant/TenantSelectionScreen';
import FacilitySelectionScreen from '../screens/facility/FacilitySelectionScreen';
import BottomTabBar from '../screens/Routes/BottomTabBar';
import EMRGenerationScreen from '../screens/emr/EmrGenerationScreen';
import PatientDetailsScreen from '../screens/patient/PatientDetailsScreen';
import RouterConstants from '../Constants/RouterConstants';
import PatientHistory from '../screens/emr/PatientHistory';

const Stack = createStackNavigator();

export default function AuthNavigator() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { currentStep } = useSelector((state) => state.loginFlow);

  // Determine initial route based on auth state
  const getInitialRouteName = () => {
    if (isAuthenticated) {
      return RouterConstants.MainTabs;
    }

    
    switch (currentStep) {
      case 'TENANT_SELECTION':
        return RouterConstants.TenantSelectionScreen;
      case 'FACILITY_SELECTION':
        return RouterConstants.FacilitySelectionScreen;
      default:
        return RouterConstants.LoginScreen;
    }
  };

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={getInitialRouteName()}
    >
      {isAuthenticated ? (
        // Authenticated screens
        <>
          <Stack.Screen 
            name={RouterConstants.MainTabs} 
            component={BottomTabBar} 
          />

          <Stack.Screen 
            name={RouterConstants.EmrGenerationScreen} 
            component={EMRGenerationScreen} 
          />
          <Stack.Screen 
            name={RouterConstants.PatientDetailsScreen} 
            component={PatientDetailsScreen} 
          />
          <Stack.Screen 
            name={RouterConstants.PatientHistory} 
            component={PatientHistory} 
          />
        </>
      ) : (
        // Authentication flow screens
        <>
          <Stack.Screen 
            name={RouterConstants.LoginScreen} 
            component={LoginScreen} 
          />
          <Stack.Screen 
            name={RouterConstants.TenantSelectionScreen} 
            component={TenantSelectionScreen} 
          />
          <Stack.Screen 
            name={RouterConstants.FacilitySelectionScreen} 
            component={FacilitySelectionScreen} 
          />
        </>
      )}
    </Stack.Navigator>
  );
}