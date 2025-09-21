import React, { useState, useEffect } from 'react';
import ShippingService from '../../api/ShippingService';
import { getAccessToken } from '../../utils/TokenStorage';

const ShippingDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    hasToken: !!getAccessToken(),
    token: getAccessToken()?.substring(0, 20) + '...',
    providers: null,
    error: null,
    loading: false
  });

  const testAPI = async () => {
    setDebugInfo(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('Testing shipping API...');
      console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
      console.log('Has Token:', !!getAccessToken());
      
      const response = await ShippingService.getProviders();
      console.log('API Response:', response);
      
      setDebugInfo(prev => ({
        ...prev,
        providers: response.data?.providers || [],
        loading: false
      }));
    } catch (error) {
      console.error('API Error:', error);
      setDebugInfo(prev => ({
        ...prev,
        error: error,
        loading: false
      }));
    }
  };

  const testDirectFetch = async () => {
    try {
      const token = getAccessToken();
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/user/shipping/providers`;
      
      console.log('Testing direct fetch to:', url);
      console.log('With token:', token?.substring(0, 20) + '...');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Direct fetch response status:', response.status);
      console.log('Direct fetch response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('Direct fetch data:', data);
        setDebugInfo(prev => ({
          ...prev,
          providers: data.data?.providers || [],
          error: null
        }));
      } else {
        const errorText = await response.text();
        console.log('Direct fetch error:', errorText);
        setDebugInfo(prev => ({
          ...prev,
          error: { status: response.status, message: errorText }
        }));
      }
    } catch (error) {
      console.error('Direct fetch error:', error);
      setDebugInfo(prev => ({
        ...prev,
        error: error
      }));
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Shipping API Debug</h1>
        
        {/* Debug Info */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>API Base URL:</strong>
              <div className="font-mono bg-gray-100 p-2 rounded">{debugInfo.apiBaseUrl}</div>
            </div>
            <div>
              <strong>Has Token:</strong>
              <div className={`font-mono p-2 rounded ${debugInfo.hasToken ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {debugInfo.hasToken ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="col-span-2">
              <strong>Token Preview:</strong>
              <div className="font-mono bg-gray-100 p-2 rounded text-xs break-all">
                {debugInfo.token || 'No token'}
              </div>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">API Tests</h2>
          <div className="flex gap-4">
            <button
              onClick={testAPI}
              disabled={debugInfo.loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {debugInfo.loading ? 'Testing...' : 'Test ShippingService.getProviders()'}
            </button>
            <button
              onClick={testDirectFetch}
              disabled={debugInfo.loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Test Direct Fetch
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Results</h2>
          
          {debugInfo.loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Testing API...</p>
            </div>
          )}

          {debugInfo.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <h3 className="font-semibold">Error:</h3>
              <pre className="text-sm mt-2 overflow-auto">
                {JSON.stringify(debugInfo.error, null, 2)}
              </pre>
            </div>
          )}

          {debugInfo.providers && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <h3 className="font-semibold">Success! Found {debugInfo.providers.length} providers:</h3>
              <div className="mt-2">
                {debugInfo.providers.map((provider, index) => (
                  <div key={index} className="bg-white p-3 rounded mt-2">
                    <h4 className="font-semibold">{provider.displayName}</h4>
                    <p className="text-sm text-gray-600">Name: {provider.name}</p>
                    <p className="text-sm text-gray-600">Services: {provider.supportedServices?.length || 0}</p>
                    <p className="text-sm text-gray-600">
                      Pricing: {provider.pricing?.baseFee} {provider.pricing?.currency}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-6">
          <h3 className="font-semibold">Debugging Steps:</h3>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Check if you have a valid authentication token</li>
            <li>Verify the API base URL is correct</li>
            <li>Make sure the backend server is running on the correct port</li>
            <li>Check browser network tab for actual HTTP requests</li>
            <li>Verify the API endpoint exists: GET /api/user/shipping/providers</li>
            <li>Check if CORS is properly configured</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ShippingDebug;
