import React, { useState, useEffect } from 'react';
import { CreditCard, Shield, Clock, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PaymentGatewaySelector = ({
  amount,
  currency = 'USD',
  onGatewaySelect,
  selectedGateway,
  className = ''
}) => {
  const { t } = useTranslation()
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feeComparison, setFeeComparison] = useState({});

  // Available payment gateways
  useEffect(() => {
    const availableGateways = [
      {
        id: 'paytabs',
        name: 'PayTabs',
        displayName: 'PayTabs',
        logo: '/images/paytabs-logo.png',
        description: 'Secure payment processing for the Middle East',
        supportedMethods: ['credit_card', 'debit_card', 'apple_pay'],
        processingTime: '1-2 business days',
        feePercentage: 2.9,
        fixedFee: 0,
        isRecommended: false, // Changed from true to false
        isDisabled: true, // Added disabled state
        disabledReason: 'Currently unavailable',
        features: ['3D Secure', 'Fraud Protection', 'Multi-currency'],
        countries: ['UAE', 'Saudi Arabia', 'Egypt'],
        primaryCurrency: 'SAR',
        currencyNote: currency !== 'SAR' ? `Amount will be converted to SAR` : null,
        statusNote: 'PayTabs is currently unavailable. Please use Stripe for payment.'
      },
      {
        id: 'stripe',
        name: 'Stripe',
        displayName: 'Stripe',
        logo: '/images/stripe-logo.png',
        description: 'Global payment platform trusted worldwide',
        supportedMethods: ['credit_card', 'debit_card', 'apple_pay', 'google_pay'],
        processingTime: '2-7 business days',
        feePercentage: 2.9,
        fixedFee: 0.29, // USD
        isRecommended: true, // Changed from false to true
        isDisabled: false, // Added enabled state
        features: ['Advanced Security', 'Global Coverage', 'Developer Friendly'],
        countries: ['Global'],
        primaryCurrency: 'USD'
      },
      {
        id: 'paypal',
        name: 'PayPal',
        displayName: 'PayPal',
        logo: '/images/paypal-logo.png',
        description: 'Pay with your PayPal account or credit card',
        supportedMethods: ['paypal', 'credit_card'],
        processingTime: '1-3 business days',
        feePercentage: 3.4,
        fixedFee: 0,
        isRecommended: false,
        isDisabled: false, // Added disabled state
        disabledReason: 'Currently unavailable',
        features: ['Buyer Protection', 'Easy Checkout', 'Mobile Optimized'],
        countries: ['Global'],
        primaryCurrency: 'USD',
        statusNote: 'PayPal is currently unavailable. Please use Stripe for payment.'
      }
    ];

    // Calculate fees for each gateway
    const fees = {};
    availableGateways.forEach(gateway => {
      const fee = (amount * gateway.feePercentage / 100) + gateway.fixedFee;
      fees[gateway.id] = {
        fee: Math.round(fee * 100) / 100,
        percentage: gateway.feePercentage,
        fixed: gateway.fixedFee
      };
    });
    console.log('Fees====================:', fees);
    setGateways(availableGateways);
    setFeeComparison(fees);
    setLoading(false);

    // Auto-select Stripe if no gateway is selected and it's the only available option
    const enabledGateways = availableGateways.filter(gateway => !gateway.isDisabled);
    if (!selectedGateway && enabledGateways.length === 1 && enabledGateways[0].id === 'stripe') {
      onGatewaySelect(enabledGateways[0]);
    }
  }, [amount, selectedGateway, onGatewaySelect]);

  const handleGatewaySelect = (gateway) => {
    // Prevent selection of disabled gateways
    if (gateway.isDisabled) {
      return;
    }
    onGatewaySelect(gateway);
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className} sm:px-0`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("choose_payment_method")}
        </h3>
        <p className="text-sm text-gray-600">{t("select_payment_gateway")}</p>
      </div>

      <div className="grid gap-4">
        {gateways.map((gateway) => {
          const isSelected = selectedGateway?.id === gateway.id;
          const gatewayFee = feeComparison[gateway.id];
          const isDisabled = gateway.isDisabled;

          return (
            <div
              key={gateway.id}
              className={`relative border rounded-lg p-4 transition-all duration-200 ${isDisabled
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                : isSelected
                  ? 'border-teal-500 bg-teal-50 cursor-pointer'
                  : 'border-gray-200 hover:border-gray-300 bg-white cursor-pointer'
                }`}
              onClick={() => !isDisabled && handleGatewaySelect(gateway)}
            >
              {/* Label */}
              {(gateway.isRecommended || isDisabled) && (
                <div className="absolute -top-2 ltr:left-4 rtl:right-4">
                  <span className={`text-white text-xs px-2 py-1 rounded-full ${isDisabled ? 'bg-gray-400' : 'bg-teal-500'
                    }`}>
                    {isDisabled ? 'Unavailable' : 'Recommended'}
                  </span>
                </div>
              )}

              {/* Main content */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1 ">
                      <h4 className={`font-semibold ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                        {gateway.displayName}
                      </h4>
                      <Shield className={`w-4 h-4 ${isDisabled ? 'text-gray-400' : 'text-green-500'}`} />
                      {isDisabled && (
                        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                          {gateway.disabledReason}
                        </span>
                      )}
                    </div>

                    <p className={`text-sm mb-2 ${isDisabled ? 'text-gray-500' : 'text-gray-600'}`}>
                      {gateway.description}
                    </p>

                    {/* Feature Icons */}
                    <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs ltr:ml-5 rtl:mr-5 ${isDisabled ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                      <div className="flex items-center space-x-1 rtl:space-x-reverse">
                        <Clock className="w-3 h-3" />
                        <span>{isDisabled ? 'N/A' : gateway.processingTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3" />
                        <span>
                          {isDisabled
                            ? 'N/A'
                            : `${gatewayFee?.percentage}% + ${currency} ${gatewayFee?.fixed}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fee Summary */}
                <div className="text-left rtl:text-right shrink-0">
                  <div className={`text-sm font-semibold ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                    {isDisabled ? 'N/A' : `${currency} ${gatewayFee?.fee}`}
                  </div>
                  <div className={`text-xs ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                   {t("processing_fee")}
                  </div>
                </div>
              </div>

              {/* Expanded Section */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Key Features</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {gateway.features.map((feature, index) => (
                          <li key={index} className="flex items-center space-x-1 rtl:space-x-reverse">
                            <div className="w-1 h-1 bg-teal-500 rounded-full" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Coverage</h5>
                      <div className="text-xs text-gray-600">{gateway.countries.join(', ')}</div>
                    </div>
                  </div>

                  {gateway.currencyNote && (
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 flex items-center gap-2">
                      💱 {gateway.currencyNote}
                    </div>
                  )}

                  {/* {gateway.statusNote && (
                    <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700 flex items-center gap-2">
                      ⚠️ {gateway.statusNote}
                    </div>
                  )} */}
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && !isDisabled && (
                <div className="absolute top-4 ltr:right-4 rtl:left-4">
                  <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentGatewaySelector;
