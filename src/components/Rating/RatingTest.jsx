import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import StarRating from './StarRating';
import RatingModal from './RatingModal';
import UserRatings from './UserRatings';
// import { getPendingRatings } from '../../api/RatingService';

const RatingTest = () => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pendingRatings, setPendingRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testUserId, setTestUserId] = useState('');

  // Mock transaction data for testing
  const mockTransaction = {
    _id: '6862362a5a81f76dccf8c7d9',
    transactionId: 'ESC-1751266858167-9SPGKWE12',
    buyer: {
      _id: '6858f8a23b51a8d68528ce0b',
      firstName: 'Pratik',
      lastName: 'Parmar',
      profile: '/uploads/profile/dd2ef9bb-8391-4a5f-a239-7687ec268429-1750762692162.jpeg'
    },
    seller: {
      _id: '6836b8bc2caa73f5098bb68d',
      firstName: 'John',
      lastName: 'Smith',
      profile: '/uploads/profile/a7e161fc-9a2a-4f4d-b2ce-f019e33bfb79-1750249679410.jpeg'
    },
    product: {
      _id: '68496d0a4c309a90fd9fb954',
      title: 'Men Regular Fit Self Design Spread Collar Casual Shirt white',
      product_photos: ['uploads/products/a7e161fc-9a2a-4f4d-b2ce-f019e33bfb79-1750237782779.jpeg']
    },
    status: 'completed'
  };

  const fetchPendingRatings = async () => {
    try {
      setLoading(true);
      // const response = await getPendingRatings();
      if (response.success) {
        setPendingRatings(response.data.pendingRatings);
        toast.success(`Found ${response.data.totalPending} pending ratings`);
      }
    } catch (error) {
      console.error('Error fetching pending ratings:', error);
      toast.error('Failed to fetch pending ratings');
    } finally {
      setLoading(false);
    }
  };

  const testCanRate = async (transactionId) => {
    try {
      // const response = await canRateTransaction(transactionId);
      if (response.success) {
        toast.success(`Can rate: ${response.data.canRate ? 'Yes' : 'No'} - ${response.data.reason || response.data.ratingType}`);
      }
    } catch (error) {
      console.error('Error checking rating eligibility:', error);
      toast.error('Failed to check rating eligibility');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Rating System Test</h1>
        
        {/* Star Rating Tests */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-800">Star Rating Component Tests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Display Mode</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <StarRating rating={4.5} size="sm" showValue={true} />
                  <span className="text-sm text-gray-600">Small (4.5/5)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <StarRating rating={3.2} size="md" showValue={true} />
                  <span className="text-sm text-gray-600">Medium (3.2/5)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <StarRating rating={5.0} size="lg" showValue={true} />
                  <span className="text-sm text-gray-600">Large (5.0/5)</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Interactive Mode</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Click to rate:</p>
                  <StarRating 
                    rating={0} 
                    interactive={true} 
                    onRatingChange={(rating) => toast.info(`You rated: ${rating} stars`)}
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Tests */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold text-gray-800">API Tests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={fetchPendingRatings}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Get Pending Ratings'}
            </button>
            
            <button
              // onClick={() => testCanRate('6862362a5a81f76dccf8c7d9')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Test Can Rate
            </button>
            
            <button
              onClick={() => setShowRatingModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Open Rating Modal
            </button>
          </div>
        </div>

        {/* Pending Ratings Display */}
        {pendingRatings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Pending Ratings</h2>
            <div className="space-y-3">
              {pendingRatings.map((pending, index) => (
                <div key={index} className="p-4 border rounded-lg bg-yellow-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {pending.transaction.product?.title || 'Product'}
                      </p>
                      <p className="text-sm text-gray-600">
                        Transaction: {pending.transaction.transactionId}
                      </p>
                      <p className="text-sm text-gray-600">
                        Rate as: {pending.ratingType === 'buyer_to_seller' ? 'Buyer' : 'Seller'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        // You can implement actual rating here
                        toast.info('Rating functionality would open here');
                      }}
                      className="bg-teal-600 text-white px-3 py-1 rounded text-sm hover:bg-teal-700"
                    >
                      Rate Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Ratings Test */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">User Ratings Component Test</h2>
          
          <div className="flex items-center space-x-4 mb-4">
            <input
              type="text"
              placeholder="Enter User ID to test"
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <button
              onClick={() => {
                if (testUserId) {
                  toast.info(`Testing ratings for user: ${testUserId}`);
                } else {
                  toast.error('Please enter a user ID');
                }
              }}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
            >
              Load Ratings
            </button>
          </div>

          {testUserId && (
            <div className="border rounded-lg p-4">
              <UserRatings userId={testUserId} showHeader={true} limit={5} />
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        transaction={mockTransaction}
        ratingType="buyer_to_seller"
        ratedUser={mockTransaction.seller}
        onRatingSubmitted={(ratingData) => {
          console.log('Rating submitted:', ratingData);
          toast.success('Rating submitted successfully!');
        }}
      />
    </div>
  );
};

export default RatingTest;
