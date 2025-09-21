import React, { useState } from 'react';
import { X, Star, User, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import StarRating from './StarRating';
import { submitRating, validateRatingData } from '../../api/RatingService';

const RatingModal = ({
  isOpen,
  onClose,
  transaction,
  transactionId,
  transactionType,
  ratingType,
  ratedUser,
  userRole,
  onRatingSubmitted = null
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [categories, setCategories] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || '';

  // Support both old format (transaction object) and new format (transactionId + transactionType)
  const currentTransactionId = transaction?.id || transaction?._id || transactionId;
  const currentTransactionType = transaction?.paymentType || transactionType || 'escrow';

  if (!isOpen || (!transaction && !transactionId)) return null;

  const isBuyerRating = ratingType === 'buyer_to_seller';
  const ratingTitle = 'Rate Product';

  // Category options based on rating type - updated to match reference design
  const categoryOptions = isBuyerRating ? [
    { key: 'productQuality', label: 'Product Quality', description: 'How was the quality of the product?' },
    { key: 'sellerCommunication', label: 'Seller Communication', description: 'How well did they communicate?' },
    { key: 'shippingSpeed', label: 'Shipping Speed', description: 'How quickly did they ship?' },
    { key: 'itemAsDescribed', label: 'Item as Described', description: 'Did the item match the description?' }
  ] : [
    { key: 'payment', label: 'Payment', description: 'How quickly did they pay?' },
    { key: 'buyerCommunication', label: 'Communication', description: 'How well did they communicate?' }
  ];

  const handleCategoryRating = (categoryKey, categoryRating) => {
    setCategories(prev => ({
      ...prev,
      [categoryKey]: categoryRating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    const ratingData = {
      rating,
      review: review.trim(),
      categories,
      ratingType
    };
    // Validate rating data
    const validation = validateRatingData(ratingData);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      toast.error(firstError);
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log('🔍 Submitting rating with:', {
        transactionId: currentTransactionId,
        transactionType: currentTransactionType
      });

      await submitRating(currentTransactionId, ratingData, currentTransactionType);
      
      toast.success('Rating submitted successfully!');
      
      // Call callback if provided
      if (onRatingSubmitted) {
        onRatingSubmitted(ratingData);
      }
      
      // Reset form
      setRating(0);
      setReview('');
      setCategories({});
      
      onClose();
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit rating';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setReview('');
      setCategories({});
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{ratingTitle}</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Info - Updated to match reference design */}
          {transaction && (
            <div className="px-6 pt-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {transaction.product?.product_photos?.[0] ? (
                    <img
                      src={transaction.product.product_photos[0]}
                      alt={transaction.product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {transaction.product?.title || 'Men Self Design Polo Neck Polyester'}
                  </h3>
                  <p className="text-teal-600 font-medium text-lg">
                    ${transaction.product?.price || '12'}
                  </p>
                  <p className="text-sm text-gray-600">
                    by {ratedUser?.firstName && ratedUser?.lastName
                      ? `${ratedUser.firstName} ${ratedUser.lastName}`
                      : 'John smith'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Overall Rating */}
          <div className="px-6 space-y-3 mt-2">
            <label className="block text-sm font-medium text-gray-700">
              Overall Rating
            </label>
            <div className="flex items-center space-x-3">
              <StarRating
                rating={rating}
                interactive={true}
                onRatingChange={setRating}
                size="xl"
              />
              <span className="text-sm text-gray-600">
                {rating > 0 ? `${rating}/5` : 'Select rating'}
              </span>
            </div>
          </div>

          {/* Detailed Ratings (Optional) */}
          <div className="px-6 space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Detailed Ratings (Optional)</h4>
            {categoryOptions.map((category) => (
              <div key={category.key} className="flex items-center justify-between py-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {category.label}
                  </label>
                  <p className="text-xs text-gray-500">{category.description}</p>
                </div>
                <StarRating
                  rating={categories[category.key] || 0}
                  interactive={true}
                  onRatingChange={(value) => handleCategoryRating(category.key, value)}
                  size="md"
                />
              </div>
            ))}
          </div>

          {/* Review Text */}
          <div className="px-6 space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this product..."
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none text-sm focus:outline-none"
              rows={4}
              maxLength={1000}
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{review.length}/1000 characters</span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 px-6 pb-6 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium"
            >
              Back to Products
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
