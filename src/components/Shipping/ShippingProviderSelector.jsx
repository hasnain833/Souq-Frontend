import React, { useState, useEffect } from 'react';
import { Truck, Clock, Star } from 'lucide-react';
import ShippingService from '../../api/ShippingService';

const ShippingProviderSelector = ({ 
  fromAddress, 
  toAddress, 
  packageDetails, 
  onProviderSelect,
  selectedProvider 
}) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      if (!fromAddress || !toAddress || !packageDetails) return;

      setLoading(true);
      setError(null);

      try {
        const rates = await ShippingService.getShippingRates(
          fromAddress,
          toAddress,
          packageDetails
        );
        
        if (rates.success) {
          setProviders(rates.data.rates || []);
        } else {
          setError(rates.error || 'Failed to fetch shipping rates');
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch shipping rates');
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [fromAddress, toAddress, packageDetails]);

  const getProviderLogo = (provider) => {
    const logos = {
      'aramex': '🚚',
      'emirates_post': '📮',
      'fedex': '📦',
      'dhl': '🚛',
      'ups': '📫'
    };
    return logos[provider] || '📦';
  };

  const formatDeliveryTime = (days) => {
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    const weeks = Math.ceil(days / 7);
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading shipping rates</p>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="text-center py-8">
        <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No shipping options available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium mb-4">Select Shipping Provider</h3>
      {providers.map((provider) => (
        <div
          key={`${provider.provider}-${provider.serviceType}`}
          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
            selectedProvider?.provider === provider.provider && 
            selectedProvider?.serviceType === provider.serviceType
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onProviderSelect(provider)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getProviderLogo(provider.provider)}</span>
              <div>
                <p className="font-medium capitalize">
                  {provider.provider.replace('_', ' ')} - {provider.serviceType}
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Delivery: {formatDeliveryTime(provider.estimatedDays)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">AED {provider.rate.toFixed(2)}</p>
              <p className="text-sm text-gray-500">
                {provider.currency}
              </p>
            </div>
          </div>
          
          {provider.features && provider.features.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {provider.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ShippingProviderSelector;