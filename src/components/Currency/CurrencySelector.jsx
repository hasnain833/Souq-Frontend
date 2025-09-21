import React, { useState, useEffect } from 'react';
import { ChevronDown, Globe, TrendingUp } from 'lucide-react';
import { getSupportedCurrencies, getExchangeRates } from '../../api/CurrencyService';

const CurrencySelector = ({
  selectedCurrency = 'USD',
  onCurrencyChange,
  showRates = false,
  className = '',
  disabled = false
}) => {
  // Add error boundary state
  const [hasError, setHasError] = useState(false);
  const [currencies, setCurrencies] = useState({
    'USD': { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
    'AED': { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rate: 3.6738 },
    'EUR': { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.9134 },
    'GBP': { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.7918 },
    'SAR': { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', rate: 3.7507 }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exchangeRates, setExchangeRates] = useState({});

  useEffect(() => {
    try {
      loadCurrencies();
      if (showRates) {
        loadExchangeRates();
      }
    } catch (error) {
      console.error('Error in CurrencySelector useEffect:', error);
      setHasError(true);
    }
  }, [showRates]);

  const loadCurrencies = async () => {
    try {
      console.log('CurrencySelector: Loading currencies from API...');
      const response = await getSupportedCurrencies();
      console.log('CurrencySelector: API response:', response);

      if (response.success && response.data && response.data.currencies) {
        // Validate that the response has the expected structure
        const apiCurrencies = response.data.currencies;
        if (apiCurrencies && typeof apiCurrencies === 'object' && apiCurrencies.USD) {
          console.log('CurrencySelector: Updating currencies from API:', apiCurrencies);
          setCurrencies(apiCurrencies);
        } else {
          console.log('CurrencySelector: API response missing USD or invalid structure, keeping default currencies');
        }
      } else {
        console.log('CurrencySelector: API failed or no data, keeping default currencies');
      }
    } catch (error) {
      console.error('CurrencySelector: Error loading currencies:', error);
      console.log('CurrencySelector: Keeping default currencies due to error');
    }
  };

  const loadExchangeRates = async () => {
    try {
      const response = await getExchangeRates({ baseCurrency: 'USD' });
      
      if (response.success) {
        setExchangeRates(response.data.rates);
      }
    } catch (error) {
      console.error('Error loading exchange rates:', error);
    }
  };

  const handleCurrencySelect = (currencyCode) => {
    try {
      if (onCurrencyChange && typeof onCurrencyChange === 'function') {
        onCurrencyChange(currencyCode);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error in handleCurrencySelect:', error);
      setHasError(true);
    }
  };

  const formatRate = (rate) => {
    if (rate === 1) return '1.00';
    return rate < 1 ? rate.toFixed(4) : rate.toFixed(2);
  };

  // Debug logging
  console.log('CurrencySelector render - currencies:', currencies);
  console.log('CurrencySelector render - selectedCurrency:', selectedCurrency);
  console.log('CurrencySelector render - loading:', loading);

  // Ensure we always have a valid currencies object and selectedCurrencyData
  const safeCurrencies = currencies && typeof currencies === 'object' ? currencies : {
    'USD': { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 }
  };

  const selectedCurrencyData = safeCurrencies[selectedCurrency] || {
    code: selectedCurrency,
    name: selectedCurrency,
    symbol: selectedCurrency === 'USD' ? '$' : selectedCurrency,
    rate: 1
  };

  // Error fallback
  if (hasError) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-between w-full px-3 py-3 text-sm border border-red-300 rounded-lg bg-red-50">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Globe className="w-4 h-4 text-red-500" />
            <span className="font-medium text-red-700">USD</span>
          </div>
          <span className="text-xs text-red-600">Error loading currencies</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center justify-between w-full px-3 py-3 text-sm border border-gray-300 rounded-lg
          bg-white hover:bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:border-transparent
          transition-colors duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Globe className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">
            {selectedCurrencyData?.symbol || selectedCurrency}
          </span>
          <span className="text-gray-600">
            {selectedCurrency}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
          isOpen ? 'transform rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
            <div className="py-1">
              {safeCurrencies && Object.entries(safeCurrencies).length > 0 ? (
                Object.entries(safeCurrencies).map(([code, currency]) => {
                // Add safety checks for currency object
                if (!currency || typeof currency !== 'object') {
                  return null;
                }

                const isSelected = code === selectedCurrency;
                const rate = exchangeRates && exchangeRates[code];

                return (
                  <button
                    key={code}
                    onClick={() => handleCurrencySelect(code)}
                    className={`
                      w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors duration-150
                      ${isSelected ? 'bg-teal-50 text-teal-700' : 'text-gray-900'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <span className="font-medium text-lg">
                          {currency.symbol || code}
                        </span>
                        <div>
                          <div className="font-medium">{code}</div>
                          <div className="text-xs text-gray-500">
                            {currency.name || code}
                          </div>
                        </div>
                      </div>
                      
                      {showRates && rate && code !== 'USD' && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatRate(rate)}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1 rtl:ml-2" />
                            vs USD
                          </div>
                        </div>
                      )}
                      
                      {isSelected && (
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      )}
                    </div>
                  </button>
                );
                }).filter(Boolean)
              ) : (
                <div className="px-3 py-2 text-gray-500 text-center">
                  Loading currencies...
                </div>
              )}
            </div>
            
            {showRates && (
              <div className="border-t border-gray-200 px-3 py-2 bg-gray-50">
                <div className="text-xs text-gray-500 text-center">
                  Exchange rates updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CurrencySelector;
