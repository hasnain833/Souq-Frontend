import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Plus, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getUserCards, getCardBrandInfo } from '../../api/CardService';
import { getBankAccounts } from '../../api/PaymentMethodService';
import { createStandardPayment, initializeStandardPayment } from '../../api/StandardPaymentService';
import StripeCardInput from './StripeCardInput';
import CardModal from '../Products/PaymentCard';

const CheckoutPaymentSection = ({ 
  product, 
  productId, 
  offerId, 
  offerAmount, 
  selectedAddress, 
  selectedShipping, 
  useEscrow,
  onPaymentSuccess,
  onPaymentError 
}) => {
  const [paymentMethodType, setPaymentMethodType] = useState('card');
  const [userCards, setUserCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [openCard, setOpenCard] = useState(false);
  const [useNewCard, setUseNewCard] = useState(false);
  const [stripePublishableKey, setStripePublishableKey] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  const stripeCardRef = useRef(null);

  // Load payment methods
  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setCardsLoading(true);
    try {
      // Load cards
      const cardsResponse = await getUserCards();
      if (cardsResponse.success) {
        setUserCards(cardsResponse.data || []);
        if (cardsResponse.data?.length > 0) {
          setSelectedCard(cardsResponse.data[0]);
        }
      }

      // Load bank accounts
      const bankResponse = await getBankAccounts();
      if (bankResponse.success) {
        setBankAccounts(bankResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setCardsLoading(false);
    }
  };

  const handleCardSaved = (newCard) => {
    setUserCards(prev => [...prev, newCard]);
    setSelectedCard(newCard);
    setUseNewCard(false);
  };

  const processPayment = async () => {
    if (processing) return;

    try {
      setProcessing(true);

      // Validation
      if (paymentMethodType === 'card' && !useNewCard && !selectedCard) {
        toast.error('Please select a card or add a new one');
        return;
      }

      if (paymentMethodType === 'bank' && !selectedBankAccount) {
        toast.error('Please select a bank account');
        return;
      }

      if (!selectedAddress) {
        toast.error('Please add a shipping address');
        return;
      }

      // Calculate payment summary
      const productPrice = offerAmount || product.price || 0;
      const shippingCost = selectedShipping?.cost?.total || product.shipping_cost || 0;
      const salesTax = 0.72; // Fixed sales tax
      const platformFee = productPrice * 0.05; // 5% platform fee for standard payments
      const baseAmount = productPrice + shippingCost + salesTax + platformFee;
      const processingFee = baseAmount * 0.029 + 0.30; // Approximate processing fee
      const totalAmount = baseAmount + processingFee;

      const paymentSummary = {
        productPrice: productPrice,
        platformFee: platformFee,
        shippingCost: shippingCost,
        salesTax: salesTax,
        processingFee: processingFee,
        totalAmount: totalAmount,
        currency: 'USD',
        exchangeRate: 1
      };

      // Create payment data
      const paymentData = {
        productId: productId,
        offerId: offerId,
        paymentGateway: useNewCard ? 'stripe' : 'paytabs', // Use Stripe for new cards
        currency: 'USD',
        shippingAddress: selectedAddress,
        gatewayFeePaidBy: 'buyer',
        paymentSummary: paymentSummary, // Add payment summary
        cardDetails: paymentMethodType === 'card' && !useNewCard ? {
          cardId: selectedCard._id
        } : null
      };

      console.log('Creating payment with data:', paymentData);

      // Step 1: Create payment record
      const createResponse = await createStandardPayment(paymentData);
      if (!createResponse.success) {
        throw new Error(createResponse.error || 'Failed to create payment');
      }

      const paymentId = createResponse.data.paymentId;
      console.log('Payment created with ID:', paymentId);

      // Step 2: Initialize payment with gateway
      const initResponse = await initializeStandardPayment(paymentId, {
        returnUrl: `${window.location.origin}/payment-success`,
        cancelUrl: window.location.href
      });

      if (!initResponse.success) {
        throw new Error(initResponse.error || 'Failed to initialize payment');
      }

      console.log('Payment initialization response:', initResponse);

      // Step 3: Handle different payment methods
      if (useNewCard && initResponse.data.clientSecret) {
        // Handle Stripe payment with new card
        setStripePublishableKey(initResponse.data.publishableKey);
        
        // Process payment through Stripe
        if (stripeCardRef.current?.processPayment) {
          await stripeCardRef.current.processPayment(initResponse.data.clientSecret);
        } else {
          throw new Error('Stripe payment form not ready');
        }
      } else if (initResponse.data.paymentUrl) {
        // Redirect to external payment gateway
        window.location.href = initResponse.data.paymentUrl;
      } else {
        // Payment completed successfully
        onPaymentSuccess({
          paymentId: paymentId,
          transactionId: initResponse.data.transactionId || paymentId,
          paymentType: 'standard'
        });
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      onPaymentError(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleStripePaymentSuccess = (paymentIntent) => {
    console.log('Stripe payment successful:', paymentIntent);
    onPaymentSuccess({
      paymentId: paymentIntent.id,
      transactionId: paymentIntent.id,
      paymentType: 'standard',
      stripePaymentIntent: paymentIntent
    });
  };

  const handleStripePaymentError = (error) => {
    console.error('Stripe payment error:', error);
    onPaymentError(error);
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-medium mb-4">Payment Method</h3>
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setPaymentMethodType('card')}
            className={`flex items-center px-4 py-2 rounded-lg border ${
              paymentMethodType === 'card'
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Credit/Debit Card
          </button>
          <button
            onClick={() => setPaymentMethodType('bank')}
            className={`flex items-center px-4 py-2 rounded-lg border ${
              paymentMethodType === 'bank'
                ? 'border-teal-500 bg-teal-50 text-teal-700'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Building2 className="w-4 h-4 mr-2" />
            Bank Account
          </button>
        </div>

        {/* Card Payment Section */}
        {paymentMethodType === 'card' && (
          <div className="space-y-4">
            {/* Card Selection Options */}
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setUseNewCard(false)}
                className={`px-4 py-2 rounded-lg border ${
                  !useNewCard
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Use Saved Card
              </button>
              <button
                onClick={() => setUseNewCard(true)}
                className={`px-4 py-2 rounded-lg border ${
                  useNewCard
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                Use New Card
              </button>
            </div>

            {/* Saved Cards */}
            {!useNewCard && (
              <div>
                {cardsLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-16 bg-gray-200 rounded"></div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                ) : userCards.length > 0 ? (
                  <div className="space-y-2">
                    {userCards.map((card) => (
                      <div
                        key={card._id}
                        className={`border p-3 rounded cursor-pointer transition-colors ${
                          selectedCard?._id === card._id
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedCard(card)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div style={{ color: getCardBrandInfo(card.brand).color }}>
                              {getCardBrandInfo(card.brand).icon}
                            </div>
                            <div>
                              <p className="font-medium">•••• •••• •••• {card.lastFourDigits}</p>
                              <p className="text-sm text-gray-500">
                                {getCardBrandInfo(card.brand).name} • Expires {card.expiryMonth}/{card.expiryYear}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setOpenCard(true)}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors"
                    >
                      <Plus className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                      <span className="text-gray-600">Add New Card</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setOpenCard(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                  >
                    <Plus className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <span className="text-gray-600">Add Your First Card</span>
                  </button>
                )}
              </div>
            )}

            {/* New Card with Stripe */}
            {useNewCard && (
              <StripeCardInput
                ref={stripeCardRef}
                onPaymentSuccess={handleStripePaymentSuccess}
                onPaymentError={handleStripePaymentError}
                publishableKey={stripePublishableKey}
              />
            )}
          </div>
        )}

        {/* Bank Account Section */}
        {paymentMethodType === 'bank' && (
          <div>
            {bankAccounts.length > 0 ? (
              <div className="space-y-2">
                {bankAccounts.map((account) => (
                  <div
                    key={account._id}
                    className={`border p-3 rounded cursor-pointer transition-colors ${
                      selectedBankAccount?._id === account._id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedBankAccount(account)}
                  >
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{account.bankName}</p>
                        <p className="text-sm text-gray-500">
                          {account.accountType} •••• {account.lastFourDigits}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No bank accounts found</p>
                <p className="text-sm">Add a bank account in your payment settings</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Button */}
      <button
        onClick={processPayment}
        disabled={processing}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
          processing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-teal-600 hover:bg-teal-700 text-white'
        }`}
      >
        {processing ? 'Processing...' : 'Complete Payment'}
      </button>

      {/* Card Modal */}
      <CardModal
        openCard={openCard}
        setOpenCard={setOpenCard}
        onCardSaved={handleCardSaved}
      />
    </div>
  );
};

export default CheckoutPaymentSection;
