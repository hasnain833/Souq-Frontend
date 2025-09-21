// src/services/offerService.js

import apiService from './ApiService';

const OFFER_BASE_URL = '/api/user/offer';

// Create a new offer
export const createOffer = async (chatId, offerData) => {
  const res = await apiService({
    url: `${OFFER_BASE_URL}/chat/${chatId}`,
    method: 'POST',
    data: offerData,
    withAuth: true,
  });
  return res.data;
};

// Get offer details
export const getOffer = async (offerId) => {
  const res = await apiService({
    url: `${OFFER_BASE_URL}/${offerId}`,
    method: 'GET',
    withAuth: true,
  });
  return res.data;
};

// Accept offer (seller only)
export const acceptOffer = async (offerId, message = '') => {
  const res = await apiService({
    url: `${OFFER_BASE_URL}/${offerId}/accept`,
    method: 'PATCH',
    data: { message },
    withAuth: true,
  });
  return res.data;
};

// Decline offer (seller only)
export const declineOffer = async (offerId, message = '') => {
  const res = await apiService({
    url: `${OFFER_BASE_URL}/${offerId}/decline`,
    method: 'PATCH',
    data: { message },
    withAuth: true,
  });
  return res.data;
};

// Get active offer for a chat
export const getChatOffer = async (chatId) => {
  const res = await apiService({
    url: `${OFFER_BASE_URL}/chat/${chatId}/active`,
    method: 'GET',
    withAuth: true,
  });
  return res.data;
};

export default {
  createOffer,
  getOffer,
  acceptOffer,
  declineOffer,
  getChatOffer,
};
