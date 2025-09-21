import React, { useState, useEffect } from 'react';
import { Star, User, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import RatingModal from './RatingModal';
// import { canRateTransaction } from '../../api/RatingService';

const RatingPrompt = ({ transaction, onRatingSubmitted = null }) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const [ratingType, setRatingType] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || '';

  useEffect(() => {
    // checkRatingEligibility();
  }, [transaction]);

  const checkRatingEligibility = async () => {
    if (!transaction?._id && !transaction?.id) {
      console.log('🌟 RatingPrompt - No transaction ID found:', transaction);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const transactionId = transaction._id || transaction.id;
      console.log('🌟 RatingPrompt - Checking rating eligibility for transaction:', transactionId);
      console.log('🌟 RatingPrompt - Transaction data:', transaction);

      // const response = await canRateTransaction(transactionId);
      console.log('🌟 RatingPrompt - Rating eligibility response:', response);

      if (response.success) {
        setCanRate(response.data.canRate);
        setRatingType(response.data.ratingType);
        setUserRole(response.data.userRole);
        console.log('🌟 RatingPrompt - Can rate:', response.data.canRate, 'Type:', response.data.ratingType);
      } else {
        console.log('🌟 RatingPrompt - Rating check failed:', response);
      }
    } catch (error) {
      console.error('❌ RatingPrompt - Error checking rating eligibility:', error);
      setCanRate(false);
    } finally {
      setLoading(false);
    }
  };

  const handleRateNow = () => {
    setShowRatingModal(true);
  };

  const handleRatingSubmitted = (ratingData) => {
    setCanRate(false); // Hide the prompt after rating is submitted
    if (onRatingSubmitted) {
      onRatingSubmitted(ratingData);
    }
  };

  // Don't show anything if loading or can't rate
  if (loading || !canRate || !transaction) {
    return null;
  }

  const isBuyerRating = ratingType === 'buyer_to_seller';
  const otherUser = isBuyerRating ? transaction.seller : transaction.buyer;
  const promptTitle = isBuyerRating ? 'Rate Your Seller' : 'Rate Your Buyer';
  const promptDescription = isBuyerRating 
    ? 'How was your buying experience? Help other buyers by rating this seller.'
    : 'How was your selling experience? Help other sellers by rating this buyer.';

  return (
    <>
      {/* Rating Prompt Card */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div className="flex items-start space-x-4">
          {/* Star Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" fill="currentColor" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {promptTitle}
            </h3>
            <p className="text-gray-700 mb-4">
              {promptDescription}
            </p>

            {/* User Info */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {otherUser?.profile ? (
                  <img
                    src={otherUser.profile}
                    alt={`${otherUser.firstName} ${otherUser.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {otherUser?.firstName} {otherUser?.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {isBuyerRating ? 'Seller' : 'Buyer'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleRateNow}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
              >
                <Star className="w-4 h-4" />
                <span>Rate Now</span>
              </button>
              <button
                onClick={() => setCanRate(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-4 pt-4 border-t border-yellow-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <MessageCircle className="w-4 h-4" />
            <span>Your rating helps build trust in our community</span>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        transaction={transaction}
        ratingType={ratingType}
        ratedUser={otherUser}
        onRatingSubmitted={handleRatingSubmitted}
      />
    </>
  );
};

export default RatingPrompt;
