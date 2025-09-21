import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getToken = () => {
  return localStorage.getItem('accessToken');
};

// Create axios instance with default config
  const token = getToken();

const cardAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/user/cards`,
  headers: {
    'Content-Type': 'application/json',
     Authorization: `Bearer ${token}`
  },
});

// Add auth token to requests
cardAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Card API - Token check:', token ? 'Token found' : 'No token found');
    console.log('🔗 Card API - Request URL:', config.url);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Card API - Authorization header added');
    } else {
      console.warn('⚠️ Card API - No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('❌ Card API - Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
cardAPI.interceptors.response.use(
  (response) => {
    console.log('✅ Card API - Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Card API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      console.warn('🔒 Card API - Authentication required. User might need to log in.');
    }

    return Promise.reject(error);
  }
);

/**
 * Verify card details without saving
 * @param {Object} cardData - Card details to verify
 * @param {string} gateway - Payment gateway to use for verification
 * @returns {Promise<Object>} Verification result
 */
export const verifyCard = async (cardData, gateway = 'stripe') => {
  try {
    const response = await cardAPI.post('/verify', {
      ...cardData,
      gateway
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, error: 'Card verification failed' };
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} Is expired
 */
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} Is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');

  if (!token) {
    console.log('🔍 Authentication check: No token found');
    return false;
  }

  if (isTokenExpired(token)) {
    console.log('🔍 Authentication check: Token is expired');
    localStorage.removeItem('accessToken'); // Clean up expired token
    return false;
  }

  console.log('🔍 Authentication check: User is logged in with valid token');
  return true;
};

/**
 * Test authentication with backend
 * @returns {Promise<Object>} Test result
 */
export const testAuthentication = async () => {
  try {
    console.log('🧪 Testing authentication with backend...');
    const response = await cardAPI.get('/test-auth');
    console.log('✅ Authentication test successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Authentication test failed:', error.response?.data || error.message);
    throw error.response?.data || { success: false, error: 'Authentication test failed' };
  }
};

/**
 * Verify and save card details
 * @param {Object} cardData - Card details to verify and save
 * @param {string} gateway - Payment gateway to use for verification
 * @param {boolean} setAsDefault - Whether to set as default card
 * @returns {Promise<Object>} Save result
 */
export const verifyAndSaveCard = async (cardData, gateway = 'stripe', setAsDefault = false) => {
  try {
    // Check authentication before making request
    if (!isAuthenticated()) {
      throw { success: false, error: 'User not authenticated. Please log in.' };
    }

    console.log('🚀 Card API - Sending verify-and-save request...');
    const response = await cardAPI.post('/verify-and-save', {
      ...cardData,
      gateway,
      setAsDefault
    });
    console.log('✅ Card API - Verify-and-save successful');
    return response.data;
  } catch (error) {
    console.error('❌ Card API - Verify-and-save failed:', error);
    throw error.response?.data || { success: false, error: 'Card save failed' };
  }
};

/**
 * Get user's saved cards
 * @param {boolean} activeOnly - Whether to return only active cards
 * @returns {Promise<Object>} User's cards
 */
export const getUserCards = async (activeOnly = true) => {
  try {
    const response = await cardAPI.get('/', {
      params: { activeOnly }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, error: 'Failed to fetch cards' };
  }
};

/**
 * Get user's default card
 * @returns {Promise<Object>} Default card
 */
export const getDefaultCard = async () => {
  try {
    const response = await cardAPI.get('/default');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, error: 'Failed to fetch default card' };
  }
};

/**
 * Set a card as default
 * @param {string} cardId - Card ID to set as default
 * @returns {Promise<Object>} Update result
 */
export const setDefaultCard = async (cardId) => {
  try {
    const response = await cardAPI.put(`/${cardId}/set-default`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, error: 'Failed to set default card' };
  }
};

/**
 * Delete a card
 * @param {string} cardId - Card ID to delete
 * @returns {Promise<Object>} Delete result
 */
export const deleteCard = async (cardId) => {
  try {
    const response = await cardAPI.delete(`/${cardId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, error: 'Failed to delete card' };
  }
};

/**
 * Get card payment details for processing
 * @param {string} cardId - Card ID
 * @returns {Promise<Object>} Card payment details
 */
export const getCardPaymentDetails = async (cardId) => {
  try {
    const response = await cardAPI.get(`/${cardId}/payment-details`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, error: 'Failed to fetch card details' };
  }
};

/**
 * Validate card number using Luhn algorithm (client-side validation)
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} Is valid
 */
export const validateCardNumber = (cardNumber) => {
  const number = cardNumber.replace(/\s/g, '');
  
  if (!/^\d+$/.test(number)) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Detect card brand from card number
 * @param {string} cardNumber - Card number
 * @returns {string} Card brand
 */
export const detectCardBrand = (cardNumber) => {
  const number = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(number)) return 'visa';
  if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return 'mastercard';
  if (/^3[47]/.test(number)) return 'amex';
  if (/^6(?:011|5)/.test(number)) return 'discover';
  if (/^3[0689]/.test(number)) return 'diners';
  if (/^35/.test(number)) return 'jcb';
  
  return 'unknown';
};

/**
 * Format card number with spaces
 * @param {string} cardNumber - Card number
 * @returns {string} Formatted card number
 */
export const formatCardNumber = (cardNumber) => {
  const number = cardNumber.replace(/\s/g, '');
  const match = number.match(/\d{1,4}/g);
  return match ? match.join(' ') : '';
};

/**
 * Get card brand display name
 * @param {string} brand - Card brand code
 * @returns {string} Display name
 */
export const getCardBrandDisplayName = (brand) => {
  const brandNames = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    diners: 'Diners Club',
    jcb: 'JCB',
    unknown: 'Unknown'
  };
  
  return brandNames[brand] || 'Unknown';
};

/**
 * Get card brand icon/color
 * @param {string} brand - Card brand code
 * @returns {Object} Brand styling info
 */
export const getCardBrandInfo = (brand) => {
  const brandInfo = {
    visa: {
      color: '#1A1F71',
      icon: '💳',
      name: 'Visa'
    },
    mastercard: {
      color: '#EB001B',
      icon: '💳',
      name: 'Mastercard'
    },
    amex: {
      color: '#006FCF',
      icon: '💳',
      name: 'American Express'
    },
    discover: {
      color: '#FF6000',
      icon: '💳',
      name: 'Discover'
    },
    diners: {
      color: '#0079BE',
      icon: '💳',
      name: 'Diners Club'
    },
    jcb: {
      color: '#006C5B',
      icon: '💳',
      name: 'JCB'
    },
    unknown: {
      color: '#666666',
      icon: '💳',
      name: 'Unknown'
    }
  };
  
  return brandInfo[brand] || brandInfo.unknown;
};

export default {
  verifyCard,
  verifyAndSaveCard,
  getUserCards,
  getDefaultCard,
  setDefaultCard,
  deleteCard,
  getCardPaymentDetails,
  validateCardNumber,
  detectCardBrand,
  formatCardNumber,
  getCardBrandDisplayName,
  getCardBrandInfo,
  isAuthenticated,
  testAuthentication
};
