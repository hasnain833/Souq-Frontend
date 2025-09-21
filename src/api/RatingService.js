import { toast } from 'react-toastify';
import apiService from './ApiService';

/**
 * Submit a rating for a transaction
 * @param {string} transactionId - Transaction ID
 * @param {Object} ratingData - Rating data
 * @returns {Promise<Object>} API response
 */
export const submitRating = async (transactionId, ratingData,type = 'standard' ) => {
  try {
    console.log('🌟 Rating API - Submitting rating for transaction:', transactionId);
    // console.log('🌟 Rating data:', ratingData);

    const response = await apiService({
      url: `/ratings/transaction/${transactionId}?type=${type}`,
      method: 'POST',
      data: ratingData,
      withAuth: true,
    });

    console.log('✅ Rating API - Submit rating successful');
    return response.data;
  } catch (error) {
    console.error('❌ Rating API - Submit rating failed:', error);
    throw error;
  }
};

/**
 * Submit a rating for a product (without transaction)
 * @param {string} productId - Product ID
 * @param {Object} ratingData - Rating data
 * @returns {Promise<Object>} API response
 */
export const submitProductRating = async (productId, ratingData) => {
  try {
    console.log('🌟 Rating API - Submitting product rating for:', productId);
    console.log('🌟 Product rating data:', ratingData);

    const response = await apiService({
      url: `/api/user/ratings/product/${productId}`,
      method: 'POST',
      data: ratingData,
      withAuth: true,
    });

    console.log('✅ Rating API - Submit product rating successful', response);

    // Success response - show success message
    // if (response && response.data && response.data.success) {
    //   toast.success('Thank you for your rating! Your feedback helps other buyers.');
    // }

    return response.data;
  } catch (error) {
    console.error('❌ Rating API - Submit product rating failed:', error);

    // Handle specific error cases
    if (error.response && error.response.data) {
      const errorMessage = error.response.data.error || 'An error occurred while submitting the rating';
      toast.error(errorMessage);
    } else {
      toast.error('An error occurred while submitting the rating');
    }

    throw error;
  }
};

/**
 * Get ratings for a specific user
 * @param {string} userId - User ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response
 */
export const getUserRatings = async (userId, params = {}) => {
  try {
    console.log('🌟 Rating API - Fetching user ratings for:', userId);
    
    const response = await apiService({
      url: `/api/user/ratings/user/${userId}`,
      method: 'GET',
      params,
      withAuth: true,
    });
    
    console.log('✅ Rating API - Get user ratings successful');
    return response.data;
  } catch (error) {
    console.error('❌ Rating API - Get user ratings failed:', error);
    throw error;
  }
};

/**
 * Get ratings for a specific product
 * @param {string} productId - Product ID
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} API response
 */
export const getProductRatings = async (productId, params = {}) => {
  try {
    console.log('🌟 Rating API - Fetching product ratings for:', productId);
    
    const response = await apiService({
      url: `/api/user/ratings/product/${productId}`,
      method: 'GET',
      params,
      withAuth: true,
    });
    
    console.log('✅ Rating API - Get product ratings successful');
    return response.data;
  } catch (error) {
    console.error('❌ Rating API - Get product ratings failed:', error);
    throw error;
  }
};

/**
 * Get pending ratings for the authenticated user
 * @returns {Promise<Object>} API response
 */
// export const getPendingRatings = async () => {
//   try {
//     console.log('🌟 Rating API - Fetching pending ratings...');
    
//     const response = await apiService({
//       url: '/ratings/pending',
//       method: 'GET',
//       withAuth: true,
//     });
    
//     console.log('✅ Rating API - Get pending ratings successful');
//     return response.data;
//   } catch (error) {
//     console.error('❌ Rating API - Get pending ratings failed:', error);
//     throw error;
//   }
// };

/**
 * Check if user can rate a specific transaction
 * @param {string} transactionId - Transaction ID
 * @param {string} type - Transaction type ('escrow' or 'standard')
 * @returns {Promise<Object>} API response
 */
