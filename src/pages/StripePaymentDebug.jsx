import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { processStripePaymentWithCardData } from '../utils/stripeHelpers';

// Debug form component
const DebugPaymentForm = ({ clientSecret, transactionId, cardData, autoProcess, paymentType }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processed, setProcessed] = useState(false);

  // Debug info
  useEffect(() => {
    console.log('🔍 DebugPaymentForm mounted with:', {
      hasStripe: !!stripe,
      hasElements: !!elements,
      hasClientSecret: !!clientSecret,
      hasCardData: !!cardData,
      autoProcess,
      paymentType,
      cardDataDetails: cardData ? {
        hasNumber: !!cardData.number,
        hasExpiry: !!(cardData.expMonth && cardData.expYear),
        hasCvc: !!cardData.cvc,
        hasName: !!cardData.name
      } : null
    });
  }, [stripe, elements, clientSecret, cardData, autoProcess, paymentType]);

  // Auto-process if conditions are met
  useEffect(() => {
    if (autoProcess && cardData && stripe && !processed) {
      console.log('✅ Auto-processing conditions met, starting payment...');
      handleAutoProcess();
    }
  }, [stripe, autoProcess, cardData, processed]);

  const handleAutoProcess = async () => {
    if (processed) return;
    
    setProcessed(true);
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 Starting auto-process payment...');
      console.log('Card data:', cardData);
      console.log('Client secret:', clientSecret?.substring(0, 20) + '...');

      const result = await processStripePaymentWithCardData(stripe, clientSecret, cardData);
      
      if (result.success) {
        console.log('✅ Payment successful!', result);
        toast.success('Payment completed successfully!');
        
        const successUrl = paymentType === 'escrow' 
          ? `/escrow/payment-success?transaction=${transactionId}`
          : `/payment-success?transaction=${transactionId}&type=standard`;
        
        navigate(successUrl);
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('❌ Payment failed:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      console.log('⚠️ Stripe or Elements not ready');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const card = elements.getElement(CardElement);
      console.log('🔄 Manual payment with card element...');

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: card }
      });

      if (error) {
        throw new Error(error.message);
      } else {
        console.log('✅ Manual payment successful!', paymentIntent);
        toast.success('Payment completed successfully!');
        
        const successUrl = paymentType === 'escrow' 
          ? `/escrow/payment-success?transaction=${transactionId}`
          : `/payment-success?transaction=${transactionId}&type=standard`;
        
        navigate(successUrl);
      }
    } catch (err) {
      console.error('❌ Manual payment failed:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Debug Information */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-bold mb-2">Debug Information:</h3>
        <div className="text-sm space-y-1">
          <div>Stripe Ready: {stripe ? '✅' : '❌'}</div>
          <div>Elements Ready: {elements ? '✅' : '❌'}</div>
          <div>Client Secret: {clientSecret ? '✅' : '❌'}</div>
          <div>Card Data: {cardData ? '✅' : '❌'}</div>
          <div>Auto Process: {autoProcess ? '✅' : '❌'}</div>
          <div>Payment Type: {paymentType}</div>
          <div>Processed: {processed ? '✅' : '❌'}</div>
          <div>Loading: {loading ? '✅' : '❌'}</div>
          {cardData && (
            <div className="mt-2">
              <strong>Card Data Details:</strong>
              <div>Number: {cardData.number ? '✅' : '❌'}</div>
              <div>Expiry: {(cardData.expMonth && cardData.expYear) ? '✅' : '❌'}</div>
              <div>CVC: {cardData.cvc ? '✅' : '❌'}</div>
              <div>Name: {cardData.name ? '✅' : '❌'}</div>
            </div>
          )}
        </div>
      </div>

      {/* Auto-processing status */}
      {autoProcess && cardData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900">Auto-Processing Status</h3>
          <p className="text-blue-700 text-sm">
            {loading ? 'Processing payment...' : 'Waiting for Stripe to initialize...'}
          </p>
        </div>
      )}

      {/* Manual form */}
      {!autoProcess && (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Information (Manual Entry)
            </label>
            <CardElement />
          </div>
          
          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-300"
          >
            {loading ? 'Processing...' : 'Pay Manually'}
          </button>
        </form>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Test buttons */}
      <div className="space-y-2">
        <button
          onClick={() => console.log('Current state:', { stripe: !!stripe, elements: !!elements, cardData, autoProcess })}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg text-sm"
        >
          Log Current State
        </button>
        
        {cardData && stripe && (
          <button
            onClick={handleAutoProcess}
            disabled={loading || processed}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm disabled:bg-gray-300"
          >
            Force Auto-Process
          </button>
        )}
      </div>
    </div>
  );
};

// Main debug component
const StripePaymentDebug = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    clientSecret, 
    publishableKey, 
    transactionId,
    cardData,
    autoProcess = false,
    paymentType = 'escrow'
  } = location.state || {};

  console.log('🔍 StripePaymentDebug - Received state:', location.state);

  const stripePromise = React.useMemo(() => {
    if (!publishableKey) {
      console.error('❌ No publishable key provided');
      return null;
    }
    console.log('🔄 Loading Stripe with key:', publishableKey.substring(0, 12) + '...');
    return loadStripe(publishableKey);
  }, [publishableKey]);

  if (!clientSecret || !publishableKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Missing Payment Data</h2>
          <div className="space-y-2 text-sm">
            <div>Client Secret: {clientSecret ? '✅' : '❌'}</div>
            <div>Publishable Key: {publishableKey ? '✅' : '❌'}</div>
            <div>Transaction ID: {transactionId || 'None'}</div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 w-full bg-teal-600 text-white py-2 px-4 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-teal-600 hover:text-teal-700 mb-4"
          >
            ← Back to Checkout
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Stripe Payment Debug</h1>
          <p className="text-gray-600 mt-1">Debug version of the payment page</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {stripePromise && (
            <Elements stripe={stripePromise}>
              <DebugPaymentForm 
                clientSecret={clientSecret}
                transactionId={transactionId}
                cardData={cardData}
                autoProcess={autoProcess}
                paymentType={paymentType}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default StripePaymentDebug;
