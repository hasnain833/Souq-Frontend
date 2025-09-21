import React, { useState, useEffect } from 'react';
import { Package, Truck, MapPin, Clock, CheckCircle, AlertCircle, RefreshCw, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';
import TrackingService from '../../api/TrackingService';
import BuyerTrackingCard from './BuyerTrackingCard';

const OrderTracking = ({ orderId, trackingId, compact = false, viewType = 'detailed', order = null }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setLoading(true);
        const data = await TrackingService.getTrackingInfo(orderId, trackingId);
        if (data.success) {
          setTrackingData(data.data);
        } else {
          setError(data.error || 'Failed to fetch tracking information');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch tracking information');
      } finally {
        setLoading(false);
      }
    };

    if (orderId && trackingId) {
      fetchTrackingData();
    }
  }, [orderId, trackingId]);

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_transit': 'bg-blue-100 text-blue-800',
      'out_for_delivery': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'exception': 'bg-red-100 text-red-800',
      'returned': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Package className="w-5 h-5 text-yellow-600" />;
      case 'in_transit':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'exception':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Error loading tracking information</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <Package className="w-8 h-8 mx-auto mb-2" />
          <p>No tracking information available</p>
        </div>
      </div>
    );
  }

  // Buyer view - show tracking card with copy functionality
  if (viewType === 'buyer') {
    return (
      <BuyerTrackingCard
        order={order}
        trackingId={trackingId}
        shippingProvider={trackingData?.shippingProvider}
        status={trackingData?.status}
        estimatedDelivery={trackingData?.estimatedDelivery}
      />
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(trackingData.status)}
            <div>
              <p className="font-medium text-gray-900">
                {trackingData.status.replace('_', ' ').toUpperCase()}
              </p>
              <p className="text-sm text-gray-600">
                Tracking: {trackingId}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingData.status)}`}>
            {trackingData.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">Order Tracking</h3>
            <p className="text-gray-600">Tracking ID: {trackingId}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trackingData.status)}`}>
            {trackingData.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-medium mb-2">Shipping Details</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Provider:</span> {trackingData.shippingProvider}</p>
              <p><span className="font-medium">Service:</span> {trackingData.serviceType}</p>
              <p><span className="font-medium">Estimated Delivery:</span> {formatDate(trackingData.estimatedDelivery)}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Package Info</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Weight:</span> {trackingData.packageDetails?.weight} kg</p>
              <p><span className="font-medium">Dimensions:</span> {trackingData.packageDetails?.dimensions?.length}×{trackingData.packageDetails?.dimensions?.width}×{trackingData.packageDetails?.dimensions?.height} cm</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4">Tracking History</h4>
          <div className="space-y-4">
            {trackingData.trackingHistory?.map((event, index) => (
              <div key={index} className="flex">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2 mr-4"></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{event.status}</p>
                      <p className="text-sm text-gray-600">{event.description}</p>
                      {event.location && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(event.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;