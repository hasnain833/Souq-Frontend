import React, { useState, useEffect } from 'react';
import { getAccessToken } from '../../utils/TokenStorage';
import useWebSocketChat from '../../hooks/useWebSocketChat';

const ChatConnectionTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const {
    socket,
    connected,
    error: socketError,
    messageError,
    reconnect,
    initializeSocket
  } = useWebSocketChat();

  const addResult = (test, status, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      data,
      timestamp
    }]);
    console.log(`[${timestamp}] ${test}: ${status} - ${message}`, data);
  };

  const runConnectionTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Check environment variables
    addResult(
      'Environment Check',
      'info',
      'Checking environment configuration',
      {
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL
      }
    );

    // Test 2: Check authentication token
    const token = getAccessToken();
    if (token) {
      // Try to decode the token to check if it's valid
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const isExpired = payload.exp * 1000 < Date.now();

          addResult(
            'Token Check',
            isExpired ? 'warning' : 'success',
            `Token found (${token.length} chars) - ${isExpired ? 'EXPIRED' : 'Valid'}`,
            {
              tokenPreview: `${token.substring(0, 20)}...`,
              payload: {
                userId: payload._id || payload.id,
                email: payload.email,
                exp: new Date(payload.exp * 1000).toISOString(),
                isExpired: isExpired
              }
            }
          );

          if (isExpired) {
            addResult('Token Check', 'error', 'Token is expired - please log in again');
            setIsRunning(false);
            return;
          }
        } else {
          addResult('Token Check', 'error', 'Token format is invalid');
          setIsRunning(false);
          return;
        }
      } catch (error) {
        addResult('Token Check', 'error', `Token decode failed: ${error.message}`);
        setIsRunning(false);
        return;
      }
    } else {
      addResult('Token Check', 'error', 'No authentication token found');
      setIsRunning(false);
      return;
    }

    // Test 3: Check socket initialization
    if (socket) {
      addResult(
        'Socket Initialization',
        'success',
        'Socket instance exists',
        { socketId: socket.id, connected: socket.connected }
      );
    } else {
      addResult('Socket Initialization', 'error', 'Socket instance not found');
    }

    // Test 4: Check connection status
    if (connected) {
      addResult('Connection Status', 'success', 'Socket is connected');
    } else {
      addResult('Connection Status', 'warning', 'Socket is not connected');
    }

    // Test 5: Check for errors
    if (socketError) {
      addResult('Error Check', 'error', `Socket error: ${socketError}`);
    } else {
      addResult('Error Check', 'success', 'No socket errors detected');
    }

    if (messageError) {
      addResult('Message Error Check', 'error', `Message error: ${messageError}`);
    } else {
      addResult('Message Error Check', 'success', 'No message errors detected');
    }

    // Test 6: Test server connectivity
    try {
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      const socketURL = import.meta.env.VITE_SOCKET_URL || baseURL;

      addResult(
        'Server Connectivity',
        'info',
        `Testing connection to ${socketURL}`,
        { socketURL, baseURL }
      );

      // Test health endpoint
      const response = await fetch(`${socketURL}/health`, {
        method: 'GET',
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        addResult('Server Connectivity', 'success', 'Server is reachable', data);
      } else {
        addResult('Server Connectivity', 'warning', `Server responded with status ${response.status}`);
      }
    } catch (error) {
      addResult('Server Connectivity', 'error', `Server connection failed: ${error.message}`);
    }

    // Test 7: Test API connectivity
    try {
      const apiURL = `${import.meta.env.VITE_API_BASE_URL}/api/user`;
      addResult(
        'API Connectivity',
        'info',
        `Testing API connection to ${apiURL}`,
        { apiURL }
      );

      const response = await fetch(`${apiURL}/test`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        addResult('API Connectivity', 'success', 'API is reachable');
      } else if (response.status === 404) {
        addResult('API Connectivity', 'info', 'API endpoint not found (expected for test endpoint)');
      } else {
        addResult('API Connectivity', 'warning', `API responded with status ${response.status}`);
      }
    } catch (error) {
      addResult('API Connectivity', 'error', `API connection failed: ${error.message}`);
    }

    setIsRunning(false);
  };

  const handleReconnect = () => {
    addResult('Manual Reconnect', 'info', 'Attempting manual reconnection...');
    reconnect();
  };

  const handleReinitialize = () => {
    addResult('Manual Reinitialize', 'info', 'Attempting socket reinitialization...');
    initializeSocket();
  };

  // Monitor connection changes
  useEffect(() => {
    if (connected) {
      addResult('Connection Monitor', 'success', 'Socket connected');
    } else {
      addResult('Connection Monitor', 'warning', 'Socket disconnected');
    }
  }, [connected]);

  // Monitor errors
  useEffect(() => {
    if (socketError) {
      addResult('Error Monitor', 'error', `Socket error: ${socketError}`);
    }
  }, [socketError]);

  useEffect(() => {
    if (messageError) {
      addResult('Message Error Monitor', 'error', `Message error: ${messageError}`);
    }
  }, [messageError]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Chat Connection Diagnostics</h2>
      
      {/* Current Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl ${connected ? 'text-green-500' : 'text-red-500'}`}>
              {connected ? '🟢' : '🔴'}
            </div>
            <div className="text-sm">Connection</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl ${socket ? 'text-green-500' : 'text-red-500'}`}>
              {socket ? '🔌' : '❌'}
            </div>
            <div className="text-sm">Socket</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl ${!socketError ? 'text-green-500' : 'text-red-500'}`}>
              {!socketError ? '✅' : '❌'}
            </div>
            <div className="text-sm">No Errors</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl ${getAccessToken() ? 'text-green-500' : 'text-red-500'}`}>
              {getAccessToken() ? '🔑' : '❌'}
            </div>
            <div className="text-sm">Token</div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={runConnectionTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isRunning ? 'Running Tests...' : 'Run Connection Tests'}
        </button>
        <button
          onClick={handleReconnect}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Manual Reconnect
        </button>
        <button
          onClick={handleReinitialize}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Reinitialize Socket
        </button>
        <button
          onClick={() => setTestResults([])}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      {/* Test Results */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Test Results</h3>
        <div className="max-h-96 overflow-y-auto border rounded-lg">
          {testResults.length === 0 ? (
            <div className="p-4 text-gray-500 text-center">
              No test results yet. Click "Run Connection Tests" to start.
            </div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="p-3 border-b last:border-b-0 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">{getStatusIcon(result.status)}</span>
                    <div>
                      <div className="font-medium">{result.test}</div>
                      <div className={`text-sm ${getStatusColor(result.status)}`}>
                        {result.message}
                      </div>
                      {result.data && (
                        <details className="mt-1">
                          <summary className="text-xs text-gray-500 cursor-pointer">
                            Show details
                          </summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{result.timestamp}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatConnectionTest;
