import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Building2, 
  Mail, 
  Calendar,
  DollarSign,
  Info
} from 'lucide-react';
import { formatCurrency } from '../../api/WalletService';

const WithdrawalTransactionCard = ({ transaction, compact = false }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMethodIcon = (method) => {
    return method === 'bank_transfer' ? (
      <Building2 className="w-4 h-4 text-blue-600" />
    ) : (
      <Mail className="w-4 h-4 text-blue-600" />
    );
  };

  const getMethodText = (method) => {
    return method === 'bank_transfer' ? 'Bank Transfer' : 'PayPal';
  };

  // Create account display from transaction data
  const getAccountDisplay = () => {
    if (transaction.withdrawalMethod === 'bank_transfer' && transaction.bankAccount) {
      return `${transaction.bankAccount.bankName} ****${transaction.bankAccount.lastFourDigits}`;
    } else if (transaction.withdrawalMethod === 'paypal' && transaction.paypalAccount) {
      return transaction.paypalAccount.email;
    }
    return transaction.accountDisplay || 'Unknown Account';
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
        <div className="flex items-center space-x-3">
          {getStatusIcon(transaction.status)}
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(transaction.netAmount || transaction.amount, transaction.currency)}
              </span>
              {getMethodIcon(transaction.withdrawalMethod)}
            </div>
            <div className="text-xs text-gray-500">
              {formatDate(transaction.requestedAt || transaction.createdAt)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
            {getStatusText(transaction.status)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getStatusIcon(transaction.status)}
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {formatCurrency(transaction.amount, transaction.currency)}
              </h3>
              {transaction.fees && transaction.fees.totalFees > 0 && (
                <span className="text-sm text-gray-500">
                  (Net: {formatCurrency(transaction.netAmount, transaction.currency)})
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {getMethodIcon(transaction.withdrawalMethod)}
              <span>{getMethodText(transaction.withdrawalMethod)}</span>
              <span>•</span>
              <span>{transaction.transactionId}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.status)}`}>
            {getStatusText(transaction.status)}
          </span>
          <div className="text-xs text-gray-500 mt-1">
            {formatDate(transaction.requestedAt || transaction.createdAt)}
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <span className="font-medium">To:</span>
          <span>{getAccountDisplay()}</span>
        </div>
        {transaction.description && (
          <div className="text-xs text-gray-600 mt-1">
            {transaction.description}
          </div>
        )}
      </div>

      {/* Status and Timing */}
      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div>
          <div className="flex items-center space-x-1 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Requested</span>
          </div>
          <div className="font-medium text-gray-900">
            {formatDate(transaction.requestedAt || transaction.createdAt)}
          </div>
        </div>
        {transaction.estimatedArrival && (
          <div>
            <div className="flex items-center space-x-1 text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Expected</span>
            </div>
            <div className="font-medium text-gray-900">
              {formatDate(transaction.estimatedArrival)}
            </div>
          </div>
        )}
      </div>

      {/* Fees Breakdown */}
      {transaction.fees && transaction.fees.totalFees > 0 && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-sm font-medium text-blue-900 mb-2">
            <DollarSign className="w-4 h-4" />
            <span>Fee Breakdown</span>
          </div>
          <div className="space-y-1 text-sm text-blue-800">
            <div className="flex justify-between">
              <span>Platform Fee:</span>
              <span>{formatCurrency(transaction.fees.platformFee, transaction.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>Processing Fee:</span>
              <span>{formatCurrency(transaction.fees.processingFee, transaction.currency)}</span>
            </div>
            <div className="flex justify-between font-medium border-t border-blue-300 pt-1">
              <span>Total Fees:</span>
              <span>{formatCurrency(transaction.fees.totalFees, transaction.currency)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error Info */}
      {transaction.status === 'failed' && transaction.errorInfo && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-sm font-medium text-red-900 mb-1">
            <XCircle className="w-4 h-4" />
            <span>Error Details</span>
          </div>
          <div className="text-sm text-red-800">
            <div className="font-medium">{transaction.errorInfo.code}</div>
            <div>{transaction.errorInfo.message}</div>
          </div>
        </div>
      )}

      {/* Toggle Details */}
      <div className="border-t border-gray-200 pt-3">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
        >
          {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showDetails ? 'Hide Details' : 'Show Details'}</span>
        </button>

        {/* Detailed Information */}
        {showDetails && (
          <div className="mt-3 space-y-3">
            {/* Provider Info */}
            {transaction.providerPayoutId && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-2">Provider Information</div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Provider:</span>
                    <span className="capitalize">{transaction.paymentProvider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payout ID:</span>
                    <span className="font-mono text-xs">{transaction.providerPayoutId}</span>
                  </div>
                  {transaction.providerItemId && (
                    <div className="flex justify-between">
                      <span>Item ID:</span>
                      <span className="font-mono text-xs">{transaction.providerItemId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status History */}
            {transaction.statusHistory && transaction.statusHistory.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-2">Status History</div>
                <div className="space-y-2">
                  {transaction.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(history.status)}
                        <span className="capitalize">{history.status.replace('_', ' ')}</span>
                        {history.note && (
                          <span className="text-gray-500">- {history.note}</span>
                        )}
                      </div>
                      <span className="text-gray-500 text-xs">
                        {formatDate(history.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalTransactionCard;