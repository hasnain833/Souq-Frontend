/**
 * Payment Configuration
 * 
 * This file controls payment gateway settings for the SOUQ application.
 * You can enable/disable specific payment methods here.
 */

const paymentConfig = {
  // Stripe Configuration
  stripe: {
    enabled: true, // Set to true to enable Stripe payments
    preventApiCalls: false, // Set to false to allow Stripe API calls
    reason: 'Enabled for real Stripe payment processing'
  },
  
  // PayTabs Configuration
  paytabs: {
    enabled: true,
    preventApiCalls: false
  },
  
  // PayFort Configuration
  payfort: {
    enabled: true,
    preventApiCalls: false
  },
  
  // Checkout.com Configuration
  checkout: {
    enabled: true,
    preventApiCalls: false
  },
  
  // PayPal Configuration
  paypal: {
    enabled: true,
    preventApiCalls: false
  }
};

/**
 * Check if a payment gateway is enabled
 * @param {string} gateway - Gateway name (stripe, paytabs, payfort, checkout, paypal)
 * @returns {boolean} - Whether the gateway is enabled
 */
export const isPaymentGatewayEnabled = (gateway) => {
  return paymentConfig[gateway]?.enabled || false;
};

/**
 * Check if API calls are prevented for a gateway
 * @param {string} gateway - Gateway name
 * @returns {boolean} - Whether API calls are prevented
 */
export const areApiCallsPrevented = (gateway) => {
  return paymentConfig[gateway]?.preventApiCalls || false;
};

/**
 * Get the reason why a gateway is disabled
 * @param {string} gateway - Gateway name
 * @returns {string} - Reason for disabling
 */
export const getDisabledReason = (gateway) => {
  return paymentConfig[gateway]?.reason || 'Payment gateway is disabled';
};

/**
 * Get all enabled payment gateways
 * @returns {Array} - List of enabled gateway names
 */
export const getEnabledGateways = () => {
  return Object.keys(paymentConfig).filter(gateway => 
    paymentConfig[gateway].enabled
  );
};

export default paymentConfig;
