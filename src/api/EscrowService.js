import apiService from './ApiService';
/**
 * Create escrow transaction
 * @param {Object} payload - Escrow transaction data
 * @returns {Promise<Object>} API response
 */
export const createEscrowTransaction = (payload) =>
  apiService({
    url: '/api/user/escrow/create',
    method: 'POST',
    data: payload,
    withAuth: true,
  });

/**
 * Initialize payment for escrow transaction
 * @param {string} escrowTransactionId - Escrow   transaction ID
 * @param {Object} payload - Payment initialization data
 * @returns {Promise<Object>} API response
 */
export const initializeEscrowPayment = (escrowTransactionId, payload) =>
  apiService({
    url: `/api/user/escrow/${escrowTransactionId}/initialize-payment`,
    method: 'POST',
    data: payload,
    withAuth: true,
  });

/**
 * Get escrow transaction details
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} API response
 */
export const getEscrowTransaction = (transactionId) =>
  apiService({
    url: `/api/user/escrow/${transactionId}`,
    method: 'GET',
    withAuth: true,
  });

/**
 * Get escrow transaction status only
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} API response
 */
export const getEscrowTransactionStatus = (transactionId) =>
  apiService({
    url: `/api/user/escrow/${transactionId}/status`,
    method: 'GET',
    withAuth: true,
  });

/**
 * Get user's escrow transactions
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response
 */
export const getUserEscrowTransactions = (params = {}) =>
  apiService({
    url: '/user/escrow',
    method: 'GET',
    params,
    withAuth: true,
  });

/**
 * Mark item as shipped (seller only)
 * @param {string} transactionId - Transaction ID
 * @param {Object} payload - Shipping details
 * @returns {Promise<Object>} API response
 */
export const markAsShipped = (transactionId, payload) =>
  apiService({
    url: `/user/escrow/${transactionId}/ship`,
    method: 'PATCH',
    data: payload,
    withAuth: true,
  });

/**
 * Confirm delivery (buyer only)
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} API response
 */
export const confirmDelivery = (transactionId) =>
  apiService({
    url: `/user/escrow/${transactionId}/confirm-delivery`,
    method: 'PATCH',
    withAuth: true,
  });

/**
 * Verify payment status
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} API response
 */
export const verifyPaymentStatus = (transactionId) =>
  apiService({
    url: `/user/escrow/${transactionId}/verify-payment`,
    method: 'GET',
    withAuth: true,
  });

/**
 * Complete payment after successful gateway confirmation
 * @param {string} transactionId - Transaction ID
 * @param {Object} paymentData - Payment completion data
 * @returns {Promise<Object>} API response
 */
export const completePayment = (transactionId, paymentData) =>
  apiService({
    url: `/user/escrow/${transactionId}/complete-payment`,
    method: 'POST',
    data: paymentData,
    withAuth: true,
  });

/**
 * Check and update payment status from gateway
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} API response
 */
export const checkPaymentStatus = (transactionId) =>
  apiService({
    url: `/escrow/${transactionId}/check-payment-status`,
    method: 'GET',
    withAuth: true,
  });

/**
 * Get transaction details by transaction ID (alternative endpoint)
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} API response
 */
export const getTransactionDetails = (transactionId) =>
  apiService({
    url: `/user/escrow/transaction/${transactionId}`,
    method: 'GET',
    withAuth: true,
  });

// Note: The following endpoints are not yet implemented in the backend
// Uncomment and update when backend endpoints are available

/**
 * Get available payment gateways
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response
 */
// export const getPaymentGateways = (params = {}) =>
//   apiService({
//     url: '/user/escrow/gateways',
//     method: 'GET',
//     params,
//     withAuth: true,
//   });

/**
 * Calculate escrow fees
 * @param {Object} payload - Fee calculation data
 * @returns {Promise<Object>} API response
 */
// export const calculateEscrowFees = (payload) =>
//   apiService({
//     url: '/user/escrow/calculate-fees',
//     method: 'POST',
//     data: payload,
//     withAuth: true,
//   });

/**
 * Get escrow transaction statistics
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response
 */
// export const getEscrowStatistics = (params = {}) =>
//   apiService({
//     url: '/user/escrow/statistics',
//     method: 'GET',
//     params,
//     withAuth: true,
//   });
