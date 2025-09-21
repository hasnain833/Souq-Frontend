import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getAccessToken } from '../utils/TokenStorage';
import ChatConnectionTest from '../components/Chat/ChatConnectionTest';
import useWebSocketChat from '../hooks/useWebSocketChat';

const ChatDebugPage = () => {
  const [manualSocket, setManualSocket] = useState(null);
  const [manualConnected, setManualConnected] = useState(false);
  const [manualLogs, setManualLogs] = useState([]);
  const [testMessage, setTestMessage] = useState('Hello, this is a test message!');

  const {
    socket: hookSocket,
    connected: hookConnected,
    error: hookError,
    messageError,
    sendMessage,
    joinChat,
    reconnect
  } = useWebSocketChat();

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setManualLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  const createManualConnection = () => {
    const token = getAccessToken();
    if (!token) {
      addLog('No token found', 'error');
      return;
    }

    const socketURL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL;
    addLog(`Creating manual socket connection to: ${socketURL}`, 'info');

    const socket = io(socketURL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    socket.on('connect', () => {
      addLog(`✅ Manual socket connected! ID: ${socket.id}`, 'success');
      setManualConnected(true);
    });

    socket.on('disconnect', (reason) => {
      addLog(`❌ Manual socket disconnected: ${reason}`, 'warning');
      setManualConnected(false);
    });

    socket.on('connect_error', (error) => {
      addLog(`❌ Manual socket connection error: ${error.message}`, 'error');
      addLog(`Error details: ${JSON.stringify(error)}`, 'error');
    });

    socket.on('error', (error) => {
      addLog(`❌ Manual socket error: ${error.message || error}`, 'error');
    });

    // Chat-specific events
    socket.on('new_message', (message) => {
      addLog(`📨 Received message: ${JSON.stringify(message)}`, 'success');
    });

    socket.on('user_typing', (data) => {
      addLog(`⌨️ User typing: ${JSON.stringify(data)}`, 'info');
    });

    setManualSocket(socket);
  };

  const disconnectManual = () => {
    if (manualSocket) {
      manualSocket.disconnect();
      setManualSocket(null);
      setManualConnected(false);
      addLog('Manual socket disconnected', 'info');
    }
  };

  const testJoinChat = () => {
    if (manualSocket && manualConnected) {
      const testChatData = {
        chatId: 'test-chat-id',
        roomId: 'test-room-id'
      };
      addLog(`Joining test chat: ${JSON.stringify(testChatData)}`, 'info');
      manualSocket.emit('join_chat', testChatData);
    } else {
      addLog('Manual socket not connected', 'error');
    }
  };

  const testSendMessage = () => {
    if (manualSocket && manualConnected) {
      const messageData = {
        chatId: 'test-chat-id',
        roomId: 'test-room-id',
        text: testMessage,
        messageType: 'text'
      };
      addLog(`Sending test message: ${JSON.stringify(messageData)}`, 'info');
      manualSocket.emit('send_message', messageData);
    } else {
      addLog('Manual socket not connected', 'error');
    }
  };

  const clearLogs = () => {
    setManualLogs([]);
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  useEffect(() => {
    return () => {
      if (manualSocket) {
        manualSocket.disconnect();
      }
    };
  }, [manualSocket]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Chat Connection Debug Page</h1>
        
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Hook-based Connection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">useWebSocketChat Hook</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${hookConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Connected: {hookConnected ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${hookSocket ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Socket: {hookSocket ? 'Initialized' : 'Not initialized'}</span>
              </div>
              {hookError && (
                <div className="text-red-600 text-sm">Error: {hookError}</div>
              )}
              {messageError && (
                <div className="text-red-600 text-sm">Message Error: {messageError}</div>
              )}
            </div>
            <div className="mt-4 space-x-2">
              <button
                onClick={reconnect}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Reconnect Hook
              </button>
            </div>
          </div>

          {/* Manual Connection */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Manual Socket Connection</h2>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${manualConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Connected: {manualConnected ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${manualSocket ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Socket: {manualSocket ? 'Created' : 'Not created'}</span>
              </div>
            </div>
            <div className="mt-4 space-x-2">
              {!manualSocket ? (
                <button
                  onClick={createManualConnection}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Connect Manual
                </button>
              ) : (
                <button
                  onClick={disconnectManual}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Disconnect Manual
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Manual Testing Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Manual Testing</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Test Message:</label>
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter test message..."
              />
            </div>
            <div className="space-x-2">
              <button
                onClick={testJoinChat}
                disabled={!manualConnected}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Test Join Chat
              </button>
              <button
                onClick={testSendMessage}
                disabled={!manualConnected}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
              >
                Test Send Message
              </button>
              <button
                onClick={clearLogs}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Clear Logs
              </button>
            </div>
          </div>
        </div>

        {/* Manual Connection Logs */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Manual Connection Logs</h2>
          <div className="max-h-64 overflow-y-auto border rounded p-4 bg-gray-50">
            {manualLogs.length === 0 ? (
              <div className="text-gray-500 text-center">No logs yet</div>
            ) : (
              manualLogs.map((log, index) => (
                <div key={index} className="text-sm mb-1">
                  <span className="text-gray-500">[{log.timestamp}]</span>
                  <span className={`ml-2 ${getLogColor(log.type)}`}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Comprehensive Diagnostics */}
        <ChatConnectionTest />
      </div>
    </div>
  );
};

export default ChatDebugPage;
