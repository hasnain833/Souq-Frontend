import React, { useState, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Shield, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import { isPaymentGatewayEnabled, areApiCallsPrevented } from '../../config/paymentConfig';

// Stripe card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: true,
};

// Stripe Card Form Component (inside Elements provider)
const StripeCardForm = React.forwardRef(({ onPaymentSuccess, onPaymentError, loading, setLoading }, ref) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);

  const handleCardChange = (event) => {
    setError(event.error ? event.error.message : null);
  };

  const processStripePayment = async (clientSecret) => {
    if (!stripe || !elements) {
      throw new Error('Stripe not loaded');
    }

    setLoading(true);
    setError(null);

    const card = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: card,
        }
      });

      if (error) {
        console.error('Stripe payment failed:', error);
        setError(error.message);
        toast.error(error.message);
        onPaymentError(error);
      } else {
        console.log('Stripe payment succeeded:', paymentIntent);
        toast.success('Payment successful!');
        onPaymentSuccess(paymentIntent);
      }
    } catch (err) {
      console.error('Stripe payment error:', err);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      onPaymentError(err);
    } finally {
      setLoading(false);
    }
  };

  // Expose the payment processing function to parent
  React.useImperativeHandle(ref, () => ({
    processPayment: processStripePayment
  }));

  return (
    <div className="space-y-4">
      {/* Card Element */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <CreditCard className="w-4 h-4 inline mr-2" />
          Card Information
        </label>
        <CardElement 
          options={cardElementOptions} 
          onChange={handleCardChange}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Security Info */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
        <div className="flex items-center text-teal-700">
          <Shield className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Secure Payment</span>
        </div>
        <p className="text-teal-600 text-sm mt-1">
          Your payment is protected by Stripe's industry-leading security and your funds
          are held in escrow until delivery is confirmed.
        </p>
      </div>

      {/* Stripe Branding */}
      <div className="flex items-center justify-center text-gray-500 text-xs">
        <Lock className="w-3 h-3 mr-1" />
        Powered by Stripe • Your payment information is secure and encrypted
      </div>
    </div>
  );
})

// Main Stripe Card Input Component
const StripeCardInput = React.forwardRef(({ onPaymentSuccess, onPaymentError, publishableKey }, ref) => {
  const [loading, setLoading] = useState(false);

  // Memoize the Stripe promise to prevent continuous API calls
  const stripePromise = useMemo(() => {
    if (!publishableKey) {
      console.warn('⚠️ No Stripe publishable key provided');
      return null;
    }

    // Check if Stripe API calls are prevented
    if (areApiCallsPrevented('stripe')) {
      console.warn('⚠️ Stripe API calls are prevented by configuration');
      return null;
    }

    if (!isPaymentGatewayEnabled('stripe')) {
      console.warn('⚠️ Stripe payment gateway is disabled');
      return null;
    }

    console.log('🔄 Loading Stripe with publishable key:', publishableKey.substring(0, 12) + '...');
    return loadStripe(publishableKey);
  }, [publishableKey]);

  if (!stripePromise) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <CreditCard className="w-8 h-8 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-600 font-medium">Stripe Payment Unavailable</p>
        <p className="text-gray-500 text-sm mt-1">
          Stripe payment processing is currently disabled or not configured.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <StripeCardForm
        ref={ref}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        loading={loading}
        setLoading={setLoading}
      />
    </Elements>
  );
});

export default StripeCardInput;
