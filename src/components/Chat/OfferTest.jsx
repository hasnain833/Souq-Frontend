import React, { useState } from 'react';
import { createOffer, acceptOffer, declineOffer, getChatOffer } from '../../api/OfferService';

const OfferTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [chatId, setChatId] = useState('');
  const [offerId, setOfferId] = useState('');

  const addResult = (test, status, message, data = null) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testCreateOffer = async () => {
    if (!chatId) {
      addResult('Create Offer', 'error', 'Please enter a chat ID');
      return;
    }

    try {
      const response = await createOffer(chatId, {
        offerAmount: 10.00,
        message: 'Test offer from offer test component'
      });
      
      if (response.success) {
        addResult('Create Offer', 'success', 'Offer created successfully', response.data);
        setOfferId(response.data.offer._id);
      } else {
        addResult('Create Offer', 'error', response.message || 'Failed to create offer');
      }
    } catch (error) {
      addResult('Create Offer', 'error', error.message || 'Network error');
    }
  };

  const testAcceptOffer = async () => {
    if (!offerId) {
      addResult('Accept Offer', 'error', 'Please create an offer first or enter an offer ID');
      return;
    }

    try {
      const response = await acceptOffer(offerId, 'Test acceptance message');
      
      if (response.success) {
        addResult('Accept Offer', 'success', 'Offer accepted successfully', response.data);
      } else {
        addResult('Accept Offer', 'error', response.message || 'Failed to accept offer');
      }
    } catch (error) {
      addResult('Accept Offer', 'error', error.message || 'Network error');
    }
  };

  const testDeclineOffer = async () => {
    if (!offerId) {
      addResult('Decline Offer', 'error', 'Please create an offer first or enter an offer ID');
      return;
    }

    try {
      const response = await declineOffer(offerId, 'Test decline message');
      
      if (response.success) {
        addResult('Decline Offer', 'success', 'Offer declined successfully', response.data);
      } else {
        addResult('Decline Offer', 'error', response.message || 'Failed to decline offer');
      }
    } catch (error) {
      addResult('Decline Offer', 'error', error.message || 'Network error');
    }
  };

  const testGetChatOffer = async () => {
    if (!chatId) {
      addResult('Get Chat Offer', 'error', 'Please enter a chat ID');
      return;
    }

    try {
      const response = await getChatOffer(chatId);
      
      if (response.success) {
        addResult('Get Chat Offer', 'success', 'Chat offer retrieved successfully', response.data);
        if (response.data) {
          setOfferId(response.data._id);
        }
      } else {
        addResult('Get Chat Offer', 'info', 'No active offer found for this chat');
      }
    } catch (error) {
      addResult('Get Chat Offer', 'error', error.message || 'Network error');
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    addResult('Test Suite', 'info', 'Starting offer API tests...');
    
    // Test get chat offer first
    await testGetChatOffer();
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test create offer
    await testCreateOffer();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test get chat offer again
    await testGetChatOffer();
    
    addResult('Test Suite', 'info', 'Test suite completed');
    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Offer API Test Suite</h2>
      
      {/* Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chat ID
          </label>
          <input
            type="text"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="Enter chat ID to test"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Offer ID (auto-filled)
          </label>
          <input
            type="text"
            value={offerId}
            onChange={(e) => setOfferId(e.target.value)}
            placeholder="Offer ID (auto-filled from tests)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Test Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={runAllTests}
          disabled={isRunning || !chatId}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </button>
        <button
          onClick={testCreateOffer}
          disabled={isRunning || !chatId}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          Test Create Offer
        </button>
        <button
          onClick={testAcceptOffer}
          disabled={isRunning || !offerId}
          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
        >
          Test Accept Offer
        </button>
        <button
          onClick={testDeclineOffer}
          disabled={isRunning || !offerId}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          Test Decline Offer
        </button>
        <button
          onClick={testGetChatOffer}
          disabled={isRunning || !chatId}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          Test Get Chat Offer
        </button>
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      {/* Test Results */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Test Results</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {testResults.length === 0 ? (
            <p className="text-gray-500 italic">No tests run yet. Enter a chat ID and click "Run All Tests" to start.</p>
          ) : (
            testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-md border-l-4 ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-400 text-green-800'
                    : result.status === 'error'
                    ? 'bg-red-50 border-red-400 text-red-800'
                    : 'bg-blue-50 border-blue-400 text-blue-800'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{result.test}</div>
                    <div className="text-sm mt-1">{result.message}</div>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium">View Data</summary>
                        <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 ml-4">{result.timestamp}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">Instructions:</h4>
        <ol className="text-sm text-yellow-700 space-y-1">
          <li>1. Enter a valid chat ID from your database</li>
          <li>2. Click "Run All Tests" to test the complete flow</li>
          <li>3. Or use individual test buttons to test specific functionality</li>
          <li>4. Check the console for additional debug information</li>
          <li>5. Make sure you're logged in and have proper permissions</li>
        </ol>
      </div>
    </div>
  );
};

export default OfferTest;
