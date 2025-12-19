import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import loginFlowReducer from './slices/loginFlowSlice';
import tokenSyncMiddleware from './middleware/tokenSyncMiddleware';

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // Only persist auth slice
  blacklist: ['loginFlow'], // Don't persist temporary login flow data
};

// Auth persist config
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['isAuthenticated', 'user', 'tokens'], // Only persist essential auth data
};

// Root reducer
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  loginFlow: loginFlowReducer, // Not persisted - temporary data only
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(tokenSyncMiddleware),
  devTools: __DEV__,
});

export const persistor = persistStore(store);

// Type definitions for TypeScript (if needed later)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;