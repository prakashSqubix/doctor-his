import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View } from 'react-native';

import colorStrings from '../../Constants/AppColors';
import RouterConstants from '../../Constants/RouterConstants';
import AppointmentScreen from '../appointment/AppointmentScreen';
// import { heightPixel } from '../../utils/Utility';
import DashboardScreen from '../dashboard/DashboardScreen';
import PatientScreen from '../patient/PatientScreen';
import ProfileScreen from '../profile/ProfileScreen';
import {
  UnselectDashboard,
  UnselectAppointment,
  SelectDashboard,
  SelectAppointment,
  SelectPatient,
  UnselectPatient,
  SelectProfile,
  UnselectProfile,
} from '../../../assets/svg';

const Tab = createBottomTabNavigator();
const BottomTabBar = () => {
  return (
    <>
      {Platform.OS === 'android' && (
        <View
          style={{
            position: 'absolute',
            top: 0, // Adjust the position to be just above the tab bar
            left: 0,
            right: 0,
            bottom: 0,
            height: 10, // Height of the shadow view
            backgroundColor: colorStrings?.grey, // Shadow color
            opacity: 1, // Shadow opacity
          }}
        />
      )}
      <Tab.Navigator
        backBehavior="none"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarInactiveTintColor: colorStrings.inactiveTextGrey,
          tabBarActiveTintColor: colorStrings.clientColor,
          tabBarStyle: {
            backgroundColor: 'white', // Make sure background is set
            paddingTop: 5,
            height: Platform.OS === 'android' ? 60 : 60,
            // elevation: -10, // Android shadow
            // shadowColor: '#000', // iOS shadow color
            // shadowOffset: { width: 0, height: -5 }, // Shadow positioned above
            // shadowOpacity: 0.1, // iOS shadow opacity
            // shadowRadius: 4, // iOS shadow blur
            // zIndex: 10, // Ensure it's above other components
          },
        }}
      >
        <Tab.Screen
          name={RouterConstants.DashboardScreen}
          component={DashboardScreen}
          options={() => ({
            unmountOnBlur: true,
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {focused ? <SelectDashboard /> : <UnselectDashboard />}
              </View>
            ),
          })}
        />
        <Tab.Screen
          name={RouterConstants.PatientScreen}
          component={PatientScreen}
          options={() => ({
            unmountOnBlur: true,
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {focused ? <SelectPatient /> : <UnselectPatient />}
              </View>
            ),
          })}
        />
        <Tab.Screen
          name={RouterConstants.AppointmentScreen}
          component={AppointmentScreen}
          options={() => ({
            unmountOnBlur: true,
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {focused ? <SelectAppointment /> : <UnselectAppointment />}
              </View>
            ),
          })}
        />
        <Tab.Screen
          name={RouterConstants.ProfileScreen}
          component={ProfileScreen}
          options={() => ({
            unmountOnBlur: true,
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {focused ? <SelectProfile /> : <UnselectProfile />}
              </View>
            ),
          })}
        />
      </Tab.Navigator>
    </>
  );
};

export default BottomTabBar;
