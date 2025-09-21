import apiService from './ApiService';

/**
 * Get supported currencies
 * @returns {Promise<Object>} API response
 */
export const getSupportedCurrencies = () =>
  apiService({
    url: '/api/user/currency/supported',
    method: 'GET',
  });

/**
 * Convert currency
 * @param {Object} payload - Conversion data
 * @returns {Promise<Object>} API response
 */
export const convertCurrency = (payload) =>
  apiService({
    url: '/api/user/currency/convert',
    method: 'POST',
    data: payload,
    withAuth: true,
  });

/**
 * Get exchange rates
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response
 */
export const getExchangeRates = (params = {}) =>
  apiService({
    url: '/api/user/currency/rates',
    method: 'GET',
    params,
  });

/**
 * Format currency amount
 * @param {Object} payload - Format data
 * @returns {Promise<Object>} API response
 */
export const formatCurrency = (payload) =>
  apiService({
    url: '/api/user/currency/format',
    method: 'POST',
    data: payload,
    withAuth: true,
  });

/**
 * Validate currency and amount
 * @param {Object} payload - Validation data
 * @returns {Promise<Object>} API response
 */
export const validateCurrency = (payload) =>
  apiService({
    url: '/api/user/currency/validate',
    method: 'POST',
    data: payload,
    withAuth: true,
  });

/**
 * Get currency by code
 * @param {string} currencyCode - Currency code
 * @returns {Promise<Object>} API response
 */
export const getCurrency = (currencyCode) =>
  apiService({
    url: `/api/user/currency/${currencyCode}`,
    method: 'GET',
  });

/**
 * Convert multiple amounts
 * @param {Object} payload - Multiple conversion data
 * @returns {Promise<Object>} API response
 */
export const convertMultiple = (payload) =>
  apiService({
    url: '/api/user/currency/convert-multiple',
    method: 'POST',
    data: payload,
    withAuth: true,
  });

/**
 * Get currency statistics
 * @returns {Promise<Object>} API response
 */
export const getCurrencyStatistics = () =>
  apiService({
    url: '/api/user/currency/admin/statistics',
    method: 'GET',
    withAuth: true,
  });

/**
 * Update exchange rates manually
 * @returns {Promise<Object>} API response
 */
export const updateExchangeRates = () =>
  apiService({
    url: '/api/user/currency/admin/update-rates',
    method: 'POST',
    withAuth: true,
  });
