import apiService from './ApiService';
// ESCROW_DISABLED: All escrow endpoints are disabled. Export stubs to prevent network calls.
const ESCROW_DISABLED_RESPONSE = (extra = {}) => ({ success: false, error: 'Escrow temporarily disabled', ...extra });

export const createEscrowTransaction = async (_payload) => ESCROW_DISABLED_RESPONSE();

export const initializeEscrowPayment = async (_escrowTransactionId, _payload) => ESCROW_DISABLED_RESPONSE();

export const getEscrowTransaction = async (_transactionId) => ESCROW_DISABLED_RESPONSE();

export const getEscrowTransactionStatus = async (_transactionId) => ESCROW_DISABLED_RESPONSE();

export const getUserEscrowTransactions = async (_params = {}) => ESCROW_DISABLED_RESPONSE({ data: [] });


export const markAsShipped = async (_transactionId, _payload) => ESCROW_DISABLED_RESPONSE();


export const confirmDelivery = async (_transactionId) => ESCROW_DISABLED_RESPONSE();


export const verifyPaymentStatus = async (_transactionId) => ESCROW_DISABLED_RESPONSE();


export const completePayment = async (_transactionId, _paymentData) => ESCROW_DISABLED_RESPONSE();


export const checkPaymentStatus = async (_transactionId) => ESCROW_DISABLED_RESPONSE();


export const getTransactionDetails = async (_transactionId) => ESCROW_DISABLED_RESPONSE();

// Note: The following endpoints are not yet implemented in the backend
// Uncomment and update when backend endpoints are available


// export const getPaymentGateways = (params = {}) =>
//   apiService({
//     url: '/user/escrow/gateways',
//     method: 'GET',
//     params,
//     withAuth: true,
//   });


// export const calculateEscrowFees = (payload) =>
//   apiService({
//     url: '/user/escrow/calculate-fees',
//     method: 'POST',
//     data: payload,
//     withAuth: true,
//   });


// export const getEscrowStatistics = (params = {}) =>
//   apiService({
//     url: '/user/escrow/statistics',
//     method: 'GET',
//     params,
//     withAuth: true,
//   });
