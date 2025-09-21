import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { RefreshCw, Filter, ChevronLeft, ChevronRight, BarChart3, X } from 'lucide-react';
import { getWithdrawalHistory, checkWithdrawalStatus, getWithdrawalStats, formatCurrency } from '../../api/WalletService';
import WithdrawalTransactionCard from './WithdrawalTransactionCard';
import { useTranslation } from 'react-i18next';

const WithdrawalHistory = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState('30d');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTransactions: 0,
    hasNext: false,
    hasPrev: false
  });
  const [filters, setFilters] = useState({
    status: '', // Explicitly set to empty string for "All"
    method: '',
    page: 1,
    limit: 10
  });

  // Force reset when component mounts or modal opens
  const resetToDefaults = () => {
    setFilters({
      status: '',
      method: '',
      page: 1,
      limit: 10
    });
    setWithdrawals([]);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalTransactions: 0,
      hasNext: false,
      hasPrev: false
    });
  };

  useEffect(() => {
    if (isOpen) {
      resetToDefaults();
      loadWithdrawalStats(statsPeriod);
    } else {
      // Reset state when modal closes
      setWithdrawals([]);
      setStats(null);
      setShowStats(false);
      setLoading(false);
      setRefreshing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (showStats) {
      loadWithdrawalStats(statsPeriod);
    }
  }, [statsPeriod, showStats]);

  // Separate effect for filter changes
  useEffect(() => {
    if (isOpen) {
      loadWithdrawals();
    }
  }, [filters]);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await getWithdrawalHistory(filters);

      if (response && response.success) {
        const transactions = response.data.data?.transactions || [];
        const pagination = response.data.data?.pagination || {};

        setWithdrawals(transactions);
        setPagination(pagination);
      } else {
        toast.error(response?.message || 'Failed to load withdrawal history');
      }
    } catch (error) {
      console.error('Error loading withdrawals:', error);
      toast.error('Failed to load withdrawal history');
    } finally {
      setLoading(false);
    }
  };

  const loadWithdrawalStats = async (period = '30d') => {
    try {
      const response = await getWithdrawalStats(period);
      
      if (response && response.success) {
        setStats(response.data);
      } else {
        console.error('Failed to load withdrawal stats:', response?.message || 'Unknown error');
        // Set empty stats to prevent undefined errors
        setStats({
          period: period,
          summary: {
            totalWithdrawals: 0,
            totalAmount: 0,
            totalFees: 0,
            totalNet: 0,
            completedWithdrawals: 0,
            pendingWithdrawals: 0,
            failedWithdrawals: 0
          },
          byStatus: {},
          byMethod: {}
        });
      }
    } catch (error) {
      console.error('Error loading withdrawal stats:', error);
      // Set empty stats to prevent undefined errors
      setStats({
        period: period,
        summary: {
          totalWithdrawals: 0,
          totalAmount: 0,
          totalFees: 0,
          totalNet: 0,
          completedWithdrawals: 0,
          pendingWithdrawals: 0,
          failedWithdrawals: 0
        },
        byStatus: {},
        byMethod: {}
      });
    }
  };

  const refreshWithdrawalStatus = async (transactionId) => {
    setRefreshing(true);
    try {
      const response = await checkWithdrawalStatus(transactionId);

      if (response.success) {
        // Update the specific withdrawal in the list
        setWithdrawals(prev => prev.map(withdrawal =>
          withdrawal.transactionId === transactionId
            ? { ...withdrawal, ...response.data }
            : withdrawal
        ));

        toast.success('Status updated successfully');
      } else {
        toast.error('Failed to refresh status');
      }
    } catch (error) {
      console.error('Error refreshing status:', error);
      toast.error('Failed to refresh status');
    } finally {
      setRefreshing(false);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handleMethodFilter = (method) => {
    setFilters(prev => ({ ...prev, method, page: 1 }));
  };

  const getStatusFilterClass = (status) => {
    const isActive = filters.status === status;
    return isActive
      ? 'bg-teal-600 text-white'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  };

  const getMethodFilterClass = (method) => {
    const isActive = filters.method === method;
    return isActive
      ? 'bg-blue-600 text-white'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{t("withdrawalHistory")}</h2>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`p-2 transition-colors ${showStats ? 'text-blue-600 bg-blue-100' : 'text-gray-400 hover:text-gray-600'}`}
              title="Toggle Statistics"
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button
              onClick={loadWithdrawals}
              disabled={loading || refreshing}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${(loading || refreshing) ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Statistics Panel */}
        {showStats && stats && (
          <div className="p-6 border-b bg-blue-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Withdrawal Statistics</h3>
              <select
                value={statsPeriod}
                onChange={(e) => setStatsPeriod(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-2xl font-bold text-gray-900">{stats?.summary?.totalWithdrawals || 0}</div>
                <div className="text-sm text-gray-600">Total Withdrawals</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-2xl font-bold text-green-600">{stats?.summary?.completedWithdrawals || 0}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-2xl font-bold text-yellow-600">{stats?.summary?.pendingWithdrawals || 0}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-2xl font-bold text-red-600">{stats?.summary?.failedWithdrawals || 0}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-lg font-semibold text-gray-900">{formatCurrency(stats?.summary?.totalAmount || 0, 'USD')}</div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-lg font-semibold text-gray-900">{formatCurrency(stats?.summary?.totalFees || 0, 'USD')}</div>
                <div className="text-sm text-gray-600">Total Fees</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-lg font-semibold text-green-600">{formatCurrency(stats?.summary?.totalNet || 0, 'USD')}</div>
                <div className="text-sm text-gray-600">Net Amount</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="space-y-4">
            {/* Status Filters */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{t("filterByStatus")}:</span>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => handleStatusFilter('')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${getStatusFilterClass('')}`}
                >
                  {t("all")}
                </button>
                <button
                  onClick={() => handleStatusFilter('pending')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${getStatusFilterClass('pending')}`}
                >
                  {t("pending")}
                </button>
                <button
                  onClick={() => handleStatusFilter('processing')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${getStatusFilterClass('processing')}`}
                >
                  Processing
                </button>
                <button
                  onClick={() => handleStatusFilter('completed')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${getStatusFilterClass('completed')}`}
                >
                  {t("completed")}
                </button>
                <button
                  onClick={() => handleStatusFilter('failed')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${getStatusFilterClass('failed')}`}
                >
                  {t("failed")}
                </button>
              </div>
            </div>
            
            {/* Method Filters */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-sm font-medium text-gray-700">Filter by Method:</span>
              <div className="flex space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => handleMethodFilter('')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${getMethodFilterClass('')}`}
                >
                  All Methods
                </button>
                <button
                  onClick={() => handleMethodFilter('bank_transfer')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${getMethodFilterClass('bank_transfer')}`}
                >
                  Bank Transfer
                </button>
                <button
                  onClick={() => handleMethodFilter('paypal')}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${getMethodFilterClass('paypal')}`}
                >
                  PayPal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
              <span className="ml-2 text-gray-600">{t("loadingWithdrawals")}...</span>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16  mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{t("noWithdrawalsFound")}</h3>
              <p className="text-gray-500">
                {filters.status || filters.method
                  ? `No withdrawals found with current filters`
                  : t("noWithdrawalsYet")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <WithdrawalTransactionCard
                  key={withdrawal.transactionId || withdrawal.id}
                  transaction={withdrawal}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div className="text-sm text-gray-700">
              {t("showing")} {withdrawals.length} {t("of")} {pagination.totalTransactions} {t("withdrawals")}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-700">
                {t("page")} {pagination.currentPage} {t("of")} {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalHistory;
