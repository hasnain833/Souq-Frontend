import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Truck, 
  Package, 
  AlertTriangle, 
  RefreshCw,
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getStandardPayment } from '../../api/StandardPaymentService';
import ShippingService from '../../api/ShippingService';

const StandardTransactionManager = ({ transactionId, userRole = 'buyer', onStatusUpdate }) => {
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingData, setShippingData] = useState({
    trackingNumber: '',
    provider: '',
    estimatedDelivery: ''
  });

  // Initialize shipping service
  const shippingService = new ShippingService();

  // Load transaction data
  const loadTransactionData = async () => {
    if (!transactionId) return;
    
    try {
      setLoading(true);
      
      // Get standard payment details
      const response = await getStandardPayment(transactionId);
      console.log('Standard payment response:', response);
      if (response.success) {
        setTransaction(response.data.payment);
      }
      
    } catch (error) {
      console.error('Failed to load transaction data:', error);
      toast.error('Failed to load transaction data');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadTransactionData();
  }, [transactionId]);

  // Handle status update
  const handleStatusUpdate = async (newStatus, statusNotes = '') => {
    if (!transactionId || !newStatus) return;
    
    try {
      setUpdating(true);
      
      // Prepare shipping details if marking as shipped
      let shippingDetails = {};
      if (newStatus === 'shipped') {
        if (!shippingData.trackingNumber) {
          toast.error('Tracking number is required when marking as shipped');
          return;
        }
        
        shippingDetails = {
          trackingNumber: shippingData.trackingNumber,
          provider: shippingData.provider || 'Unknown',
          estimatedDelivery: shippingData.estimatedDelivery
        };
      }
      
      const response = await shippingService.updateOrderStatus(
        transactionId, 
        newStatus, 
        statusNotes,
        shippingDetails // Pass shipping details
      );
      
      if (response.success) {
        toast.success(`Order status updated to: ${getStatusLabel(newStatus)}`);
        
        // Reload transaction data
        await loadTransactionData();
        
        // Notify parent component
        if (onStatusUpdate) {
          onStatusUpdate(newStatus, response.data);
        }
        
        // Reset form
        setSelectedStatus('');
        setNotes('');
        setShowActions(false);
        setShowShippingForm(false);
        setShippingData({
          trackingNumber: '',
          provider: '',
          estimatedDelivery: ''
        });
        
      } else {
        toast.error(response.message || 'Failed to update order status');
      }
      
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  // Get available actions based on current status and user role
  const getAvailableActions = () => {
    if (!transaction || userRole !== 'seller') return [];
    
    const currentStatus = transaction.orderStatus || 'paid';
    const paymentStatus = transaction.status;
    
    // Only show actions if payment is completed
    if (paymentStatus !== 'completed') return [];
    
    const actions = [];
    
    if (currentStatus === 'paid' || !currentStatus) {
      actions.push({
        status: 'shipped',
        label: 'Mark as Shipped',
        description: 'Mark the item as shipped to buyer',
        requiresConfirmation: true
      });
    } else if (currentStatus === 'shipped') {
      actions.push({
        status: 'delivered',
        label: 'Mark as Delivered',
        description: 'Mark the item as delivered to buyer',
        requiresConfirmation: true
      });
    } else if (currentStatus === 'delivered') {
      actions.push({
        status: 'completed',
        label: 'Mark as Completed',
        description: 'Mark the transaction as completed',
        requiresConfirmation: true
      });
    }
    
    return actions;
  };

  // Handle quick status update
  const handleQuickUpdate = async (status) => {
    const action = getAvailableActions().find(a => a.status === status);
    
    if (status === 'shipped') {
      // Show shipping form for shipped status
      setSelectedStatus(status);
      setShowShippingForm(true);
      setShowActions(true);
    } else if (action?.requiresConfirmation) {
      setSelectedStatus(status);
      setShowActions(true);
    } else {
      await handleStatusUpdate(status);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'pending_payment': 'text-yellow-600 bg-yellow-100',
      'paid': 'text-green-600 bg-green-100',
      'processing': 'text-blue-600 bg-blue-100',
      'shipped': 'text-indigo-600 bg-indigo-100',
      'delivered': 'text-purple-600 bg-purple-100',
      'completed': 'text-green-600 bg-green-100',
      'cancelled': 'text-red-600 bg-red-100',
      'failed': 'text-red-600 bg-red-100'
    };
    
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      'pending_payment': Clock,
      'paid': CheckCircle,
      'processing': RefreshCw,
      'shipped': Truck,
      'delivered': Package,
      'completed': CheckCircle,
      'cancelled': AlertTriangle,
      'failed': AlertTriangle
    };
    
    return icons[status] || Clock;
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      'pending_payment': 'Pending Payment',
      'paid': 'Payment Completed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'failed': 'Failed'
    };
    
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading transaction...</span>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Transaction Not Found</h3>
          <p className="text-gray-600">Unable to load transaction details.</p>
        </div>
      </div>
    );
  }

  const currentStatus = transaction.orderStatus || 'paid';
  const paymentStatus = transaction.status;
  const StatusIcon = getStatusIcon(currentStatus);
  const availableActions = getAvailableActions();

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getStatusColor(currentStatus)}`}>
            <StatusIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
            <p className="text-sm text-gray-600">
              Order Status: <span className="font-medium">{getStatusLabel(currentStatus)}</span>
            </p>
            <p className="text-sm text-gray-600">
              Payment Status: <span className="font-medium">{getStatusLabel(paymentStatus)}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(currentStatus)}`}>
            {getStatusLabel(currentStatus)}
          </span>
        </div>
      </div>

      {/* Available Actions */}
      {availableActions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Available Actions</h4>
          <div className="flex flex-wrap gap-2">
            {availableActions.map((action) => (
              <button
                key={action.status}
                onClick={() => handleQuickUpdate(action.status)}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating && selectedStatus === action.status ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Payment Status Info */}
      {paymentStatus !== 'completed' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800 font-medium">
              Waiting for payment completion before order actions become available.
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedStatus && showActions && (
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Confirm Status Update: {getStatusLabel(selectedStatus)}
          </h4>
          
          {/* Shipping Form for 'shipped' status */}
          {selectedStatus === 'shipped' && showShippingForm && (
            <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Shipping Details</h5>
              
              <div className="grid gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Number *
                  </label>
                  <input
                    type="text"
                    value={shippingData.trackingNumber}
                    onChange={(e) => setShippingData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                    placeholder="Enter tracking number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shipping Provider
                  </label>
                  <input
                    type="text"
                    value={shippingData.provider}
                    onChange={(e) => setShippingData(prev => ({ ...prev, provider: e.target.value }))}
                    placeholder="e.g., Aramex, DHL, FedEx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    value={shippingData.estimatedDelivery}
                    onChange={(e) => setShippingData(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this status update..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleStatusUpdate(selectedStatus, notes)}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {updating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Confirm Update
            </button>
            
            <button
              onClick={() => {
                setSelectedStatus('');
                setNotes('');
                setShowActions(false);
                setShowShippingForm(false);
                setShippingData({
                  trackingNumber: '',
                  provider: '',
                  estimatedDelivery: ''
                });
              }}
              disabled={updating}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={loadTransactionData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default StandardTransactionManager;
