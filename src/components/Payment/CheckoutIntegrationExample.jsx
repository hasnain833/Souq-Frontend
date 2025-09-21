import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CheckoutPaymentSection from './CheckoutPaymentSection';
import { useTranslation } from 'react-i18next';

/**
 * Example of how to integrate the new payment system into your existing checkout page
 * 
 * Replace the existing payment button and flow in Checkout.jsx with this component
 */
const CheckoutIntegrationExample = ({
  product,
  productId,
  offerId,
  offerAmount,
  selectedAddress,
  selectedShipping,
  useEscrow
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation()

  const handlePaymentSuccess = (paymentResult) => {
    console.log('✅ Payment successful:', paymentResult);

    // Show success message
    toast.success('Payment completed successfully!');

    // Navigate to success page with transaction details
    const successUrl = `/payment-success?transaction=${paymentResult.transactionId}&type=${paymentResult.paymentType}`;
    navigate(successUrl);
  };

  const handlePaymentError = (error) => {
    console.error('❌ Payment failed:', error);

    // Show error message
    toast.error(error.message || 'Payment failed. Please try again.');

    // Optionally navigate to error page or stay on current page
    // navigate('/payment-error');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-6">
        {t("complete_your_payment")}
      </h2>

      <CheckoutPaymentSection
        product={product}
        productId={productId}
        offerId={offerId}
        offerAmount={offerAmount}
        selectedAddress={selectedAddress}
        selectedShipping={selectedShipping}
        useEscrow={useEscrow}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </div>
  );
};

export default CheckoutIntegrationExample;

/**
 * INTEGRATION INSTRUCTIONS:
 * 
 * 1. In your existing Checkout.jsx file, replace the current payment button section with:
 * 
 * ```jsx
 * import CheckoutIntegrationExample from '../components/Payment/CheckoutIntegrationExample';
 * 
 * // Replace the existing payment button (around line 875) with:
 * <CheckoutIntegrationExample
 *   product={product}
 *   productId={productId}
 *   offerId={offerId}
 *   offerAmount={offerAmount}
 *   selectedAddress={selectedAddress}
 *   selectedShipping={selectedShipping}
 *   useEscrow={useEscrow}
 * />
 * ```
 * 
 * 2. Remove the old payment button and navigation logic:
 * 
 * ```jsx
 * // REMOVE THIS OLD CODE:
 * <button
 *   className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
 *   onClick={() => {
 *     // ... old validation and navigation logic
 *     navigate('/escrow-checkout', { state: navigationState });
 *   }}
 * >
 *   Pay Now
 * </button>
 * ```
 * 
 * 3. The new system will:
 *    - Handle both saved cards and new Stripe cards
 *    - Process payments directly on the checkout page
 *    - Show real-time payment status
 *    - Navigate to success page automatically
 *    - Display proper error messages
 * 
 * 4. Benefits:
 *    - No separate payment page needed
 *    - Better user experience
 *    - Real Stripe integration
 *    - Proper error handling
 *    - Consistent with your existing UI
 */
