import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CreditCard, Shield, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Load PayPal JS SDK script (with card-fields/hosted-fields) and attach client token
const loadPayPalSdk = ({ clientId, clientToken, components = 'buttons,hosted-fields,card-fields', intent = 'capture', currency = 'USD' }) => {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-augment="paypal-sdk"]');
    // If script exists but without client token, replace it so fields can render
    if (existing && !existing.getAttribute('data-client-token') && clientToken) {
      existing.parentNode.removeChild(existing);
    }
    if (window.paypal && (window.paypal.HostedFields || window.paypal.CardFields)) {
      return resolve(window.paypal);
    }
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&components=${components}&intent=${intent}&currency=${currency}&enable-funding=card`;
    script.async = true;
    if (clientToken) {
      script.setAttribute('data-client-token', clientToken);
    }
    script.dataset.augment = 'paypal-sdk';
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
    document.body.appendChild(script);
  });
};

const fetchPayPalConfig = async () => {
  const base = import.meta.env.VITE_API_BASE_URL;
  const [idRes, tokenRes] = await Promise.all([
    fetch(`${base}/api/user/payments/paypal/client-id`),
    fetch(`${base}/api/user/payments/paypal/client-token`)
  ]);
  const idJson = await idRes.json();
  const tokenJson = await tokenRes.json();
  return {
    clientId: idJson?.data?.clientId,
    environment: idJson?.data?.environment || 'sandbox',
    clientToken: tokenJson?.data?.clientToken || null
  };
};


const PayPalCardPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, transactionId, paymentType = 'standard', currency = 'USD', paymentUrl } = location.state || {};
  // console.log('location.state:', location.state);

  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirecting, setRedirecting] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const paypalRef = useRef(null);
  const [paypalEnv, setPaypalEnv] = useState('sandbox');
  console.log('sdkReady:', sdkReady);
  const cardFieldsRef = useRef(null);
  const [fieldValid, setFieldValid] = useState({ cardholderName: null, number: null, expirationDate: null, cvv: null });
  const [fieldErrors, setFieldErrors] = useState({});
  const isFormValid = Object.values(fieldValid).every(v => v === true);
  const ineligible = !!error && String(error).toLowerCase().includes('eligible');
  useEffect(() => {
    (async () => {
      try {
          setLoading(true);
        if (!orderId || !transactionId) {
          setError('Missing payment information.');
          return;
        }
        const { clientId, clientToken, environment } = await fetchPayPalConfig();
        if (!clientId) throw new Error('PayPal is not configured');
        if (environment) setPaypalEnv(environment);
        const paypal = await loadPayPalSdk({ clientId, clientToken, components: 'buttons,hosted-fields,card-fields', intent: 'capture', currency });
        paypalRef.current = paypal;
        setSdkReady(true);
      } catch (e) {
        setError(e.message || 'Failed to initialize PayPal');
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId, transactionId, currency]);
//  if (loading) {
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//                 <LoadingSpinner size={60} fullScreen />
//             </div>
//         );
//     }
  useEffect(() => {
    if (!sdkReady || !containerRef.current || !paypalRef.current) return;

    (async () => {
      const paypal = paypalRef.current;
      console.log('paypal:', paypal);
      try {
        if (paypal.HostedFields && paypal.HostedFields.isEligible && (await paypal.HostedFields.isEligible())) {
          const { clientToken } = await fetchPayPalConfig();
          if (!clientToken) throw new Error('Missing client token for hosted fields');

          const hf = await paypal.HostedFields.render({
            createOrder: () => orderId,
            styles: {
              'input': { 'font-size': '16px', 'padding': '12px' },
              '.valid': { color: '#16a34a' },
              '.invalid': { color: '#dc2626' },
              '::placeholder': { color: '#9ca3af' }
            },
            fields: {
              cardholderName: { selector: '#pp-card-name', placeholder: 'Jane M Doe' },
              number: { selector: '#pp-card-number', placeholder: '4111 1111 1111 1111' },
              expirationDate: { selector: '#pp-card-exp', placeholder: 'MM/YY' },
              cvv: { selector: '#pp-card-cvv', placeholder: '123' }
            }
          });

          // Seed initial validity
          try {
            const state = hf.getState?.();
            if (state?.fields) {
              setFieldValid({
                cardholderName: state.fields.cardholderName?.isValid || false,
                number: state.fields.number?.isValid || false,
                expirationDate: state.fields.expirationDate?.isValid || false,
                cvv: state.fields.cvv?.isValid || false,
              });
            }
          } catch {}

          // Attach validation events similar to Stripe UX
          hf.on('focus', ({ fieldType }) => {
            setFieldErrors(prev => ({ ...prev, [fieldType]: null }));
          });
          hf.on('blur', ({ fieldType }) => {
            // Mark simple error if invalid on blur
            setFieldErrors(prev => ({ ...prev, [fieldType]: fieldValid[fieldType] ? null : 'Please enter a valid value' }));
          });
          hf.on('cardTypeChange', () => {
            // could set brand icon here if desired
          });
          hf.on('inputSubmitRequest', () => handleSubmit());
          hf.on('validityChange', (evt) => {
            const { fields } = evt;
            setFieldValid({
              cardholderName: fields.cardholderName?.isValid || false,
              number: fields.number?.isValid || false,
              expirationDate: fields.expirationDate?.isValid || false,
              cvv: fields.cvv?.isValid || false,
            });
          });

          cardFieldsRef.current = hf;
          setError(null);
        } else if (paypal.CardFields && paypal.CardFields.isEligible && paypal.CardFields.isEligible()) {
          // Fallback to Card Fields when Hosted Fields isn’t eligible
          const cardFields = paypal.CardFields({ createOrder: () => orderId });
          try { cardFields.NameField().render('#pp-card-name'); } catch {}
          try { cardFields.NumberField().render('#pp-card-number'); } catch {}
          try { cardFields.ExpiryField().render('#pp-card-exp'); } catch {}
          try { cardFields.CVVField().render('#pp-card-cvv'); } catch {}
          cardFieldsRef.current = { submit: () => cardFields.submit({ contingencies: ['3D_SECURE'] }) };
          setError(null);
        } else {
          setError('Card fields not eligible for this merchant or browser');

          // Auto-redirect to approval URL if available (fastest fallback)
          const approvalUrl = paymentUrl || `${paypalEnv === 'production' ? 'https://www.paypal.com' : 'https://www.sandbox.paypal.com'}/checkoutnow?token=${orderId}`;
          if (approvalUrl) {
            setRedirecting(true);
            setTimeout(() => {
              try { window.location.assign(approvalUrl); } catch {}
            }, 100);
          }

          // Also render PayPal Buttons as a UI fallback
          try {
            const btnContainer = document.getElementById('pp-fallback-buttons');  
            if (paypal.Buttons && btnContainer && !btnContainer.hasChildNodes()) {
              paypal.Buttons({
                createOrder: () => orderId,
                onApprove: () => {
                  const successUrl = paymentType === 'escrow'
                    ? `/escrow/payment-success?transaction=${transactionId}`
                    : `/payment-success?transaction=${transactionId}&type=standard`;
                  navigate(successUrl, { replace: true });
                },
                onCancel: () => {
                  // stay on page
                },
                onError: (err) => {
                  console.error('PayPal Buttons error', err);
                },
                style: { layout: 'vertical', shape: 'rect' }
              }).render('#pp-fallback-buttons');
            }
          } catch (btnErr) {
            console.warn('Fallback PayPal Buttons failed', btnErr);
          }
        }
      } catch (e) {
        console.error('Failed to render PayPal card fields', e);
        setError('Failed to render card fields');
      }
    })();
  }, [sdkReady, navigate, orderId, transactionId, paymentType, paymentUrl]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      if (cardFieldsRef.current?.submit) {
        await cardFieldsRef.current.submit({ contingencies: ['3D_SECURE'] });
        const successUrl = paymentType === 'escrow'
          ? `/escrow/payment-success?transaction=${transactionId}`
          : `/payment-success?transaction=${transactionId}&type=standard`;
        navigate(successUrl, { replace: true });
        return;
      }
      toast.error('Payment form is not ready.');
    } catch (e) {
      console.error('Submit error', e);
      toast.error(e?.details?.[0]?.description || 'Please check your card details and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show full-screen loader during initial loading or while redirecting to PayPal
  if (loading || redirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <LoadingSpinner size={60} />
          <span className="text-gray-600">{redirecting ? 'Redirecting to PayPal...' : 'Loading payment...'}</span>
        </div>
      </div>
    );
  }

  return (
  <>
    {(
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto p-4 sm:p-6">
          <button
            className="inline-flex items-center text-sm text-gray-600 mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Checkout
          </button>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
            <p className="text-sm text-gray-600 mb-6">
              Enter your payment details to complete your secure purchase
            </p>

            {/* Fallback PayPal Buttons container */}
            <div className="space-y-4" ref={containerRef}>
              <div id="pp-fallback-buttons" className="mt-2" />
              <p className="text-xs text-center text-gray-500 mt-2">
                Powered by PayPal • Your payment information is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);
};



//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-3xl mx-auto p-4 sm:p-6">
//         <button className="inline-flex items-center text-sm text-gray-600 mb-4" onClick={() => navigate(-1)}>
//           <ArrowLeft className="w-4 h-4 mr-1" /> Back to Checkout
//         </button>

//         <div className="bg-white rounded-xl shadow-sm border p-6">
//           <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
//           <p className="text-sm text-gray-600 mb-6">Enter your payment details to complete your secure purchase</p>

//           {/* {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
//               <div className="mb-2">{error}</div>
//               {paymentUrl && String(error).toLowerCase().includes('eligible') && (
//                 <button
//                   onClick={() => window.location.assign(paymentUrl)}
//                   className="inline-flex items-center px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
//                 >
//                   Pay with PayPal instead
//                 </button>
//               )}
//             </div>
//           )} */}

//           <div className="space-y-4" ref={containerRef}>
//             {/* Card Information panel */}
//             {/* <div className="border rounded-lg p-4">
//               <div className="flex items-center text-gray-800 mb-3">
//                 <CreditCard className="w-5 h-5 mr-2" />
//                 <span className="font-medium">Card Information</span>
//               </div>
//               <div className="grid gap-4">
//                 <div>
//                   <label className="text-sm text-gray-700 mb-1 block">Name on card</label>
//                   <div id="pp-card-name" className={`border rounded p-3 bg-white ${fieldValid.cardholderName === false ? 'border-red-400' : ''}`} />
//                   {fieldValid.cardholderName === false && <p className="text-xs text-red-600 mt-1">Please enter the name on card</p>}
//                 </div>
//                 <div>
//                   <label className="text-sm text-gray-700 mb-1 block">Card number</label>
//                   <div id="pp-card-number" className={`border rounded p-3 bg-white ${fieldValid.number === false ? 'border-red-400' : ''}`} />
//                   {fieldValid.number === false && <p className="text-xs text-red-600 mt-1">Enter a valid card number</p>}
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-sm text-gray-700 mb-1 block">Expiry</label>
//                     <div id="pp-card-exp" className={`border rounded p-3 bg-white ${fieldValid.expirationDate === false ? 'border-red-400' : ''}`} />
//                     {fieldValid.expirationDate === false && <p className="text-xs text-red-600 mt-1">Enter a valid expiry</p>}
//                   </div>
//                   <div>
//                     <label className="text-sm text-gray-700 mb-1 block">CVV</label>
//                     <div id="pp-card-cvv" className={`border rounded p-3 bg-white ${fieldValid.cvv === false ? 'border-red-400' : ''}`} />
//                     {fieldValid.cvv === false && <p className="text-xs text-red-600 mt-1">Enter a valid CVV</p>}
//                   </div>
//                 </div>
//               </div>
//             </div> */}

//             {/* Fallback PayPal Buttons (rendered only if card fields ineligible) */}
//             <div id="pp-fallback-buttons" className="mt-2" />

//             {/* Security note */}
//             {/* <div className="rounded-lg p-4 bg-emerald-50 border border-emerald-200 text-emerald-800">
//               <div className="flex items-center">
//                 <Shield className="w-5 h-5 mr-2" />
//                 <div>
//                   <div className="font-medium">Secure Payment</div>
//                   <div className="text-sm">Your payment is protected by industry-leading security and encryption.</div>
//                 </div>
//               </div>
//             </div> */}

//             {/* <button
//               disabled={loading || !sdkReady || !cardFieldsRef.current}
//               onClick={handleSubmit}
//               className={`w-full py-3 rounded-lg font-semibold text-white ${loading || !cardFieldsRef.current ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'} flex items-center justify-center`}
//             >
//               <span className="mr-2">Complete Payment</span>
//             </button> */}

//             <p className="text-xs text-center text-gray-500 mt-2">Powered by PayPal • Your payment information is secure and encrypted</p>
//           </div>

          
//         </div>
//       </div>
//     </div>
//   );
// };

export default PayPalCardPayment;

