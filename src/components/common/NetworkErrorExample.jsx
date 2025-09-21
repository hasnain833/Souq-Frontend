import React, { useState } from 'react';
import { useNetworkError } from '../../hooks/useNetworkError';
import enhancedApiService, { createRetryableApiCall } from '../../api/EnhancedApiService';

/**
 * Example component demonstrating network error handling
 * This shows different ways to handle network errors in your components
 */
const NetworkErrorExample = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const networkError = useNetworkError();

  // Example 1: Basic API call with automatic error handling
  const handleBasicApiCall = async () => {
    setLoading(true);
    try {
      const response = await enhancedApiService({
        url: '/api/products',
        method: 'GET',
        retryFunction: () => handleBasicApiCall() // Enable retry
      });

      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      if (error.isNetworkError) {
        // Network error will be automatically handled by the context
        // You can also add custom handling here
        console.log('Network error occurred:', error.errorDetails);
      } else {
        // Handle other types of errors
        console.error('API Error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Using the hook to manually show network errors
  const handleManualNetworkError = () => {
    networkError.showConnectionError(() => {
      console.log('Retry function called');
      handleBasicApiCall();
    });
  };

  // Example 3: Using retryable API calls
  const handleRetryableApiCall = async () => {
    setLoading(true);
    try {
      const retryableCall = createRetryableApiCall({
        url: '/api/products',
        method: 'GET'
      }, 3, 2000); // 3 retries with 2 second delay

      const response = await retryableCall();
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      if (error.isNetworkError) {
        networkError.handleApiError(error, () => handleRetryableApiCall());
      }
    } finally {
      setLoading(false);
    }
  };

  // Example 4: Different types of network errors
  const showDifferentErrors = () => {
    // Connection error
    networkError.showConnectionError(() => console.log('Retry connection'));
    
    // Server error
    // networkError.showServerError(() => console.log('Retry server'));
    
    // Timeout error
    // networkError.showTimeoutError(() => console.log('Retry timeout'));
    
    // Offline error
    // networkError.showOfflineError();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Network Error Handling Examples</h2>
      
      {/* Network Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Network Status</h3>
        <p className={`text-sm ${networkError.isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {networkError.isOnline ? '🟢 Online' : '🔴 Offline'}
        </p>
      </div>

      {/* Example Buttons */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Example 1: Basic API Call with Auto Error Handling</h3>
          <button
            onClick={handleBasicApiCall}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Make API Call'}
          </button>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Example 2: Manual Network Error</h3>
          <button
            onClick={handleManualNetworkError}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Show Connection Error
          </button>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Example 3: Retryable API Call</h3>
          <button
            onClick={handleRetryableApiCall}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Retryable API Call'}
          </button>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Example 4: Different Error Types</h3>
          <button
            onClick={showDifferentErrors}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Show Different Errors
          </button>
        </div>
      </div>

      {/* Data Display */}
      {data && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold mb-2">API Response:</h3>
          <pre className="text-sm text-gray-600 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">How to Use in Your Components:</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>1. Import the hook:</strong></p>
          <code className="block bg-white p-2 rounded">
            import {`{ useNetworkError }`} from '../hooks/useNetworkError';
          </code>
          
          <p><strong>2. Use in component:</strong></p>
          <code className="block bg-white p-2 rounded">
            const networkError = useNetworkError();
          </code>
          
          <p><strong>3. Handle API errors:</strong></p>
          <code className="block bg-white p-2 rounded">
            networkError.handleApiError(error, retryFunction);
          </code>
        </div>
      </div>
    </div>
  );
};

export default NetworkErrorExample;
