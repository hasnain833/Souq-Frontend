import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const ShippingTracker = ({ 
  transaction, 
  onMarkAsShipped, 
  userRole = 'buyer' 
}) => {
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingData, setShippingData] = useState({
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: ''
  });

  useEffect(() => {
    if (transaction.deliveryDetails?.trackingNumber) {
      loadTrackingInfo();
    }
  }, [transaction.deliveryDetails?.trackingNumber]);

  const loadTrackingInfo = async () => {
    try {
      setLoading(true);
      // Mock tracking API call - replace with actual tracking service
      const mockTrackingInfo = {
        status: 'in_transit',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        events: [
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            status: 'picked_up',
            location: 'Dubai, UAE',
            description: 'Package picked up from seller'
          },
          {
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
            status: 'in_transit',
            location: 'Dubai Sorting Facility',
            description: 'Package processed at sorting facility'
          },
          {
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            status: 'in_transit',
            location: 'Abu Dhabi Distribution Center',
            description: 'Package arrived at distribution center'
          }
        ]
      };
      
      setTrackingInfo(mockTrackingInfo);
    } catch (error) {
      console.error('Error loading tracking info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsShipped = async () => {
    try {
      setLoading(true);
      await onMarkAsShipped(shippingData);
      setShowShippingForm(false);
    } catch (error) {
      console.error('Error marking as shipped:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'picked_up':
        return <Package className="w-4 h-4" />;
      case 'in_transit':
        return <Truck className="w-4 h-4" />;
      case 'out_for_delivery':
        return <MapPin className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'picked_up':
        return 'text-blue-600 bg-blue-100';
      case 'in_transit':
        return 'text-yellow-600 bg-yellow-100';
      case 'out_for_delivery':
        return 'text-purple-600 bg-purple-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show shipping form for seller when funds are held
  if (userRole === 'seller' && transaction.status === 'funds_held') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Package className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ready to Ship</h3>
            <p className="text-sm text-gray-600">
              Payment received. Please ship the item and provide tracking details.
            </p>
          </div>
        </div>

        {!showShippingForm ? (
          <button
            onClick={() => setShowShippingForm(true)}
            className="w-full flex items-center justify-center px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Truck className="w-5 h-5 mr-2" />
            Mark as Shipped
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number
              </label>
              <input
                type="text"
                value={shippingData.trackingNumber}
                onChange={(e) => setShippingData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter tracking number"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carrier
              </label>
              <select
                value={shippingData.carrier}
                onChange={(e) => setShippingData(prev => ({ ...prev, carrier: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              >
                <option value="">Select carrier</option>
                <option value="Emirates Post">Emirates Post</option>
                <option value="Aramex">Aramex</option>
                <option value="DHL">DHL</option>
                <option value="FedEx">FedEx</option>
                <option value="UPS">UPS</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Delivery Date
              </label>
              <input
                type="date"
                value={shippingData.estimatedDelivery}
                onChange={(e) => setShippingData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowShippingForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsShipped}
                disabled={loading || !shippingData.trackingNumber || !shippingData.carrier}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300"
              >
                {loading ? 'Updating...' : 'Confirm Shipment'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show tracking info for shipped items
  if (transaction.status === 'shipped' && transaction.deliveryDetails?.trackingNumber) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Package Tracking</h3>
              <p className="text-sm text-gray-600">
                Track your package delivery status
              </p>
            </div>
          </div>
          
          <button
            onClick={loadTrackingInfo}
            disabled={loading}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Tracking Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Tracking Number:</span>
              <div className="font-mono text-gray-900 mt-1 flex items-center">
                {transaction.deliveryDetails.trackingNumber}
                <button className="ml-2 text-blue-600 hover:text-blue-700">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Carrier:</span>
              <div className="text-gray-900 mt-1">
                {transaction.deliveryDetails.carrier}
              </div>
            </div>
            
            {trackingInfo?.estimatedDelivery && (
              <div>
                <span className="font-medium text-gray-700">Estimated Delivery:</span>
                <div className="text-gray-900 mt-1">
                  {formatDate(trackingInfo.estimatedDelivery)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Current Status */}
        {trackingInfo && (
          <div className="mb-6">
            <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(trackingInfo.status)}`}>
              {getStatusIcon(trackingInfo.status)}
              <span className="ml-2 capitalize">
                {trackingInfo.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Tracking Timeline */}
        {trackingInfo?.events && trackingInfo.events.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Tracking History</h4>
            <div className="space-y-4">
              {trackingInfo.events.map((event, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(event.status)}`}>
                    {getStatusIcon(event.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {event.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(event.timestamp)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No tracking info available */}
        {!trackingInfo && !loading && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              Tracking information is not available yet. Please check back later.
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ShippingTracker;
