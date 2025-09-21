import React, { useState, useEffect } from 'react';
import { Package, Truck, MapPin, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import ShippingService from '../../api/ShippingService';

const TrackingWidget = ({ trackingNumber, orderId, compact = false, autoRefresh = true }) => {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (trackingNumber) {
      loadTracking();
      
      // Set up auto-refresh if enabled
      if (autoRefresh) {
        const interval = setInterval(loadTracking, 5 * 60 * 1000); // Refresh every 5 minutes
        return () => clearInterval(interval);
      }
    }
  }, [trackingNumber, autoRefresh]);

  const loadTracking = async () => {
    if (!trackingNumber) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await ShippingService.trackShipment(trackingNumber);
      
      if (response.success) {
        setTracking(response.data.tracking);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to load tracking:', error);
      setError(error.error || 'Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'created':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'picked_up':
        return <Truck className="w-5 h-5 text-indigo-600" />;
      case 'in_transit':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-orange-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'exception':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'created':
        return 'bg-blue-100 text-blue-800';
      case 'picked_up':
        return 'bg-indigo-100 text-indigo-800';
      case 'in_transit':
        return 'bg-purple-100 text-purple-800';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'exception':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !tracking) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Tracking Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <button
            onClick={loadTracking}
            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="text-center text-gray-500">
          <Package className="w-8 h-8 mx-auto mb-2" />
          <p>No tracking information available</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(tracking.status)}
            <div>
              <p className="font-medium text-gray-900">
                {formatStatus(tracking.status)}
              </p>
              <p className="text-sm text-gray-600">
                Tracking: {trackingNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tracking.status)}`}>
              {formatStatus(tracking.status)}
            </span>
            {tracking.estimatedDelivery && (
              <p className="text-xs text-gray-500 mt-1">
                Est. {formatDate(tracking.estimatedDelivery)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Package Tracking
            </h3>
            <p className="text-sm text-gray-600">
              Tracking Number: {trackingNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(tracking.status)}`}>
              {formatStatus(tracking.status)}
            </span>
            <button
              onClick={loadTracking}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Refresh tracking"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-3">
          {getStatusIcon(tracking.status)}
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {formatStatus(tracking.status)}
            </p>
            {tracking.events && tracking.events.length > 0 && (
              <p className="text-sm text-gray-600">
                {tracking.events[0].description}
              </p>
            )}
          </div>
          {tracking.estimatedDelivery && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Estimated Delivery
              </p>
              <p className="text-sm text-gray-600">
                {formatDate(tracking.estimatedDelivery)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tracking Events */}
      {tracking.events && tracking.events.length > 0 && (
        <div className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Tracking History</h4>
          <div className="space-y-3">
            {tracking.events.map((event, index) => (
              <div key={index} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    index === 0 ? 'bg-teal-600' : 'bg-gray-300'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {event.description}
                      </p>
                      {event.location && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location.city}
                          {event.location.country && `, ${event.location.country}`}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {formatDate(event.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {lastUpdated && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <p className="text-xs text-gray-500">
            Last updated: {formatDate(lastUpdated)}
          </p>
        </div>
      )}
    </div>
  );
};

export default TrackingWidget;
