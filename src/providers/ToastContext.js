import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Toast from '../components/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info', // 'success' | 'error' | 'info' | 'warning'
  });

  const timeoutRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast({
      visible: true,
      message,
      type,
    });

    // Auto hide after 3 seconds
    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, 3500);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
};
