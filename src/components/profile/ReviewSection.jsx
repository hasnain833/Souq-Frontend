import React, { useState, useEffect } from "react";
import { FaStar, FaBox } from "react-icons/fa";
import { getUserRatings } from "../../api/RatingService";
import { getProfile } from "../../api/AuthService";
import LoadingSpinner from "../common/LoadingSpinner";
import { formatSafeDate } from '../../utils/dateUtils';
import { useTranslation } from "react-i18next";

const ReviewSection = ({ userProfile = null }) => {
  const { t } = useTranslation()
  const [filter, setFilter] = useState("all");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserProfile, setCurrentUserProfile] = useState(userProfile);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || '';



  useEffect(() => {
    console.log('🔄 ReviewSection useEffect triggered with userProfile:', userProfile);

    if (userProfile && (userProfile._id || userProfile.id)) {
      console.log('✅ Using provided userProfile:', userProfile);
      setCurrentUserProfile(userProfile);

      // If profile already has ratings data, use it directly
      if (userProfile.ratings) {
        console.log('✅ Using ratings data from profile:', userProfile.ratings);
        setAverageRating(userProfile.ratings.averageRating || 0);
        setTotalRatings(userProfile.ratings.totalRatings || 0);
      }

      // Still fetch detailed reviews for the list
      fetchRatings(userProfile);
    } else {
      console.log('⚠️ No userProfile provided, fetching from API');
      fetchUserProfileAndRatings();
    }
  }, [userProfile]);

  const fetchRatings = async (userData) => {
    try {
      setLoading(true);

      // Ensure we have user data with the correct ID field
      const userId = userData?._id || userData?.id;

      if (!userId) {
        console.error('❌ No user ID found in user data:', userData);
        setReviews([]);
        setAverageRating(0);
        setTotalRatings(0);
        return;
      }

      console.log('👤 Fetching ratings for user:', userId);
      console.log('👤 User data:', userData);

      // Fetch ratings for this user (ratings received by this user)
      const ratingsResponse = await getUserRatings(userId, {
        type: 'received',
        page: 1,
        limit: 50
      });

      console.log('📊 Ratings response:', ratingsResponse);

      if (ratingsResponse?.success) {
        const ratingsData = ratingsResponse.data?.ratings || [];
        const avgRating = ratingsResponse.data?.averageRating || {};

        console.log('📋 Raw ratings data:', ratingsData);
        console.log('⭐ Average rating data:', avgRating);

        // Transform ratings data to match UI structure
        const transformedReviews = ratingsData.map(rating => {
          const reviewerName = `${rating.ratedBy?.firstName || ''} ${rating.ratedBy?.lastName || ''}`.trim();
          const productImage = rating.product?.product_photos?.[0];

          return {
            id: rating._id,
            user: reviewerName || 'Anonymous',
            // avatar: rating.ratedBy?.profile
            //   ? `${baseURL}${rating.ratedBy.profile}`
            //   : `https://ui-avatars.com/api/?name=${rating.ratedBy?.firstName?.[0] || 'U'}`,
            avatar: rating.ratedBy?.profile
              ? rating.ratedBy?.profile
              : `https://ui-avatars.com/api/?name=${rating.ratedBy?.firstName?.[0] || 'U'}`,
            rating: rating.rating,
            message: rating.review || (rating.rating === 5 ? 'Auto-feedback: Sale completed successfully' : 'No review message'),
            timeAgo: formatSafeDate(rating.createdAt),
            type: rating.review && rating.review.trim() ? "member" : "auto",
            product: {
              title: rating.product?.title || 'Product',
              image: productImage
                ? (productImage.startsWith('http') ? productImage : `${baseURL}/${productImage}`)
                : null,
              id: rating.product?._id
            },
            ratingType: rating.ratingType,
            categories: rating.categories || {}
          };
        });

        console.log('✨ Transformed reviews:', transformedReviews);

        setReviews(transformedReviews);
        setAverageRating(avgRating.averageRating || 0);
        setTotalRatings(avgRating.totalRatings || transformedReviews.length);
      } else {
        console.warn('⚠️ Failed to fetch ratings:', ratingsResponse);
        setReviews([]);
        setAverageRating(0);
        setTotalRatings(0);
      }
    } catch (error) {
      console.error('❌ Error fetching ratings:', error);
      // Set empty state on error
      setReviews([]);
      setAverageRating(0);
      setTotalRatings(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfileAndRatings = async () => {
    try {
      setLoading(true);

      // Get current user profile
      const profileResponse = await getProfile();
      if (profileResponse?.success) {
        const userData = profileResponse.data.data;
        setCurrentUserProfile(userData);

        console.log('👤 Profile fetched:', userData);

        // Fetch ratings using the profile data
        await fetchRatings(userData);
      } else {
        console.warn('⚠️ Failed to fetch user profile:', profileResponse);
        setReviews([]);
        setAverageRating(0);
        setTotalRatings(0);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      setReviews([]);
      setAverageRating(0);
      setTotalRatings(0);
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (filter === "member") return r.type === "member";
    if (filter === "auto") return r.type === "auto";
    return true;
  });

  const memberReviewsCount = reviews.filter(r => r.type === "member").length;
  const autoReviewsCount = reviews.filter(r => r.type === "auto").length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      {/* Rating Overview Section */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          {/* Profile + Rating */}
          <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0 rtl:space-y-reverse">
            {/* Profile Image */}
            {currentUserProfile && (
              <div className="flex-shrink-0">
                <img
                  src={
                    currentUserProfile.profile
                      ? currentUserProfile.profile
                      : `https://ui-avatars.com/api/?name=${currentUserProfile.firstName?.[0] || 'U'}&background=e5e7eb&color=6b7280&size=80`
                  }
                  alt={`${currentUserProfile.firstName || ''} ${currentUserProfile.lastName || ''}`.trim()}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${currentUserProfile.firstName?.[0] || 'U'}&background=e5e7eb&color=6b7280&size=80`;
                  }}
                />
              </div>
            )}

            {/* Rating Display */}
            <div className="text-center sm:text-left">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-1">
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
              </h2>
              <div className="flex justify-center sm:justify-start mb-2">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`text-lg ${index < Math.floor(averageRating) ? 'text-yellow-500' : 'text-gray-300'
                      }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                {totalRatings} {totalRatings === 1 ? t("review") : t("reviews")}
              </p>
            </div>
          </div>

          {/* Review Stats */}
          <div className="flex gap-8 text-sm text-gray-600 justify-center md:justify-end w-full md:w-auto">
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1 justify-center">
                <FaStar className="text-yellow-500 text-xs" />
                <span className="font-medium">{t("member")}</span>
              </div>
              <p className="text-2xl font-bold text-teal-600">{memberReviewsCount}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1 justify-center">
                <FaStar className="text-yellow-500 text-xs" />
                <span className="font-medium">{t("automatic")}</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{autoReviewsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-gray-100 rounded-xl shadow-inner p-1">
          {[
            { label: t("all"), value: "all", count: totalRatings },
            { label: t("from-members"), value: "member", count: memberReviewsCount },
            { label: t("automatic"), value: "auto", count: autoReviewsCount },
          ].map(({ label, value, count }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-5 py-2 rounded-md text-sm font-medium
          ${filter === value
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
                }`}
              aria-pressed={filter === value}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>


      {/* Review List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <FaBox className="mx-auto text-gray-400 text-5xl mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">{t("no-reviews-yet")}</h3>
            <p className="text-gray-500">{t("reviews-from-buyers")}</p>
          </div>
        ) : (
          filteredReviews.map((review, index) => (
            <div key={review.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
              {/* Product Information Header */}
              {review.product && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 border-b">
                  {review.product.image ? (
                    <img
                      src={review.product.image}
                      alt={review.product.title}
                      className="w-10 h-10 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FaBox className="text-gray-400 text-sm" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{review.product.title}</p>
                    <p className="text-xs text-gray-500">
                      {review.ratingType === 'buyer_to_seller' ? 'Buyer review' : 'Seller review'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{review.timeAgo}</span>
                </div>
              )}

              {/* Review Content */}
              <div className="p-4">
                <div className="flex gap-3">
                  <img
                    src={review.avatar}
                    alt={review.user}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${review.user?.[0] || 'U'}&background=e5e7eb&color=6b7280`;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm text-gray-800 truncate">
                        {review.user || 'Anonymous'}
                      </h4>
                      {!review.product && (
                        <span className="text-xs text-gray-400 ml-2">{review.timeAgo}</span>
                      )}
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={`text-sm ${i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({review.rating}/5)</span>
                      {review.type === 'auto' && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {t("auto")}
                        </span>
                      )}
                    </div>

                    {/* Review Message */}
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      {review.message}
                    </p>

                    {/* Category Ratings (if available) */}
                    {review.categories && Object.keys(review.categories).length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">{t("detailed-ratings")}:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(review.categories).map(([category, rating]) => (
                            <div key={category} className="flex items-center justify-between">
                              <span className="text-xs text-gray-600 capitalize">
                                {category.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <FaStar
                                    key={i}
                                    className={`text-xs ${i < rating ? 'text-yellow-500' : 'text-gray-300'
                                      }`}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
