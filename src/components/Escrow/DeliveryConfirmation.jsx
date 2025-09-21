import React, { useState } from 'react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  Camera, 
  Star,
  MessageSquare,
  Shield,
  Clock
} from 'lucide-react';

const DeliveryConfirmation = ({ 
  transaction, 
  onConfirmDelivery, 
  onRaiseDispute, 
  userRole = 'buyer' 
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleConfirmDelivery = async () => {
    try {
      setLoading(true);
      await onConfirmDelivery({
        rating,
        review,
        photos
      });
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error confirming delivery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRaiseDispute = async () => {
    try {
      setLoading(true);
      await onRaiseDispute({
        reason: disputeReason,
        description: disputeDescription,
        photos
      });
      setShowDispute(false);
    } catch (error) {
      console.error('Error raising dispute:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    // In a real app, you'd upload these to a server
    setPhotos(prev => [...prev, ...files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }))]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const renderStars = (currentRating, onRatingChange) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRatingChange && onRatingChange(star)}
            className={`w-8 h-8 ${
              star <= currentRating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
            disabled={!onRatingChange}
          >
            <Star className="w-full h-full" />
          </button>
        ))}
      </div>
    );
  };

  const getTimeRemaining = () => {
    if (!transaction.autoReleaseAt) return null;
    
    const now = new Date();
    const releaseDate = new Date(transaction.autoReleaseAt);
    const diff = releaseDate - now;
    
    if (diff <= 0) return 'Auto-release overdue';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  if (transaction.status !== 'shipped') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Truck className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Item Shipped</h3>
          <p className="text-sm text-gray-600">
            Your item has been shipped and is on its way to you
          </p>
        </div>
      </div>

      {/* Shipping Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {transaction.deliveryDetails?.trackingNumber && (
            <div>
              <span className="font-medium text-gray-700">Tracking Number:</span>
              <div className="font-mono text-gray-900 mt-1">
                {transaction.deliveryDetails.trackingNumber}
              </div>
            </div>
          )}
          
          {transaction.deliveryDetails?.carrier && (
            <div>
              <span className="font-medium text-gray-700">Carrier:</span>
              <div className="text-gray-900 mt-1">
                {transaction.deliveryDetails.carrier}
              </div>
            </div>
          )}
          
          {transaction.deliveryDetails?.shippedAt && (
            <div>
              <span className="font-medium text-gray-700">Shipped Date:</span>
              <div className="text-gray-900 mt-1">
                {new Date(transaction.deliveryDetails.shippedAt).toLocaleDateString()}
              </div>
            </div>
          )}
          
          {transaction.deliveryDetails?.estimatedDelivery && (
            <div>
              <span className="font-medium text-gray-700">Estimated Delivery:</span>
              <div className="text-gray-900 mt-1">
                {new Date(transaction.deliveryDetails.estimatedDelivery).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auto-release Warning */}
      {getTimeRemaining() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-yellow-800">
                Auto-release in {getTimeRemaining()}
              </div>
              <div className="text-yellow-700 mt-1">
                If you don't confirm delivery or raise a dispute, funds will be automatically 
                released to the seller.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {userRole === 'buyer' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowConfirmation(true)}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Confirm Delivery
          </button>
          
          <button
            onClick={() => setShowDispute(true)}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Report Issue
          </button>
        </div>
      )}

      {/* Delivery Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delivery</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Please confirm that you have received your item and it matches the description.
            </p>

            {/* Rating */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate your experience
              </label>
              {renderStars(rating, setRating)}
            </div>

            {/* Review */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave a review (optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Share your experience with this purchase..."
              />
            </div>

            {/* Photo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add photos (optional)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
              >
                <Camera className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Upload photos</span>
              </label>
              
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelivery}
                disabled={loading || rating === 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
              >
                {loading ? 'Confirming...' : 'Confirm Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">Report Issue</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Please describe the issue with your order. Our team will review and help resolve it.
            </p>

            {/* Dispute Reason */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Type
              </label>
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="">Select an issue</option>
                <option value="not_received">Item not received</option>
                <option value="damaged">Item damaged</option>
                <option value="not_as_described">Not as described</option>
                <option value="wrong_item">Wrong item received</option>
                <option value="quality_issues">Quality issues</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Please provide details about the issue..."
                required
              />
            </div>

            {/* Photo Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence Photos
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="dispute-photo-upload"
              />
              <label
                htmlFor="dispute-photo-upload"
                className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
              >
                <Camera className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">Upload evidence photos</span>
              </label>
              
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.url}
                        alt={`Evidence ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDispute(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseDispute}
                disabled={loading || !disputeReason || !disputeDescription}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryConfirmation;
