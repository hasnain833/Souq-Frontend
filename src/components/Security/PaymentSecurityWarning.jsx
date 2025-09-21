import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Home, ArrowLeft } from 'lucide-react';

const PaymentSecurityWarning = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Warning Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 text-center">
          {/* Warning Icon */}
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Security Warning
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            For security reasons, you cannot navigate back to the payment page after a successful transaction.
          </p>

          {/* Security Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                Payment Security Active
              </span>
            </div>
            <p className="text-xs text-blue-700">
              This prevents unauthorized access to sensitive payment information and protects your transaction data.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go to Products
            </button>

            <p className="text-xs text-gray-500">
              Redirecting automatically in 5 seconds...
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            If you need to make another purchase, please start from the products page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSecurityWarning;
