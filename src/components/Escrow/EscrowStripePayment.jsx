import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Shield, CreditCard, ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { processStripePaymentWithCardData, formatStripeError } from '../../utils/stripeHelpers';

// Enhanced Escrow Stripe Payment Form
const EscrowPaymentForm = ({ clientSecret, transactionId, cardData, autoProcess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(autoProcess);
  const [error, setError] = useState(null);
  const [processed, setProcessed] = useState(false);

  // Auto-process payment if card data is provided
  useEffect(() => {
    if (autoProcess && cardData && stripe && !processed) {
      processEscrowPayment();
    }
  }, [stripe, autoProcess, cardData, processed]);

  const processEscrowPayment = async () => {
    if (processed) return;
    
    setProcessed(true);
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Processing escrow payment with Stripe...');
      
      if (cardData) {
        // Use provided card data
        const result = await processStripePaymentWithCardData(stripe, clientSecret, cardData);
        
        if (result.success) {
          handlePaymentSuccess(result.paymentIntent);
        } else {
          throw new Error(result.error);
        }
      } else {
        // Use card element
        const card = elements.getElement(CardElement);
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card: card }
        });

        if (error) {
          throw new Error(error.message);
        } else {
          handlePaymentSuccess(paymentIntent);
        }
      }
    } catch (err) {
      console.error('❌ Escrow payment failed:', err);
      const errorMessage = formatStripeError(err.message);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('✅ Escrow payment successful:', paymentIntent);
    toast.success('Escrow payment completed successfully!');
    
    // Navigate to escrow success page
    navigate(`/escrow/payment-success?transaction=${transactionId}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!processed) {
      await processEscrowPayment();
    }
  };

  // Show processing screen if auto-processing
  if (autoProcess && cardData) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-white border border-teal-300 rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Your Escrow Payment</h3>
          <p className="text-gray-600 mb-4">
            Please wait while we securely process your payment with escrow protection...
          </p>
          
          {/* Escrow Protection Info */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-center justify-center text-teal-700 mb-2">
              <Shield className="w-5 h-5 mr-2" />
              <span className="font-medium">Escrow Protection Active</span>
            </div>
            <div className="text-teal-600 text-sm space-y-1">
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Funds held securely until delivery</span>
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Seller protection guaranteed</span>
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Dispute resolution available</span>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="mt-2 text-red-600 hover:text-red-700 text-sm underline"
            >
              Go back to checkout
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Escrow Protection Banner */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <div className="flex items-center text-teal-700 mb-2">
          <Shield className="w-5 h-5 mr-2" />
          <span className="font-medium">Escrow Protection Enabled</span>
        </div>
        <p className="text-teal-600 text-sm">
          Your payment will be held securely until you confirm delivery. 
          The seller will only receive payment after successful delivery confirmation.
        </p>
      </div>

      {/* Card Element */}
      <div className="bg-white border border-gray-300 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <CreditCard className="w-4 h-4 inline mr-2" />
          Card Information
        </label>
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': { color: '#aab7c4' },
              fontFamily: 'system-ui, -apple-system, sans-serif',
            },
            invalid: { color: '#9e2146' },
          },
          hidePostalCode: true,
        }} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Payment Button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-teal-600 hover:bg-teal-700 text-white'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing Escrow Payment...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Shield className="w-4 h-4 mr-2" />
            Complete Escrow Payment
          </div>
        )}
      </button>

      {/* Security Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center justify-center text-gray-600 text-sm">
          <Lock className="w-4 h-4 mr-2" />
          <span>Secured by Stripe • Escrow Protection by Habibi ماركت</span>
        </div>
      </div>
    </form>
  );
};

// Main Escrow Stripe Payment Component
const EscrowStripePayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    clientSecret, 
    publishableKey, 
    transactionId,
    cardData,
    autoProcess = false 
  } = location.state || {};

  const stripePromise = React.useMemo(() => {
    if (!publishableKey) {
      console.error('No Stripe publishable key provided for escrow payment');
      return null;
    }
    return loadStripe(publishableKey);
  }, [publishableKey]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (!clientSecret || !publishableKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Error</h2>
            <p className="text-gray-600 mb-4">
              Missing payment information. Please try again.
            </p>
            <button
              onClick={handleGoBack}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center text-teal-600 hover:text-teal-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Checkout
          </button>
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-teal-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Escrow Payment</h1>
              <p className="text-gray-600 mt-1">
                Complete your secure escrow-protected purchase
              </p>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {stripePromise && (
            <Elements stripe={stripePromise}>
              <EscrowPaymentForm 
                clientSecret={clientSecret}
                transactionId={transactionId}
                cardData={cardData}
                autoProcess={autoProcess}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default EscrowStripePayment;
