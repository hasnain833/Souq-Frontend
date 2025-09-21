import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  Truck,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { formatCurrency } from '../../api/WalletService';

const WithdrawalStatusCard = ({ withdrawal, onRefresh }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'in_transit':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'canceled':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'in_transit':
        return 'bg-blue-50 border-blue-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'canceled':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Processing';
      case 'in_transit':
        return 'In Transit';
      case 'failed':
        return 'Failed';
      case 'canceled':
        return 'Canceled';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstimatedArrival = () => {
    if (withdrawal.status === 'paid' || withdrawal.status === 'completed') {
      return withdrawal.completedAt ? formatDate(withdrawal.completedAt) : 'Completed';
    }
    
    if (withdrawal.estimatedArrival) {
      return formatDate(withdrawal.estimatedArrival);
    }
    
    if (withdrawal.status === 'pending' || withdrawal.status === 'in_transit') {
      return '1-3 business days';
    }
    
    return null;
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor(withdrawal.status)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
          {getStatusIcon(withdrawal.status)}
          <div className="flex-1">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <h4 className="font-semibold text-gray-900">
                {formatCurrency(withdrawal.amount, withdrawal.currency)}
              </h4>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                withdrawal.status === 'paid' || withdrawal.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : withdrawal.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : withdrawal.status === 'in_transit'
                  ? 'bg-blue-100 text-blue-800'
                  : withdrawal.status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {getStatusText(withdrawal.status)}
              </span>
            </div>
            
            <div className="mt-2 space-y-1">
              {/* Bank Account Info */}
              {withdrawal.bankAccount && (
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                  <Building2 className="w-4 h-4" />
                  <span>
                    {withdrawal.bankAccount.bankName} ****{withdrawal.bankAccount.lastFourDigits}
                  </span>
                </div>
              )}
              
              {/* Transaction ID */}
              <div className="text-xs text-gray-500">
                ID: {withdrawal.transactionId}
              </div>
              
              {/* Created Date */}
              <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Requested: {formatDate(withdrawal.createdAt)}</span>
              </div>
              
              {/* Estimated Arrival */}
              {getEstimatedArrival() && (
                <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {withdrawal.status === 'paid' || withdrawal.status === 'completed'
                      ? 'Completed: '
                      : 'Expected: '}
                    {getEstimatedArrival()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Status Message */}
            <div className="mt-3 text-sm">
              {withdrawal.message || (
                withdrawal.status === 'pending'
                  ? 'Your withdrawal is being processed and will arrive in your bank account within 1-3 business days.'
                  : withdrawal.status === 'in_transit'
                  ? 'Your withdrawal is on its way to your bank account.'
                  : withdrawal.status === 'paid' || withdrawal.status === 'completed'
                  ? 'Withdrawal completed successfully. Funds have been transferred to your bank account.'
                  : withdrawal.status === 'failed'
                  ? `Withdrawal failed: ${withdrawal.failureMessage || 'Please contact support or try again.'}`
                  : 'Withdrawal status is being updated.'
              )}
            </div>
            
            {/* Failure Details */}
            {withdrawal.status === 'failed' && withdrawal.failureCode && (
              <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm">
                <div className="font-medium text-red-800">Error Code: {withdrawal.failureCode}</div>
                {withdrawal.failureMessage && (
                  <div className="text-red-700 mt-1">{withdrawal.failureMessage}</div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Refresh Button */}
        {onRefresh && (withdrawal.status === 'pending' || withdrawal.status === 'in_transit') && (
          <button
            onClick={() => onRefresh(withdrawal.transactionId)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh status"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default WithdrawalStatusCard;
