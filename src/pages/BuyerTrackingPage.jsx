import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import BuyerOrderTracking from '../components/Buyer/BuyerOrderTracking';
import { getOrderDetails } from '../api/OrderService';

const BuyerTrackingPage = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const trackingId = searchParams.get('tracking');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else if (trackingId) {
      // If only tracking ID is provided, create a minimal order object
      setOrder({
        id: 'N/A',
        trackingId: trackingId,
        status: 'shipped'
      });
      setLoading(false);
    }
  }, [orderId, trackingId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await getOrderDetails(orderId);
      if (response.success) {
        setOrder(response.data);
      } else {
        setError(response.error || 'Failed to load order details');
      }
    } catch (err) {
      setError(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Order</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={goBack}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">
              We couldn't find the order you're looking for.
            </p>
            <button
              onClick={goBack}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={goBack}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
            <p className="text-gray-600 mt-1">
              Monitor your package delivery status and get real-time updates
            </p>
          </div>
        </div>

        {/* Tracking Component */}
        <BuyerOrderTracking order={order} />

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tracking Issues</h4>
              <p className="text-sm text-gray-600 mb-2">
                If your tracking information isn't updating or you're experiencing issues:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Wait 24-48 hours for initial tracking updates</li>
                <li>• Check if you copied the tracking ID correctly</li>
                <li>• Try tracking directly on the carrier's website</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Contact Support</h4>
              <p className="text-sm text-gray-600 mb-2">
                Still having trouble? Our support team is here to help:
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  📧 Email: support@yourstore.com
                </p>
                <p className="text-sm text-gray-600">
                  💬 Live Chat: Available 9 AM - 6 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerTrackingPage;