// export default StripePayment;
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
// import { Elements } from '@stripe/react-stripe-js';
import { ArrowLeft, CreditCard, Shield, Lock } from 'lucide-react';

import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';
// import { ArrowLeft } from 'lucide-react';
import usePaymentSecurity from '../hooks/usePaymentSecurity';
import { getEscrowTransaction } from '../api/EscrowService';
import { getStandardPayment } from '../api/StandardPaymentService';
// import CheckoutForm from './CheckoutForm'; // your existing manual card form
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
const StripePayment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);

  const { isPaymentRecentlyCompleted } = usePaymentSecurity();

  const {
    clientSecret,
    publishableKey,
    transactionId,
    cardData,
    autoProcess = false,
    paymentType = 'escrow',
    checkoutRedirect = true // NEW flag to trigger redirect flow
  } = location.state || {};





  const CheckoutForm = ({
    clientSecret,
    transactionId,
    cardData,
    autoProcess,
    paymentType,
    checkoutRedirect = true // NEW: control whether to redirect instead of manual entry
  }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(autoProcess || checkoutRedirect);
    const [error, setError] = useState(null);
    const [processed, setProcessed] = useState(false);

    // 🔹 On mount, if redirect mode is enabled, trigger Stripe Checkout Session
    useEffect(() => {
      const startRedirectCheckout = async () => {
        if (!checkoutRedirect) return;
        try {
          const endpoint =
            paymentType === 'escrow'
              ? '/api/user/stripe/checkout'
              : '/api/user/stripe/checkout';

          const res = await axios.post(endpoint, {
            transactionId,
            paymentType,
            successUrl: `${window.location.origin}/payment-success?transaction=${transactionId}&type=${paymentType}`,
            cancelUrl: `${window.location.origin}/payment-cancelled?transaction=${transactionId}&type=${paymentType}`
          });

          if (res.data?.url) {
            window.location.href = res.data.url;
          } else {
            throw new Error('No checkout URL returned from backend');
          }
        } catch (err) {
          console.error('❌ Redirect checkout failed:', err);
          toast.error('Unable to start Stripe Checkout.');
          navigate(-1);
        } finally {
          setLoading(false);
        }
      };

      startRedirectCheckout();
    }, [checkoutRedirect, paymentType, transactionId, navigate]);

    // Manual card data processing
    const processPaymentWithCardData = async () => {
      if (processed) return;
      setProcessed(true);
      setLoading(true);
      setError(null);

      try {
        const result = await processStripePaymentWithCardData(stripe, clientSecret, cardData);
        if (result.success) {
          toast.success('Payment successful!');
          if (paymentType === 'escrow' && transactionId) {
            try {
              await completePayment(transactionId, {
                paymentIntentId: result.paymentIntent.id,
                amount: result.paymentIntent.amount / 100,
                currency: result.paymentIntent.currency
              });
            } catch (error) {
              console.error('❌ Escrow completion error:', error);
            }
          }
          navigate(
            paymentType === 'escrow'
              ? `/escrow/payment-success?transaction=${transactionId}`
              : `/payment-success?transaction=${transactionId}&type=standard`
          );
        } else {
          const errorMessage = formatStripeError(result.error);
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (err) {
        const errorMessage = formatStripeError(err.message);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // Manual form submit
    const handleSubmit = async (event) => {
      event.preventDefault();
      if (!stripe || !elements) return;
      setLoading(true);
      setError(null);

      const card = elements.getElement(CardElement);
      try {
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: { card }
        });

        if (error) {
          setError(error.message);
          toast.error(error.message);
        } else {
          toast.success('Payment successful!');
          if (paymentType === 'escrow' && transactionId) {
            try {
              await completePayment(transactionId, {
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency
              });
            } catch (error) {
              console.error('❌ Escrow completion error:', error);
            }
          }
          navigate(
            paymentType === 'escrow'
              ? `/escrow/payment-success?transaction=${transactionId}`
              : `/payment-success?transaction=${transactionId}&type=standard`
          );
        }
      } catch (err) {
        setError('An unexpected error occurred.');
        toast.error('Payment failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const cardElementOptions = {
      style: {
        base: {
          fontSize: '16px',
          color: '#424770',
          '::placeholder': { color: '#aab7c4' },
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased'
        },
        invalid: { color: '#9e2146' }
      },
      hidePostalCode: false
    };

    // If redirect mode — show loading only
    if (checkoutRedirect) {
      return (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size={40} />
          <span className="ml-3">Redirecting to Stripe Checkout...</span>
        </div>
      );
    }

    // Manual entry form
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Element */}
        <div className="bg-white border border-gray-300 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCard className="w-4 h-4 inline mr-2" /> Card Information
          </label>
          <CardElement options={cardElementOptions} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-teal-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-teal-900">Secure Payment</h3>
              <p className="text-sm text-teal-700 mt-1">
                {paymentType === 'escrow'
                  ? "Your payment is protected by Stripe's industry-leading security and escrow service."
                  : "Your payment is protected by Stripe's industry-leading security and encryption."}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!stripe || loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${loading || !stripe
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-teal-600 text-white hover:bg-teal-700'
            }`}
        >
          {loading ? (
            <>
              <LoadingSpinner size={20} /> Processing Payment...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" /> Complete Payment
            </>
          )}
        </button>
      </form>
    );
  };






  // security guard
  useEffect(() => {
    if (isPaymentRecentlyCompleted()) {
      toast.warning('⚠️ You cannot return to payment after completion');
      navigate('/payment-security-warning', { replace: true });
    }
  }, [isPaymentRecentlyCompleted, navigate]);

  // Stripe init (manual card mode)
  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  // Load transaction summary (both types supported)
  useEffect(() => {
    let isMounted = true;
    const loadSummary = async () => {
      if (!transactionId) {
        setError('Missing transactionId');
        setLoading(false);
        return;
      }
      try {
        if (paymentType === 'escrow') {
          const apiRes = await getEscrowTransaction(transactionId);
          const e = apiRes?.data?.escrowTransaction || apiRes?.data?.data?.escrowTransaction;
          if (e) {
            const buyerPays = e.totalAmount + (e.gatewayFeePaidBy === 'buyer' ? (e.gatewayFeeAmount || 0) : 0);
            setSummary({
              productPrice: e.productPrice,
              platformFee: e.platformFeeAmount,
              shippingCost: e.shippingCost || 0,
              salesTax: e.paymentSummary?.salesTax || 0,
              processingFee: e.gatewayFeePaidBy === 'buyer' ? (e.gatewayFeeAmount || 0) : 0,
              totalToPay: buyerPays,
              currency: e.currency
            });
            setPaymentDetails(e);
          }
        } else {
          const apiRes = await getStandardPayment(transactionId);
          const p = apiRes?.data?.payment || apiRes?.data?.data?.payment || apiRes?.data;
          if (p) {
            const buyerPays = (p.productPrice || 0)
              + (p.platformFeeAmount || 0)
              + (p.shippingCost || 0)
              + (p.salesTax || 0)
              + (p.gatewayFeePaidBy === 'buyer' ? (p.gatewayFeeAmount || 0) : 0);
            setSummary({
              productPrice: p.productPrice,
              platformFee: p.platformFeeAmount,
              shippingCost: p.shippingCost || 0,
              salesTax: p.salesTax || 0,
              processingFee: p.gatewayFeePaidBy === 'buyer' ? (p.gatewayFeeAmount || 0) : 0,
              totalToPay: buyerPays,
              currency: p.currency
            });
            setPaymentDetails(p);
          }
        }
      } catch (err) {
        console.warn('⚠️ Failed to load summary:', err);
      } finally {
        if (isMounted) {
          setSummaryLoading(false);
          setLoading(false);
        }
      }
    };
    loadSummary();
    return () => { isMounted = false; };
  }, [transactionId, paymentType]);

  // 🚀 Redirect mode handler
  // useEffect(() => {
  //   if (!checkoutRedirect || !summary || summaryLoading || loading) return;
  //   const startRedirectCheckout = async () => {
  //     try {
  //       const endpoint =
  //         paymentType === 'escrow'
  //           ? '/api/escrow-payments/stripe/checkout'
  //           : '/api/standard-payments/stripe/checkout';

  //       const res = await axios.post(endpoint, {
  //         transactionId,
  //         paymentType,
  //         successUrl: `${window.location.origin}/payment-success?transaction=${transactionId}&type=${paymentType}`,
  //         cancelUrl: `${window.location.origin}/payment-cancelled?transaction=${transactionId}&type=${paymentType}`
  //       });

  //       if (res.data?.url) {
  //         window.location.href = res.data.url;
  //       } else {
  //         throw new Error('No checkout URL returned');
  //       }
  //     } catch (err) {
  //       console.error('❌ Redirect checkout failed:', err);
  //       toast.error('Unable to start payment');
  //       navigate(-1);
  //     }
  //   };
  //   startRedirectCheckout();
  // }, [checkoutRedirect, summary, summaryLoading, loading, paymentType, transactionId, navigate]);




  useEffect(() => {
    async function startCheckoutRedirect() {
      let endpoint = '';
      if (paymentType === 'escrow') {
        // endpoint = 'http://localhost:5000/api/user/escrow/stripe/checkout';
        endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/user/escrow/stripe/checkout`;
      } else if (paymentType === 'standard') {
        // endpoint = 'http://localhost:5000/api/user/payments/stripe/checkout';
        endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/user/payments/stripe/checkout`;
      } else {
        toast.error('Invalid payment type');
        return;
      }

      try {
        const token = localStorage.getItem('accessToken'); // 👈 Get your auth token
        const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
        const response = await axios.post(
          endpoint,
          {
            transactionId,
            paymentType,
            successUrl: `${FRONTEND_URL}/payment-success?transaction=${transactionId}&type=${paymentType}`,
            cancelUrl: `${FRONTEND_URL}/payment-cancelled?transaction=${transactionId}&type=${paymentType}`
          },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined // 👈 Pass as Bearer token
            }
          }
        );

        // Should respond: { url: 'https://checkout.stripe.com/c/pay/cs_xxx...' }
        if (response.data && response.data.url) {
          window.location.href = response.data.url; // Redirect to Stripe
        } else {
          throw new Error('No checkout URL from backend');
        }
      } catch (e) {
        toast.error('Unable to redirect to payment gateway');
      }
    }

    if (checkoutRedirect) {
      startCheckoutRedirect();
    }
  }, [checkoutRedirect, paymentType, transactionId]);


  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><LoadingSpinner size={60} /></div>;
  }

  // If we're using redirect-based checkout, don't render the page UI; just show a full-screen loader
  if (checkoutRedirect) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <LoadingSpinner size={60} />
          <span className="text-gray-600">Redirecting to Stripe Checkout...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div>
          <h1>Payment Error</h1>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="btn">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center text-teal-600">
            <ArrowLeft className="mr-2" /> Back to Checkout
          </button>
          <h1 className="text-2xl font-bold">Complete Your Payment</h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {!checkoutRedirect && stripePromise && (
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  transactionId={transactionId}
                  cardData={cardData}
                  autoProcess={autoProcess}
                  paymentType={paymentType}
                />
              </Elements>
            )}
          </div>
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            {summaryLoading ? (
              <p>Loading...</p>
            ) : summary ? (
              <div>
                <p>Product Price: {summary.currency} {summary.productPrice?.toFixed(2)}</p>
                <p>Platform Fee: {summary.currency} {summary.platformFee?.toFixed(2)}</p>
                {summary.shippingCost > 0 && <p>Shipping: {summary.currency} {summary.shippingCost?.toFixed(2)}</p>}
                {summary.salesTax > 0 && <p>Sales Tax: {summary.currency} {summary.salesTax?.toFixed(2)}</p>}
                {summary.processingFee > 0 && <p>Processing Fee: {summary.currency} {summary.processingFee?.toFixed(2)}</p>}
                <hr />
                <p><strong>Total: {summary.currency} {summary.totalToPay?.toFixed(2)}</strong></p>
              </div>
            ) : (
              <p>Summary unavailable</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripePayment;
