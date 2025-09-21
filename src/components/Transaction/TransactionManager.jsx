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
import { 
  getTransactionStatus, 
  updateTransactionStatus, 
  getAvailableTransitions 
} from '../../api/TransactionService';

const TransactionManager = ({ transactionId, userRole = 'buyer', onStatusUpdate }) => {
  const [transaction, setTransaction] = useState(null);
  const [availableTransitions, setAvailableTransitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Load transaction data
  const loadTransactionData = async () => {
    if (!transactionId) return;
    
    try {
      setLoading(true);
      
      // Get transaction status
      const statusResponse = await getTransactionStatus(transactionId);
      console.log('Transaction status response:', statusResponse);
      if (statusResponse.success) {
        setTransaction(statusResponse.data);
      }
      
      // Get available transitions
      const transitionsResponse = await getAvailableTransitions(transactionId);
      if (transitionsResponse.success) {
        setAvailableTransitions(transitionsResponse.data.availableTransitions || []);
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
      
      const response = await updateTransactionStatus(transactionId, newStatus, statusNotes);
      
      if (response.success) {
        toast.success(`Transaction status updated to: ${getStatusLabel(newStatus)}`);
        
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
        
      } else {
        toast.error(response.message || 'Failed to update transaction status');
      }
      
    } catch (error) {
      console.error('Failed to update transaction status:', error);
      toast.error('Failed to update transaction status');
    } finally {
      setUpdating(false);
    }
  };

  // Handle quick status update (no confirmation needed)
  const handleQuickUpdate = async (status) => {
    const transition = availableTransitions.find(t => t.status === status);
    
    if (transition?.requiresConfirmation) {
      setSelectedStatus(status);
      setShowActions(true);
    } else {
      await handleStatusUpdate(status);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'processing': 'text-blue-600 bg-blue-100',
      'payment_confirmed': 'text-green-600 bg-green-100',
      'funds_held': 'text-green-600 bg-green-100',
      'shipped': 'text-indigo-600 bg-indigo-100',
      'in_transit': 'text-indigo-600 bg-indigo-100',
      'delivered': 'text-purple-600 bg-purple-100',
      'completed': 'text-green-600 bg-green-100',
      'cancelled': 'text-red-600 bg-red-100',
      'failed': 'text-red-600 bg-red-100',
      'refunded': 'text-orange-600 bg-orange-100'
    };
    
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      'pending': Clock,
      'processing': RefreshCw,
      'payment_confirmed': CheckCircle,
      'funds_held': CheckCircle,
      'shipped': Truck,
      'in_transit': Truck,
      'delivered': Package,
      'completed': CheckCircle,
      'cancelled': AlertTriangle,
      'failed': AlertTriangle,
      'refunded': AlertTriangle
    };
    
    return icons[status] || Clock;
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pending',
      'processing': 'Processing',
      'payment_confirmed': 'Payment Confirmed',
      'funds_held': 'Funds Secured',
      'shipped': 'Shipped',
      'in_transit': 'In Transit',
      'delivered': 'Delivered',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'failed': 'Failed',
      'refunded': 'Refunded'
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

  const StatusIcon = getStatusIcon(transaction.status);

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getStatusColor(transaction.status)}`}>
            <StatusIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Transaction Management</h3>
            <p className="text-sm text-gray-600">
              Current Status: <span className="font-medium">{getStatusLabel(transaction.status)}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(transaction.status)}`}>
            {getStatusLabel(transaction.status)}
          </span>
          <span className="text-sm text-gray-500">
            {transaction.progress}% Complete
          </span>
        </div>
      </div>

      {/* Available Actions */}
      {availableTransitions.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Available Actions</h4>
          <div className="flex flex-wrap gap-2">
            {availableTransitions.map((transition) => (
              <button
                key={transition.status}
                onClick={() => handleQuickUpdate(transition.status)}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating && selectedStatus === transition.status ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {transition.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status History */}
      {transaction.statusHistory && transaction.statusHistory.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowActions(!showActions)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showActions ? 'rotate-180' : ''}`} />
            Status History ({transaction.statusHistory.length})
          </button>
          
          {showActions && (
            <div className="mt-3 space-y-3">
              {transaction.statusHistory.map((history, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded-full ${getStatusColor(history.status)}`}>
                    <div className="w-2 h-2 rounded-full bg-current" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {getStatusLabel(history.status)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(history.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {history.notes && (
                      <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Updated by: {history.updatedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedStatus && showActions && (
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Confirm Status Update: {getStatusLabel(selectedStatus)}
          </h4>
          
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

export default TransactionManager;
