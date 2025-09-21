import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * Custom hook to prevent access to payment pages after successful transactions
 * @param {Object} options - Configuration options
 * @param {boolean} options.preventAccess - Whether to prevent access to this page
 * @param {string} options.redirectTo - Where to redirect if access is prevented
 * @param {string} options.warningMessage - Custom warning message
 */
const usePaymentSecurity = (options = {}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    preventAccess = false,
    redirectTo = '/payment-security-warning',
    warningMessage = '⚠️ For security reasons, you cannot access payment pages after a successful transaction'
  } = options;

  useEffect(() => {
    // Only run protection logic if explicitly requested
    if (!preventAccess) {
      return;
    }

    // Check if user came from a successful payment
    const hasSuccessfulPayment = sessionStorage.getItem('payment_completed');
    const currentPath = location.pathname;

    // List of payment-related paths that should be protected ONLY after successful payment
    const protectedPaths = [
      '/stripe-payment',
      '/escrow/stripe-payment',
      '/stripe-payment-debug'
    ];

    // If user has completed a payment and is trying to access a payment page
    if (hasSuccessfulPayment && protectedPaths.some(path => currentPath.includes(path))) {
      toast.warning(warningMessage);
      navigate(redirectTo, { replace: true });
      return;
    }

    // If preventAccess is explicitly set to true
    if (preventAccess) {
      navigate(redirectTo, { replace: true });
      return;
    }
  }, [navigate, location.pathname, preventAccess, redirectTo, warningMessage]);

  // Function to mark payment as completed
  const markPaymentCompleted = () => {
    sessionStorage.setItem('payment_completed', 'true');
    sessionStorage.setItem('payment_completed_time', new Date().toISOString());
  };

  // Function to clear payment completion status (call when starting new checkout)
  const clearPaymentStatus = () => {
    sessionStorage.removeItem('payment_completed');
    sessionStorage.removeItem('payment_completed_time');
  };

  // Function to start new checkout flow (clears previous payment status)
  const startNewCheckout = () => {
    clearPaymentStatus();
    console.log('🛒 Starting new checkout - cleared previous payment status');
  };

  // Function to check if payment was recently completed
  const isPaymentRecentlyCompleted = () => {
    const completedTime = sessionStorage.getItem('payment_completed_time');
    if (!completedTime) return false;
    
    const timeDiff = new Date() - new Date(completedTime);
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Consider payment "recent" if completed within last 2 hours
    return hoursDiff < 2;
  };

  return {
    markPaymentCompleted,
    clearPaymentStatus,
    startNewCheckout,
    isPaymentRecentlyCompleted
  };
};

export default usePaymentSecurity;
