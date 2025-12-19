import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to restore tokens from AsyncStorage on app start
export const restoreTokensFromStorage = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const userInfo = await AsyncStorage.getItem('userInfo');

    return {
      accessToken,
      refreshToken,
      userInfo: userInfo ? JSON.parse(userInfo) : null,
    };
  } catch (error) {
    console.error('Error restoring tokens from storage:', error);
    return {
      accessToken: null,
      refreshToken: null,
      userInfo: null,
    };
  }
};

// Function to clear all auth data
export const clearAuthStorage = async () => {
  try {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userInfo']);
  } catch (error) {
    console.error('Error clearing auth storage:', error);
  }
};