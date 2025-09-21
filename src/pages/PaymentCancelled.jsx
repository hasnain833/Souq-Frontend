import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Home, ShoppingBag, RefreshCw } from 'lucide-react';

const PaymentCancelled = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const transactionId = searchParams.get('transaction');

  const handleGoToDashboard = () => {
    navigate('/');
  };

  const handleRetryPayment = () => {
    if (transactionId) {
      // Navigate back to escrow transaction page to retry payment
      navigate(`/standard/transaction/${transactionId}`);
    } else {
      // Navigate to dashboard if no transaction ID
      navigate('/');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cancelled Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cancelled Icon and Message */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Payment Cancelled</h1>
            <p className="text-red-100 text-lg">
              Your payment was cancelled and no charges were made
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Transaction Info */}
              {transactionId && (
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Information</h2>
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="font-medium text-gray-900">{transactionId}</p>
                  </div>
                </div>
              )}

              {/* What happened */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-medium text-yellow-900 mb-2">What happened?</h3>
                <p className="text-sm text-yellow-700">
                  You cancelled the payment process before it was completed. No charges have been made to your payment method.
                  The escrow transaction is still pending and you can retry the payment at any time.
                </p>
              </div>

              {/* Next Steps */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">What can you do next?</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <p className="text-sm text-gray-700">Retry the payment with the same or different payment method</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <p className="text-sm text-gray-700">Contact the seller to discuss alternative payment options</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <p className="text-sm text-gray-700">Browse other products on our marketplace</p>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
                <p className="text-sm text-blue-700">
                  If you're experiencing issues with payment or have questions about the escrow process,
                  our support team is here to help. Contact us for assistance.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* {transactionId ? (
                <button
                  onClick={handleRetryPayment}
                  className="flex-1 bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Retry Payment
                </button>
              ) : (
                <button
                  onClick={handleGoBack}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Go Back
                </button>
              )} */}
              
              <button
                onClick={handleGoToDashboard}
                className="flex-1 bg-white text-teal-600 border border-teal-600 py-3 px-4 rounded-lg font-medium hover:bg-teal-50 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Products
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your transaction is safe with our escrow protection. You can retry payment anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;
