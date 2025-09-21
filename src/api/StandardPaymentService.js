import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance for standard payments
const paymentAPI = axios.create({
    baseURL: `${API_BASE_URL}/api/user/payments`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
paymentAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        console.log('🔑 Payment API - Token check:', token ? 'Token found' : 'No token found');
        console.log('🔗 Payment API - Request URL:', config.url);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Payment API - Authorization header added');
        } else {
            console.warn('⚠️ Payment API - No accessToken found in localStorage');
        }
        return config;
    },
    (error) => {
        console.error('❌ Payment API - Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
paymentAPI.interceptors.response.use(
    (response) => {
        console.log('✅ Payment API - Response received:', response.status);
        return response;
    },
    (error) => {
        console.error('❌ Payment API - Response error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

/**
 * Test standard payment API
 * @returns {Promise<Object>} Test result
 */
export const testStandardPaymentAPI = async () => {
    try {
        console.log('🧪 Testing standard payment API...');
        const response = await paymentAPI.get('/test');
        console.log('✅ Standard payment API test successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Standard payment API test failed:', error.response?.data || error.message);
        throw error.response?.data || { success: false, error: 'API test failed' };
    }
};

/**
 * Create a standard payment transaction
 * @param {Object} paymentData - Payment details
 * @returns {Promise<Object>} Payment creation response
 */
export const createStandardPayment = async (paymentData) => {
    try {
        console.log('🔄 Creating standard payment transaction:', paymentData);
        const response = await paymentAPI.post('/create', paymentData);
        console.log('✅ Standard payment created:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to create standard payment:', error.response?.data || error.message);
        throw error.response?.data || { success: false, error: 'Failed to create payment' };
    }
};

/**
 * Initialize payment with gateway
 * @param {string} paymentId - Payment transaction ID
 * @param {Object} initData - Initialization data
 * @returns {Promise<Object>} Payment initialization response
 */
export const initializeStandardPayment = async (paymentId, initData) => {
    try {
        console.log('🔄 Initializing standard payment:', paymentId, initData);
        const response = await paymentAPI.post(`/${paymentId}/initialize`, initData);
        console.log('✅ Standard payment initialized:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to initialize standard payment:', error.response?.data || error.message);
        throw error.response?.data || { success: false, error: 'Failed to initialize payment' };
    }
};

/**
 * Get payment transaction details
 * @param {string} paymentId - Payment transaction ID
 * @returns {Promise<Object>} Payment details
 */
export const getStandardPayment = async (paymentId) => {
    try {
        console.log('🔄 Getting standard payment details:', paymentId);
        const response = await paymentAPI.get(`/${paymentId}`);
        console.log('✅ Standard payment details retrieved:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to get standard payment:', error.response?.data || error.message);
        throw error.response?.data || { success: false, error: 'Failed to get payment details' };
    }
};

/**
 * Check and update payment status from gateway for standard payments
 * @param {string} paymentId - Payment transaction ID
 * @returns {Promise<Object>} Payment status check response
 */
export const checkStandardPaymentStatus = async (paymentId) => {
    try {
        console.log('🔍 Checking standard payment status:', paymentId);
        const response = await paymentAPI.get(`/${paymentId}/check-payment-status`);
        console.log('✅ Standard payment status checked:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to check standard payment status:', error.response?.data || error.message);
        throw error.response?.data || { success: false, error: 'Failed to check payment status' };
    }
};

/**
 * Confirm payment completion
 * @param {string} paymentId - Payment transaction ID
 * @param {Object} confirmData - Confirmation data
 * @returns {Promise<Object>} Payment confirmation response
 */
export const confirmStandardPayment = async (paymentId, confirmData) => {
    try {
        console.log('🔄 Confirming standard payment:', paymentId, confirmData);
        const response = await paymentAPI.post(`/${paymentId}/confirm`, confirmData);
        console.log('✅ Standard payment confirmed:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to confirm standard payment:', error.response?.data || error.message);
        throw error.response?.data || { success: false, error: 'Failed to confirm payment' };
    }
};

export default {
    testStandardPaymentAPI,
    createStandardPayment,
    initializeStandardPayment,
    getStandardPayment,
    checkStandardPaymentStatus,
    confirmStandardPayment
};
