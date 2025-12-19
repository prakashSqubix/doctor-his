/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import 'react-native-gesture-handler';
import AppProviders from './src/providers/AppProviders';
import AuthNavigator from './src/navigation/AuthNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
  <SafeAreaProvider>
    <AppProviders>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AuthNavigator />
    </AppProviders>
  </SafeAreaProvider>
  );
}

export default App;
