/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../auth/LoginScreen';
import TenantSelectionScreen from '../tenant/TenantSelectionScreen';
import FacilitySelectionScreen from '../facility/FacilitySelectionScreen';
import RouterConstants from '../../Constants/RouterConstants';
import DashboardScreen from '../dashboard/DashboardScreen';
import BottomTabBar from './BottomTabBar';
import EMRGenerationScreen from '../emr/EmrGenerationScreen';
import PatientDetailsScreen from '../patient/PatientDetailsScreen';
import PatientHistory from '../emr/PatientHistory';


const Stack = createStackNavigator();

function RouteStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={RouterConstants.LoginScreen}
    >
      <Stack.Screen name={RouterConstants.LoginScreen} component={LoginScreen} />
      <Stack.Screen name={RouterConstants.TenantSelectionScreen} component={TenantSelectionScreen} />
      <Stack.Screen name={RouterConstants.FacilitySelectionScreen} component={FacilitySelectionScreen} />
      <Stack.Screen name={RouterConstants.MainTabs} component={BottomTabBar} />

      <Stack.Screen name={RouterConstants.EmrGenerationScreen} component={EMRGenerationScreen} />
      <Stack.Screen name={RouterConstants.PatientDetailsScreen} component={PatientDetailsScreen} />
      <Stack.Screen name={RouterConstants.PatientHistory} component={PatientHistory} />
    </Stack.Navigator>
  );
}

export default RouteStack;
