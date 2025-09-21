import React, { useState, useEffect } from 'react';
import { 
  Package, 
  CheckCircle, 
  Copy, 
  Truck, 
  Clock, 
  CreditCard,
  RefreshCw,
  AlertCircle,
  ExternalLink 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getTransactionStatus } from '../../api/TransactionService';
import ShippingService from '../../api/ShippingService';

const BuyerOrderStatusDisplay = ({ transactionId, orderId, className = '' }) => {
  const [transactionData, setTransactionData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copying, setCopying] = useState(false);

  // Fetch both transaction status and order details
  const fetchData = async () => {
    if (!transactionId && !orderId) return;

    try {
      setLoading(true);
      setError(null);
      
      const promises = [];
      
      // Fetch transaction status if transactionId is provided
      if (transactionId) {
        promises.push(
          getTransactionStatus(transactionId)
            .then(response => ({ type: 'transaction', data: response }))
            .catch(err => ({ type: 'transaction', error: err }))
        );
      }
      
      // Fetch order details if orderId is provided
      if (orderId) {
        promises.push(
          ShippingService.getOrderDetails(orderId)
            .then(response => ({ type: 'order', data: response }))
            .catch(err => ({ type: 'order', error: err }))
        );
      }
      
      const results = await Promise.all(promises);
      
      // Process results
      for (const result of results) {
        if (result.type === 'transaction' && result.data?.success) {
          setTransactionData(result.data.data);
          console.log('🔄 Transaction Status API data loaded:', result.data.data);
        } else if (result.type === 'order' && result.data?.success) {
          setOrderData(result.data.data.order);
          console.log('📊 Order Details API data loaded:', result.data.data.order);
        } else if (result.error) {
          console.error(`❌ Error loading ${result.type} data:`, result.error);
        }
      }
      
      // If we have neither transaction nor order data, set error
      if (!transactionData && !orderData) {
        setError('Failed to load transaction or order information');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load order information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [transactionId, orderId]);

  // Copy tracking description to clipboard
  const copyTrackingDescription = async (description) => {
    if (!description) return;

    try {
      setCopying(true);
      await navigator.clipboard.writeText(description);
      toast.success('Tracking information copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy tracking information');
    } finally {
      setCopying(false);
    }
  };

  // Extract tracking number from description
  const extractTrackingNumber = (description) => {
    if (!description) return null;
    
    // Pattern: "Shipped via {provider} - Tracking: {trackingNumber}"
    const trackingRegex = /Tracking:\s*([^\s,;]+)/i;
    const match = description.match(trackingRegex);
    
    return match ? match[1].trim() : null;
  };

  // Extract provider from description
  const extractProvider = (description) => {
    if (!description) return null;
    
    // Pattern: "Shipped via {provider} - Tracking: {trackingNumber}"
    const providerRegex = /Shipped via\s+([^\s-]+)/i;
    const match = description.match(providerRegex);
    
    return match ? match[1].trim() : null;
  };

  // Get status icon and color
  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'shipped':
      case 'in_transit':
        return { icon: Truck, color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'processing':
        return { icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case 'delivered':
        return { icon: Package, color: 'text-green-600', bgColor: 'bg-green-100' };
      default:
        return { icon: Clock, color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // Get comprehensive tracking information from both sources
  const getTrackingInfo = () => {
    let trackingInfo = {
      trackingNumber: null,
      provider: null,
      description: null,
      shippedAt: null
    };

    // First, check transaction status history for shipped status
    if (transactionData?.statusHistory) {
      const shippedStatus = transactionData.statusHistory.find(
        status => status.status?.toLowerCase() === 'shipped'
      );
      
      if (shippedStatus && shippedStatus.description) {
        trackingInfo.description = shippedStatus.description;
        trackingInfo.trackingNumber = extractTrackingNumber(shippedStatus.description);
        trackingInfo.provider = extractProvider(shippedStatus.description);
        trackingInfo.shippedAt = shippedStatus.timestamp;
      }
    }

    // Then, check order data for additional tracking info (may override if more recent)
    if (orderData?.shipping) {
      if (orderData.shipping.trackingNumber) {
        trackingInfo.trackingNumber = orderData.shipping.trackingNumber;
      }
      if (orderData.shipping.provider) {
        trackingInfo.provider = orderData.shipping.provider;
      }
      if (orderData.shipping.shippedAt) {
        trackingInfo.shippedAt = orderData.shipping.shippedAt;
      }
    }

    return trackingInfo;
  };

  // Find the shipped status in statusHistory
  const getShippedInfo = () => {
    if (!transactionData?.statusHistory) return null;

    const shippedStatus = transactionData.statusHistory.find(
      status => status.status?.toLowerCase() === 'shipped'
    );

    return shippedStatus;
  };

  // Find the paid status in statusHistory
  const getPaidInfo = () => {
    if (!transactionData?.statusHistory) return null;

    const paidStatus = transactionData.statusHistory.find(
      status => status.status?.toLowerCase() === 'paid'
    );

    return paidStatus;
  };

  // Get current order status (prioritize order details API, then status API)
  const getCurrentOrderStatus = () => {
    // Prioritize order data first (from order details API)
    if (orderData) {
      console.log('🎯 Using order details API status:', orderData.status);
      return orderData.status || 'unknown';
    }

    // Check transaction data as fallback (from status API)
    if (transactionData) {
      console.log('🎯 Using transaction status API for status determination');
      // Check if there's a shipped status in history
      const shippedInfo = getShippedInfo();
      if (shippedInfo) {
        console.log('🎯 Found shipped status in transaction history');
        return 'shipped';
      }

      // Check if there's a paid status
      const paidInfo = getPaidInfo();
      if (paidInfo) {
        console.log('🎯 Found paid status in transaction history');
        return 'paid';
      }

      // Fall back to overall status
      console.log('🎯 Using transaction overall status:', transactionData.status);
      return transactionData.status || 'unknown';
    }

    console.log('🎯 No API data available for status determination');
    return 'unknown';
  };

  // Get payment status
  const getPaymentStatus = () => {
    // Check transaction data first
    if (transactionData) {
      const paidInfo = getPaidInfo();
      if (paidInfo) return 'paid';
      
      return transactionData.status === 'processing' ? 'processing' : 'unknown';
    }

    // Check order data
    if (orderData?.payment) {
      return orderData.payment.status || 'unknown';
    }

    return 'unknown';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
          <span className="text-gray-600">Loading order status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Status</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!transactionData && !orderData) {
    return (
      <div className={`bg-white rounded-lg border shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">Unable to load order information</p>
        </div>
      </div>
    );
  }

  const currentOrderStatus = getCurrentOrderStatus();
  const paymentStatus = getPaymentStatus();
  const shippedInfo = getShippedInfo();
  const paidInfo = getPaidInfo();
  const trackingInfo = getTrackingInfo();

  const orderStatusDisplay = getStatusDisplay(currentOrderStatus);
  console.log(orderStatusDisplay,'orderstatusdislay')
  const paymentStatusDisplay = getStatusDisplay(paymentStatus);
  const OrderStatusIcon = orderStatusDisplay.icon;
  const PaymentStatusIcon = paymentStatusDisplay.icon;

  // Use transaction ID from either source
  const displayTransactionId = transactionData?.transactionId || orderData?.orderNumber || transactionId || 'N/A';

  return (
    <div className={`bg-white rounded-lg border shadow-sm p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Order Status</h2>
            <p className="text-sm text-gray-600">Transaction: {displayTransactionId}</p>
          </div>
        </div>
        
        <button
          onClick={fetchData}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
          title="Refresh status"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Order Status Card */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${orderStatusDisplay.bgColor}`}>
              <OrderStatusIcon className={`w-5 h-5 ${orderStatusDisplay.color}`} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Order Status</h3>
              <p className={`text-sm font-medium capitalize ${orderStatusDisplay.color}`}>
                {currentOrderStatus.replace('_', ' ')}
              </p>
            </div>
          </div>
          {shippedInfo && (
            <div className="mt-2 text-xs text-gray-600">
              Shipped on: {new Date(shippedInfo.timestamp).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Payment Status Card */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${paymentStatusDisplay.bgColor}`}>
              <PaymentStatusIcon className={`w-5 h-5 ${paymentStatusDisplay.color}`} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Payment Status</h3>
              <p className={`text-sm font-medium capitalize ${paymentStatusDisplay.color}`}>
                {paymentStatus.replace('_', ' ')}
              </p>
            </div>
          </div>
          {paidInfo && (
            <div className="mt-2 text-xs text-gray-600">
              Paid on: {new Date(paidInfo.timestamp).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Shipping Information - Enhanced for shipped orders or success message for delivered */}
      {(trackingInfo.trackingNumber || trackingInfo.description) && 
       (currentOrderStatus === 'shipped' || currentOrderStatus === 'delivered') && (
        <div className="border-t pt-6">
          {currentOrderStatus === 'delivered' ? (
            /* Delivered Orders - Show only success message and Buy More Products button */
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Order Complete
              </h3>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-green-800 font-medium mb-3">
                      Package delivered successfully! We hope you enjoy your purchase.
                    </p>
                    <button
                      onClick={() => window.location.href = '/'}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors font-medium"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Buy More Products
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Shipped Orders - Show full tracking details */
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Shipping Details
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-4">
                  {/* How to Track Your Package Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                          📦 How to Track Your Package
                        </h4>
                        <p className="text-sm text-blue-800">
                          Use your tracking number below to monitor your package's journey. You can also track it directly on AfterShip for real-time updates.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Number/ID */}
                  {trackingInfo.trackingNumber && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Tracking ID / Tracking Number:</p>
                        <p className="font-mono text-gray-900 font-medium text-lg">{trackingInfo.trackingNumber}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyTrackingDescription(trackingInfo.trackingNumber)}
                          disabled={copying}
                          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          title="Copy tracking number"
                        >
                          <Copy className="w-4 h-4" />
                          Copy
                        </button>
                        
                        {/* Track on AfterShip Button */}
                        <button
                          onClick={() => {
                            const aftershipUrl = `https://track.aftership.com/${trackingInfo.trackingNumber}`;
                            window.open(aftershipUrl, '_blank');
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                          title="Track on AfterShip"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Track on AfterShip
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Provider */}
                  {trackingInfo.provider && (
                    <div>
                      <p className="text-sm text-gray-600">Shipping Provider:</p>
                      <p className="text-gray-900 font-medium capitalize">{trackingInfo.provider}</p>
                    </div>
                  )}
                  
                  {/* Full Description with Copy */}
                  {trackingInfo.description && (
                    <div className="border-t pt-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">Full Tracking Information:</p>
                          <p className="text-gray-900 break-all">{trackingInfo.description}</p>
                          {trackingInfo.shippedAt && (
                            <div className="mt-2 text-xs text-gray-500">
                              Shipped: {new Date(trackingInfo.shippedAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => copyTrackingDescription(trackingInfo.description)}
                          disabled={copying}
                          className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                          title="Copy tracking information"
                        >
                          <Copy className="w-4 h-4" />
                          {copying ? 'Copying...' : 'Copy All'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Timeline */}
      {transactionData?.statusHistory && transactionData.statusHistory.length > 0 && (
        <div className="border-t pt-6 mt-6">
          <h3 className="font-medium text-gray-900 mb-3">Status Timeline</h3>
          <div className="space-y-3">
            {transactionData.statusHistory
              .slice() // Create a copy to avoid mutating original array
              .reverse() // Show latest first
              .map((statusItem, index) => {
                const statusDisplay = getStatusDisplay(statusItem.status);
                const StatusIcon = statusDisplay.icon;
                
                return (
                  <div key={statusItem._id || index} className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-full ${statusDisplay.bgColor} flex-shrink-0 mt-0.5`}>
                      <StatusIcon className={`w-3 h-3 ${statusDisplay.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium capitalize ${statusDisplay.color}`}>
                          {statusItem.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(statusItem.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {statusItem.description && (
                        <p className="text-sm text-gray-600 break-words">{statusItem.description}</p>
                      )}
                      {statusItem.updatedBy && (
                        <p className="text-xs text-gray-500 mt-1">
                          Updated by: {statusItem.updatedBy}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerOrderStatusDisplay;