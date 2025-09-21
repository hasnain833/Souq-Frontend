import apiService from './ApiService';

const PAYPAL_BASE = '/api/user/paypal-accounts';

/**
 * Add a new PayPal account
 */
export const addPaypalAccount = async (paypalData) => {
  const requestData = {
    email: paypalData.email,
    accountType: paypalData.accountType || 'personal',
    setAsDefault: paypalData.isDefault || false,
  };

  const res = await apiService({
    url: `${PAYPAL_BASE}/add`,
    method: 'POST',
    data: requestData,
  });

  return res.data;
};

/**
 * Get user's PayPal accounts
 */
export const getPaypalAccounts = async (activeOnly = true) => {
  const res = await apiService({
    url: `${PAYPAL_BASE}/`,
    method: 'GET',
    params: { activeOnly },
  });

  return res.data;
};

/**
 * Get default PayPal account
 */
export const getDefaultPaypalAccount = async () => {
  const res = await apiService({
    url: `${PAYPAL_BASE}/default`,
    method: 'GET',
  });

  return res.data;
};

/**
 * Set PayPal account as default
 */
export const setDefaultPaypalAccount = async (accountId) => {
  const res = await apiService({
    url: `${PAYPAL_BASE}/${accountId}/set-default`,
    method: 'PUT',
  });

  return res.data;
};

/**
 * Verify PayPal account
 */
export const verifyPaypalAccount = async (accountId) => {
  const res = await apiService({
    url: `${PAYPAL_BASE}/${accountId}/verify`,
    method: 'POST',
  });

  return res.data;
};

/**
 * Delete PayPal account
 */
export const deletePaypalAccount = async (accountId) => {
  const res = await apiService({
    url: `${PAYPAL_BASE}/${accountId}`,
    method: 'DELETE',
  });

  return res.data;
};

/**
 * Get PayPal connection status
 */
export const getConnectionStatus = async () => {
  const res = await apiService({
    url: `${PAYPAL_BASE}/connection-status`,
    method: 'GET',
  });

  return res.data;
};

/**
 * Validate PayPal email format
 */
export const validatePaypalEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default {
  addPaypalAccount,
  getPaypalAccounts,
  getDefaultPaypalAccount,
  setDefaultPaypalAccount,
  verifyPaypalAccount,
  deletePaypalAccount,
  getConnectionStatus,
  validatePaypalEmail
};