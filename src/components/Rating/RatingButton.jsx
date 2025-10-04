import React, { useState, useEffect } from "react";
import { Star, Eye, Edit3, User, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { formatSafeDate } from "../../utils/dateUtils";
import StarRating from "./StarRating";
import RatingModal from "./RatingModal";
import {
  getTransactionRating,
  canRateTransaction,
} from "../../api/RatingService";
import { useTranslation } from "react-i18next";

const RatingButton = ({
  transactionId,
  transactionType = "escrow",
  onRatingUpdate = null,
}) => {
  const [loading, setLoading] = useState(true);
  const [existingRating, setExistingRating] = useState(null);
  const [canRate, setCanRate] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showRatingDetails, setShowRatingDetails] = useState(false);
  const [ratingType, setRatingType] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const { t } = useTranslation();

  const baseURL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, "") || "";

  useEffect(() => {
    if (transactionId) {
      checkRatingStatus();
    }
  }, [transactionId, transactionType]);

  const checkRatingStatus = async () => {
    try {
      setLoading(true);

      // Check if user has already rated this transaction
      const ratingResponse = await getTransactionRating(
        transactionId,
        transactionType
      );

      // if (ratingResponse.success && ratingResponse.data.hasRating) {
      //   setExistingRating(ratingResponse.data.rating);
      //   setCanRate(false);
      // } else {
      //   // Check if user can rate this transaction
      //   const canRateResponse = await canRateTransaction(transactionId, transactionType);

      //   if (canRateResponse.success && canRateResponse.data.canRate) {
      //     setCanRate(true);
      //     setRatingType(canRateResponse.data.ratingType);
      //     setUserRole(canRateResponse.data.userRole);
      //   } else {
      //     setCanRate(false);
      //   }
      // }
    } catch (error) {
      console.error("Error checking rating status:", error);
      toast.error("Failed to load rating information");
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmitted = (newRating) => {
    setExistingRating(newRating);
    setCanRate(false);
    setShowRatingModal(false);
    toast.success("Rating submitted successfully!");

    if (onRatingUpdate) {
      onRatingUpdate(newRating);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  // Show existing rating
  if (existingRating) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Your Rating</h3>
          <button
            onClick={() => setShowRatingDetails(!showRatingDetails)}
            className="text-gray-500 hover:text-gray-700 transition-colors">
            <Eye className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-3 mb-3">
          <StarRating rating={existingRating.rating} size="lg" />
          <span className="text-xl font-bold text-gray-900">
            {existingRating.rating}/5
          </span>
        </div>

        {existingRating.review && (
          <div className="mb-3">
            <p className="text-gray-700 text-sm leading-relaxed">
              "{existingRating.review}"
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Rated {formatSafeDate(existingRating.createdAt)} ago</span>
          </div>
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span className="capitalize">
              {existingRating.ratingType?.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Detailed rating view */}
        {showRatingDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-3">
              {/* Rated User Info */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {existingRating.ratedUser?.profile ? (
                    <img
                      // src={`${baseURL}${existingRating.ratedUser.profile}`}
                      src={existingRating.ratedUser.profile}
                      alt={`${existingRating.ratedUser.firstName} ${existingRating.ratedUser.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {existingRating.ratedUser?.firstName}{" "}
                    {existingRating.ratedUser?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {existingRating.ratingType === "buyer_to_seller"
                      ? "Seller"
                      : "Buyer"}
                  </p>
                </div>
              </div>

              {/* Category Ratings */}
              {existingRating.categories &&
                Object.keys(existingRating.categories).length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Category Ratings
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(existingRating.categories).map(
                        ([category, rating]) => (
                          <div
                            key={category}
                            className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 capitalize">
                              {category.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                            <StarRating rating={rating} size="sm" />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show "Rate Now" button
  // if (canRate) {
  //   return (
  //     <>
  //       <button
  //         onClick={() => setShowRatingModal(true)}
  //         className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
  //         <Star className="w-5 h-5" />
  //         {t("rateNow")}
  //       </button>

  //       <RatingModal
  //         isOpen={showRatingModal}
  //         onClose={() => setShowRatingModal(false)}
  //         transactionId={transactionId}
  //         transactionType={transactionType}
  //         ratingType={ratingType}
  //         userRole={userRole}
  //         onRatingSubmitted={handleRatingSubmitted}
  //       />
  //     </>
  //   );
  // }

  // // Show message when rating is not available
  // return (
  //   <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
  //     <div className="flex items-center justify-center mb-2">
  //       <Star className="w-6 h-6 text-gray-400" />
  //     </div>
  //     <p className="text-sm text-gray-600">Rating not available</p>
  //     <p className="text-xs text-gray-500 mt-1">
  //       You can only rate completed transactions
  //     </p>
  //   </div>
  // );
};

export default RatingButton;