export const canRateTransaction = async (transactionId, type = 'escrow') => {
  try {
    console.log('🌟 Rating API - Checking if can rate transaction:', transactionId);

    const response = await apiService({
      url: `/api/user/ratings/transaction/${transactionId}/can-rate?type=${type}`,
      method: 'GET',
      withAuth: true,
    });

    console.log('✅ Rating API - Can rate transaction check successful');
    return response.data;
  } catch (error) {
    console.error('❌ Rating API - Can rate transaction check failed:', error);
    throw error;
  }
};

/**
 * Get existing rating for a transaction by the current user
 * @param {string} transactionId - Transaction ID
 * @param {string} type - Transaction type ('escrow' or 'standard')
 * @returns {Promise<Object>} API response
 */
export const getTransactionRating = async (transactionId, type = 'escrow') => {
  try {
    console.log('🌟 Rating API - Getting transaction rating:', transactionId);

    const response = await apiService({
      url: `/api/user/ratings/transaction/${transactionId}?type=${type}`,
      method: 'GET',
      withAuth: true,
    });

    console.log('✅ Rating API - Get transaction rating successful');
    return response.data;
  } catch (error) {
    console.error('❌ Rating API - Get transaction rating failed:', error);
    throw error;
  }
};

/**
 * Helper function to format rating display
 * @param {number} rating - Rating value
 * @param {number} totalRatings - Total number of ratings
 * @returns {Object} Formatted rating data
 */
export const formatRatingDisplay = (rating, totalRatings = 0) => {
  if (!rating || rating === 0) {
    return {
      displayRating: '0.0',
      starPercentage: 0,
      ratingText: 'No ratings yet',
      totalText: ''
    };
  }

  const displayRating = rating.toFixed(1);
  const starPercentage = (rating / 5) * 100;
  const ratingText = `${displayRating} out of 5`;
  const totalText = totalRatings > 0 ? `(${totalRatings} ${totalRatings === 1 ? 'rating' : 'ratings'})` : '';

  return {
    displayRating,
    starPercentage,
    ratingText,
    totalText
  };
};

/**
 * Helper function to get rating color based on value
 * @param {number} rating - Rating value
 * @returns {string} CSS color class
 */
export const getRatingColor = (rating) => {
  if (rating >= 4.5) return 'text-green-600';
  if (rating >= 4.0) return 'text-yellow-500';
  if (rating >= 3.0) return 'text-orange-500';
  if (rating >= 2.0) return 'text-red-500';
  return 'text-gray-400';
};

/**
 * Helper function to validate rating data
 * @param {Object} ratingData - Rating data to validate
 * @returns {Object} Validation result
 */
export const validateRatingData = (ratingData) => {
  const errors = {};

  // Validate rating
  if (!ratingData.rating) {
    errors.rating = 'Rating is required';
  } else if (!Number.isInteger(ratingData.rating) || ratingData.rating < 1 || ratingData.rating > 5) {
    errors.rating = 'Rating must be between 1 and 5';
  }

  // Validate rating type
  if (!ratingData.ratingType) {
    errors.ratingType = 'Rating type is required';
  } else if (!['buyer_to_seller', 'seller_to_buyer'].includes(ratingData.ratingType)) {
    errors.ratingType = 'Invalid rating type';
  }

  // Validate review length
  if (ratingData.review && ratingData.review.length > 1000) {
    errors.review = 'Review must be less than 1000 characters';
  }

  // Validate categories if provided
  if (ratingData.categories) {
    Object.entries(ratingData.categories).forEach(([key, value]) => {
      if (value !== undefined && (!Number.isInteger(value) || value < 1 || value > 5)) {
        errors[`categories.${key}`] = `${key} rating must be between 1 and 5`;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  submitRating,
  submitProductRating,
  getUserRatings,
  getProductRatings,
  // getPendingRatings,
  canRateTransaction,
  getTransactionRating,
  formatRatingDisplay,
  getRatingColor,
  validateRatingData
};
