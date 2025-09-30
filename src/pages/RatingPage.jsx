import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RatingButton from '../components/Rating/RatingButton';
import { getEscrowTransaction, getTransactionDetails } from '../api/EscrowService';
import { getStandardPayment } from '../api/StandardPaymentService';


const RatingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const [canRate, setCanRate] = useState(false);
  const [ratingType, setRatingType] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [error, setError] = useState(null);

  const transactionId = searchParams.get('transaction');
  const type = searchParams.get('type') || 'escrow';
  const baseOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  
  console.log('Transactiondataaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:', transaction);
  useEffect(() => {
    if (!transactionId) {
      setError('Transaction ID is required');
      setLoading(false);
      return;
    }

    loadTransactionAndCheckRating();
  }, [transactionId, type]);



  const loadTransactionAndCheckRating = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Loading transaction: ${transactionId} (type: ${type})`);

      // Load transaction details
      let transactionData;
      let response;
      console.log(transactionData,'transactiondata')
      if (type === 'escrow') {
        console.log('📦 Loading escrow transaction...');
        try {
          console.log('hhhhhhhhhhhhhhhhhhh')
          response = await getEscrowTransaction(transactionId);
        } catch (primaryError) {
          console.log('Primary endpoint failed, trying alternative:', primaryError);
          response = await getTransactionDetails(transactionId);
        }
        console.log('📦 Escrow response:', response);

        if (response.success) {
          // Handle escrow transaction data structure
          const escrowData = response.data.escrowTransaction || response.data;
          transactionData = {
            ...escrowData,
            paymentType: 'escrow',
            id: escrowData._id || escrowData.id,
            escrowTransaction: escrowData,
            // Store user role from API response
            userRole: response.data.userRole
          };
        } else {
          console.error('❌ Failed to load escrow transaction:', response.message);
        }
      } else {
        console.log('💳 Loading standard payment...');
        response = await getStandardPayment(transactionId);
        console.log('💳 Standard payment response:', response);

        if (response.success) {
          // Handle standard payment data structure
          const paymentData = response.data.payment || response.data;
          transactionData = {
            ...paymentData,
            paymentType: 'standard',
            id: paymentData._id || paymentData.id
          };
        } else {
          console.error('❌ Failed to load standard payment:', response.message);
        }
      }

      if (!transactionData) {
        throw new Error(`${type === 'escrow' ? 'Escrow transaction' : 'Standard payment'} not found`);
      }

      console.log('✅ Transaction loaded:', transactionData);
      console.log('🔍 Transaction product data:', transactionData?.product);
      console.log('🔍 Transaction buyer data:', transactionData?.buyer);
      console.log('🔍 Transaction seller data:', transactionData?.seller);
      setTransaction(transactionData);

      // Check if user can rate this transaction
      console.log('🌟 Checking rating eligibility...');
      try {
        // For now, set default values based on transaction data
        // TODO: Implement proper rating eligibility check when API is ready

        // Determine user role from transaction data
        // Get current user ID from localStorage (using the correct key structure)
        let currentUserId = null;
        try {
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          currentUserId = userData._id || userData.id || userData.userId;
          console.log('🔍 Current user from localStorage:', userData);
          console.log('🔍 Current user ID:', currentUserId);
        } catch (e) {
          console.warn('Error parsing user data from localStorage:', e);
        }

        let userRole = 'buyer';
        let ratingType = 'buyer_to_seller';

        console.log('🔍 Current user ID:', currentUserId);
        console.log('🔍 Transaction buyer:', transactionData.buyer);
        console.log('🔍 Transaction seller:', transactionData.seller);

        if (type === 'escrow') {
          // For escrow transactions, use the userRole from API response first
          // The API already determines the user role based on the authenticated user
          const apiUserRole = transactionData.userRole || response.data.userRole || transactionData.data?.userRole;

          if (apiUserRole) {
            userRole = apiUserRole;
            ratingType = userRole === 'buyer' ? 'buyer_to_seller' : 'seller_to_buyer';
            console.log('🔍 User role from API response:', userRole);
          } else if (currentUserId) {
            // Fallback: determine from transaction data
            const buyer = transactionData.buyer || transactionData.data?.escrowTransaction?.buyer;
            const seller = transactionData.seller || transactionData.data?.escrowTransaction?.seller;

            if (buyer && seller) {
              const buyerId = buyer._id || buyer.id;
              const sellerId = seller._id || seller.id;
              const isBuyer = buyerId === currentUserId;
              const isSeller = sellerId === currentUserId;

              if (isBuyer) {
                userRole = 'buyer';
                ratingType = 'buyer_to_seller';
              } else if (isSeller) {
                userRole = 'seller';
                ratingType = 'seller_to_buyer';
              }

              console.log('🔍 User role determined from transaction data:', userRole);
              console.log('🔍 Is buyer:', isBuyer, 'Is seller:', isSeller);
            }
          } else {
            console.log('⚠️ Could not determine user role, using default (buyer)');
          }
        }

        setCanRate(true);
        setRatingType(ratingType);
        setUserRole(userRole);
        console.log(`🌟 Can rate: true, Type: ${ratingType}, Role: ${userRole}`);

      } catch (ratingError) {
        console.warn('⚠️ Rating eligibility check failed:', ratingError);
        // Set default values if rating check fails
        setCanRate(true);
        setRatingType('buyer_to_seller');
        setUserRole('buyer');
      }

    } catch (error) {
      console.error('❌ Error loading transaction or rating data:', error);
      setError(error.message || 'Failed to load transaction details');
    } finally {
      setLoading(false);
    }
  };
  // console.log(transaction,'transactionssssssssss')
  const handleRatingSubmitted = (ratingData) => {
    console.log('✅ Rating submitted:', ratingData);
    toast.success('Thank you for your rating! Your feedback helps build trust in our community.');
    setShowRatingModal(false);
    setCanRate(false);
    // Optionally navigate to dashboard after rating
    navigate('/');
  };

  const getOtherUser = () => {
    console.log('🔍 getOtherUser check:', {
      hasTransaction: !!transaction,
      hasUserRole: !!userRole,
      userRole,
      buyer: transaction?.buyer,
      seller: transaction?.seller,
      transactionStructure: Object.keys(transaction || {})
    });

    if (!transaction || !userRole) {
      console.log('⚠️ getOtherUser returning null - missing transaction or userRole');
      return null;
    }

    // The transaction data might be nested, so let's check both structures
    const buyer = transaction.buyer || transaction.data?.escrowTransaction?.buyer;
    const seller = transaction.seller || transaction.data?.escrowTransaction?.seller;

    if (userRole === 'buyer') {
      console.log('🔍 Returning seller as other user:', seller);
      return seller;
    } else {
      console.log('🔍 Returning buyer as other user:', buyer);
      return buyer;
    }
  };

  const getProductImage = () => {
    // Handle nested transaction structure
    const product = transaction?.product || transaction?.data?.escrowTransaction?.product;

    if (!product) {
      console.log('⚠️ No product found in transaction');
      return null;
    }

    let imageUrl = null;

    // Check for product_photos array (escrow transaction structure)
    if (product.product_photos && product.product_photos.length > 0) {
      imageUrl = product.product_photos[0];
    }
    // Check for photos array (alternative structure)
    else if (product.photos && product.photos.length > 0) {
      imageUrl = product.photos[0];
    }

    if (imageUrl) {
      // Handle different URL formats
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      } else {
        // Normalize to absolute path on same origin
        return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
      }
    }

    console.log('⚠️ No product image found');
    return null;
  };

  const getProductPrice = () => {
    if (!transaction) return 0;

    // Handle nested transaction structure - try different price fields
    const price = transaction.productPrice ||
                  transaction.data?.escrowTransaction?.productPrice ||
                  transaction.amount ||
                  transaction.product?.price ||
                  transaction.data?.escrowTransaction?.product?.price ||
                  0;

    console.log('🔍 Product price found:', price);
    return price;
  };

  const otherUser = getOtherUser();
  const isBuyerRating = ratingType === 'buyer_to_seller';

  console.log('🔍 Final state check:', {
    hasTransaction: !!transaction,
    userRole,
    ratingType,
    hasOtherUser: !!otherUser,
    canRate,
    productTitle: transaction?.product?.title || transaction?.data?.escrowTransaction?.product?.title,
    productPrice: getProductPrice()
  });
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Transaction</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Rate Your Transaction</h1>
          <p className="text-gray-600">Share your experience to help build trust in our community</p>
        </div>

        {/* Transaction Details Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-start space-x-4">
              {/* Product Image or Icon */}
              <div className="flex-shrink-0">
                {getProductImage() ? (
                  <img
                    src={getProductImage()}
                    alt={transaction.product?.title || 'Product'}
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center"
                  style={{ display: getProductImage() ? 'none' : 'flex' }}
                >
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
              </div>

              {/* Transaction Info */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {transaction.product?.title || transaction.data?.escrowTransaction?.product?.title || 'Product'}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Transaction ID:</span> {transaction.transactionId || transaction.data?.escrowTransaction?.transactionId || transaction._id || transaction.id || 'N/A'}</p>
                  <p><span className="font-medium">Amount:</span> ${getProductPrice()}</p>
                  <p><span className="font-medium">Type:</span> {type === 'escrow' ? 'Escrow Payment' : 'Standard Payment'}</p>
                  <p><span className="font-medium">Date:</span> {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'Invalid Date'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Rating Section */}
        {transaction && (canRate && otherUser) ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-10 h-10 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {isBuyerRating ? 'Rate Your Seller' : 'Rate Your Buyer'}
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  How was your experience with {otherUser.firstName} {otherUser.lastName}?
                </p>
              </div>

              {/* User Info */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {otherUser.profile ? (
                    <img
                      // src={`${baseURL}${otherUser.profile}`}
                      src={otherUser.profile}
                      alt={`${otherUser.firstName} ${otherUser.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900 text-lg">
                    {otherUser.firstName} {otherUser.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isBuyerRating ? 'Seller' : 'Buyer'}
                  </p>
                </div>
              </div>

              {/* Rating Section */}
              <div className="max-w-md mx-auto">
                <RatingButton
                  transactionId={transactionId}
                  transactionType={type}
                  onRatingUpdate={(rating) => {
                    console.log('Rating updated:', rating);
                    toast.success('Thank you for your rating!');
                    // Optionally redirect back to payment success or dashboard
                    setTimeout(() => {
                      navigate('/');
                    }, 2000);
                  }}
                />
              </div>
            </div>
          </div>

        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {!otherUser ? 'Unable to Load User Data' : 'Rating Not Available'}
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {!otherUser
                  ? 'We could not load the user information for this transaction. Please try again later.'
                  : 'Rating is not available for this transaction at this time.'
                }
              </p>

              {/* Additional debug info */}
              <div className="bg-gray-50 rounded p-4 mb-4 text-left text-sm">
                <p><strong>Debug Info:</strong></p>
                <p>Can Rate: {canRate ? 'Yes' : 'No'}</p>
                <p>Has Other User: {otherUser ? 'Yes' : 'No'}</p>
                <p>User Role: {userRole || 'Not set'}</p>
                <p>Has Transaction: {transaction ? 'Yes' : 'No'}</p>
                {transaction && (
                  <>
                    <p>Buyer: {transaction.buyer ? `${transaction.buyer.firstName} ${transaction.buyer.lastName}` : 'Not found'}</p>
                    <p>Seller: {transaction.seller ? `${transaction.seller.firstName} ${transaction.seller.lastName}` : 'Not found'}</p>
                  </>
                )}
              </div>

              <button
                onClick={() => navigate('/')}
                className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          transaction={transaction}
          ratingType={ratingType}
          ratedUser={otherUser}
          onRatingSubmitted={handleRatingSubmitted}
        />
      </div>
    </div>
  );
};

export default RatingPage;
