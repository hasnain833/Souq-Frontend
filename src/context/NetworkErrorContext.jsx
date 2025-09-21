import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import NetworkErrorModal from '../components/common/NetworkErrorModal';

const NetworkErrorContext = createContext();

export const useNetworkError = () => {
  const context = useContext(NetworkErrorContext);
  if (!context) {
    throw new Error('useNetworkError must be used within a NetworkErrorProvider');
  }
  return context;
};

export const NetworkErrorProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState({
    title: "Network Connection Error",
    message: "Network is not connected. Please check your internet connection and try again later.",
    retryFunction: null,
    showRetryButton: true,
    autoRetry: false,
    retryCount: 0,
    maxRetries: 3
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Network connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('🚫 Network connection lost');
      showNetworkError({
        title: "Connection Lost",
        message: "Your internet connection has been lost. Please check your network settings.",
        showRetryButton: true
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Show network error modal
  const showNetworkError = useCallback((options = {}) => {
    const {
      title = "Network Connection Error",
      message = "Network is not connected. Please check your internet connection and try again later.",
      retryFunction = null,
      showRetryButton = true,
      autoRetry = false,
      maxRetries = 3
    } = options;

    setErrorDetails({
      title,
      message,
      retryFunction,
      showRetryButton,
      autoRetry,
      retryCount: 0,
      maxRetries
    });
    setIsModalOpen(true);
  }, []);

  // Hide network error modal
  const hideNetworkError = useCallback(() => {
    setIsModalOpen(false);
    setErrorDetails(prev => ({ ...prev, retryCount: 0 }));
  }, []);

  // Handle retry with auto-retry logic
  const handleRetry = useCallback(async () => {
    const { retryFunction, autoRetry, retryCount, maxRetries } = errorDetails;
    
    if (retryFunction) {
      try {
        // Increment retry count
        setErrorDetails(prev => ({ ...prev, retryCount: retryCount + 1 }));
        
        // Execute retry function
        await retryFunction();
        
        // If successful, close modal
        hideNetworkError();
      } catch (error) {
        console.error('Retry failed:', error);
        
        // Check if we should auto-retry
        if (autoRetry && retryCount < maxRetries) {
          setTimeout(() => {
            handleRetry();
          }, 2000); // Wait 2 seconds before auto-retry
        } else {
          // Show error message for failed retry
          setErrorDetails(prev => ({
            ...prev,
            message: `Retry failed. ${prev.message}`,
            autoRetry: false
          }));
        }
      }
    } else {
      // No retry function, just close modal
      hideNetworkError();
    }
  }, [errorDetails, hideNetworkError]);

  // Auto-detect network errors from API responses
  const handleApiError = useCallback((error, retryFunction = null) => {
    console.error('API Error detected:', error);
    
    // Check if it's a network error
    const isNetworkError = 
      !navigator.onLine ||
      error.code === 'NETWORK_ERROR' ||
      error.message?.toLowerCase().includes('network') ||
      error.message?.toLowerCase().includes('fetch') ||
      error.message?.toLowerCase().includes('connection') ||
      error.name === 'NetworkError' ||
      (error.response && error.response.status >= 500);

    if (isNetworkError) {
      let title = "Network Error";
      let message = "Unable to connect to the server. Please check your internet connection and try again.";

      // Customize message based on error type
      if (!navigator.onLine) {
        title = "No Internet Connection";
        message = "Please check your internet connection and try again.";
      } else if (error.response?.status >= 500) {
        title = "Server Error";
        message = "The server is currently unavailable. Please try again later.";
      } else if (error.message?.toLowerCase().includes('timeout')) {
        title = "Connection Timeout";
        message = "The request timed out. Please check your connection and try again.";
      }

      showNetworkError({
        title,
        message,
        retryFunction,
        showRetryButton: !!retryFunction,
        autoRetry: false
      });

      return true; // Indicates error was handled
    }

    return false; // Not a network error
  }, [showNetworkError]);

  const value = {
    isOnline,
    isModalOpen,
    errorDetails,
    showNetworkError,
    hideNetworkError,
    handleRetry,
    handleApiError
  };

  return (
    <NetworkErrorContext.Provider value={value}>
      {children}
      <NetworkErrorModal
        isOpen={isModalOpen}
        onClose={hideNetworkError}
        onRetry={handleRetry}
        title={errorDetails.title}
        message={errorDetails.message}
        showRetryButton={errorDetails.showRetryButton}
        autoRetry={errorDetails.autoRetry}
        retryCount={errorDetails.retryCount}
        maxRetries={errorDetails.maxRetries}
      />
    </NetworkErrorContext.Provider>
  );
};
