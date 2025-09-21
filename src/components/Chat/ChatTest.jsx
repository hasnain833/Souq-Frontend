import React, { useState, useEffect } from 'react';
import { getUserChats, createOrGetChat, getChatMessages } from '../../api/ChatService';
import { getAccessToken } from '../../utils/TokenStorage';
import useWebSocketChat from '../../hooks/useWebSocketChat';

const ChatTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  
  const {
    socket,
    connected,
    error: socketError,
    messages,
    currentChat,
    joinChat,
    sendMessage,
    markAsSeen
  } = useWebSocketChat();

  const addResult = (test, status, message, data = null) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test 1: Check authentication
    addResult('Authentication', 'running', 'Checking authentication...');
    const token = getAccessToken();
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token) {
      addResult('Authentication', 'failed', 'No access token found');
      setIsRunning(false);
      return;
    }
    
    if (!user) {
      addResult('Authentication', 'failed', 'No user data found');
      setIsRunning(false);
      return;
    }
    
    addResult('Authentication', 'passed', `User: ${user.userName} (${user.id || user._id})`);

    // Test 2: Check WebSocket connection
    addResult('WebSocket', 'running', 'Checking WebSocket connection...');
    
    if (!connected) {
      addResult('WebSocket', 'failed', `Not connected. Error: ${socketError || 'Unknown'}`);
    } else {
      addResult('WebSocket', 'passed', `Connected with socket ID: ${socket?.id}`);
    }

    // Test 3: Fetch user chats
    addResult('API - Get Chats', 'running', 'Fetching user chats...');
    
    try {
      const chatsResponse = await getUserChats(1, 10);
      
      if (chatsResponse.success) {
        const chats = chatsResponse.data.data.chats;
        addResult('API - Get Chats', 'passed', `Found ${chats.length} chats`, chats);
      } else {
        addResult('API - Get Chats', 'failed', chatsResponse.error);
      }
    } catch (error) {
      addResult('API - Get Chats', 'failed', error.message);
    }

    // Test 4: Create/Get chat for product (if product ID provided)
    if (selectedProductId) {
      addResult('API - Create Chat', 'running', `Creating/getting chat for product ${selectedProductId}...`);
      
      try {
        const chatResponse = await createOrGetChat(selectedProductId);
        
        if (chatResponse.success) {
          const chat = chatResponse.data.data.chat;
          addResult('API - Create Chat', 'passed', `Chat created/found: ${chat.id}`, chat);
          
          // Test 5: Join chat via WebSocket
          if (connected) {
            addResult('WebSocket - Join Chat', 'running', 'Joining chat room...');
            joinChat(chat.id, chat.roomId);
            
            setTimeout(() => {
              if (currentChat?.chatId === chat.id) {
                addResult('WebSocket - Join Chat', 'passed', `Joined room: ${chat.roomId}`);
              } else {
                addResult('WebSocket - Join Chat', 'failed', 'Failed to join chat room');
              }
            }, 1000);
          }
          
          // Test 6: Get chat messages
          addResult('API - Get Messages', 'running', 'Fetching chat messages...');
          
          try {
            const messagesResponse = await getChatMessages(chat.id);
            
            if (messagesResponse.success) {
              const messages = messagesResponse.data.data.messages;
              addResult('API - Get Messages', 'passed', `Found ${messages.length} messages`, messages);
            } else {
              addResult('API - Get Messages', 'failed', messagesResponse.error);
            }
          } catch (error) {
            addResult('API - Get Messages', 'failed', error.message);
          }
        } else {
          addResult('API - Create Chat', 'failed', chatResponse.error);
        }
      } catch (error) {
        addResult('API - Create Chat', 'failed', error.message);
      }
    }

    setIsRunning(false);
  };

  const testSendMessage = () => {
    if (!currentChat || !connected) {
      addResult('Send Message', 'failed', 'No active chat or not connected');
      return;
    }

    addResult('Send Message', 'running', 'Sending test message...');
    
    sendMessage({
      text: `Test message at ${new Date().toLocaleTimeString()}`,
      messageType: 'text'
    });

    addResult('Send Message', 'passed', 'Message sent via WebSocket');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'running': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Chat System Test</h1>
      
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Configuration</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Product ID (optional - for chat creation test):
          </label>
          <input
            type="text"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            placeholder="Enter a product ID to test chat creation"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </button>
          
          <button
            onClick={testSendMessage}
            disabled={!currentChat || !connected}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Send Test Message
          </button>
          
          <button
            onClick={() => setTestResults([])}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Test Results</h2>
        
        {testResults.length === 0 ? (
          <p className="text-gray-500">No tests run yet. Click "Run Tests" to start.</p>
        ) : (
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className={`p-3 rounded-lg ${getStatusColor(result.status)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{result.test}</span>
                    <span className="ml-2 text-sm">({result.status})</span>
                  </div>
                  <span className="text-xs">{result.timestamp}</span>
                </div>
                <p className="mt-1 text-sm">{result.message}</p>
                {result.data && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer">View Data</summary>
                    <pre className="text-xs mt-1 bg-gray-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Status */}
      <div className="mt-6 bg-gray-50 border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Current Status</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>WebSocket:</strong> {connected ? '✅ Connected' : '❌ Disconnected'}
          </div>
          <div>
            <strong>Socket ID:</strong> {socket?.id || 'N/A'}
          </div>
          <div>
            <strong>Current Chat:</strong> {currentChat?.chatId || 'None'}
          </div>
          <div>
            <strong>Messages:</strong> {messages?.length || 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatTest;
