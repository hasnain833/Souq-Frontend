import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Shield, MessageSquare } from 'lucide-react';
import EscrowTransactionStatus from '../components/Escrow/EscrowTransactionStatus';
import ShippingTracker from '../components/Escrow/ShippingTracker';
import DeliveryConfirmation from '../components/Escrow/DeliveryConfirmation';
import { 
  getEscrowTransaction, 
  markAsShipped, 
  confirmDelivery 
} from '../api/EscrowService';

const EscrowTransaction = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  
  const [transaction, setTransaction] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transactionId) {
      loadTransaction();
    }
  }, [transactionId]);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      const response = await getEscrowTransaction(transactionId);
      
      if (response.success) {
        setTransaction(response?.data?.data?.escrowTransaction);
        setUserRole(response.data.data?.userRole);
      } else {
        toast.error('Transaction not found');
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading transaction:', error);
      toast.error('Failed to load transaction details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsShipped = async (shippingData) => {
    try {
      const response = await markAsShipped(transactionId, shippingData);
      
      if (response.success) {
        toast.success('Item marked as shipped successfully');
        await loadTransaction(); // Reload to get updated data
      } else {
        toast.error(response.error || 'Failed to mark as shipped');
      }
    } catch (error) {
      console.error('Error marking as shipped:', error);
      toast.error('Failed to mark as shipped');
    }
  };

  const handleConfirmDelivery = async (deliveryData) => {
    try {
      const response = await confirmDelivery(transactionId);
      
      if (response.success) {
        toast.success('Delivery confirmed successfully');
        await loadTransaction(); // Reload to get updated data
      } else {
        toast.error(response.error || 'Failed to confirm delivery');
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast.error('Failed to confirm delivery');
    }
  };

  const handleRaiseDispute = async (disputeData) => {
    try {
      // TODO: Implement dispute API call
      console.log('Raising dispute:', disputeData);
      toast.success('Dispute submitted successfully. Our team will review it.');
    } catch (error) {
      console.error('Error raising dispute:', error);
      toast.error('Failed to submit dispute');
    }
  };

  const handleTransactionAction = async (actionId) => {
    switch (actionId) {
      case 'mark_shipped':
        // This will be handled by ShippingTracker component
        break;
      case 'confirm_delivery':
        // This will be handled by DeliveryConfirmation component
        break;
      case 'raise_dispute':
        // This will be handled by DeliveryConfirmation component
        break;
      default:
        console.log('Unknown action:', actionId);
    }
  };

  const handleTransactionUpdate = (updatedTransaction) => {
    console.log('Transaction updated:', updatedTransaction);
    setTransaction(updatedTransaction);
  };

  const navigateToChat = () => {
    // Get current user to check authentication
    const authUser = JSON.parse(localStorage.getItem('user'));

    if (!authUser) {
      toast.error('Please log in to start a chat');
      navigate('/login');
      return;
    }

    // Check if user is trying to chat with themselves
    if (authUser.id === transaction.seller._id || authUser.id === transaction.buyer._id) {
      // Determine if current user is buyer or seller
      const isBuyer = authUser.id === transaction.buyer._id;
      if (isBuyer && authUser.id === transaction.seller._id) {
        toast.error("You cannot chat with yourself");
        return;
      }
    }

    // Navigate to chat layout with the product ID as a query parameter
    // This will trigger the chat creation/retrieval process in ChatLayout
    navigate(`/chat-layout?productId=${transaction.product._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Transaction Not Found</h2>
          <p className="text-gray-600">Unable to load transaction details.</p>
        </div>
      </div>
    );
  }

  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const normalizedBaseURL = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;

  // Handle different image path structures
  const getProductImage = () => {
    // Try product_photos array first (from product API)
    if (transaction.product.product_photos && transaction.product.product_photos.length > 0) {
      const imagePath = transaction.product.product_photos[0];
      // Check if path already includes uploads/ prefix
      if (imagePath.startsWith('uploads/')) {
        return `${normalizedBaseURL}${imagePath}`;
      }
      return `${normalizedBaseURL}uploads/${imagePath}`;
    }
    // Try photos array (from chat API or other sources)
    if (transaction.product.photos && transaction.product.photos.length > 0) {
      const imagePath = transaction.product.photos[0];
      if (imagePath.startsWith('uploads/')) {
        return `${normalizedBaseURL}${imagePath}`;
      }
      return `${normalizedBaseURL}uploads/${imagePath}`;
    }
    // Try single image field
    if (transaction.product.image) {
      const imagePath = transaction.product.image;
      if (imagePath.startsWith('uploads/')) {
        return `${normalizedBaseURL}${imagePath}`;
      }
      return `${normalizedBaseURL}uploads/${imagePath}`;
    }
    // Fallback to placeholder
    return 'https://via.placeholder.com/96x96?text=No+Image';
  };

  const productImage = getProductImage();

  // Debug: Log the final product image URL
  console.log('🖼️ EscrowTransaction - Final product image URL:', productImage);
  console.log('🖼️ EscrowTransaction - Product data for image:', {
    product_photos: transaction.product?.product_photos,
    photos: transaction.product?.photos,
    image: transaction.product?.image
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-teal-600 hover:text-teal-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-teal-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Escrow Transaction</h1>
                <p className="text-gray-600">Transaction ID: {transaction.transactionId}</p>
              </div>
            </div>
            
            <button
              onClick={navigateToChat}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat with {userRole === 'buyer' ? 'Seller' : 'Buyer'}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Product Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>
            <div className="flex items-center space-x-4">
              <img
                src={transaction.product.product_photos[0]}
                alt={transaction.product.title}
                className="w-24 h-24 object-cover rounded-lg"
                onError={(e) => {
                  console.log('EscrowTransaction: Product image failed to load:', e.target.src);
                  e.target.src = 'https://via.placeholder.com/96x96?text=No+Image';
                }}
                onLoad={() => {
                  console.log('EscrowTransaction: Product image loaded successfully:', productImage);
                }}
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{transaction.product.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{transaction.product.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span>Price: {transaction.currency} {transaction.productPrice}</span>
                  {transaction.offer && (
                    <span className="text-green-600">
                      Offer Applied: {transaction.currency} {transaction.offer.offerAmount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Parties */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Parties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Buyer</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {transaction.buyer.firstName[0]}{transaction.buyer.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {transaction.buyer.firstName} {transaction.buyer.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{transaction.buyer.email}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Seller</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {transaction.seller.firstName[0]}{transaction.seller.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {transaction.seller.firstName} {transaction.seller.lastName}
                    </div>
                    <div className="text-sm text-gray-600">{transaction.seller.email}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Status */}
          <EscrowTransactionStatus
            transaction={transaction}
            userRole={userRole}
            onAction={handleTransactionAction}
            onTransactionUpdate={handleTransactionUpdate}
          />

          {/* Shipping Tracker */}
          <ShippingTracker
            transaction={transaction}
            onMarkAsShipped={handleMarkAsShipped}
            userRole={userRole}
          />

          {/* Delivery Confirmation */}
          <DeliveryConfirmation
            transaction={transaction}
            onConfirmDelivery={handleConfirmDelivery}
            onRaiseDispute={handleRaiseDispute}
            userRole={userRole}
          />
        </div>
      </div>
    </div>
  );
};

export default EscrowTransaction;
