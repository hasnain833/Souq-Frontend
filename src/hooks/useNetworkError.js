import { useNetworkError as useNetworkErrorContext } from '../context/NetworkErrorContext';

/**
 * Custom hook for handling network errors
 * Provides easy-to-use methods for showing network error modals
 */
export const useNetworkError = () => {
  const context = useNetworkErrorContext();

  /**
   * Show a network error modal with custom options
   * @param {Object} options - Configuration options
   * @param {string} options.title - Modal title
   * @param {string} options.message - Error message
   * @param {Function} options.retryFunction - Function to call on retry
   * @param {boolean} options.showRetryButton - Whether to show retry button
   * @param {boolean} options.autoRetry - Whether to auto-retry
   * @param {number} options.maxRetries - Maximum retry attempts
   */
  const showError = (options = {}) => {
    context.showNetworkError(options);
  };

  /**
   * Handle API errors automatically
   * Detects network-related errors and shows appropriate modal
   * @param {Error} error - The error object from API call
   * @param {Function} retryFunction - Optional retry function
   * @returns {boolean} - True if error was handled, false otherwise
   */
  const handleApiError = (error, retryFunction = null) => {
    return context.handleApiError(error, retryFunction);
  };

  /**
   * Show a generic connection error
   * @param {Function} retryFunction - Optional retry function
   */
  const showConnectionError = (retryFunction = null) => {
    showError({
      title: "Connection Error",
      message: "Unable to connect to the server. Please check your internet connection and try again.",
      retryFunction,
      showRetryButton: !!retryFunction
    });
  };

  /**
   * Show a server error
   * @param {Function} retryFunction - Optional retry function
   */
  const showServerError = (retryFunction = null) => {
    showError({
      title: "Server Error",
      message: "The server is currently unavailable. Please try again later.",
      retryFunction,
      showRetryButton: !!retryFunction
    });
  };

  /**
   * Show a timeout error
   * @param {Function} retryFunction - Optional retry function
   */
  const showTimeoutError = (retryFunction = null) => {
    showError({
      title: "Request Timeout",
      message: "The request took too long to complete. Please try again.",
      retryFunction,
      showRetryButton: !!retryFunction
    });
  };

  /**
   * Show an offline error
   */
  const showOfflineError = () => {
    showError({
      title: "No Internet Connection",
      message: "You are currently offline. Please check your internet connection.",
      showRetryButton: false
    });
  };

  /**
   * Hide the network error modal
   */
  const hideError = () => {
    context.hideNetworkError();
  };

  return {
    // State
    isOnline: context.isOnline,
    isModalOpen: context.isModalOpen,
    
    // Methods
    showError,
    hideError,
    handleApiError,
    
    // Convenience methods
    showConnectionError,
    showServerError,
    showTimeoutError,
    showOfflineError
  };
};

export default useNetworkError;
