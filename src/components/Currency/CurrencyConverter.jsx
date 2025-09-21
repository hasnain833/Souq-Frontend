import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Calculator, RefreshCw } from 'lucide-react';
import { convertCurrency, getExchangeRates } from '../../api/CurrencyService';
import CurrencySelector from './CurrencySelector';

const CurrencyConverter = ({
  initialAmount = 100,
  initialFromCurrency = 'USD',
  initialToCurrency = 'AED',
  onConversionChange,
  className = ''
}) => {
  const [amount, setAmount] = useState(initialAmount);
  const [fromCurrency, setFromCurrency] = useState(initialFromCurrency);
  const [toCurrency, setToCurrency] = useState(initialToCurrency);
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (amount > 0) {
      handleConvert();
    }
  }, [amount, fromCurrency, toCurrency]);

  const handleConvert = async () => {
    if (!amount || amount <= 0) {
      setConvertedAmount(0);
      setExchangeRate(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await convertCurrency({
        amount: parseFloat(amount),
        fromCurrency,
        toCurrency
      });

      if (response.success) {
        const { convertedAmount: converted, exchangeRate: rate, lastUpdated: updated } = response.data;
        
        setConvertedAmount(converted);
        setExchangeRate(rate);
        setLastUpdated(updated);

        // Notify parent component of conversion
        if (onConversionChange) {
          onConversionChange({
            originalAmount: amount,
            fromCurrency,
            convertedAmount: converted,
            toCurrency,
            exchangeRate: rate
          });
        }
      } else {
        setError(response.error || 'Conversion failed');
      }
    } catch (error) {
      console.error('Currency conversion error:', error);
      setError('Failed to convert currency');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const formatAmount = (amount, currency) => {
    if (!amount) return '0.00';
    
    const symbols = {
      'AED': 'د.إ',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'SAR': 'ر.س'
    };

    const symbol = symbols[currency] || currency;
    const formatted = parseFloat(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    return ['AED', 'SAR'].includes(currency) 
      ? `${formatted} ${symbol}`
      : `${symbol}${formatted}`;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <Calculator className="w-5 h-5 text-teal-600" />
        <h3 className="text-lg font-semibold text-gray-900">Currency Converter</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            From
          </label>
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="w-32">
              <CurrencySelector
                selectedCurrency={fromCurrency}
                onCurrencyChange={setFromCurrency}
              />
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSwapCurrencies}
            className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors duration-200"
            title="Swap currencies"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            To
          </label>
          <div className="flex space-x-3">
            <div className="flex-1">
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <div className="text-lg font-semibold text-gray-900">
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Converting...</span>
                    </div>
                  ) : (
                    formatAmount(convertedAmount, toCurrency)
                  )}
                </div>
              </div>
            </div>
            <div className="w-32">
              <CurrencySelector
                selectedCurrency={toCurrency}
                onCurrencyChange={setToCurrency}
              />
            </div>
          </div>
        </div>

        {/* Exchange Rate Info */}
        {exchangeRate > 0 && !loading && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <span>Exchange Rate:</span>
                <span className="font-medium">
                  1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                </span>
              </div>
              {lastUpdated && (
                <div className="flex justify-between items-center mt-1">
                  <span>Last Updated:</span>
                  <span className="text-xs">
                    {new Date(lastUpdated).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Amount Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Amounts
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[100, 500, 1000, 5000].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                {quickAmount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Conversion Summary */}
        {convertedAmount > 0 && !loading && (
          <div className="border-t border-gray-200 pt-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatAmount(amount, fromCurrency)} = {formatAmount(convertedAmount, toCurrency)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Converted at rate: 1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyConverter;
