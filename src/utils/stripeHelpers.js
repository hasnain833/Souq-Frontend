/**
 * Stripe Helper Functions
 * Utilities for handling Stripe payments and card data
 */

/**
 * Format card data for Stripe API
 * @param {Object} cardData - Raw card data from form
 * @returns {Object} Formatted card data for Stripe
 */
export const formatCardDataForStripe = (cardData) => {
  if (!cardData) return null;

  // Remove spaces and format card number
  const cardNumber = cardData.number?.replace(/\s/g, '') || cardData.cardNumber?.replace(/\s/g, '');
  
  // Parse expiry date
  let expMonth, expYear;
  
  if (cardData.expiry) {
    // Handle MM/YY or MM/YYYY format
    const [month, year] = cardData.expiry.split('/');
    expMonth = parseInt(month);
    expYear = year.length === 2 ? parseInt(`20${year}`) : parseInt(year);
  } else {
    expMonth = parseInt(cardData.expMonth || cardData.expiryMonth);
    expYear = parseInt(cardData.expYear || cardData.expiryYear);
  }

  return {
    number: cardNumber,
    exp_month: expMonth,
    exp_year: expYear,
    cvc: cardData.cvc || cardData.cvv || cardData.securityCode,
    name: cardData.name || cardData.cardholderName || cardData.holderName,
    email: cardData.email || cardData.customerEmail
  };
};

/**
 * Validate card data before processing
 * @param {Object} cardData - Card data to validate
 * @returns {Object} Validation result
 */
export const validateCardData = (cardData) => {
  const errors = [];

  if (!cardData) {
    return { isValid: false, errors: ['Card data is required'] };
  }

  const formatted = formatCardDataForStripe(cardData);

  // Validate card number
  if (!formatted.number || formatted.number.length < 13 || formatted.number.length > 19) {
    errors.push('Invalid card number');
  }

  // Validate expiry month
  if (!formatted.exp_month || formatted.exp_month < 1 || formatted.exp_month > 12) {
    errors.push('Invalid expiry month');
  }

  // Validate expiry year
  const currentYear = new Date().getFullYear();
  if (!formatted.exp_year || formatted.exp_year < currentYear || formatted.exp_year > currentYear + 20) {
    errors.push('Invalid expiry year');
  }

  // Validate CVC
  if (!formatted.cvc || formatted.cvc.length < 3 || formatted.cvc.length > 4) {
    errors.push('Invalid security code');
  }

  // Validate cardholder name
  if (!formatted.name || formatted.name.trim().length < 2) {
    errors.push('Cardholder name is required');
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    formattedData: formatted
  };
};

/**
 * Create payment method with Stripe
 * @param {Object} stripe - Stripe instance
 * @param {Object} cardData - Card data
 * @returns {Promise<Object>} Payment method result
 */
export const createStripePaymentMethod = async (stripe, cardData) => {
  try {
    console.log('🔄 Creating Stripe payment method...');
    
    // Validate card data
    const validation = validateCardData(cardData);
    if (!validation.isValid) {
      throw new Error(`Invalid card data: ${validation.errors.join(', ')}`);
    }

    const formatted = validation.formattedData;
    console.log('✅ Card data validated successfully');

    // Create payment method
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: {
        number: formatted.number,
        exp_month: formatted.exp_month,
        exp_year: formatted.exp_year,
        cvc: formatted.cvc,
      },
      billing_details: {
        name: formatted.name,
        email: formatted.email,
      },
    });

    if (error) {
      console.error('❌ Failed to create payment method:', error);
      throw new Error(error.message);
    }

    console.log('✅ Payment method created:', paymentMethod.id);
    return { success: true, paymentMethod };

  } catch (error) {
    console.error('❌ Error creating payment method:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Confirm payment intent with Stripe
 * @param {Object} stripe - Stripe instance
 * @param {string} clientSecret - Payment intent client secret
 * @param {string} paymentMethodId - Payment method ID
 * @returns {Promise<Object>} Payment confirmation result
 */
export const confirmStripePayment = async (stripe, clientSecret, paymentMethodId) => {
  try {
    console.log('🔄 Confirming Stripe payment...');
    console.log('Client Secret:', clientSecret?.substring(0, 20) + '...');
    console.log('Payment Method ID:', paymentMethodId);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethodId,
    });

    if (error) {
      console.error('❌ Payment confirmation failed:', error);
      throw new Error(error.message);
    }

    console.log('✅ Payment confirmed successfully:', paymentIntent.id);
    return { success: true, paymentIntent };

  } catch (error) {
    console.error('❌ Error confirming payment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Handle Stripe payment with card data
 * @param {Object} stripe - Stripe instance
 * @param {string} clientSecret - Payment intent client secret
 * @param {Object} cardData - Card data from checkout
 * @returns {Promise<Object>} Payment result
 */
export const processStripePaymentWithCardData = async (stripe, clientSecret, cardData) => {
  try {
    console.log('🔄 Processing Stripe payment with card data...');

    // Step 1: Create payment method
    const pmResult = await createStripePaymentMethod(stripe, cardData);
    if (!pmResult.success) {
      throw new Error(pmResult.error);
    }

    // Step 2: Confirm payment
    const confirmResult = await confirmStripePayment(stripe, clientSecret, pmResult.paymentMethod.id);
    if (!confirmResult.success) {
      throw new Error(confirmResult.error);
    }

    console.log('🎉 Payment processed successfully!');
    return {
      success: true,
      paymentIntent: confirmResult.paymentIntent,
      paymentMethod: pmResult.paymentMethod
    };

  } catch (error) {
    console.error('❌ Payment processing failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Format error message for user display
 * @param {string} errorMessage - Raw error message
 * @returns {string} User-friendly error message
 */
export const formatStripeError = (errorMessage) => {
  const errorMap = {
    'Your card number is incorrect.': 'Please check your card number and try again.',
    'Your card\'s expiration date is incorrect.': 'Please check your card\'s expiration date.',
    'Your card\'s security code is incorrect.': 'Please check your card\'s security code (CVC).',
    'Your card has insufficient funds.': 'Your card has insufficient funds for this transaction.',
    'Your card was declined.': 'Your card was declined. Please try a different payment method.',
    'Your card does not support this type of purchase.': 'This card cannot be used for this purchase.',
    'Your card has expired.': 'Your card has expired. Please use a different card.',
    'Processing error': 'There was a problem processing your payment. Please try again.'
  };

  return errorMap[errorMessage] || errorMessage || 'An unexpected error occurred. Please try again.';
};

export default {
  formatCardDataForStripe,
  validateCardData,
  createStripePaymentMethod,
  confirmStripePayment,
  processStripePaymentWithCardData,
  formatStripeError
};
