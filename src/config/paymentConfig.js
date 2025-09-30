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


export const isPaymentGatewayEnabled = (gateway) => {
  return paymentConfig[gateway]?.enabled || false;
};


export const areApiCallsPrevented = (gateway) => {
  return paymentConfig[gateway]?.preventApiCalls || false;
};


export const getDisabledReason = (gateway) => {
  return paymentConfig[gateway]?.reason || 'Payment gateway is disabled';
};

export const getEnabledGateways = () => {
  return Object.keys(paymentConfig).filter(gateway => 
    paymentConfig[gateway].enabled
  );
};

export default paymentConfig;
