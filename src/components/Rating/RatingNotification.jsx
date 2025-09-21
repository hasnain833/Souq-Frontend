// import { useState, useEffect } from 'react';
// import { Star, X, Bell } from 'lucide-react';
// import { toast } from 'react-toastify';
// // import { getPendingRatings } from '../../api/RatingService';

// const RatingNotification = () => {
//   const [pendingRatings, setPendingRatings] = useState([]);
//   const [showNotification, setShowNotification] = useState(false);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     // loadPendingRatings();
    
//     // Check for pending ratings every 5 minutes
//     const interval = setInterval(loadPendingRatings, 5 * 60 * 1000);
    
//     return () => clearInterval(interval);
//   }, []);

//   const loadPendingRatings = async () => {
//     try {
//       setLoading(true);
//       // const response = await getPendingRatings();
      
//       if (response.success && response.data.ratings) {
//         const ratings = response.data.ratings;
//         setPendingRatings(ratings);

//         // Show notification if there are pending ratings
//         if (ratings.length > 0) {
//           setShowNotification(true);
//         }
//       } else if (response.success && response.data.pendingRatings) {
//         // Handle old API response format
//         const ratings = response.data.pendingRatings;
//         setPendingRatings(ratings);

//         // Show notification if there are pending ratings
//         if (ratings.length > 0) {
//           setShowNotification(true);
//         }
//       }
//     } catch (error) {
//       console.error('Error loading pending ratings:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRateNow = (rating) => {
//     // Navigate to rating page
//     const transactionId = rating.transaction._id || rating.transaction.id;
//     const type = rating.transaction.type || 'escrow';
//     window.location.href = `/rating?transaction=${transactionId}&type=${type}`;
//   };

//   const handleDismiss = () => {
//     setShowNotification(false);
//   };

//   const handleDismissAll = () => {
//     setShowNotification(false);
//     toast.info('Rating reminders dismissed. You can still rate transactions from your orders page.');
//   };

//   if (!showNotification || pendingRatings.length === 0) {
//     return null;
//   }

//   return (
//     <div className="fixed top-20 right-4 z-50 max-w-sm">
//       <div className="bg-white rounded-lg shadow-lg border border-yellow-200 overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-3 flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             <Bell className="w-5 h-5 text-white" />
//             <h3 className="text-white font-semibold">Pending Ratings</h3>
//           </div>
//           <button
//             onClick={handleDismiss}
//             className="text-white hover:text-yellow-100"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-4">
//           <p className="text-sm text-gray-600 mb-3">
//             You have {pendingRatings.length} transaction{pendingRatings.length > 1 ? 's' : ''} waiting for your rating.
//           </p>

//           {/* Pending Ratings List */}
//           <div className="space-y-3 max-h-60 overflow-y-auto">
//             {pendingRatings.slice(0, 3).map((rating, index) => (
//               <div key={index} className="border border-gray-200 rounded-lg p-3">
//                 <div className="flex items-start space-x-3">
//                   <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
//                     <Star className="w-4 h-4 text-yellow-600" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-medium text-gray-900 truncate">
//                       {rating.transaction.product?.title || 'Product Transaction'}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       {rating.ratingType === 'buyer_to_seller' ? 'Rate Seller' : 'Rate Buyer'}
//                     </p>
//                     <p className="text-xs text-gray-400">
//                       {new Date(rating.transaction.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => handleRateNow(rating)}
//                   className="w-full mt-2 bg-yellow-600 text-white text-xs py-1 px-2 rounded hover:bg-yellow-700 transition-colors"
//                 >
//                   Rate Now
//                 </button>
//               </div>
//             ))}
//           </div>

//           {/* Show more indicator */}
//           {pendingRatings.length > 3 && (
//             <p className="text-xs text-gray-500 text-center mt-2">
//               +{pendingRatings.length - 3} more pending ratings
//             </p>
//           )}

//           {/* Action Buttons */}
//           <div className="flex space-x-2 mt-4">
//             <button
//               onClick={() => window.location.href = '/orders'}
//               className="flex-1 bg-gray-100 text-gray-700 text-sm py-2 px-3 rounded hover:bg-gray-200 transition-colors"
//             >
//               View All Orders
//             </button>
//             <button
//               onClick={handleDismissAll}
//               className="flex-1 bg-yellow-600 text-white text-sm py-2 px-3 rounded hover:bg-yellow-700 transition-colors"
//             >
//               Dismiss All
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RatingNotification;
