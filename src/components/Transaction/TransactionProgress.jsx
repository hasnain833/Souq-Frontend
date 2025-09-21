import React, { useState, useEffect } from 'react';
import { CreditCard, Shield, Truck, Package, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { getTransactionStatus } from '../../api/TransactionService';

const TransactionProgress = ({ transaction, transactionType = 'escrow', onRefresh }) => {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch transaction details
  const fetchTransactionDetails = async () => {
    if (!transaction?.transactionId) return;

    try {
      setLoading(true);
      const response = await getTransactionStatus(transaction.transactionId);
      if (response.success) {
        setTransactionDetails(response.data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch transaction details:', error);
    } finally {
      setLoading(false);
      setLastChecked(new Date());
    }
  };

  // Initial load
  useEffect(() => {
    fetchTransactionDetails();
  }, [transaction?.transactionId, transactionType]);

  // Auto-refresh functionality
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchTransactionDetails();
        if (onRefresh) onRefresh();
      }, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, onRefresh]);

  // Define progress steps based on transaction type
  const getProgressSteps = () => {
    if (transactionType === 'escrow') {
      return [
        {
          key: 'payment',
          label: 'Payment',
          sublabel: 'Processing payment',
          icon: CreditCard,
          description: 'Payment is being processed by the gateway',
          statuses: ['pending', 'processing', 'pending_payment']
        },
        {
          key: 'funds_secured',
          label: 'Funds Secured',
          sublabel: 'Payment secured in escrow',
          icon: Shield,
          description: 'Funds are secured in escrow',
          statuses: ['funds_held', 'payment_confirmed']
        },
        {
          key: 'shipped',
          label: 'Shipped',
          sublabel: 'Item shipped by seller',
          icon: Truck,
          description: 'Item has been shipped by the seller',
          statuses: ['shipped', 'in_transit']
        },
        {
          key: 'delivered',
          label: 'Delivered',
          sublabel: 'Delivery confirmed',
          icon: Package,
          description: 'Item has been delivered and confirmed',
          statuses: ['delivered', 'delivery_confirmed']
        },
        {
          key: 'completed',
          label: 'Completed',
          sublabel: 'Transaction complete',
          icon: CheckCircle,
          description: 'Transaction is complete and funds released',
          statuses: ['completed', 'funds_released']
        }
      ];
    } else {
      // Standard payment steps
      return [
        {
          key: 'payment',
          label: 'Payment',
          sublabel: 'Payment processing',
          icon: CreditCard,
          description: 'Payment is being processed by the gateway',
          statuses: ['pending', 'processing', 'pending_payment']
        },
        {
          key: 'payment_completed',
          label: 'Payment Complete',
          sublabel: 'Awaiting shipment',
          icon: CheckCircle,
          description: 'Payment completed successfully, waiting for seller to ship',
          statuses: ['completed', 'paid']
        },
        {
          key: 'shipped',
          label: 'Shipped',
          sublabel: 'Item shipped by seller',
          icon: Truck,
          description: 'Item has been shipped by the seller',
          statuses: ['shipped', 'in_transit']
        },
        {
          key: 'delivered',
          label: 'Delivered',
          sublabel: 'Delivery confirmed',
          icon: Package,
          description: 'Item has been delivered to buyer',
          statuses: ['delivered', 'delivery_confirmed']
        },
        {
          key: 'completed',
          label: 'Completed',
          sublabel: 'Transaction complete',
          icon: CheckCircle,
          description: 'Transaction is complete',
          statuses: ['order_completed', 'transaction_completed']
        }
      ];
    }
  };

  const progressSteps = getProgressSteps();

  // Get current step based on transaction status
  const getCurrentStepIndex = () => {
    // Use API response data if available, otherwise fall back to prop data
    const currentTransaction = transactionDetails || transaction;
    if (!currentTransaction?.status) return 0;

    const status = currentTransaction.status.toLowerCase();
    const currentTransactionType = transactionDetails?.transactionType || transactionType;



    // Special handling for standard payments
    if (currentTransactionType === 'standard') {
      // Use API progress to determine step if available
      if (transactionDetails?.progress !== undefined) {
        const progress = transactionDetails.progress;
        if (progress >= 100) return 3; // Completed
        if (progress >= 75) return 2; // Delivered
        if (progress >= 50) return 1; // Shipped
        return 0; // Payment/Processing
      }

      // Map payment statuses to order fulfillment flow
      if (status === 'completed' || status === 'paid') {
        // Check if there are next possible statuses to determine current step
        const nextStatuses = currentTransaction.nextPossibleStatuses || [];

        if (nextStatuses.includes('shipped')) {
          return 0; // Payment completed, waiting for shipment
        } else if (nextStatuses.includes('delivered')) {
          return 1; // Shipped, waiting for delivery
        } else if (nextStatuses.length === 0) {
          return 3; // Final completed - no more possible statuses
        }

        // Fallback: check if there's an orderStatus for fulfillment tracking
        const orderStatus = currentTransaction.orderStatus?.toLowerCase() || 'paid';
        if (orderStatus === 'completed') return 3; // Final completed
        if (orderStatus === 'delivered') return 2; // Delivered
        if (orderStatus === 'shipped') return 1; // Shipped
        return 0; // Payment completed, waiting for shipment
      }

      if (status === 'processing' || status === 'pending_payment') {
        return 0; // Still processing payment
      }
    }

    // Default logic for escrow and other cases
    for (let i = progressSteps.length - 1; i >= 0; i--) {
      if (progressSteps[i].statuses.some(s => status.includes(s))) {
        return i;
      }
    }
    return 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  // Get step status (completed, current, pending)
  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'pending';
  };

  // Get step styles based on status
  const getStepStyles = (status) => {
    switch (status) {
      case 'completed':
        return {
          circle: 'bg-green-500 text-white',
          line: 'bg-green-500',
          text: 'text-green-600',
          sublabel: 'text-green-500'
        };
      case 'current':
        return {
          circle: 'bg-blue-500 text-white animate-pulse',
          line: 'bg-gray-300',
          text: 'text-blue-600',
          sublabel: 'text-blue-500'
        };
      default:
        return {
          circle: 'bg-gray-300 text-gray-500',
          line: 'bg-gray-300',
          text: 'text-gray-500',
          sublabel: 'text-gray-400'
        };
    }
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status message
  const getStatusMessage = () => {
    const currentStep = progressSteps[currentStepIndex];
    if (!currentStep) return 'Processing transaction...';

    if (transactionType === 'standard') {
      if (currentStep.key === 'payment') {
        return 'Payment is being processed by the gateway. This usually takes 1-3 minutes.';
      } else if (currentStep.key === 'payment_completed') {
        return 'Payment completed successfully! Waiting for seller to ship the item.';
      } else if (currentStep.key === 'shipped') {
        return 'Item has been shipped by the seller. Tracking information will be provided if available.';
      } else if (currentStep.key === 'delivered') {
        return 'Item has been delivered. Please confirm receipt to complete the transaction.';
      } else if (currentStep.key === 'completed') {
        return 'Transaction completed successfully! Thank you for your purchase.';
      }
    }

    if (currentStep.key === 'payment') {
      return 'Payment is being processed by the gateway. This usually takes 1-3 minutes.';
    }

    return currentStep.description;
  };

  return (
    <div></div>
    // <div className="bg-white rounded-lg border shadow-sm p-6">
    //   {/* Header */}
    //   <div className="flex items-center justify-between mb-6">
    //     <div className="flex items-center gap-3">
    //       <div className="p-2 bg-blue-100 rounded-lg">
    //         <CreditCard className="w-6 h-6 text-blue-600" />
    //       </div>
    //       <div>
    //         <h2 className="text-lg font-semibold text-gray-900">
    //           {(() => {
    //             const currentTransactionType = transactionDetails?.transactionType || transactionType;

    //             if (currentTransactionType === 'escrow') return 'Escrow Transaction Progress';

    //             // Use current step to determine title
    //             const currentStep = progressSteps[currentStepIndex];
    //             if (currentStep?.key === 'payment') return 'Payment Processing';
    //             if (currentStep?.key === 'payment_completed') return 'Payment Completed';
    //             if (currentStep?.key === 'shipped') return 'Item Shipped';
    //             if (currentStep?.key === 'delivered') return 'Item Delivered';
    //             if (currentStep?.key === 'completed') return 'Transaction Completed';

    //             return 'Transaction Progress';
    //           })()}
    //         </h2>
    //         <p className="text-sm text-gray-600">
    //           {(() => {
    //             const currentTransactionType = transactionDetails?.transactionType || transactionType;

    //             if (currentTransactionType === 'escrow') return 'Escrow transaction in progress';

    //             // Use current step to determine subtitle
    //             const currentStep = progressSteps[currentStepIndex];
    //             if (currentStep?.key === 'payment') return 'Payment is being processed by the gateway';
    //             if (currentStep?.key === 'payment_completed') return 'Payment successful, awaiting shipment';
    //             if (currentStep?.key === 'shipped') return 'Item is on its way to buyer';
    //             if (currentStep?.key === 'delivered') return 'Item has been delivered to buyer';
    //             if (currentStep?.key === 'completed') return 'Transaction has been completed successfully';

    //             return 'Transaction in progress';
    //           })()}
    //         </p>
    //       </div>
    //     </div>
    //     <div className="text-right">
    //       <div className="mb-2">
    //         <p className="text-sm text-gray-500">Progress</p>
    //         <p className="text-lg font-semibold text-blue-600">
    //           {transactionDetails?.progress !== undefined ? transactionDetails.progress : Math.round(((currentStepIndex + 1) / progressSteps.length) * 100)}% Complete
    //         </p>
    //       </div>
    //       <div>
    //         <p className="text-sm text-gray-500">Transaction ID</p>
    //         <p className="font-mono text-sm font-medium">
    //           {transactionDetails?.transactionId || transaction?.transactionId || 'N/A'}
    //         </p>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Transaction Progress */}
    //   <div className="mb-6">
    //     <div className="flex items-center justify-between mb-4">
    //       <h3 className="text-lg font-medium text-gray-900">Transaction Progress</h3>
    //       <div className="flex items-center gap-2">
    //         <button
    //           onClick={() => setAutoRefresh(!autoRefresh)}
    //           className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full transition-colors ${
    //             autoRefresh 
    //               ? 'bg-blue-100 text-blue-700' 
    //               : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    //           }`}
    //         >
    //           <Clock className="w-3 h-3" />
    //           {autoRefresh ? 'Auto-refreshing...' : 'Auto-refresh'}
    //         </button>
    //         <button
    //           onClick={() => {
    //             fetchTransactionDetails();
    //             if (onRefresh) onRefresh();
    //           }}
    //           disabled={loading}
    //           className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
    //         >
    //           <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
    //           {loading ? 'Loading...' : 'Refresh'}
    //         </button>
    //       </div>
    //     </div>

    //     {/* Progress Steps */}
    //     <div className="flex justify-between items-center mb-6">
    //       {progressSteps.map((step, index) => {
    //         const stepStatus = getStepStatus(index);
    //         const styles = getStepStyles(stepStatus);
    //         const IconComponent = step.icon;

    //         return (
    //           <div key={step.key} className="flex flex-col items-center flex-1">
    //             {/* Step Circle */}
    //             <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${styles.circle}`}>
    //               <IconComponent className="w-6 h-6" />
    //             </div>
                
    //             {/* Step Label */}
    //             <div className="text-center">
    //               <p className={`font-medium text-sm ${styles.text}`}>
    //                 {step.label}
    //               </p>
    //               <p className={`text-xs ${styles.sublabel}`}>
    //                 {step.sublabel}
    //               </p>
    //             </div>

    //             {/* Connecting Line */}
    //             {index < progressSteps.length - 1 && (
    //               <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-gray-300 -z-10" 
    //                    style={{ 
    //                      left: `${((index + 0.5) / progressSteps.length) * 100}%`,
    //                      width: `${(1 / progressSteps.length) * 100}%`
    //                    }} 
    //               />
    //             )}
    //           </div>
    //         );
    //       })}
    //     </div>

    //     {/* Progress Bar */}
    //     <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
    //       <div
    //         className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
    //         style={{
    //           width: `${transactionDetails?.progress !== undefined ? transactionDetails.progress : ((currentStepIndex + 1) / progressSteps.length) * 100}%`
    //         }}
    //       />
    //     </div>
    //   </div>

    //   {/* Status Message */}
    //   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
    //     <div className="flex items-start gap-3">
    //       <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
    //       <div className="flex-1">
    //         <p className="text-blue-800 font-medium">
    //           {getStatusMessage()}
    //         </p>
    //         <p className="text-blue-600 text-sm mt-1">
    //           Last checked: {formatTime(lastChecked)}
    //         </p>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default TransactionProgress;
