import apiService from "./ApiService";

/**
 * Get escrow dashboard statistics
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response
 */
export const getDashboardStats = (params = {}) =>
  apiService({
    url: "/api/admin/escrow/dashboard/stats",
    method: "GET",
    params,
    withAuth: true,
  });

/**
 * Get all escrow transactions with filters
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response
 */
export const getAllTransactions = (params = {}) =>
  apiService({
    url: "/api/admin/escrow/transactions",
    method: "GET",
    params,
    withAuth: true,
  });

/**
 * Get transaction details
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} API response
 */
export const getTransactionDetails = (transactionId) =>
  apiService({
    url: `/api/admin/escrow/transactions/${transactionId}`,
    method: "GET",
    withAuth: true,
  });

/**
 * Update transaction status
 * @param {string} transactionId - Transaction ID
 * @param {Object} payload - Status update data
 * @returns {Promise<Object>} API response
 */
export const updateTransactionStatus = (transactionId, payload) =>
  apiService({
    url: `/api/admin/escrow/transactions/${transactionId}/status`,
    method: "PATCH",
    data: payload,
    withAuth: true,
  });

/**
 * Process manual payout
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} API response
 */
export const processManualPayout = (transactionId) =>
  apiService({
    url: `/api/admin/escrow/transactions/${transactionId}/payout`,
    method: "POST",
    withAuth: true,
  });

/**
 * Get payment gateway status
 * @returns {Promise<Object>} API response
 */
export const getGatewayStatus = () =>
  apiService({
    url: "/api/admin/escrow/gateways/status",
    method: "GET",
    withAuth: true,
  });

/**
 * Get currency statistics
 * @returns {Promise<Object>} API response
 */
export const getCurrencyStats = () =>
  apiService({
    url: "/api/admin/escrow/currency/stats",
    method: "GET",
    withAuth: true,
  });

/**
 * Update exchange rates manually
 * @returns {Promise<Object>} API response
 */
export const updateExchangeRates = () =>
  apiService({
    url: "/api/admin/escrow/currency/update-rates",
    method: "POST",
    withAuth: true,
  });
