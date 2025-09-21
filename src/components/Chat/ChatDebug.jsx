import React, { useState } from 'react';
import { getAccessToken } from '../../utils/TokenStorage';

const ChatDebug = ({ socket, connected, currentChat, messages, error }) => {
  const [showDebug, setShowDebug] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const token = getAccessToken();

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-1 rounded text-xs z-50"
      >
        Debug Chat
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 max-w-md max-h-96 overflow-auto shadow-lg z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">Chat Debug Info</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-xs">
        {/* Connection Status */}
        <div>
          <strong>Connection:</strong>
          <span className={`ml-2 px-2 py-1 rounded ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div>
            <strong>Error:</strong>
            <span className="ml-2 text-red-600">{error}</span>
          </div>
        )}

        {/* Socket Info */}
        <div>
          <strong>Socket ID:</strong>
          <span className="ml-2 font-mono">{socket?.id || 'N/A'}</span>
        </div>

        {/* Current User */}
        <div>
          <strong>Current User:</strong>
          <div className="ml-2 bg-gray-100 p-2 rounded mt-1">
            <div>ID: {currentUser?.id || currentUser?._id || 'N/A'}</div>
            <div>Name: {currentUser?.userName || 'N/A'}</div>
            <div>Email: {currentUser?.email || 'N/A'}</div>
          </div>
        </div>

        {/* Token */}
        <div>
          <strong>Token:</strong>
          <div className="ml-2 bg-gray-100 p-2 rounded mt-1 break-all">
            {token ? `${token.substring(0, 20)}...` : 'No token'}
          </div>
        </div>

        {/* Current Chat */}
        <div>
          <strong>Current Chat:</strong>
          {currentChat ? (
            <div className="ml-2 bg-gray-100 p-2 rounded mt-1">
              <div>Chat ID: {currentChat.chatId}</div>
              <div>Room ID: {currentChat.roomId}</div>
            </div>
          ) : (
            <span className="ml-2 text-gray-500">No active chat</span>
          )}
        </div>

        {/* Messages Count */}
        <div>
          <strong>Messages:</strong>
          <span className="ml-2">{messages?.length || 0} messages</span>
        </div>

        {/* Recent Messages */}
        {messages && messages.length > 0 && (
          <div>
            <strong>Recent Messages:</strong>
            <div className="ml-2 bg-gray-100 p-2 rounded mt-1 max-h-32 overflow-y-auto">
              {messages.slice(-3).map((msg, index) => (
                <div key={index} className="text-xs mb-1">
                  <strong>{msg.sender?.userName}:</strong> {msg.text?.substring(0, 30)}...
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Environment */}
        <div>
          <strong>Environment:</strong>
          <div className="ml-2 bg-gray-100 p-2 rounded mt-1">
            <div>API URL: {import.meta.env.VITE_API_BASE_URL}</div>
            <div>Socket URL: {import.meta.env.VITE_API_BASE_URL?.replace('/api', '')}</div>
          </div>
        </div>

        {/* Test Actions */}
        <div>
          <strong>Test Actions:</strong>
          <div className="ml-2 mt-1 space-y-1">
            <button
              onClick={() => {
                console.log('🔄 Attempting to reconnect...');
                socket?.disconnect();
                socket?.connect();
              }}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-2"
              disabled={!socket}
            >
              Reconnect
            </button>
            <button
              onClick={() => {
                console.log('📊 Current state:', {
                  connected,
                  currentChat,
                  messagesCount: messages?.length,
                  socketId: socket?.id,
                  userId: currentUser?.id || currentUser?._id,
                  token: token ? 'Present' : 'Missing'
                });
              }}
              className="bg-gray-500 text-white px-2 py-1 rounded text-xs"
            >
              Log State
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatDebug;
