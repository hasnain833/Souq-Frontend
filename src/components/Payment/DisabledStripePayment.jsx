import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, CreditCard, AlertCircle } from 'lucide-react';

const DisabledStripePayment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we have transaction data and redirect to success page
  useEffect(() => {
    const state = location.state;
    if (state && state.transactionId) {
      console.log('🔄 Transaction ID found, redirecting to payment success:', state.transactionId);
      // Redirect to payment success page with transaction ID
      navigate(`/escrow/payment-success?transaction=${state.transactionId}&type=escrow`, {
        replace: true
      });
    }
  }, [location.state, navigate]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToSuccess = () => {
    // If we have transaction ID in state, go to success page
    const state = location.state;
    if (state && state.transactionId) {
      navigate(`/escrow/payment-success?transaction=${state.transactionId}&type=escrow`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center text-teal-600 hover:text-teal-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Checkout
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Payment Unavailable</h1>
          <p className="text-gray-600 mt-2">
            Stripe payment processing is currently disabled
          </p>
        </div>

        {/* Disabled Notice */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Service Disabled</h2>
            <p className="text-gray-600 mb-6">
              Stripe payment processing has been disabled to prevent continuous API calls.
              Please contact the administrator to enable payment processing.
            </p>

            {/* Debug Info */}
            {location.state && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Debug Information</h3>
                <p className="text-sm text-blue-700">
                  Transaction ID: {location.state.transactionId || 'Not found'}
                </p>
                <p className="text-sm text-blue-700">
                  Payment Type: {location.state.paymentType || 'escrow'}
                </p>
              </div>
            )}
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="text-left">
                  <h3 className="font-medium text-orange-900">Developer Note</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    This component prevents continuous Stripe API calls. To re-enable Stripe payments, 
                    replace this component with the original StripePayment component in the routing configuration.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Show success button if we have transaction ID */}
              {location.state && location.state.transactionId && (
                <button
                  onClick={handleGoToSuccess}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Go to Payment Success
                </button>
              )}

              <button
                onClick={handleGoBack}
                className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back to Checkout
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Payment processing is temporarily disabled
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisabledStripePayment;
