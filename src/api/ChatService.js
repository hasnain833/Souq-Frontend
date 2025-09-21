import apiService from './ApiService';

// Create or get chat for a product
export const createOrGetChat = (productId) =>
  apiService({
    url: `/api/user/chat/product/${productId}`,
    method: 'POST',
    withAuth: true,
  });

// Get all chats for the authenticated user
export const getUserChats = (page = 1, limit = 20) =>
  apiService({
    url: '/api/user/chat',
    method: 'GET',
    params: { page, limit },
    withAuth: true,
  });

// Get messages for a specific chat
export const getChatMessages = (chatId, page = 1, limit = 50) =>
  apiService({
    url: `/api/user/chat/${chatId}/messages`,
    method: 'GET',
    params: { page, limit },
    withAuth: true,
  });

// Send a message (HTTP fallback)
export const sendMessage = (chatId, messageData) =>
  apiService({
    url: `/api/user/chat/${chatId}/messages`,
    method: 'POST',
    data: messageData,
    withAuth: true,
  });

// Mark messages as seen
export const markMessagesAsSeen = (chatId) =>
  apiService({
    url: `/api/user/chat/${chatId}/seen`,
    method: 'PATCH',
    withAuth: true,
  });

// Delete chat
export const deleteChat = (chatId) =>
  apiService({
    url: `/api/user/chat/${chatId}`,
    method: 'DELETE',
    withAuth: true,
  });

// Block user
export const blockUser = (userId, reason = 'other', notes = '') =>
  apiService({
    url: `/api/user/chat/block/${userId}`,
    method: 'POST',
    data: { reason, notes },
    withAuth: true,
  });

// Unblock user
export const unblockUser = (userId) =>
  apiService({
    url: `/api/user/chat/block/${userId}`,
    method: 'DELETE',
    withAuth: true,
  });

// Report user
export const reportUser = (userId, reason, description, evidence = []) =>
  apiService({
    url: `/api/user/chat/report/${userId}`,
    method: 'POST',
    data: { reason, description, evidence },
    withAuth: true,
  });

// Get blocked users
export const getBlockedUsers = (page = 1, limit = 20) =>
  apiService({
    url: '/api/user/chat/blocked',
    method: 'GET',
    params: { page, limit },
    withAuth: true,
  });
