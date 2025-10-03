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


export const verifyAndSaveCard = async (cardData, gateway = 'stripe', setAsDefault = false) => {
  try {
    // Check authentication before making request
    if (!isAuthenticated()) {
      throw { success: false, error: 'User not authenticated. Please log in.' };
    }

    // TODO: Restore card verification API later
    // console.log('🚀 Card API - Sending verify-and-save request...');
    // const response = await cardAPI.post('/verify-and-save', {
    //   ...cardData,
    //   gateway,
    //   setAsDefault
    // });
    // console.log('✅ Card API - Verify-and-save successful');
    // return response.data;

    // Mocked success response to avoid hitting backend
    console.warn('⚠️ Using mocked verify-and-save response (backend call disabled)');
    await new Promise((res) => setTimeout(res, 400)); // slight delay for UX
    return {
      success: true,
      message: 'Card saved successfully',
      data: {
        card: {
          id: 'mock-card-id',
          brand: detectCardBrand(cardData.cardNumber || ''),
          last4: (cardData.cardNumber || '').slice(-4),
          isDefault: !!setAsDefault,
        },
      },
    };
  } catch (error) {
    console.error('❌ Card API - Verify-and-save failed:', error);
    throw error.response?.data || { success: false, error: 'Card save failed' };
  }
};

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

export const getDefaultCard = async () => {
  try {
    const response = await cardAPI.get('/default');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, error: 'Failed to fetch default card' };
  }
};

export const setDefaultCard = async (cardId) => {
  try {
    const response = await cardAPI.put(`/${cardId}/set-default`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, error: 'Failed to set default card' };
  }
};

export const deleteCard = async (cardId) => {
  try {
    const response = await cardAPI.delete(`/${cardId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, error: 'Failed to delete card' };
  }
};

export const getCardPaymentDetails = async (cardId) => {
  try {
    const response = await cardAPI.get(`/${cardId}/payment-details`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, error: 'Failed to fetch card details' };
  }
};

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

export const formatCardNumber = (cardNumber) => {
  const number = cardNumber.replace(/\s/g, '');
  const match = number.match(/\d{1,4}/g);
  return match ? match.join(' ') : '';
};

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
