// src/api/paymentService.js
import apiService from './ApiService';

const CARD_BASE = '/api/user/cards';
const BANK_BASE = '/api/user/bank-accounts';

export const addCard = async (cardData) => {
  const requestData = {
    cardNumber: cardData.cardNumber,
    expiryMonth: cardData.expiryMonth,
    expiryYear: cardData.expiryYear,
    cvv: cardData.cvv,
    cardholderName: cardData.cardholderName,
    setAsDefault: cardData.isDefault || false,
    gateway: 'stripe',
  };

  const res = await apiService({
    url: `${CARD_BASE}/verify-and-save`,
    method: 'POST',
    data: requestData,
  });

  return res.data;
};

export const addBankAccount = async (bankData) => {
  const requestData = {
    accountHolderName: bankData.accountHolderName,
    accountNumber: bankData.accountNumber,
    routingNumber: bankData.routingNumber,
    accountType: bankData.accountType,
    bankName: bankData.bankName,
    billingAddress: bankData.billingAddress,
    setAsDefault: bankData.isDefault || false,
  };

  const res = await apiService({
    url: `${BANK_BASE}/add`,
    method: 'POST',
    data: requestData,
  });

  return res.data;
};

export const getCards = async (activeOnly = true) => {
  const res = await apiService({
    url: `${CARD_BASE}/`,
    method: 'GET',
    params: { activeOnly },
  });

  return res.data;
};

export const getBankAccounts = async (activeOnly = true) => {
  const res = await apiService({
    url: `${BANK_BASE}/`,
    method: 'GET',
    params: { activeOnly },
  });

  return res.data;
};

export const setDefaultCard = async (cardId) => {
  const res = await apiService({
    url: `${CARD_BASE}/${cardId}/set-default`,
    method: 'PUT',
  });

  return res.data;
};

export const deleteCard = async (cardId) => {
  const res = await apiService({
    url: `${CARD_BASE}/${cardId}`,
    method: 'DELETE',
  });

  return res.data;
};

export const setDefaultBankAccount = async (accountId) => {
  const res = await apiService({
    url: `${BANK_BASE}/${accountId}/set-default`,
    method: 'PUT',
  });

  return res.data;
};

export const deleteBankAccount = async (accountId) => {
  const res = await apiService({
    url: `${BANK_BASE}/${accountId}`,
    method: 'DELETE',
  });

  return res.data;
};

// =============================
// Utility Functions (Unchanged)
// =============================

export const validateCardNumber = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;

  let sum = 0;
  let isEven = false;
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i));
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

export const getCardBrand = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  const firstDigit = cleanNumber.charAt(0);
  const firstTwo = cleanNumber.slice(0, 2);
  const firstFour = cleanNumber.slice(0, 4);

  if (firstDigit === '4') return 'visa';
  if (['51', '52', '53', '54', '55'].includes(firstTwo)) return 'mastercard';
  if (['34', '37'].includes(firstTwo)) return 'amex';
  if (firstFour === '6011') return 'discover';
  return 'other';
};

export const formatCardNumber = (cardNumber) => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  const groups = cleanNumber.match(/.{1,4}/g) || [];
  return groups.join(' ').substr(0, 19);
};

export const formatExpiryDate = (expiry) => {
  const digits = expiry.replace(/\D/g, '');
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2, 4);
  return digits;
};

export const validateExpiryDate = (expiry) => {
  const match = expiry.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) return false;

  const month = parseInt(match[1]);
  const year = parseInt('20' + match[2]);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  return year > currentYear || (year === currentYear && month >= currentMonth);
};
