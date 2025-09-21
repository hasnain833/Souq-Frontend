import React from 'react';
import { CreditCard } from 'lucide-react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useTranslation } from 'react-i18next';

/**
 * Simple PayPal button stack used on the continue-checkout page
 * It mimics the PayPal/Pay Later/Card buttons and triggers the provided
 * callbacks. The actual order creation + redirect happens in the parent.
 */
const PayPalButtonStack = ({
  onPayPal, onPayLater, onCard,
  disabled = false,
  loading = false, // NEW prop
  className = ''
}) => {
  const { t } = useTranslation()

  const commonBtn =
    'w-full rounded-lg py-3 text-base font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* PayPal */}
      <button
        type="button"
        disabled={disabled || loading}
        onClick={onCard}
        className={`${commonBtn} ${disabled || loading
          ? 'bg-yellow-300 cursor-not-allowed'
          : 'bg-[#FFC439] hover:brightness-95'
          } text-[#003087] flex justify-center items-center gap-2`}
        aria-label="Pay with PayPal"
      >
        <span className="text-lg font-bold">{t("continueWithPayPal")}</span>
        {loading && (
          <AiOutlineLoading3Quarters className="animate-spin h-5 w-5 ml-2 rtl:mr-2" />
        )}
      </button>

      {/* Pay Later */}
      {/* <button
        type="button"
        disabled={disabled}
        onClick={onPayLater}
        className={`${commonBtn} ${disabled ? 'bg-yellow-300 cursor-not-allowed' : 'bg-[#FFC439] hover:brightness-95'} text-[#111827] flex items-center justify-center`}
        aria-label="PayPal Pay Later"
      >
        <img src="/images/paypal-logo.png" alt="PayPal" className="h-5 mr-2" />
        Pay Later
      </button> */}

      {/* Debit or Credit Card */}
      {/* <button
        type="button"
        disabled={disabled}
        onClick={onCard}
        className={`${commonBtn} ${disabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-900'} text-white flex items-center justify-center`}
        aria-label="Pay with Debit or Credit Card"
      >
        <CreditCard className="w-5 h-5 mr-2" />
        Debit or Credit Card
      </button> */}

      <div className="text-center text-xs text-gray-500 mt-1">
        {t("poweredBy")} <span className="font-semibold text-[#003087]">PayPal</span>
      </div>
    </div>
  );
};

export default PayPalButtonStack;

