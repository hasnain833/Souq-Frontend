import React, { useState, useEffect } from 'react';
import { Wallet, Eye, EyeOff, TrendingUp, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getWallet, formatCurrency } from '../../api/WalletService';

const WalletBalance = ({ showDetails = true, className = '' }) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const response = await getWallet();
      if (response.success) {
        setWallet(response.data.wallet);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-teal-600" />
          <span className="text-sm font-medium text-gray-700">My Wallet</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-3">
        {showBalance ? (
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(wallet?.totalBalance || 0, wallet?.primaryCurrency || 'AED')}
          </div>
        ) : (
          <div className="text-2xl font-bold text-gray-900">••••••</div>
        )}
        <div className="text-sm text-gray-500">
          Available Balance
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="space-y-2">
          {/* Currency Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(wallet?.balances || {}).map(([currency, balance]) => (
              balance > 0 && (
                <div key={currency} className="flex justify-between">
                  <span className="text-gray-500">{currency}:</span>
                  <span className="font-medium">
                    {showBalance ? formatCurrency(balance, currency) : '••••'}
                  </span>
                </div>
              )
            ))}
          </div>

          {/* Statistics */}
          {wallet?.statistics && (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <TrendingUp className="w-3 h-3" />
                <span>Total Earned:</span>
              </div>
              <span className="text-xs font-medium text-green-600">
                {showBalance 
                  ? formatCurrency(wallet.statistics.totalEarned || 0, wallet.primaryCurrency)
                  : '••••'
                }
              </span>
            </div>
          )}

          {/* Action Link */}
          <Link
            to="/settings"
            className="block w-full text-center py-2 mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
          >
            Manage Wallet
          </Link>
        </div>
      )}
    </div>
  );
};

export default WalletBalance;
