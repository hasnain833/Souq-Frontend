import apiService from './ApiService';

/**
 * Get transaction details by transaction ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} API response
 */
export const getTransactionDetails = (transactionId) =>
  apiService({
    url: `/api/user/escrow/transaction/${transactionId}`,
    method: 'GET',
    withAuth: true,
  });

/**
 * Get user's transaction history
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.status - Filter by status
 * @param {string} params.paymentGateway - Filter by payment gateway
 * @returns {Promise<Object>} API response
 */
export const getUserTransactions = (params = {}) =>
  apiService({
    url: '/api/user/escrow/transactions/history',
    method: 'GET',
    params,
    withAuth: true,
  });

/**
 * Get transaction statistics for user
 * @returns {Promise<Object>} API response
 */
export const getTransactionStats = () =>
  apiService({
    url: '/api/user/escrow/transactions/stats',
    method: 'GET',
    withAuth: true,
  });

/**
 * Update transaction status (admin only) - Legacy
 * @param {string} transactionId - Transaction ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} API response
 */
export const updateTransactionStatusLegacy = (transactionId, updateData) =>
  apiService({
    url: `/api/user/escrow/transaction/${transactionId}/status`,
    method: 'PATCH',
    data: updateData,
    withAuth: true,
  });

/**
 * Get transaction status and progress (New API)
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} API response
 */
export const getTransactionStatus = (transactionId) =>
  apiService({
    url: `/api/user/transactions/${transactionId}/status`,
    method: 'GET',
    withAuth: true,
  });

/**
 * Update transaction status (New API)
 * @param {string} transactionId - Transaction ID
 * @param {string} status - New status
 * @param {string} notes - Optional notes
 * @returns {Promise<Object>} API response
 */
export const updateTransactionStatus = (transactionId, status, notes = '') =>
  apiService({
    url: `/api/user/transactions/${transactionId}/status`,
    method: 'PUT',
    data: { status, notes },
    withAuth: true,
  });

/**
 * Get available status transitions for a transaction
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} API response
 */
export const getAvailableTransitions = (transactionId) =>
  apiService({
    url: `/api/user/transactions/${transactionId}/transitions`,
    method: 'GET',
    withAuth: true,
  });

/**
 * Bulk update transaction statuses
 * @param {Array} transactionIds - Array of transaction IDs
 * @param {string} status - New status
 * @param {string} notes - Optional notes
 * @returns {Promise<Object>} API response
 */
export const bulkUpdateTransactionStatus = (transactionIds, status, notes = '') =>
  apiService({
    url: '/api/user/transactions/bulk/status',
    method: 'PUT',
    data: {
      transactions: transactionIds,
      status,
      notes
    },
    withAuth: true,
  });

/**
 * Add note to transaction
 * @param {string} transactionId - Transaction ID
 * @param {Object} noteData - Note data
 * @returns {Promise<Object>} API response
 */
export const addTransactionNote = (transactionId, noteData) =>
  apiService({
    url: `/api/user/escrow/transaction/${transactionId}/notes`,
    method: 'POST',
    data: noteData,
    withAuth: true,
  });

/**
 * Get transaction by gateway transaction ID
 * @param {string} gatewayTransactionId - Gateway transaction ID
 * @returns {Promise<Object>} API response
 */
export const getTransactionByGatewayId = (gatewayTransactionId) =>
  apiService({
    url: `/api/user/escrow/transaction/gateway/${gatewayTransactionId}`,
    method: 'GET',
    withAuth: true,
  });

/**
 * Export transaction data
 * @param {Object} filters - Export filters
 * @returns {Promise<Object>} API response
 */
export const exportTransactions = (filters = {}) =>
  apiService({
    url: '/api/user/escrow/transactions/export',
    method: 'GET',
    params: filters,
    withAuth: true,
  });

// Transaction status constants
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded'
};

// Payment gateway constants
export const PAYMENT_GATEWAYS = {
  STRIPE: 'stripe',
  PAYTABS: 'paytabs',
  PAYPAL: 'paypal',
  PAYFORT: 'payfort',
  CHECKOUT: 'checkout'
};

// Payment method constants
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  WALLET: 'wallet',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay'
};
