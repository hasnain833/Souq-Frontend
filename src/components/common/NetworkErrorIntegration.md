# Network Error Handling Integration Guide

## Overview
This guide shows how to integrate the network error handling system into your existing components and API services.

## Components Created

### 1. NetworkErrorModal
- **Location**: `src/components/common/NetworkErrorModal.jsx`
- **Purpose**: Displays network error popup with retry functionality
- **Features**: 
  - Auto-detects online/offline status
  - Customizable error messages
  - Retry functionality
  - Troubleshooting tips
  - Matches project theme (teal colors)

### 2. NetworkErrorProvider
- **Location**: `src/context/NetworkErrorContext.jsx`
- **Purpose**: Global context for managing network errors
- **Features**:
  - Auto-detects network status changes
  - Provides global error handling
  - Manages modal state
  - Auto-retry functionality

### 3. useNetworkError Hook
- **Location**: `src/hooks/useNetworkError.js`
- **Purpose**: Easy-to-use hook for components
- **Methods**:
  - `showError()` - Show custom error
  - `handleApiError()` - Auto-handle API errors
  - `showConnectionError()` - Show connection error
  - `showServerError()` - Show server error
  - `showTimeoutError()` - Show timeout error
  - `showOfflineError()` - Show offline error

### 4. Enhanced API Service
- **Location**: `src/api/EnhancedApiService.js`
- **Purpose**: API service with automatic error detection
- **Features**:
  - Auto-detects network errors
  - Retry functionality
  - Custom error handling

## Integration Steps

### Step 1: Basic Component Integration

```jsx
import React, { useState } from 'react';
import { useNetworkError } from '../hooks/useNetworkError';

const MyComponent = () => {
  const networkError = useNetworkError();
  const [loading, setLoading] = useState(false);

  const handleApiCall = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      // Handle success
    } catch (error) {
      // Let the hook handle network errors automatically
      const wasHandled = networkError.handleApiError(error, () => handleApiCall());
      if (!wasHandled) {
        // Handle other types of errors
        console.error('Non-network error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleApiCall} disabled={loading}>
        {loading ? 'Loading...' : 'Make API Call'}
      </button>
    </div>
  );
};
```

### Step 2: Existing API Service Integration

For your existing API services (like StandardPaymentService), add error handling:

```jsx
// In your existing API service
import { isNetworkError, getErrorDetails } from '../utils/apiErrorHandler';

const makeApiCall = async (config) => {
  try {
    const response = await paymentAPI.post('/create', config);
    return response.data;
  } catch (error) {
    // Check if it's a network error
    if (isNetworkError(error)) {
      const errorDetails = getErrorDetails(error);
      
      // Create enhanced error for the component to handle
      const networkError = new Error(errorDetails.message);
      networkError.isNetworkError = true;
      networkError.errorDetails = errorDetails;
      throw networkError;
    }
    
    // Re-throw other errors
    throw error;
  }
};
```

### Step 3: Component Usage with Existing Services

```jsx
import { createStandardPayment } from '../api/StandardPaymentService';
import { useNetworkError } from '../hooks/useNetworkError';

const PaymentComponent = () => {
  const networkError = useNetworkError();

  const handlePayment = async (paymentData) => {
    try {
      const result = await createStandardPayment(paymentData);
      // Handle success
    } catch (error) {
      if (error.isNetworkError) {
        // Show network error modal with retry
        networkError.showError({
          title: error.errorDetails.title,
          message: error.errorDetails.message,
          retryFunction: () => handlePayment(paymentData),
          showRetryButton: true
        });
      } else {
        // Handle other errors (validation, etc.)
        toast.error(error.message);
      }
    }
  };

  return (
    <button onClick={() => handlePayment(data)}>
      Make Payment
    </button>
  );
};
```

## Quick Integration for Existing Components

### Method 1: Minimal Integration
Just add the hook and handle errors:

```jsx
const networkError = useNetworkError();

// In your catch block:
catch (error) {
  const wasHandled = networkError.handleApiError(error, retryFunction);
  if (!wasHandled) {
    // Handle non-network errors
  }
}
```

### Method 2: Manual Error Handling
Show specific error types:

```jsx
const networkError = useNetworkError();

// Show connection error
networkError.showConnectionError(() => retryFunction());

// Show server error
networkError.showServerError(() => retryFunction());

// Show timeout error
networkError.showTimeoutError(() => retryFunction());
```

## Error Types Detected

The system automatically detects these network errors:
- **Offline**: `navigator.onLine === false`
- **Network errors**: Connection refused, DNS errors
- **Timeouts**: Request timeout errors
- **Server errors**: 5xx HTTP status codes
- **Service unavailable**: 503 status code
- **Fetch errors**: Network request failures

## Customization

### Custom Error Messages
```jsx
networkError.showError({
  title: "Custom Error Title",
  message: "Custom error message for your specific case",
  retryFunction: () => yourRetryFunction(),
  showRetryButton: true
});
```

### Auto-Retry Configuration
```jsx
networkError.showError({
  title: "Connection Error",
  message: "Retrying automatically...",
  retryFunction: () => yourRetryFunction(),
  autoRetry: true,
  maxRetries: 3
});
```

## Testing

To test the network error handling:

1. **Offline Testing**: 
   - Open DevTools → Network tab → Set to "Offline"
   - Try making API calls

2. **Server Error Testing**:
   - Temporarily change API URLs to non-existent endpoints
   - Or stop your backend server

3. **Timeout Testing**:
   - Use network throttling in DevTools
   - Set very slow network speeds

## Benefits

✅ **Consistent UX**: Same error handling across all pages
✅ **Automatic Detection**: No need to manually check error types
✅ **Retry Functionality**: Users can easily retry failed requests
✅ **Theme Matching**: Matches your existing teal theme
✅ **Offline Support**: Detects and handles offline scenarios
✅ **Easy Integration**: Minimal code changes required
