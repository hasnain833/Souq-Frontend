import apiService from './ApiService';

// Get user personalization data
export const getPersonalization = () =>
  apiService({
    url: '/api/user/personalization',
    method: 'GET',
    withAuth: true,
  });

// Save or update user personalization preferences
export const saveOrUpdatePersonalization = (data) =>
  apiService({
    url: '/api/user/personalization/save',
    method: 'POST',
    data,
    withAuth: true,
  });

// Add category/brand to personalization from liked product
export const addPersonalizationFromLikedProduct = (productId) =>
  apiService({
    url: '/api/user/personalization/like',
    method: 'POST',
    data: { productId },
    withAuth: true,
  });
