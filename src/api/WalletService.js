import apiService from './ApiService';



// Get seller orders for wallet
export const getSellerOrders = (page = 1, limit = 10) =>
  apiService({
    url: `/api/user/orders?role=seller&page=${page}&limit=${limit}`,
    method: 'GET',
    withAuth: true,
  });

// Get wallet details
export const getWallet = () =>
  apiService({
    url: '/api/user/wallet',
    method: 'GET',
    withAuth: true,
  });

// Get wallet balance for specific currency
export const getWalletBalance = (currency = 'AED') => // Changed default to AED
  apiService({
    url: '/api/user/wallet/balance',
    method: 'GET',
    params: { currency },
    withAuth: true,
  });

// Get transaction history
export const getTransactionHistory = (params = {}) =>
  apiService({
    url: '/api/user/wallet/transactions',
    method: 'GET',
    params: {
      page: 1,
      limit: 20,
      ...params
    },
    withAuth: true,
  });

// Get wallet statistics
export const getWalletStatistics = (period = '30') =>
  apiService({
    url: '/api/user/wallet/statistics',
    method: 'GET',
    params: { period },
    withAuth: true,
  });

// Withdraw money from wallet
export const withdrawMoney = (withdrawalData) =>
  apiService({
    url: '/api/user/wallet/withdraw',
    method: 'POST',
    data: withdrawalData,
    withAuth: true,
  });

// Check withdrawal status
export const checkWithdrawalStatus = (transactionId) =>
  apiService({
    url: `/api/user/wallet/withdrawal/${transactionId}/status`,
    method: 'GET',
    withAuth: true,
  });

// Get withdrawal history
export const getWithdrawalHistory = (params = {}) =>
  apiService({
    url: '/api/user/wallet/withdrawals',
    method: 'GET',
    params: {
      page: 1,
      limit: 10,
      ...params
    },
    withAuth: true,
  });

// Get withdrawal statistics
export const getWithdrawalStats = (period = '30d') =>
  apiService({
    url: '/api/user/wallet/withdrawal-stats',
    method: 'GET',
    params: { period },
    withAuth: true,
  });

// Update wallet settings
export const updateWalletSettings = (settings) =>
  apiService({
    url: '/api/user/wallet/settings',
    method: 'PUT',
    data: settings,
    withAuth: true,
  });

// Get transaction details for progress tracking
export const getTransactionDetails = (transactionId, transactionType = 'auto') =>
  apiService({
    url: `/api/user/wallet/check-transaction?transactionId=${transactionId}&transactionType=${transactionType}`,
    method: 'GET',
    withAuth: true,
  });

// Complete payment and credit wallet
export const completePayment = (paymentData) =>
  apiService({
    url: '/api/user/wallet/complete-payment',
    method: 'POST',
    data: paymentData,
    withAuth: true,
  });

// Helper functions for formatting
export const formatCurrency = (amount, currency = 'AED') => { // Changed default to AED
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatTransactionType = (type) => {
  const typeMap = {
    credit: 'Money Received',
    debit: 'Money Spent',
    refund: 'Refund',
    withdrawal: 'Withdrawal',
    fee: 'Platform Fee',
    bonus: 'Bonus',
    transfer: 'Transfer'
  };
  return typeMap[type] || type;
};

export const getTransactionIcon = (type) => {
  const iconMap = {
    credit: '💰',
    debit: '💸',
    refund: '🔄',
    withdrawal: '🏦',
    fee: '📊',
    bonus: '🎁',
    transfer: '↔️'
  };
  return iconMap[type] || '💳';
};

export const getTransactionColor = (type) => {
  const colorMap = {
    credit: 'text-green-600',
    debit: 'text-red-600',
    refund: 'text-blue-600',
    withdrawal: 'text-orange-600',
    fee: 'text-gray-600',
    bonus: 'text-purple-600',
    transfer: 'text-indigo-600'
  };
  return colorMap[type] || 'text-gray-600';
};
