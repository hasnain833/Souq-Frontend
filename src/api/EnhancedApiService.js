// Enhanced API Service with automatic network error handling
import axiosInstance from './AxiosInstance';
import { isNetworkError, getErrorDetails } from '../utils/apiErrorHandler';

/**
 * Enhanced API service with automatic network error detection
 * @param {Object} config - API configuration
 * @param {string} config.url - API endpoint URL
 * @param {string} config.method - HTTP method (GET, POST, etc.)
 * @param {Object} config.data - Request data
 * @param {Object} config.params - URL parameters
 * @param {Object} config.headers - Request headers
 * @param {boolean} config.withAuth - Whether to include authentication
 * @param {Function} config.onNetworkError - Custom network error handler
 * @param {boolean} config.showNetworkModal - Whether to show network error modal
 * @param {Function} config.retryFunction - Function to call on retry
 * @returns {Promise} - API response or throws error
 */
const enhancedApiService = async ({
  url,
  method = 'GET',
  data = {},
  params = {},
  headers = {},
  withAuth = true,
  onNetworkError = null,
  showNetworkModal = true,
  retryFunction = null
}) => {
  try {
    const isFormData = data instanceof FormData;

    const config = {
      url,
      method,
      data,
      params,
      headers: {
        ...headers,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      withAuth,
    };

    const response = await axiosInstance(config);

    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
    };

  } catch (error) {
    console.error('API Error:', error);

    // Check if it's a network error
    if (isNetworkError(error)) {
      const errorDetails = getErrorDetails(error);
      
      // Create enhanced error object
      const networkError = new Error(errorDetails.message);
      networkError.isNetworkError = true;
      networkError.originalError = error;
      networkError.errorDetails = errorDetails;
      networkError.retryFunction = retryFunction;
      networkError.showNetworkModal = showNetworkModal;
      networkError.onNetworkError = onNetworkError;

      // Log network error details
      console.error('Network Error Details:', {
        title: errorDetails.title,
        message: errorDetails.message,
        isOnline: navigator.onLine,
        url: config.url,
        method: config.method
      });

      throw networkError;
    }

    // Handle other API errors
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        'An unexpected error occurred';

    return {
      success: false,
      error: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    };
  }
};

/**
 * Create a retry-enabled API call
 * @param {Object} config - API configuration
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Delay between retries in ms
 * @returns {Function} - Retry function
 */
export const createRetryableApiCall = (config, maxRetries = 3, delay = 1000) => {
  const retryFunction = async (attempt = 0) => {
    try {
      return await enhancedApiService({
        ...config,
        retryFunction: attempt < maxRetries ? () => retryFunction(attempt + 1) : null
      });
    } catch (error) {
      if (error.isNetworkError && attempt < maxRetries) {
        console.log(`Retrying API call (${attempt + 1}/${maxRetries}) after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return retryFunction(attempt + 1);
      }
      throw error;
    }
  };

  return retryFunction;
};

/**
 * Wrapper for GET requests
 */
export const get = (url, params = {}, options = {}) => {
  return enhancedApiService({
    url,
    method: 'GET',
    params,
    ...options
  });
};

/**
 * Wrapper for POST requests
 */
export const post = (url, data = {}, options = {}) => {
  return enhancedApiService({
    url,
    method: 'POST',
    data,
    ...options
  });
};

/**
 * Wrapper for PUT requests
 */
export const put = (url, data = {}, options = {}) => {
  return enhancedApiService({
    url,
    method: 'PUT',
    data,
    ...options
  });
};

/**
 * Wrapper for DELETE requests
 */
export const del = (url, options = {}) => {
  return enhancedApiService({
    url,
    method: 'DELETE',
    ...options
  });
};

export default enhancedApiService;
