import { useState, useEffect, useRef, useCallback } from 'react';
import { getSharedSocket, releaseSharedSocket } from './sharedSocket';

const useWebSocketChat = () => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [messageError, setMessageError] = useState(null);

  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const pendingJoinRef = useRef(null);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    const socket = getSharedSocket();
    if (!socket) {
      setError('No authentication token found');
      return null;
    }

    if (socketRef.current === socket) {
      console.log('🔄 Socket already initialized');
      return socket;
    }

    console.log('💬 Initializing chat socket listeners');

    const handleConnect = () => {
      console.log('✅ Chat connected via shared socket, ID:', socket.id);
      setConnected(true);
      setError(null);

      // Execute pending join if any
      if (pendingJoinRef.current) {
        const { chatId, roomId } = pendingJoinRef.current;
        console.log('🔄 Executing pending chat join:', { chatId, roomId });
        socket.emit('join_chat', { chatId, roomId });
        setCurrentChat({ chatId, roomId });
        pendingJoinRef.current = null;
        console.log('✅ Pending join executed and currentChat set');
      }
    };

    const handleDisconnect = (reason) => {
      console.log('❌ Chat disconnected:', reason);
      setConnected(false);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    };

    const handleConnectError = (error) => {
      console.error('❌ Chat connection error:', error);
      setError(`Connection failed: ${error.message}`);
      setConnected(false);
    };

    const handleError = (error) => {
      console.error('❌ Chat error:', error);
      const errorMessage = error.message || 'Connection error';

      if (errorMessage.includes('Image') || errorMessage.includes('Message') || 
          errorMessage.includes('content') || errorMessage.includes('text') || 
          errorMessage.includes('data') || errorMessage.includes('format') ||
          errorMessage.includes('size') || errorMessage.includes('permission') || 
          errorMessage.includes('Validation')) {
        setMessageError(errorMessage);

        setMessages(prev => prev.map(msg => {
          if (msg.status === 'sending') {
            const sendingMessages = prev.filter(m => m.status === 'sending');
            const isLatestSending = sendingMessages.length > 0 && msg.id === sendingMessages[sendingMessages.length - 1].id;
            if (isLatestSending) {
              return { ...msg, status: 'failed', error: errorMessage };
            }
          }
          return msg;
        }));

        setTimeout(() => setMessageError(null), 8000);
      } else {
        setError(errorMessage);
      }
    };

    const handleNewMessage = (messageData) => {
      console.log('📨 New message received:', messageData);
      setMessages(prev => {
        const existingMessage = prev.find(msg => {
          if (msg.id === messageData.id) return true;
          if (msg.id && msg.id.startsWith('temp-')) {
            if (messageData.messageType === 'text' && msg.messageType === 'text') {
              return msg.text === messageData.text &&
                     msg.sender.id === messageData.sender.id &&
                     Math.abs(new Date(msg.createdAt) - new Date(messageData.createdAt)) < 30000;
            }
            if (messageData.messageType === 'image' && msg.messageType === 'image') {
              return msg.sender.id === messageData.sender.id &&
                     Math.abs(new Date(msg.createdAt) - new Date(messageData.createdAt)) < 30000;
            }
          }
          return false;
        });

        return existingMessage
          ? prev.map(msg => msg.id === existingMessage.id ? messageData : msg)
          : [...prev, messageData];
      });
    };

    const handleMessageUpdated = (messageData) => {
      console.log('🔄 Message updated:', messageData);
      setMessages(prev => prev.map(msg => 
        msg.id === messageData.id || msg._id === messageData.id ? { ...messageData } : msg
      ));
    };

    const handleUserTyping = (data) => {
      const currentUser = JSON.parse(localStorage.getItem('user'));
      const currentUserId = currentUser?.id || currentUser?._id;
      if (data.user.id !== currentUserId) {
        setOtherUserTyping(data.isTyping);
      }
    };

    const handleMessagesSeen = (data) => {
      setMessages(prev => prev.map(msg => ({
        ...msg,
        seen: msg.sender.id === data.seenBy ? true : msg.seen
      })));
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('error', handleError);
    socket.on('new_message', handleNewMessage);
    socket.on('message_updated', handleMessageUpdated);
    socket.on('user_typing', handleUserTyping);
    socket.on('messages_seen', handleMessagesSeen);

    socketRef.current = socket;
    setConnected(socket.connected);

    return socket;
  }, []);

  // Join a chat room
  const joinChat = useCallback((chatId, roomId) => {
    // Validate inputs
    if (!chatId || !roomId) {
      console.error('❌ joinChat called with invalid parameters:', { chatId, roomId });
      return;
    }

    console.log('🚪 joinChat called:', {
      chatId,
      roomId,
      hasSocket: !!socketRef.current,
      connected,
      socketId: socketRef.current?.id,
      currentChatId: currentChat?.chatId,
      alreadyInSameChat: currentChat?.chatId === chatId
    });

    // If already in the same chat, don't rejoin
    if (currentChat?.chatId === chatId && currentChat?.roomId === roomId) {
      console.log('✅ Already in this chat room, skipping join');
      return;
    }

    // Always set the current chat state immediately for UI responsiveness
    const newChatState = { chatId, roomId };
    setCurrentChat(newChatState);
    console.log('✅ currentChat set immediately to:', newChatState);

    if (socketRef.current && connected) {
      console.log('🚪 Joining chat room immediately:', { chatId, roomId });
      socketRef.current.emit('join_chat', { chatId, roomId });
      pendingJoinRef.current = null; // Clear any pending join
    } else {
      console.log('⏳ Socket not connected yet, storing pending join:', { chatId, roomId });
      pendingJoinRef.current = { chatId, roomId };
    }
  }, [connected, currentChat]);

  // Leave current chat room
  const leaveChat = useCallback(() => {
    if (socketRef.current && currentChat) {
      console.log('🚪 Leaving chat room:', currentChat);
      socketRef.current.emit('leave_chat', currentChat);
      setCurrentChat(null);
      setMessages([]);
    }
  }, [currentChat]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Send a message
  const sendMessage = useCallback((messageData) => {
    setMessageError(null);

    // Debug what's failing
    const hasSocket = !!socketRef.current;
    const hasCurrentChat = !!currentChat;
    const isConnected = connected;
    const hasPendingJoin = !!pendingJoinRef.current;

    console.log('🔍 Send message check:', {
      hasSocket,
      hasCurrentChat,
      isConnected,
      hasPendingJoin,
      currentChat,
      socketId: socketRef.current?.id,
      pendingJoin: pendingJoinRef.current
    });

    if (socketRef.current && connected) {
      // If we don't have currentChat but have a pending join, execute it first
      if (!currentChat && pendingJoinRef.current) {
        const { chatId, roomId } = pendingJoinRef.current;
        console.log('🔄 Auto-joining chat before sending message:', { chatId, roomId });
        socketRef.current.emit('join_chat', { chatId, roomId });
        setCurrentChat({ chatId, roomId });
        pendingJoinRef.current = null;
      }

      // Determine which chat to use for sending the message
      let chatToUse = currentChat;

      // If currentChat is null but we have a pending join, use that
      if (!chatToUse && pendingJoinRef.current) {
        chatToUse = {
          chatId: pendingJoinRef.current.chatId,
          roomId: pendingJoinRef.current.roomId
        };

        // Execute the pending join
        console.log('🔄 Executing pending join for message send:', chatToUse);
        socketRef.current.emit('join_chat', chatToUse);
        setCurrentChat(chatToUse);
        pendingJoinRef.current = null;
      }

      if (chatToUse && chatToUse.chatId && chatToUse.roomId) {
        const messagePayload = {
          chatId: chatToUse.chatId,
          roomId: chatToUse.roomId,
          text: messageData.text || '',
          messageType: messageData.messageType || 'text',
          ...(messageData.messageType === 'image' && messageData.imageUrl && {
            imageUrl: messageData.imageUrl
          })
        };

        console.log('📤 Sending message:', messagePayload);
        socketRef.current.emit('send_message', messagePayload);
      } else {
        const errorMsg = 'Cannot send message - no chat room information available';
        console.warn('⚠️', errorMsg, {
          currentChat,
          pendingJoin: pendingJoinRef.current,
          chatToUse
        });
        setMessageError(errorMsg);
      }
    } else {
      let errorMsg = 'Cannot send message - ';
      if (!hasSocket) {
        errorMsg += 'socket not initialized';
      } else if (!isConnected) {
        errorMsg += 'not connected to server';
      } else {
        errorMsg += 'unknown issue';
      }

      console.warn('⚠️', errorMsg);
      setMessageError(errorMsg);
    }
  }, [currentChat, connected]);

  // Handle typing indicators
  const handleTyping = useCallback((isTyping) => {
    if (socketRef.current && currentChat && connected) {
      const eventName = isTyping ? 'typing_start' : 'typing_stop';
      socketRef.current.emit(eventName, {
        chatId: currentChat.chatId,
        roomId: currentChat.roomId
      });
      setTyping(isTyping);

      // Clear typing after 3 seconds of inactivity
      if (isTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          handleTyping(false);
        }, 3000);
      }
    }
  }, [currentChat, connected]);

  // Mark messages as seen
  const markAsSeen = useCallback(() => {
    if (socketRef.current && currentChat && connected) {
      socketRef.current.emit('mark_seen', {
        chatId: currentChat.chatId,
        roomId: currentChat.roomId
      });
    }
  }, [currentChat, connected]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    if (socketRef.current) {
      console.log('🧹 Cleaning up chat listeners');
      socketRef.current.off('connect');
      socketRef.current.off('disconnect');
      socketRef.current.off('connect_error');
      socketRef.current.off('error');
      socketRef.current.off('new_message');
      socketRef.current.off('message_updated');
      socketRef.current.off('user_typing');
      socketRef.current.off('messages_seen');
      
      if (currentChat) {
        leaveChat();
      }
      
      releaseSharedSocket();
      socketRef.current = null;
    }
  }, [currentChat, leaveChat]);

  // Manual reconnection function
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnection requested');
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setConnected(false);
    setError(null);
    setMessageError(null);

    // Reinitialize socket
    setTimeout(() => {
      initializeSocket();
    }, 1000);
  }, [initializeSocket]);

  // Debug function to check current state
  const debugChatState = useCallback(() => {
    console.log('🔍 Current Chat State:', {
      connected: connected,
      hasSocket: !!socketRef.current,
      socketId: socketRef.current?.id,
      currentChat: currentChat,
      pendingJoin: pendingJoinRef.current,
      messagesCount: messages.length,
      error: error,
      messageError: messageError
    });
  }, [connected, currentChat, messages.length, error, messageError]);

  // Ensure chat is joined before sending message
  const ensureChatJoined = useCallback((chatId, roomId) => {
    return new Promise((resolve) => {
      // If already in the correct chat, resolve immediately
      if (currentChat?.chatId === chatId && currentChat?.roomId === roomId) {
        console.log('✅ Already in correct chat room');
        resolve(true);
        return;
      }

      // If socket is connected, join immediately
      if (socketRef.current && connected) {
        console.log('🚪 Ensuring chat is joined:', { chatId, roomId });
        socketRef.current.emit('join_chat', { chatId, roomId });
        setCurrentChat({ chatId, roomId });
        pendingJoinRef.current = null;

        // Give a small delay for the join to process
        setTimeout(() => resolve(true), 100);
      } else {
        // Store pending join and wait for connection
        console.log('⏳ Storing pending join for later:', { chatId, roomId });
        pendingJoinRef.current = { chatId, roomId };
        setCurrentChat({ chatId, roomId });

        // Wait for connection or timeout
        const checkConnection = () => {
          if (connected && socketRef.current) {
            resolve(true);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      }
    });
  }, [connected, currentChat]);

  // Initialize socket on mount
  useEffect(() => {
    initializeSocket();
    return cleanup;
  }, [initializeSocket, cleanup]);

  return {
    socket: socketRef.current,
    connected,
    error,
    messageError,
    setMessageError,
    messages,
    setMessages,
    clearMessages,
    currentChat,
    typing,
    otherUserTyping,
    joinChat,
    leaveChat,
    sendMessage,
    handleTyping,
    markAsSeen,
    initializeSocket,
    reconnect,
    debugChatState,
    ensureChatJoined
  };
};

export default useWebSocketChat;