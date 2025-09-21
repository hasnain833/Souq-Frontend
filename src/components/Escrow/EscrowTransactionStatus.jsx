import React, { useState, useEffect } from 'react';
import {
  Clock,
  CreditCard,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  DollarSign,
  Calendar,
  User,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { getEscrowTransaction, checkPaymentStatus } from '../../api/EscrowService';
import { checkStandardPaymentStatus } from '../../api/StandardPaymentService';
import { toast } from 'react-toastify';

const EscrowTransactionStatus = ({ transaction, userRole, onAction, onTransactionUpdate, paymentType = 'escrow' }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Auto-refresh for payment processing status
  useEffect(() => {
    let intervalId;

    // Only auto-refresh if transaction is in processing state
    if (transaction.status === 'payment_processing') {
      intervalId = setInterval(() => {
        checkTransactionStatus();
      }, 10000); // Check every 10 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [transaction.status, transaction._id]);

  const checkTransactionStatus = async () => {
    try {
      setIsRefreshing(true);

      // Skip automatic payment status checking - let webhooks handle status updates
      console.log('ℹ️ Skipping automatic payment status check - relying on webhook updates');

      // Fallback to regular transaction fetch
      const response = await getEscrowTransaction(transaction._id);

      if (response.success) {
        const updatedTransaction = response?.data?.data?.escrowTransaction;

        // Check if status has changed
        if (updatedTransaction.status !== transaction.status) {
          console.log('🔄 Transaction status updated:', {
            from: transaction.status,
            to: updatedTransaction.status
          });

          // Show status update notification
          const statusMessages = {
            'funds_held': '✅ Payment successful! Funds are now secured in escrow.',
            'payment_failed': '❌ Payment failed. Please try again.',
            'cancelled': '🚫 Payment was cancelled.',
            'shipped': '📦 Item has been shipped!',
            'delivered': '✅ Delivery confirmed!',
            'completed': '🎉 Transaction completed successfully!'
          };

          if (statusMessages[updatedTransaction.status]) {
            toast.success(statusMessages[updatedTransaction.status]);
          }

          // Update parent component
          if (onTransactionUpdate) {
            onTransactionUpdate(updatedTransaction);
          }
        }

        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    checkTransactionStatus();
  };



  const getStatusConfig = (status) => {
    // Debug logging to see what status we're receiving
    console.log('🔍 EscrowTransactionStatus received status:', status);
    console.log('🔍 Transaction object:', transaction);

    const configs = {
      pending: {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        title: 'Payment Processing',
        description: 'Payment is being processed, please wait...'
      },
      pending_payment: {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        title: 'Pending Payment',
        description: 'Waiting for buyer to complete payment'
      },
      payment_processing: {
        icon: CreditCard,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        title: 'Processing Payment',
        description: 'Payment is being processed by the gateway'
      },
      payment_failed: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        title: 'Payment Failed',
        description: 'Payment could not be processed'
      },
      funds_held: {
        icon: Shield,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        title: 'Funds Secured',
        description: 'Payment successful, funds held in escrow'
      },
      shipped: {
        icon: Truck,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        title: 'Item Shipped',
        description: 'Seller has shipped the item'
      },
      delivered: {
        icon: Package,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        title: 'Delivered',
        description: 'Buyer confirmed delivery'
      },
      completed: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        title: 'Transaction Complete',
        description: 'Payment released to seller'
      },
      disputed: {
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        title: 'Disputed',
        description: 'Transaction is under dispute'
      },
      refunded: {
        icon: DollarSign,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        title: 'Refunded',
        description: 'Payment has been refunded to buyer'
      },
      cancelled: {
        icon: XCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        title: 'Cancelled',
        description: 'Transaction was cancelled'
      }
    };

    // If status not found, log it and provide a fallback
    if (!configs[status]) {
      console.warn('⚠️ Unknown escrow transaction status:', status);
      console.warn('⚠️ Available statuses:', Object.keys(configs));

      // Return a generic fallback
      return {
        icon: Clock,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        title: `Status: ${status}`,
        description: `Transaction status: ${status}`
      };
    }

    return configs[status];
  };

  const statusConfig = getStatusConfig(transaction.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailableActions = () => {
    const actions = [];

    if (userRole === 'seller') {
      if (transaction.status === 'funds_held') {
        actions.push({
          id: 'mark_shipped',
          label: 'Mark as Shipped',
          variant: 'primary',
          icon: Truck
        });
      }
    }

    if (userRole === 'buyer') {
      if (transaction.status === 'shipped') {
        actions.push({
          id: 'confirm_delivery',
          label: 'Confirm Delivery',
          variant: 'primary',
          icon: CheckCircle
        });
      }

      if (['funds_held', 'shipped'].includes(transaction.status)) {
        actions.push({
          id: 'raise_dispute',
          label: 'Raise Dispute',
          variant: 'secondary',
          icon: AlertTriangle
        });
      }
    }

    return actions;
  };

  const renderProgressSteps = () => {
    const steps = [
      {
        key: 'payment',
        label: 'Payment',
        statuses: ['pending_payment', 'payment_processing'],
        icon: CreditCard,
        description: 'Processing payment'
      },
      {
        key: 'secured',
        label: 'Funds Secured',
        statuses: ['funds_held'],
        icon: Shield,
        description: 'Payment secured in escrow'
      },
      {
        key: 'shipped',
        label: 'Shipped',
        statuses: ['shipped'],
        icon: Truck,
        description: 'Item shipped by seller'
      },
      {
        key: 'delivered',
        label: 'Delivered',
        statuses: ['delivered'],
        icon: Package,
        description: 'Delivery confirmed'
      },
      {
        key: 'completed',
        label: 'Completed',
        statuses: ['completed'],
        icon: CheckCircle,
        description: 'Transaction complete'
      }
    ];

    const getCurrentStepIndex = () => {
      return steps.findIndex(step => step.statuses.includes(transaction.status));
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
      <div className="mb-6">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Transaction Progress</h4>
          <div className="flex items-center space-x-2">
            {transaction.status === 'payment_processing' && (
              <div className="flex items-center text-sm text-blue-600">
                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                Auto-refreshing...
              </div>
            )}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex flex-col items-center relative">
                  {/* Step Circle */}
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-300
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' :
                      isActive ? 'bg-blue-500 border-blue-500 text-white animate-pulse' :
                        'bg-white border-gray-300 text-gray-400'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <StepIcon className="w-6 h-6" />
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-600' :
                        isCompleted ? 'text-green-600' :
                          'text-gray-500'
                      }`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 max-w-20">
                      {step.description}
                    </div>
                  </div>

                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className={`
                      absolute top-6 left-12 w-full h-0.5 -z-10 transition-all duration-300
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                    `} style={{ width: 'calc(100% - 48px)' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Status Info */}
        {transaction.status === 'payment_processing' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center text-sm text-blue-800">
              <Clock className="w-4 h-4 mr-2" />
              <span>
                Payment is being processed by the gateway. This usually takes 1-3 minutes.
                <br />
                <span className="text-xs text-blue-600">
                  Last checked: {lastUpdated.toLocaleTimeString()}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div></div>
    // <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    //   {/* Header */}
    //   <div className="p-6 border-b border-gray-200">
    //     <div className="flex items-center justify-between">
    //       <div className="flex items-center space-x-3">
    //         <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
    //           <StatusIcon className={`w-6 h-6 ${statusConfig.color}`} />
    //         </div>
    //         <div>
    //           <h3 className="text-lg font-semibold text-gray-900">
    //             {statusConfig.title}
    //           </h3>
    //           <p className="text-sm text-gray-600">
    //             {statusConfig.description}
    //           </p>
    //         </div>
    //       </div>

    //       <div className="text-right">
    //         <div className="text-sm text-gray-500">Transaction ID</div>
    //         <div className="font-mono text-sm font-medium">
    //           {transaction.transactionId}
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Progress Steps */}
    //   {!['payment_failed', 'cancelled', 'disputed', 'refunded'].includes(transaction.status) && (
    //     <div className="p-6 border-b border-gray-200">
    //       {renderProgressSteps()}
    //     </div>
    //   )}

    //   {/* Transaction Details */}
    //   <div className="p-6">
    //     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //       {/* Financial Details */}
    //       <div>
    //         <h4 className="font-medium text-gray-900 mb-3">Financial Details</h4>
    //         <div className="space-y-2 text-sm">
    //           <div className="flex justify-between">
    //             <span className="text-gray-600">Product Price:</span>
    //             <span className="font-medium">
    //               {transaction.currency} {Number(transaction.productPrice || 0).toFixed(2)}
    //             </span>
    //           </div>
    //           <div className="flex justify-between">
    //             <span className="text-gray-600">Shipping Cost:</span>
    //             <span className="font-medium">
    //               {transaction.currency} {Number(transaction.shippingCost || 0).toFixed(2)}
    //             </span>
    //           </div>
    //           <div className="flex justify-between">
    //             <span className="text-gray-600">Platform Fee:</span>
    //             <span className="font-medium">
    //               {transaction.currency} {Number(transaction.platformFeeAmount || 0).toFixed(2)}
    //             </span>
    //           </div>
    //           <div className="flex justify-between">
    //             <span className="text-gray-600">Gateway Fee:</span>
    //             <span className="font-medium">
    //               {transaction.currency} {Number(transaction.gatewayFeeAmount || 0).toFixed(2)}
    //             </span>
    //           </div>
    //           <div className="flex justify-between pt-2 border-t border-gray-200">
    //             <span className="font-semibold text-gray-900">Total Amount:</span>
    //             <span className="font-semibold text-gray-900">
    //               {transaction.currency} {Number(transaction.totalAmount || 0).toFixed(2)}
    //             </span>
    //           </div>
    //         </div>
    //       </div>

    //       {/* Delivery Details */}
    //       {transaction.deliveryDetails && (
    //         <div>
    //           <h4 className="font-medium text-gray-900 mb-3">Delivery Details</h4>
    //           <div className="space-y-2 text-sm">
    //             {transaction.deliveryDetails.trackingNumber && (
    //               <div className="flex justify-between">
    //                 <span className="text-gray-600">Tracking Number:</span>
    //                 <span className="font-medium font-mono">
    //                   {transaction.deliveryDetails.trackingNumber}
    //                 </span>
    //               </div>
    //             )}
    //             {transaction.deliveryDetails.carrier && (
    //               <div className="flex justify-between">
    //                 <span className="text-gray-600">Carrier:</span>
    //                 <span className="font-medium">
    //                   {transaction.deliveryDetails.carrier}
    //                 </span>
    //               </div>
    //             )}
    //             {transaction.deliveryDetails.shippedAt && (
    //               <div className="flex justify-between">
    //                 <span className="text-gray-600">Shipped At:</span>
    //                 <span className="font-medium">
    //                   {formatDate(transaction.deliveryDetails.shippedAt)}
    //                 </span>
    //               </div>
    //             )}
    //             {transaction.deliveryDetails.estimatedDelivery && (
    //               <div className="flex justify-between">
    //                 <span className="text-gray-600">Estimated Delivery:</span>
    //                 <span className="font-medium">
    //                   {formatDate(transaction.deliveryDetails.estimatedDelivery)}
    //                 </span>
    //               </div>
    //             )}
    //           </div>
    //         </div>
    //       )}
    //     </div>


    //     {/* Auto-release Information */}
    //     {transaction.status === 'shipped' && transaction.daysUntilAutoRelease > 0 && (
    //       <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    //         <div className="flex items-start space-x-2">
    //           <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
    //           <div className="text-sm">
    //             <div className="font-medium text-yellow-800">
    //               Auto-release in {transaction.daysUntilAutoRelease} days
    //             </div>
    //             <div className="text-yellow-700 mt-1">
    //               If delivery is not confirmed, funds will be automatically released to the seller.
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     )}

    //     {/* Action Buttons */}
    //     {getAvailableActions().length > 0 && (
    //       <div className="mt-6 flex flex-wrap gap-3">
    //         {getAvailableActions().map((action) => {
    //           const ActionIcon = action.icon;
    //           return (
    //             <button
    //               key={action.id}
    //               onClick={() => onAction(action.id)}
    //               className={`
    //                 inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors
    //                 ${action.variant === 'primary'
    //                   ? 'bg-teal-600 text-white hover:bg-teal-700'
    //                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    //                 }
    //               `}
    //             >
    //               <ActionIcon className="w-4 h-4 mr-2" />
    //               {action.label}
    //             </button>
    //           );
    //         })}
    //       </div>
    //     )}

    //     {/* Toggle Details */}
    //     <button
    //       onClick={() => setShowDetails(!showDetails)}
    //       className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium"
    //     >
    //       {showDetails ? 'Hide Details' : 'Show More Details'}
    //     </button>

    //     {/* Extended Details */}
    //     {showDetails && (
    //       <div className="mt-4 pt-4 border-t border-gray-200">
    //         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
    //           <div>
    //             <h5 className="font-medium text-gray-900 mb-2">Transaction Info</h5>
    //             <div className="space-y-1">
    //               <div className="flex justify-between">
    //                 <span className="text-gray-600">Created:</span>
    //                 <span>{formatDate(transaction.createdAt)}</span>
    //               </div>
    //               <div className="flex justify-between">
    //                 <span className="text-gray-600">Payment Gateway:</span>
    //                 <span className="capitalize">{transaction.paymentGateway}</span>
    //               </div>
    //               <div className="flex justify-between">
    //                 <span className="text-gray-600">Gateway Fee Paid By:</span>
    //                 <span className="capitalize">{transaction.gatewayFeePaidBy}</span>
    //               </div>
    //             </div>
    //           </div>

    //           {transaction.statusHistory && transaction.statusHistory.length > 0 && (
    //             <div>
    //               <h5 className="font-medium text-gray-900 mb-2">Status History</h5>
    //               <div className="space-y-1 max-h-32 overflow-y-auto">
    //                 {transaction.statusHistory.slice(-5).reverse().map((history, index) => (
    //                   <div key={index} className="text-xs">
    //                     <div className="flex justify-between">
    //                       <span className="capitalize font-medium">{history.status.replace('_', ' ')}</span>
    //                       <span className="text-gray-500">{formatDate(history.timestamp)}</span>
    //                     </div>
    //                     {history.note && (
    //                       <div className="text-gray-600 mt-1">{history.note}</div>
    //                     )}
    //                   </div>
    //                 ))}
    //               </div>
    //             </div>
    //           )}
    //         </div>
    //       </div>
    //     )}
    //   </div>
    // </div>
  );
};

export default EscrowTransactionStatus;
