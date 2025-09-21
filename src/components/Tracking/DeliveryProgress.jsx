import React from 'react';
import { Package, Truck, MapPin, CheckCircle, Clock } from 'lucide-react';

const DeliveryProgress = ({ status, events = [], estimatedDelivery, actualDelivery }) => {
  const progressSteps = [
    {
      key: 'created',
      label: 'Order Placed',
      icon: Package,
      description: 'Your order has been confirmed'
    },
    {
      key: 'picked_up',
      label: 'Picked Up',
      icon: Truck,
      description: 'Package picked up by carrier'
    },
    {
      key: 'in_transit',
      label: 'In Transit',
      icon: Truck,
      description: 'Package is on its way'
    },
    {
      key: 'out_for_delivery',
      label: 'Out for Delivery',
      icon: Truck,
      description: 'Package is out for delivery'
    },
    {
      key: 'delivered',
      label: 'Delivered',
      icon: CheckCircle,
      description: 'Package has been delivered'
    }
  ];

  const getCurrentStepIndex = () => {
    const statusMap = {
      'created': 0,
      'pending_payment': 0,
      'paid': 0,
      'processing': 0,
      'picked_up': 1,
      'shipped': 1,
      'in_transit': 2,
      'out_for_delivery': 3,
      'delivered': 4
    };
    return statusMap[status] || 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  const getStepStatus = (stepIndex) => {
    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'pending';
  };

  const getStepStyles = (stepStatus) => {
    switch (stepStatus) {
      case 'completed':
        return {
          circle: 'bg-green-600 text-white',
          line: 'bg-green-600',
          text: 'text-green-600',
          description: 'text-gray-600'
        };
      case 'current':
        return {
          circle: 'bg-blue-600 text-white ring-4 ring-blue-100',
          line: 'bg-gray-300',
          text: 'text-blue-600 font-medium',
          description: 'text-gray-700'
        };
      case 'pending':
        return {
          circle: 'bg-gray-300 text-gray-500',
          line: 'bg-gray-300',
          text: 'text-gray-500',
          description: 'text-gray-400'
        };
      default:
        return {
          circle: 'bg-gray-300 text-gray-500',
          line: 'bg-gray-300',
          text: 'text-gray-500',
          description: 'text-gray-400'
        };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventForStep = (stepKey) => {
    return events.find(event => 
      event.status === stepKey || 
      (stepKey === 'created' && ['created', 'pending_payment', 'paid', 'processing'].includes(event.status))
    );
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Delivery Progress</h3>
        {estimatedDelivery && !actualDelivery && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Estimated Delivery
            </p>
            <p className="text-sm text-gray-600">{formatDate(estimatedDelivery)}</p>
          </div>
        )}
        {actualDelivery && (
          <div className="text-right">
            <p className="text-sm font-medium text-green-600 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Delivered
            </p>
            <p className="text-sm text-gray-600">{formatDate(actualDelivery)}</p>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="relative">
        {progressSteps.map((step, index) => {
          const stepStatus = getStepStatus(index);
          const styles = getStepStyles(stepStatus);
          const event = getEventForStep(step.key);
          const IconComponent = step.icon;

          return (
            <div key={step.key} className="relative flex items-start pb-8 last:pb-0">
              {/* Connecting Line */}
              {index < progressSteps.length - 1 && (
                <div 
                  className={`absolute left-4 top-8 w-0.5 h-16 ${styles.line}`}
                  style={{ transform: 'translateX(-1px)' }}
                />
              )}

              {/* Step Circle */}
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${styles.circle}`}>
                <IconComponent className="w-4 h-4" />
              </div>

              {/* Step Content */}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${styles.text}`}>
                      {step.label}
                    </p>
                    <p className={`text-xs ${styles.description}`}>
                      {step.description}
                    </p>
                  </div>
                  {event && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {formatDate(event.timestamp)}
                      </p>
                      {event.location && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.location.city}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Event Description */}
                {event && event.description && stepStatus === 'current' && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">{event.description}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Status Information */}
      {status === 'exception' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-sm font-medium text-red-800">Delivery Exception</p>
          </div>
          <p className="text-sm text-red-700 mt-1">
            There was an issue with your delivery. Please contact customer support for assistance.
          </p>
        </div>
      )}

      {status === 'returned' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <p className="text-sm font-medium text-yellow-800">Package Returned</p>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Your package has been returned to the sender. Please contact the seller for more information.
          </p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Order Placed</span>
          <span>Delivered</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStepIndex + 1) / progressSteps.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{Math.round(((currentStepIndex + 1) / progressSteps.length) * 100)}% Complete</span>
          {estimatedDelivery && !actualDelivery && (
            <span>Est. {formatDate(estimatedDelivery)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryProgress;
