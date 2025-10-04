import React, { useState, useEffect } from 'react';
import { Check, X, Clock, ShoppingBag } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { acceptOffer, declineOffer, getOffer } from '../../api/OfferService';
import CountdownTimer from './CountdownTimer';
import { useTranslation } from 'react-i18next';

const OfferMessage = ({
  message,
  currentUserId,
  onOfferUpdate,
  product
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const status = location.state?.status;
  const { t } = useTranslation()
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [offerDetails, setOfferDetails] = useState(null);

  const isSender = message.sender.id === currentUserId || message.sender._id === currentUserId;

  // Better seller detection - check multiple possible fields
  const isSeller = product?.user === currentUserId ||
    product?.user?._id === currentUserId ||
    product?.seller === currentUserId ||
    product?.seller?._id === currentUserId;

  const offerData = message.offerData;

  // Fetch offer details to get expiration date
  useEffect(() => {
    const fetchOfferDetails = async () => {
      if (message.offer && offerData?.status === 'pending') {
        try {
          const response = await getOffer(message.offer);
          if (response.success) {
            setOfferDetails(response.data);
          }
        } catch (error) {
          console.error('Failed to fetch offer details:', error);
        }
      }
    };

    fetchOfferDetails();
  }, [message.offer, offerData?.status]);

  // Debug logging
  console.log('OfferMessage Debug:', {
    currentUserId,
    isSender,
    isSeller,
    messageType: message.messageType,
    offerStatus: offerData?.status,
    productUser: product?.user,
    productSeller: product?.seller,
    senderId: message.sender.id || message.sender._id,
    offerDetails: offerDetails
  });

  const handleAcceptOffer = async () => {
    if (!message.offer) return;

    setIsProcessing(true);
    setError('');

    try {
      const response = await acceptOffer(message.offer);
      if (response.success) {
        onOfferUpdate(response.data);
      }
    } catch (error) {
      console.error('Accept offer error:', error);
      setError(error.message || 'Failed to accept offer');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeclineOffer = async () => {
    if (!message.offer) return;

    setIsProcessing(true);
    setError('');

    try {
      const response = await declineOffer(message.offer);
      if (response.success) {
        onOfferUpdate(response.data);
      }
    } catch (error) {
      console.error('Decline offer error:', error);
      setError(error.message || 'Failed to decline offer');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle automatic expiration
  const handleOfferExpiration = async () => {
    console.log('Offer expired, auto-declining...');
    setIsExpired(true);

    // Auto-decline the offer when it expires
    if (message.offer && offerData?.status === 'pending') {
      try {
        const response = await declineOffer(message.offer, 'Offer expired after 48 hours');
        if (response.success) {
          onOfferUpdate(response.data);
        }
      } catch (error) {
        console.error('Auto-decline error:', error);
        // Even if API call fails, mark as expired locally
        setError('Offer has expired');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'accepted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'declined':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'accepted':
        return <Check size={16} />;
      case 'declined':
        return <X size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const renderOfferContent = () => {
    if (message.messageType === 'offer' || message.messageType === 'offer_accepted' || message.messageType === 'offer_declined' || message.messageType === 'offer_expired') {
      return (
        <div className="bg-white border-4 border-teal-600 rounded-lg p-4 max-w-sm shadow-sm">
          {/* Offer Header */}
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">
              {isSender ? t("yourOffer") : t('offerReceived')}
            </h4>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border rtl:space-x-reverse ${getStatusColor(offerData?.status)}`}>
              {getStatusIcon(offerData?.status)}
              <span className="capitalize">{offerData?.status || 'pending'}</span>
            </div>
          </div>

          {/* Price Info */}
          <div className="space-y-2 mb-4 rtl:space-y-reverse">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t("originalPrice")}:</span>
              <span className="text-sm font-medium">${offerData?.originalPrice}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t("offerAmount")}:</span>
              <span className="text-lg font-bold text-teal-600">${offerData?.amount}</span>
            </div>
            {offerData?.originalPrice && offerData?.amount && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("discount")}:</span>
                <span className="text-sm font-medium text-green-600">
                  {Math.round(((offerData.originalPrice - offerData.amount) / offerData.originalPrice) * 100)}% off
                </span>
              </div>
            )}
          </div>

          {/* Countdown Timer for Pending Offers */}
          {offerData?.status === 'pending' && (offerDetails?.expiresAt || message.createdAt) && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-orange-800">{t("offerExpiresIn")}:</span>
                <CountdownTimer
                  expiresAt={offerDetails?.expiresAt || new Date(new Date(message.createdAt).getTime() + 48 * 60 * 60 * 1000)}
                  onExpire={handleOfferExpiration}
                  size="sm"
                  className="text-orange-700"
                />
              </div>
            </div>
          )}

          {/* Expired Offer Notice */}
          {(offerData?.status === 'expired' || isExpired) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-center">
                <span className="text-sm font-medium text-red-800">{t("offerExpired")}</span>
              </div>
            </div>
          )}

          {/* Message Text */}
          {message.text && message.text !== `Made an offer of $${offerData?.amount}` && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                {message.text.replace(`Made an offer of $${offerData?.amount}: `, '')}
              </p>
            </div>
          )}

          {/* Debug Info - Remove in production */}
          {/* {import.meta.env.DEV && ( 
            <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <div>isSender: {isSender.toString()}</div>
              <div>isSeller: {isSeller.toString()}</div>
              <div>Status: {offerData?.status}</div>
              <div>Show buttons: {(!isSender && isSeller && offerData?.status === 'pending').toString()}</div>
            </div>
          )} */}

          {/* Action Buttons for Seller */}
          {((!isSender && isSeller && offerData?.status === 'pending') ||
            (!isSender && offerData?.status === 'pending')) && !isExpired && (
              <div className="flex space-x-2 rtl:space-x-reverse">
                <button
                  onClick={handleDeclineOffer}
                  disabled={isProcessing || isExpired}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isProcessing ? 'Processing...' : t('decline')}
                </button>
                <button
                  onClick={handleAcceptOffer}
                  disabled={isProcessing || isExpired}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {isProcessing ? 'Processing...' : t('accept')}
                </button>
              </div>
            )}

          {/* Fallback buttons for testing - Remove in production */}
          {/* {import.meta.env.DEV && !isSender && offerData?.status === 'pending' && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <div className="text-xs text-blue-600 mb-2">Debug: Force show buttons</div>
              <div className="flex space-x-2">
                <button
                  onClick={handleDeclineOffer}
                  disabled={isProcessing}
                  className="flex-1 px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Force Decline'}
                </button>
                <button
                  onClick={handleAcceptOffer}
                  disabled={isProcessing}
                  className="flex-1 px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Force Accept'}
                </button>
              </div>
            </div>
          )} */}

          {/* Buy Now Button for Buyer (when offer is accepted) */}
          {isSender && offerData?.status === 'accepted' && (
            <button
              onClick={() => {
                console.log('Buy now clicked for accepted offer:', offerData);

                // Prepare product data for checkout with the accepted offer price
                const productForCheckout = {
                  // Original product data
                  id: product?.id,
                  title: product?.title,
                  product_photos: product?.photos || product?.product_photos || [],
                  brand: product?.brand, // Default since chat API doesn't include brand
                  size: product?.size, // Default since chat API doesn't include size
                  condition: product?.condition,
                  material: product?.material,
                  colors: product?.colors,

                  // Use accepted offer amount as the price for checkout
                  price: offerData.amount,
                  shipping_cost: product?.shippingCost || 0,

                  // Additional offer-related data
                  isOfferPurchase: true,
                  offerId: offerData.id,
                  originalPrice: product?.price,
                  discountAmount: product?.price - offerData.offerAmount,
                  discountPercentage: product?.price ? Math.round(((product.price - offerData.offerAmount) / product.price) * 100) : 0
                };

                console.log('Navigating to checkout with offer data:', productForCheckout);

                // Navigate to checkout page with the accepted offer price
                navigate('/continue-checkout', {
                  state: { product: productForCheckout }
                });
              }}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 rtl:space-x-reverse transition-colors
    ${product?.status === "sold" || status
                  ? "bg-teal-600 text-white opacity-50 cursor-not-allowed"
                  : "bg-teal-600 text-white hover:bg-teal-700"}`}
              disabled={product?.status === "sold" || status}
            >
              <ShoppingBag size={16} />
              <span>{t("buyNow")}</span>
            </button>
          )}

          {/* Status Message for Buyer */}
          {isSender && offerData?.status !== 'pending' && offerData?.status !== 'accepted' && (
            <div className={`text-center py-2 px-3 rounded-lg text-sm font-medium ${getStatusColor(offerData?.status)}`}>
              {offerData?.status === 'declined' ? t('offerDeclined') : t('offerCancelled')}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md min-w-[270px] ${isSender ? 'order-2' : 'order-1'}`}>
        {renderOfferContent()}

        {/* Timestamp */}
        <div className={`text-xs text-gray-500 mt-1 ${isSender ? 'text-right' : 'text-left'}`}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

export default OfferMessage;
