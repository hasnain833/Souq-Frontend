/**
 * Checkout Helper Functions
 * Utilities for handling checkout flow and payment navigation
 */

/**
 * Navigate to Stripe payment page with card data
 * @param {Function} navigate - React Router navigate function
 * @param {Object} paymentData - Payment initialization data
 * @param {Object} cardData - Card data from checkout form
 * @param {Object} options - Additional options
 */
export const navigateToStripePayment = (navigate, paymentData, cardData, options = {}) => {
  const {
    autoProcess = true,
    paymentType = 'escrow'
  } = options;

  console.log('🔄 Navigating to Stripe payment with card data...');
  console.log('Payment data:', paymentData);
  console.log('Card data provided:', {
    hasNumber: !!cardData?.number,
    hasExpiry: !!(cardData?.expMonth && cardData?.expYear) || !!cardData?.expiry,
    hasCvc: !!cardData?.cvc,
    hasName: !!cardData?.name
  });

  // Navigate to Stripe payment page with all required data
  navigate('/stripe-payment', {
    state: {
      clientSecret: paymentData.clientSecret,
      publishableKey: paymentData.publishableKey,
      transactionId: paymentData.transactionId || paymentData.paymentId,
      cardData: cardData,
      autoProcess: autoProcess,
      paymentType: paymentType
    }
  });
};

/**
 * Extract card data from checkout form
 * @param {Object} formData - Form data from checkout
 * @returns {Object} Formatted card data
 */
export const extractCardDataFromForm = (formData) => {
  // Handle different possible field names
  const cardData = {
    number: formData.cardNumber || formData.number || formData.card_number,
    expMonth: formData.expMonth || formData.expiryMonth || formData.exp_month,
    expYear: formData.expYear || formData.expiryYear || formData.exp_year,
    expiry: formData.expiry || formData.expiryDate,
    cvc: formData.cvc || formData.cvv || formData.securityCode || formData.security_code,
    name: formData.cardholderName || formData.name || formData.cardholder_name || formData.holderName,
    email: formData.email || formData.customerEmail || formData.customer_email
  };

  // If expiry is in MM/YY format, split it
  if (cardData.expiry && !cardData.expMonth && !cardData.expYear) {
    const [month, year] = cardData.expiry.split('/');
    cardData.expMonth = month;
    cardData.expYear = year?.length === 2 ? `20${year}` : year;
  }

  return cardData;
};

/**
 * Validate checkout form before payment
 * @param {Object} formData - Form data to validate
 * @param {Object} selectedAddress - Selected shipping address
 * @param {Object} selectedCard - Selected saved card (if any)
 * @returns {Object} Validation result
 */
export const validateCheckoutForm = (formData, selectedAddress, selectedCard = null) => {
  const errors = [];

  // Validate shipping address
  if (!selectedAddress) {
    errors.push('Please select a shipping address');
  }

  // Validate payment method
  if (!selectedCard) {
    // Validate new card data
    const cardData = extractCardDataFromForm(formData);
    
    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 13) {
      errors.push('Please enter a valid card number');
    }
    
    if (!cardData.expMonth || !cardData.expYear) {
      if (!cardData.expiry) {
        errors.push('Please enter card expiry date');
      }
    }
    
    if (!cardData.cvc || cardData.cvc.length < 3) {
      errors.push('Please enter card security code');
    }
    
    if (!cardData.name || cardData.name.trim().length < 2) {
      errors.push('Please enter cardholder name');
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Create payment navigation state for checkout
 * @param {Object} params - Parameters for payment
 * @returns {Object} Navigation state object
 */
export const createPaymentNavigationState = (params) => {
  const {
    product,
    productId,
    offerId,
    offerAmount,
    selectedAddress,
    selectedShipping,
    selectedCard,
    cardData,
    useEscrow = false,
    paymentGateway = 'stripe'
  } = params;

  return {
    product,
    productId,
    offerId,
    offerAmount,
    selectedAddress,
    selectedShipping,
    selectedCard,
    cardData,
    useEscrow,
    paymentGateway,
    // Additional metadata
    timestamp: Date.now(),
    source: 'checkout'
  };
};

/**
 * Handle payment method selection in checkout
 * @param {string} method - Payment method ('saved_card', 'new_card', 'bank')
 * @param {Object} data - Additional data for the method
 * @returns {Object} Payment method configuration
 */
export const handlePaymentMethodSelection = (method, data = {}) => {
  switch (method) {
    case 'saved_card':
      return {
        type: 'saved_card',
        gateway: 'paytabs', // or other gateway for saved cards
        requiresCardInput: false,
        cardId: data.cardId,
        autoProcess: false
      };
      
    case 'new_card':
      return {
        type: 'new_card',
        gateway: 'stripe', // Use Stripe for new cards
        requiresCardInput: true,
        autoProcess: true
      };
      
    case 'bank_account':
      return {
        type: 'bank_account',
        gateway: 'bank_transfer',
        requiresCardInput: false,
        accountId: data.accountId,
        autoProcess: false
      };
      
    default:
      return {
        type: 'new_card',
        gateway: 'stripe',
        requiresCardInput: true,
        autoProcess: true
      };
  }
};

/**
 * Format checkout data for API submission
 * @param {Object} checkoutData - Raw checkout data
 * @returns {Object} Formatted data for API
 */
export const formatCheckoutDataForAPI = (checkoutData) => {
  const {
    productId,
    offerId,
    selectedAddress,
    selectedShipping,
    paymentMethod,
    cardData,
    useEscrow
  } = checkoutData;

  return {
    productId,
    offerId,
    paymentGateway: paymentMethod.gateway,
    currency: 'USD',
    shippingAddress: selectedAddress,
    shippingMethod: selectedShipping,
    gatewayFeePaidBy: 'buyer',
    escrowProtection: useEscrow,
    cardDetails: paymentMethod.type === 'saved_card' ? {
      cardId: paymentMethod.cardId
    } : null,
    // Include card data for new cards (will be processed securely)
    newCardData: paymentMethod.type === 'new_card' ? cardData : null
  };
};

export default {
  navigateToStripePayment,
  extractCardDataFromForm,
  validateCheckoutForm,
  createPaymentNavigationState,
  handlePaymentMethodSelection,
  formatCheckoutDataForAPI
};
