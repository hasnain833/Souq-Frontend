/**
 * API Error Handler Utility
 * Provides automatic network error detection and handling
 */

/**
 * Check if an error is network-related
 * @param {Error} error - The error object
 * @returns {boolean} - True if it's a network error
 */
export const isNetworkError = (error) => {
  // Check if browser is offline
  if (!navigator.onLine) {
    return true;
  }

  // Check error properties
  if (error.code === 'NETWORK_ERROR' || error.name === 'NetworkError') {
    return true;
  }

  // Check error message for network-related keywords
  const networkKeywords = [
    'network',
    'fetch',
    'connection',
    'timeout',
    'unreachable',
    'offline',
    'dns',
    'refused'
  ];

  const errorMessage = error.message?.toLowerCase() || '';
  if (networkKeywords.some(keyword => errorMessage.includes(keyword))) {
    return true;
  }

  // Check HTTP status codes that indicate network/server issues
  if (error.response) {
    const status = error.response.status;
    // 5xx server errors, 408 timeout, 503 service unavailable, etc.
    if (status >= 500 || status === 408 || status === 503 || status === 504) {
      return true;
    }
  }

  // Check if it's a fetch/axios network error
  if (error.request && !error.response) {
    return true;
  }

  return false;
};

/**
 * Get appropriate error message based on error type
 * @param {Error} error - The error object
 * @returns {Object} - Error details with title and message
 */
export const getErrorDetails = (error) => {
  if (!navigator.onLine) {
    return {
      title: "No Internet Connection",
      message: "Please check your internet connection and try again."
    };
  }

  if (error.response) {
    const status = error.response.status;
    
    if (status >= 500) {
      return {
        title: "Server Error",
        message: "The server is currently unavailable. Please try again later."
      };
    }
    
    if (status === 408 || status === 504) {
      return {
        title: "Request Timeout",
        message: "The request took too long to complete. Please try again."
      };
    }
    
    if (status === 503) {
      return {
        title: "Service Unavailable",
        message: "The service is temporarily unavailable. Please try again later."
      };
    }
  }

  // Check for specific error types
  const errorMessage = error.message?.toLowerCase() || '';
  
  if (errorMessage.includes('timeout')) {
    return {
      title: "Connection Timeout",
      message: "The request timed out. Please check your connection and try again."
    };
  }
  
  if (errorMessage.includes('dns') || errorMessage.includes('unreachable')) {
    return {
      title: "Connection Error",
      message: "Unable to reach the server. Please check your internet connection."
    };
  }

  // Default network error
  return {
    title: "Network Error",
    message: "Unable to connect to the server. Please check your internet connection and try again."
  };
};

/**
 * Wrapper function for API calls with automatic error handling
 * @param {Function} apiCall - The API function to call
 * @param {Object} options - Options for error handling
 * @param {Function} options.onNetworkError - Custom network error handler
 * @param {boolean} options.showModal - Whether to show error modal (default: true)
 * @param {Function} options.retryFunction - Function to call on retry
 * @returns {Promise} - The API call result or throws error
 */
export const withNetworkErrorHandling = async (apiCall, options = {}) => {
  const {
    onNetworkError = null,
    showModal = true,
    retryFunction = null
  } = options;

  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    console.error('API call failed:', error);

    // Check if it's a network error
    if (isNetworkError(error)) {
      const errorDetails = getErrorDetails(error);
      
      // Call custom network error handler if provided
      if (onNetworkError) {
        onNetworkError(error, errorDetails, retryFunction);
      } else if (showModal) {
        // Import and use the network error context
        // Note: This should be used within a component that has access to the context
        console.warn('Network error detected. Use useNetworkError hook in component to show modal.');
      }
      
      // Re-throw with additional context
      const networkError = new Error(errorDetails.message);
      networkError.isNetworkError = true;
      networkError.originalError = error;
      networkError.errorDetails = errorDetails;
      throw networkError;
    }

    // Not a network error, re-throw original error
    throw error;
  }
};

/**
 * Create a retry function for API calls
 * @param {Function} apiCall - The API function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum retry attempts (default: 3)
 * @param {number} options.delay - Delay between retries in ms (default: 1000)
 * @returns {Function} - Retry function
 */
export const createRetryFunction = (apiCall, options = {}) => {
  const { maxRetries = 3, delay = 1000 } = options;
  
  return async (currentAttempt = 0) => {
    try {
      return await apiCall();
    } catch (error) {
      if (currentAttempt < maxRetries && isNetworkError(error)) {
        console.log(`Retry attempt ${currentAttempt + 1} of ${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return createRetryFunction(apiCall, options)(currentAttempt + 1);
      }
      throw error;
    }
  };
};

export default {
  isNetworkError,
  getErrorDetails,
  withNetworkErrorHandling,
  createRetryFunction
};
