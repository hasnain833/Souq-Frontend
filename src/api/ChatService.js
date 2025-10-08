import apiService from './ApiService';

// Create or get chat for a product
// Tries multiple known route patterns to be compatible with different backends
export const createOrGetChat = async (productId) => {
  const attempts = [
    { url: `/api/user/chat/product/${productId}`, method: 'POST' },
    { url: `/api/user/chat/product`, method: 'POST', data: { productId } },
    { url: `/api/user/chat/start/${productId}`, method: 'POST' },
    { url: `/api/user/chat/create/${productId}`, method: 'POST' },
  ];

  let lastError = null;
  for (const cfg of attempts) {
    const res = await apiService({
      url: cfg.url,
      method: cfg.method,
      data: cfg.data,
      withAuth: true,
    });

    if (res?.success) return res;

    // only keep specific 404/Not Found style errors to continue trying
    lastError = res;
    const msg = (res && (res.error || res.message || '')) + '';
    const isNotFound = res?.status === 404 || /not\s*found/i.test(msg) || /endpoint/i.test(msg);
    if (!isNotFound) break; // stop early if error isn't about missing route
  }

  return lastError || { success: false, error: 'Failed to start chat' };
};

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
