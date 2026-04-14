import AsyncStorage from '@react-native-async-storage/async-storage';

// Middleware to sync tokens between Redux and AsyncStorage
const tokenSyncMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  // Sync tokens to AsyncStorage when auth state changes
  if (action.type === 'auth/loginSuccess') {
    const { tokens, user } = action.payload;
    if (tokens?.accessToken) {
      AsyncStorage.setItem('accessToken', tokens.accessToken).catch(console.error);
    }
    if (tokens?.refreshToken) {
      AsyncStorage.setItem('refreshToken', tokens.refreshToken).catch(console.error);
    }
    if (user) {
      AsyncStorage.setItem('userInfo', JSON.stringify(user)).catch(console.error);
    }
  }

  if (action.type === 'auth/logout') {
    AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userInfo']).catch(console.error);
  }

  if (action.type === 'auth/updateTokens') {
    const { accessToken, refreshToken } = action.payload;
    if (accessToken) AsyncStorage.setItem('accessToken', accessToken).catch(console.error);
    if (refreshToken) AsyncStorage.setItem('refreshToken', refreshToken).catch(console.error);
  }

  return result;
};

export default tokenSyncMiddleware;