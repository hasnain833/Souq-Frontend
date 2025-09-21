import React, { useState, useEffect } from 'react';
import { Star, User, Package, Calendar, ThumbsUp } from 'lucide-react';
import { formatSafeDate } from '../../utils/dateUtils';
import StarRating from './StarRating';
import { getUserRatings, formatRatingDisplay } from '../../api/RatingService';

const UserRatings = ({ userId, showHeader = true, limit = 10 }) => {
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('received');

  const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || '';



  useEffect(() => {
    fetchUserRatings();
  }, [userId, activeTab]);

  const fetchUserRatings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getUserRatings(userId, {
        type: activeTab,
        limit: limit
      });

      if (response.success) {
        setRatings(response.data.ratings);
        setAverageRating(response.data.averageRating);
      }
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      setError('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  const formatRatingData = (rating, totalRatings) => {
    return formatRatingDisplay(rating, totalRatings);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {showHeader && (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        )}
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="animate-pulse bg-white p-4 rounded-lg border">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  const ratingData = averageRating ? formatRatingData(averageRating.averageRating, averageRating.totalRatings) : null;

  return (
    <div className="space-y-6">
      {/* Header with Average Rating */}
      {showHeader && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ratings & Reviews</h3>
          
          {ratingData && averageRating.totalRatings > 0 ? (
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {ratingData.displayRating}
                </div>
                <StarRating rating={averageRating.averageRating} size="sm" />
                <p className="text-sm text-gray-600 mt-1">
                  {ratingData.totalText}
                </p>
              </div>
              
              {/* Rating Distribution */}
              <div className="flex-1 max-w-xs">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = averageRating.ratingDistribution?.[star] || 0;
                  const percentage = averageRating.totalRatings > 0 
                    ? (count / averageRating.totalRatings) * 100 
                    : 0;
                  
                  return (
                    <div key={star} className="flex items-center space-x-2 text-sm">
                      <span className="w-3 text-gray-600">{star}</span>
                      <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-gray-600 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No ratings yet</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('received')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'received'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Received ({averageRating?.totalRatings || 0})
            </button>
            <button
              onClick={() => setActiveTab('given')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'given'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Given
            </button>
          </nav>
        </div>

        {/* Ratings List */}
        <div className="p-6">
          {ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating._id} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start space-x-4">
                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                      {rating.ratedBy?.profile ? (
                        <img
                          // src={`${baseURL}${rating.ratedBy.profile}`}
                          src={rating.ratedBy.profile}
                          alt={`${rating.ratedBy.firstName} ${rating.ratedBy.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {/* Rating Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {rating.ratedBy?.firstName} {rating.ratedBy?.lastName}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <StarRating rating={rating.rating} size="sm" />
                            <span className="text-sm text-gray-600">
                              {rating.rating}/5
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {formatSafeDate(rating.createdAt)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {rating.ratingType === 'buyer_to_seller' ? 'As Seller' : 'As Buyer'}
                          </p>
                        </div>
                      </div>

                      {/* Review Text */}
                      {rating.review && (
                        <p className="text-gray-700 text-sm mb-3">
                          "{rating.review}"
                        </p>
                      )}

                      {/* Product Info */}
                      {rating.product && (
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Package className="w-3 h-3" />
                          <span>{rating.product.title}</span>
                          {rating.escrowTransaction?.transactionId && (
                            <>
                              <span>•</span>
                              <span>Order #{rating.escrowTransaction.transactionId}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Category Ratings */}
                      {rating.categories && Object.keys(rating.categories).length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(rating.categories).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between">
                              <span className="text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <StarRating rating={value} size="sm" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">
                {activeTab === 'received' ? 'No ratings received yet' : 'No ratings given yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRatings;
