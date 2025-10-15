import React, { useEffect, useRef } from 'react';
import { createPayPalOrder, capturePayPalOrder } from '../../api/PayPalService';

// Loads PayPal JS SDK if not already present
function usePayPalScript(clientId, currency = 'USD') {
  useEffect(() => {
    if (window.paypal) return;
    const script = document.createElement('script');
    const query = new URLSearchParams({ 'client-id': clientId, currency });
    script.src = `https://www.paypal.com/sdk/js?${query.toString()}`;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      // keep script for subsequent views
    };
  }, [clientId, currency]);
}

const PayPalCheckoutButton = ({ amount, currency = 'USD', clientId, metadata = {}, onSuccess, onError }) => {
  const containerRef = useRef(null);
  usePayPalScript(clientId, currency);

  useEffect(() => {
    if (!window.paypal || !containerRef.current) return;

    const buttons = window.paypal.Buttons({
      style: { layout: 'vertical' },
      createOrder: async () => {
        const resp = await createPayPalOrder({ amount, currency, metadata });
        if (!resp?.success) throw new Error(resp?.error || 'Failed to create order');
        return resp.orderId;
      },
      onApprove: async (data) => {
        const resp = await capturePayPalOrder({ orderId: data.orderID });
        if (resp?.success) {
          onSuccess && onSuccess(resp);
        } else {
          throw new Error(resp?.error || 'Capture failed');
        }
      },
      onError: (err) => {
        onError && onError(err);
      },
    });

    buttons.render(containerRef.current);
    return () => {
      try { buttons.close(); } catch (_) {}
    };
  }, [amount, currency, clientId, metadata, onSuccess, onError]);

  return <div ref={containerRef} />;
};

export default PayPalCheckoutButton;


