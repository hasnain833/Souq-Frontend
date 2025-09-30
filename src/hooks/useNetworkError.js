import { useNetworkError as useNetworkErrorContext } from '../context/NetworkErrorContext';
export const useNetworkError = () => {
  const context = useNetworkErrorContext();

  const showError = (options = {}) => {
    context.showNetworkError(options);
  };


  const handleApiError = (error, retryFunction = null) => {
    return context.handleApiError(error, retryFunction);
  };

  const showConnectionError = (retryFunction = null) => {
    showError({
      title: "Connection Error",
      message: "Unable to connect to the server. Please check your internet connection and try again.",
      retryFunction,
      showRetryButton: !!retryFunction
    });
  };


  const showServerError = (retryFunction = null) => {
    showError({
      title: "Server Error",
      message: "The server is currently unavailable. Please try again later.",
      retryFunction,
      showRetryButton: !!retryFunction
    });
  };

  const showTimeoutError = (retryFunction = null) => {
    showError({
      title: "Request Timeout",
      message: "The request took too long to complete. Please try again.",
      retryFunction,
      showRetryButton: !!retryFunction
    });
  };


  const showOfflineError = () => {
    showError({
      title: "No Internet Connection",
      message: "You are currently offline. Please check your internet connection.",
      showRetryButton: false
    });
  };

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
