import { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Settings,
  Package,
  Eye,
  EyeOff,
  RefreshCw,
  Building2,
  Star,
  History
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  getWallet,
  getTransactionHistory,
  getWalletStatistics,
  withdrawMoney,
  updateWalletSettings,
  completePayment,
  getSellerOrders,
  formatCurrency,
  formatTransactionType,
  getTransactionIcon,
  getTransactionColor,
  checkWithdrawalStatus,
  getWithdrawalHistory
} from '../../api/WalletService';
import { getBankAccounts } from '../../api/PaymentMethodService';
import WithdrawalHistory from '../Wallet/WithdrawalHistory';

// Helper function for date formatting
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
import RatingPrompt from '../Rating/RatingPrompt';
import WalletSkeleton from '../Skeleton/WalletSkeleton';
import { useTranslation } from 'react-i18next';

const Wallet = () => {
  const { t } = useTranslation()
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionsPagination, setTransactionsPagination] = useState(null);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1);
  const [statistics, setStatistics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [totalOrdersAmount, setTotalOrdersAmount] = useState(0);
  const [ordersPagination, setOrdersPagination] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [currentOrderPage, setCurrentOrderPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    currency: 'AED', // Changed default to AED
    withdrawalMethod: 'bank_transfer',
    bankAccountId: '',
    description: ''
  });
  const [selectedCurrency, setSelectedCurrency] = useState('AED'); // Add currency selector state
  const [showWithdrawalHistory, setShowWithdrawalHistory] = useState(false);
  console.log('Wallet component rendered', orders);

  useEffect(() => {
    loadWalletData();
  
    // Set up auto-refresh every 30 seconds - COMMENTED OUT
    // const interval = setInterval(() => {
    //   loadWalletData();
    // }, 30000);
                                                  
    // return () => clearInterval(interval);
  }, []);

  // Update selected currency when wallet data loads
  useEffect(() => {
    if (wallet?.primaryCurrency) {
      setSelectedCurrency(wallet.primaryCurrency);
    }
  }, [wallet]);

  const loadBankAccounts = async () => {
    try {
      setLoadingBankAccounts(true);
      const response = await getBankAccounts();
      if (response.success) {
        setBankAccounts(response.data.accounts || []);
        // Set default bank account if none selected
        if (!withdrawalData.bankAccountId && response.data.accounts?.length > 0) {
          const defaultAccount = response.data.accounts.find(acc => acc.isDefault) || response.data.accounts[0];
          setWithdrawalData(prev => ({ ...prev, bankAccountId: defaultAccount._id }));
        }
      }
    } catch (error) {
      console.error('Failed to load bank accounts:', error);
      toast.error('Failed to load bank accounts');
    } finally {
      setLoadingBankAccounts(false);
    }
  };

  const loadWalletData = async () => {
    try {
      setLoading(true);

      // Load wallet details
      const walletResponse = await getWallet();

      if (walletResponse.success) {
        setWallet(walletResponse.data?.data?.wallet);
      } else {
        console.error('❌ Failed to load wallet:', walletResponse.message);
        toast.error(walletResponse.message || 'Failed to load wallet data');
      }

      // Load transaction history
      await loadTransactionsData(1);

      // Load statistics
      console.log('📈 Fetching wallet statistics...');
      const statsResponse = await getWalletStatistics();
      console.log('📈 Statistics response:', statsResponse);

      if (statsResponse.success && statsResponse.data) {
        setStatistics(statsResponse.data?.data);
        console.log('✅ Statistics loaded:', statsResponse.data);
        console.log('📊 Period stats:', statsResponse.data.period);
        console.log('📊 Overall stats:', statsResponse.data.overall);
      } else {
        console.warn('⚠️ Failed to load statistics:', statsResponse.message || 'No data');
        // Set default statistics structure
        setStatistics({
          period: { totalEarned: 0, totalSpent: 0, totalTransactions: 0 },
          overall: { totalWithdrawn: 0, totalEarned: 0, totalTransactions: 0 }
        });
      }

      // Load seller orders (first page)
      await loadOrdersData(1);

    } catch (error) {
      console.error('❌ Error loading wallet data:', error);
      toast.error('Failed to load wallet data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
      console.log('✅ Wallet data loading completed');
    }
  };
console.log(transactions,'transsssssssss')
  const loadTransactionsData = async (page = 1) => {
    try {
      setTransactionsLoading(true);
      console.log('📋 Fetching transaction history for page:', page);
      const transactionsResponse = await getTransactionHistory({ page, limit: 10 });
      console.log('📋 Transactions response:', transactionsResponse);

      if (transactionsResponse.success && transactionsResponse.data) {
        const transactionsData = transactionsResponse.data.data?.transactions || transactionsResponse.data.transactions || [];
        const pagination = transactionsResponse.data.data?.pagination || transactionsResponse.data.pagination || null;

        setTransactions(transactionsData);
        setTransactionsPagination(pagination);
        setCurrentTransactionPage(page);

        console.log('✅ Transactions loaded:', transactionsData);
        console.log('📊 Transaction count:', transactionsData.length);
        console.log('📊 Pagination:', pagination);
        if (transactionsData.length > 0) {
          console.log('📊 First transaction:', transactionsData[0]);
        }
      } else {
        console.warn('⚠️ Failed to load transactions:', transactionsResponse.message || 'No data');
        setTransactions([]); // Set empty array as fallback
        setTransactionsPagination(null);
      }
    } catch (error) {
      console.error('❌ Error loading transactions:', error);
      toast.error('Error loading transactions: ' + error.message);
      setTransactions([]);
      setTransactionsPagination(null);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const loadOrdersData = async (page = 1, calculateTotal = false) => {
    try {
      setOrdersLoading(true);
      console.log('📦 Loading seller orders for page:', page);

      // Use different limits based on purpose
      const limit = calculateTotal ? 100 : 20; // 100 for total calculation, 20 for pagination
      const ordersResponse = await getSellerOrders(page, limit);

      console.log('📦 Orders API Response:', ordersResponse);

      if (ordersResponse.success) {
        const ordersData = ordersResponse.data.data?.orders || [];
        const pagination = ordersResponse.data.pagination || null;

        console.log('📦 Orders Data:', ordersData);
        console.log('📦 Pagination:', pagination);

        setOrders(ordersData);
        setOrdersPagination(pagination);
        setCurrentOrderPage(page);

        // Calculate total amount from current page orders
        const total = ordersData.reduce((sum, order) => {
          // Use the correct field from API response
          const amount = order.orderDetails?.productPrice || order.payment?.fees?.total || 0;
          console.log(`📦 Order ${order.orderNumber}: $${amount}`);
          return sum + parseFloat(amount);
        }, 0);

        setTotalOrdersAmount(total);

        console.log(`📦 Loaded ${ordersData.length} orders for page ${page}, page total: $${total}`);
        console.log('📦 Orders state after setting:', ordersData);

        if (!calculateTotal) {
          toast.success(`Loaded ${ordersData.length} orders for page ${page}`);
        }
      } else {
        console.error('❌ Failed to load orders:', ordersResponse.message);
        console.error('❌ Full response:', ordersResponse);
        toast.error('Failed to load orders: ' + ordersResponse.message);
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      toast.error('Error loading orders: ' + error.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleCurrencyChange = async (newCurrency) => {
    try {
      setLoading(true);
      const response = await updateWalletSettings({
        primaryCurrency: newCurrency
      });

      if (response.success) {
        setSelectedCurrency(newCurrency);
        toast.success(`Primary currency updated to ${newCurrency}`);
        loadWalletData(); // Reload wallet data to reflect changes
      } else {
        toast.error(response.message || 'Failed to update currency');
      }
    } catch (error) {
      console.error('Currency update error:', error);
      toast.error(error.message || 'Failed to update currency');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
                                                                     
    // Validate bank account selection for bank transfer                                        
    if (withdrawalData.withdrawalMethod === 'bank_transfer' && !withdrawalData.bankAccountId) {
      toast.error('Please select a bank account for withdrawal');                    
      return;              
    }                
                          
    // Validate amount                                                     
    if (!withdrawalData.amount || parseFloat(withdrawalData.amount) <= 0) {            
      toast.error('Please enter a valid withdrawal amount');           
      return;        
    }          
                                           
    // Check if amount exceeds balance                                      
    const currentBalance = wallet?.balances?.[selectedCurrency] || 0;       
    if (parseFloat(withdrawalData.amount) > currentBalance) {                    
      toast.error(`Insufficient balance. Available: ${formatCurrency(currentBalance, selectedCurrency)}`);
      return;
    }
                     
    setLoading(true); 
                  
    try {                                                       
      const response = await withdrawMoney(withdrawalData);                

      if (response.success) {
        // Show detailed success message with processing information
        const bankAccount = bankAccounts.find(acc => acc._id === withdrawalData.bankAccountId);
        const bankName = bankAccount?.bankName || 'your bank account';
        const lastFour = bankAccount?.lastFourDigits || '';

        toast.success(
          <div>
            <div className="font-semibold">Withdrawal Submitted Successfully!</div>
            <div className="text-sm mt-1">
              {formatCurrency(withdrawalData.amount, selectedCurrency)} will be transferred to {bankName} ****{lastFour}
            </div>
            <div className="text-xs mt-1 text-gray-600">
              Processing time: 1-3 business days
            </div>
          </div>,
          { autoClose: 8000 }
        );

        setShowWithdrawModal(false);
        setWithdrawalData({
          amount: '',
          currency: selectedCurrency,
          withdrawalMethod: 'bank_transfer',
          bankAccountId: '',
          description: ''
        });

        // Refresh wallet data
        loadWalletData();

        // Show withdrawal details in console for debugging
        console.log('Withdrawal successful:', {
          transactionId: response.data?.transactionId,
          payoutId: response.data?.payoutId,
          status: response.data?.status,
          estimatedArrival: response.data?.estimatedArrival
        });

      } else {
        const errorMessage = response.error || response.message || 'Failed to process withdrawal';
        toast.error(
          <div>
            <div className="font-semibold">Withdrawal Failed</div>
            <div className="text-sm mt-1">{errorMessage}</div>
          </div>
        );
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to process withdrawal';
      toast.error(
        <div>
          <div className="font-semibold">Withdrawal Error</div>
          <div className="text-sm mt-1">{errorMessage}</div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'cancelled': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'escrow': return 'bg-purple-100 text-purple-700';
      case 'standard': return 'bg-blue-100 text-blue-700';
      case 'stripe': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };


  const handleCompleteOrderPayment = async (order) => {
    try {
      console.log('💰 Completing order payment:', order);
      console.log('💰 Order details:', {
        transactionId: order.payment?.transactionId,
        transactionType: order.type,
        orderNumber: order.orderNumber,
        orderId: order._id,
        fullOrder: order
      });

      // For escrow orders, we need to use the order ID to find the escrow transaction
      let transactionId = order.payment?.transactionId;

      // If it's an escrow order, try multiple approaches to find the transaction
      if (order.type === 'escrow') {
        console.log('🛡️ Escrow order detected, trying multiple transaction ID approaches:');
        console.log(`🛡️   - Order payment.transactionId: ${order.payment?.transactionId}`);
        console.log(`🛡️   - Order number: ${order.orderNumber}`);
        console.log(`🛡️   - Order _id: ${order._id}`);

        // Try the order ID first (most likely to work for escrow)
        transactionId = order._id;
        console.log(`🛡️   - Using order._id as transaction ID: ${transactionId}`);
      }

      // Validate transaction ID exists
      if (!transactionId) {
        toast.error(`Order ${order.orderNumber} has no transaction ID`);
        return;
      }

      const paymentData = {
        transactionId: transactionId,
        transactionType: order.type // Let backend auto-detect the type
      };

      console.log('💰 Sending payment completion request:', paymentData);

      const response = await completePayment(paymentData);

      console.log('💰 Payment completion response:', response);

      if (response.success) {
        if (response.data.alreadyCompleted) {
          toast.info(`Order ${order.orderNumber} payment was already completed`);
        } else if (response.data.walletCredited) {
          toast.success(`Order ${order.orderNumber} payment completed! Wallet credited: ${response.data.currency} ${response.data.sellerAmount}`);
        } else {
          toast.info(`Order ${order.orderNumber} payment processed (no wallet credit needed)`);
        }

        // Mark this order as payment completed to hide the button
        setOrders(prevOrders =>
          prevOrders.map(o =>
            o._id === order._id
              ? { ...o, paymentCompleted: true }
              : o
          )
        );

        // Refresh wallet and orders data
        await loadWalletData();
        await loadOrdersData();
      } else {
        const errorMessage = response.message || response.error || 'Unknown error occurred';
        console.error('💰 Payment completion failed:', errorMessage);
        toast.error(`Failed to complete order ${order.orderNumber}: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Complete order payment error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Unknown error occurred';

      toast.error(`Failed to complete order ${order.orderNumber}: ${errorMessage}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      // <div className="flex items-center justify-center h-64">
      //   <div className="text-center">
      //     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
      //     <p className="text-gray-600">Loading wallet data...</p>
      //   </div>
      // </div>
      <WalletSkeleton />
    );
  }

  // Show error state if wallet failed to load
  if (!wallet) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <WalletIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Not Available</h3>
          <p className="text-gray-600 mb-4">
            We're having trouble loading your wallet. Please try again.
          </p>
          <button
            onClick={loadWalletData}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <WalletIcon className="w-8 h-8 text-teal-600" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{t("myWallet")}</h1>
            <p className="text-sm md:text-base text-gray-600">
              {t("manageEarningsWithdrawals")}
            </p>
          </div>
        </div>
        <button
          onClick={loadWalletData}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4 mr-2 rtl:ml-2" />
          {t("refresh")}
        </button>
      </div>

      {/* Currency Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">{t("primaryCurrency")}</h3>
            <p className="text-xs text-gray-500">{t("choosePreferredCurrency")}</p>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            {['USD', 'AED', 'EUR', 'GBP'].map((currency) => (
              <button
                key={currency}
                onClick={() => handleCurrencyChange(currency)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${selectedCurrency === currency
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                disabled={loading}
              >
                {currency}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Balance */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-sm">{t("totalBalance")}</p>
              <div className="flex items-center space-x-2">
                {showBalance ? (
                  <h3 className="text-2xl font-bold">
                    ${(statistics?.totalBalance || wallet?.totalBalance || 0).toFixed(2)}
                  </h3>
                ) : (
                  <h3 className="text-2xl font-bold">••••••</h3>
                )}
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-teal-100 hover:text-white"
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-teal-200" />
          </div>
        </div>

        {/* This Month Earned */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t("thisMonthEarned")}</p>
              <h3 className="text-xl font-bold text-gray-900">
                ${(statistics?.period?.totalEarned || 0).toFixed(2)}
              </h3>
            </div>
            <TrendingUp className="w-6 h-6 text-green-500" />
          </div>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t("totalWithdrawn")}</p>
              <h3 className="text-xl font-bold text-gray-900">
                ${(statistics?.overall?.totalWithdrawn || 0).toFixed(2)}
              </h3>
            </div>
            <TrendingDown className="w-6 h-6 text-blue-500" />
          </div>
        </div>

        {/* Total Orders Amount */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">{t("totalOrdersValue")}</p>
              <h3 className="text-xl font-bold">
                ${totalOrdersAmount.toFixed(2)}
              </h3>
              <p className="text-purple-200 text-xs mt-1">
                {orders.length} {t("orders")} | {orders.filter(o => o.status === 'pending').length} {t("pending")}
              </p>
              <p className="text-purple-200 text-xs">
                {t("potentialWalletCredit")}: ${orders.filter(o => o.status === 'pending').reduce((sum, order) => {
                  const amount = order.orderDetails?.productPrice || 0;
                  const platformFee = amount * 0.1; // 10% platform fee
                  return sum + (amount - platformFee);
                }, 0).toFixed(2)}
              </p>
            </div>
            <Package className="w-6 h-6 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {/* <div className="flex flex-wrap gap-4 mb-8"> */}
      
        {/* <button
          onClick={async () => {
            setShowWithdrawModal(true);
            await loadBankAccounts();
          }}
          className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Download className="w-4 h-4 mr-2 rtl:ml-2" />
          {t("withdrawMoney")}
        </button>
        <button
          onClick={() => setShowWithdrawalHistory(true)}
          className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <History className="w-4 h-4 mr-2 rtl:ml-2" />
          {t("withdrawalHistory")}
        </button> */}


        {/* <button className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <Settings className="w-4 h-4 mr-2" />
          Wallet Settings
        </button> */}
        {/* 
        <button
          onClick={() => loadOrdersData(currentOrderPage)}
          disabled={ordersLoading}
          className="flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${ordersLoading ? 'animate-spin' : ''}`} />
          {ordersLoading ? 'Loading...' : 'Refresh Orders'}
        </button> */}

        {/* <button
          onClick={async () => {
            console.log('🔄 Manual wallet refresh...');
            await loadWalletData();
            toast.success('Wallet data refreshed!');
          }}
          disabled={loading}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Wallet'}
        </button> */}
        {/* <button
          onClick={async () => {
            const pendingOrders = orders.filter(order =>
              order.status === 'pending' || order.payment?.status === 'pending'
            );

            if (pendingOrders.length === 0) {
              toast.info('No pending orders to complete on this page');
              return;
            }

            const confirmed = window.confirm(
              `Complete payments for ${pendingOrders.length} pending orders on this page? This will credit your wallet.`
            );

            if (confirmed) {
              for (const order of pendingOrders) {
                await handleCompleteOrderPayment(order);
                // Small delay between requests
                await new Promise(resolve => setTimeout(resolve, 500));
              }
              // Refresh current page after completing payments
              await loadOrdersData(currentOrderPage);
            }
          }}
          disabled={orders.filter(o => o.status === 'pending').length === 0}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Complete All Pending ({orders.filter(o => o.status === 'pending').length})
        </button> */}
      {/* </div> */}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex flex-wrap gap-4 sm:space-x-8">
          {[
            { id: 'overview', label: t('overview') },
            { id: 'transactions', label: t('transactions') },
            { id: 'orders', label: t('orders') },
            { id: 'statistics', label: t('statistics') }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-1.5 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors ${activeTab === tab.id
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>


      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Currency Balances */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("currencyBalances")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(statistics?.balances || wallet?.balances || {}).map(([currency, balance]) => (
                <div key={currency} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">{currency}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(balance, currency)}
                  </p>
                  {currency === selectedCurrency && (
                    <p className="text-xs text-teal-600 mt-1">{t("primary")}</p>
                  )}
                </div>
              ))}
            </div>
            {statistics?.totalBalance && (
              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">{t("totalBalance")}</p>
                <p className="text-xl font-bold text-teal-600">
                  ${statistics.totalBalance.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t("recentTransactions")}</h3>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-teal-600 hover:text-teal-700 text-sm font-medium"
              >
               {t("viewAll")}
              </button>
            </div>

            <div className="space-y-3">
              {transactions && transactions.length > 0 ? (
                transactions.slice(0, 3).map((transaction) => (
                  <div
                    key={transaction._id || transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-start space-x-3 rtl:space-x-reverse">
                      <span className="text-lg mt-1">{getTransactionIcon(transaction.type)}</span>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {formatTransactionType(transaction.type)}
                        </p>
                        <p className="text-gray-600">
                          {transaction.description || 'Transaction'}
                        </p>
                        {transaction.relatedEscrowTransaction?.product && (
                          <p className="text-xs text-purple-600">
                            {transaction.relatedEscrowTransaction.product.title}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right mt-2 sm:mt-0">
                      <p className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t("noRecentTransactions")}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {t("transactionsAppearAfterSales")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Wallet Transactions */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">{t("walletTransactions")}</h3>
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                {transactionsPagination && (
                  <div className="text-sm text-gray-600">
                    Page {transactionsPagination.currentPage} of {transactionsPagination.totalPages}
                    ({transactionsPagination.totalTransactions} total)
                  </div>
                )}
                <button
                  onClick={() => loadTransactionsData(currentTransactionPage)}
                  disabled={transactionsLoading}
                  className="flex items-center px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 rtl:ml-2 ${transactionsLoading ? 'animate-spin' : ''}`} />
                  {transactionsLoading ? 'Loading...' : t('refresh')}
                </button>
              </div>
            </div>

            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <span className="ml-2 text-gray-600">Loading transactions...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.length > 0 ? transactions.map((transaction) => (
                  <div key={transaction._id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start space-x-4 rtl:space-x-reverse">
                      <div className="flex-shrink-0 mt-1">
                        <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                      </div>
                      <div className="flex-1">
                        {transaction.metadata?.transactionType == "standard" && (
                            <div className="mt-2 p-2 bg-teal-80 rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{formatTransactionType(transaction.type)}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${transaction.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {transaction.status}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-blue-600 mt-1">{transaction.description}</p>
                        <p className="text-[10px] sm:text-xs text-blue-500 mt-1">ID: {transaction.transactionId}</p>
                              </div>  
                        ) }
 
                           
                        {/* Escrow Transaction Details */}
                        {transaction.relatedEscrowTransaction && (
                          <div className="mt-2 p-2 bg-teal-80 rounded-lg border border-teal-200">
                               <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <p className="font-medium text-gray-900 text-sm sm:text-base">{formatTransactionType(transaction.type)}</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${transaction.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {transaction.status}
                          </span>
                             </div>
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              {transaction.relatedEscrowTransaction.product?.product_photos?.[0] && (
                                <img
                                  src={transaction.relatedEscrowTransaction.product.product_photos[0]}
                                  alt={transaction.relatedEscrowTransaction.product.title}
                                  className="w-8 h-8 object-cover rounded"
                                />
                              )}
                              <div>
                                <p className="text-[10px] sm:text-xs font-medium text-teal-700">
                                  {transaction.relatedEscrowTransaction.product?.title}
                                </p>
                                <p className="text-[10px] sm:text-xs text-teal-600">
                                  Buyer: {transaction.relatedEscrowTransaction.buyer?.firstName} {transaction.relatedEscrowTransaction.buyer?.lastName}
                                </p>
                                <p className="text-[10px] sm:text-xs text-teal-600">
                                  Order: {transaction.relatedEscrowTransaction.transactionId}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                           
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-base sm:text-lg font-semibold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Balance: ${transaction.balanceAfter.toFixed(2)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t("noWalletTransactions")}</p>
                    <p className="text-sm text-gray-400 mt-1">{t("transactionsAppearAfterPayments")}</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {transactionsPagination && transactionsPagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {t("showing")} {((transactionsPagination.currentPage - 1) * 10) + 1} to {Math.min(transactionsPagination.currentPage * 10, transactionsPagination.totalTransactions)} of {transactionsPagination.totalTransactions} transactions
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => loadTransactionsData(currentTransactionPage - 1)}
                    disabled={!transactionsPagination.hasPrev || transactionsLoading}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("previous")}
                  </button>
                  <span className="px-3 py-1 text-sm bg-teal-600 text-white rounded">
                    {transactionsPagination.currentPage}
                  </span>
                  <button
                    onClick={() => loadTransactionsData(currentTransactionPage + 1)}
                    disabled={!transactionsPagination.hasNext || transactionsLoading}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("next")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Orders Summary */}
          {/* {orders.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{orders.length}</p>
                  <p className="text-sm text-gray-600">Total Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {orders.filter(order => order.status === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {orders.filter(order => order.status === 'pending').length}
                  </p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {orders.filter(order => order.type === 'escrow').length}
                  </p>
                  <p className="text-sm text-gray-600">Escrow Orders</p>
                </div>
              </div>
            </div>
          )} */}

          {/* Orders List */}

        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Orders Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("ordersSummary")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-purple-600">{ordersPagination?.totalOrders || orders.length}</p>
                <p className="text-sm text-gray-600">{t("totalOrders")}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(order => order.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">{t("completed")}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(order => order.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-600">{t("pending")}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <p className="text-2xl font-bold text-blue-600">
                  {orders.filter(order => order.type === 'escrow').length}
                </p>
                <p className="text-sm text-gray-600">{t("escrowOrders")}</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">{t("currentPageTotalValue")}</p>
              <p className="text-2xl font-bold text-purple-700">
                ${totalOrdersAmount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t("showing")} {orders.length} {t("ordersOnThisPage")}
              </p>
            </div>
          </div>

          {/* Orders List */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t("ordersManagement")}</h3>
              <div className="flex items-center space-x-4">
                {ordersPagination && (
                  <div className="text-sm text-gray-600">
                    {t("page")} {ordersPagination.currentPage} {t("of")} {ordersPagination.totalPages}
                    ({ordersPagination.totalOrders} {t("totalOrders")})
                  </div>
                )}
                <button
                  onClick={() => loadOrdersData(currentOrderPage)}
                  disabled={ordersLoading}
                  className="flex items-center px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-1 rtl:ml-2 ${ordersLoading ? 'animate-spin' : ''}`} />
                  {ordersLoading ? 'Loading...' : t('refresh')}
                </button>
              </div>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <span className="ml-2 text-gray-600">Loading orders...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.length > 0 ? orders.map((order) => (
                  <div key={order._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-purple-200 rounded-lg bg-purple-50 hover:bg-purple-100 space-y-4 sm:space-y-0">
                    <div className="flex items-start sm:items-center space-x-4 rtl:space-x-reverse">
                      <div className="flex-shrink-0">
                        {order.product?.product_photos?.[0] ? (
                          <img
                            src={order.product.product_photos[0]}
                            alt={order.product.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="w-16 h-16 text-purple-600 p-3 bg-purple-100 rounded-lg" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-medium text-gray-900 text-sm sm:text-base">
                            Order #{order.orderNumber?.split('_')[2] || order._id?.slice(-6)}
                          </p>
                          <span className={`px-2 py-1 text-[10px] sm:text-xs rounded-full ${order.type === 'escrow'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                            }`}>
                            {order.type}
                          </span>
                          <span className={`px-2 py-1 text-[10px] sm:text-xs rounded-full ${order.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : order.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base text-gray-900 font-medium mb-1">
                          {order.product?.title || 'Product Order'}
                        </p>
                        <div className="text-[10px] sm:text-xs text-gray-600 space-y-1">
                          <p>Brand: {order.product?.brand} | Size: {order.product?.size} | {order.product?.condition}</p>
                          <p>Buyer: {order.buyer?.firstName} {order.buyer?.lastName} ({order.buyer?.email})</p>
                          <p>Shipping: {order.shipping?.toAddress?.city}, {order.shipping?.toAddress?.state}, {order.shipping?.toAddress?.country}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-2 py-1 text-[10px] sm:text-xs rounded-full ${getPaymentMethodColor(order.payment?.method)}`}>
                            {order.payment?.method}
                          </span>
                          {order.payment?.status && (
                            <span className={`px-2 py-1 text-[10px] sm:text-xs rounded-full ${order.payment.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : order.payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                              }`}>
                              Payment: {order.payment.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="text-base sm:text-lg font-semibold text-purple-600 mb-1">
                        ${(order.orderDetails?.productPrice || order.payment?.fees?.total || 0).toFixed(2)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1">
                        {order.orderDetails?.currency || 'USD'} | Qty: {order.orderDetails?.quantity || 1}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-2">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>

                      {/* Action Buttons */}
                      <div className="space-y-1">
                        {(order.status === 'pending' || order.payment?.status === 'pending') && !order.paymentCompleted && (
                          <button
                            onClick={() => handleCompleteOrderPayment(order)}
                            className="w-full px-3 py-1 bg-green-600 text-white text-[10px] sm:text-xs rounded hover:bg-green-700 transition-colors"
                            title="Complete payment and credit wallet"
                          >
                            Complete Payment
                          </button>
                        )}
                        {order.paymentCompleted && (
                          <div className="w-full px-3 py-1 bg-gray-100 text-gray-600 text-[10px] sm:text-xs rounded text-center">
                            Payment Completed
                          </div>
                        )}
                        {order.status === 'completed' && (
                          <button
                            onClick={() => {
                              setSelectedOrderForRating(order);
                              setShowRatingModal(true);
                            }}
                            className="w-full px-3 py-1 bg-yellow-600 text-white text-[10px] sm:text-xs rounded hover:bg-yellow-700 transition-colors"
                            title="Rate this transaction"
                          >
                            ⭐ Rate Transaction
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm sm:text-base">{t("noOrdersFound")}</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">{t("ordersAppearAfterPurchase")}</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {ordersPagination && ordersPagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {t("showing")} {((ordersPagination.currentPage - 1) * 20) + 1} to {Math.min(ordersPagination.currentPage * 20, ordersPagination.totalOrders)} of {ordersPagination.totalOrders} orders
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => loadOrdersData(currentOrderPage - 1)}
                    disabled={currentOrderPage <= 1 || ordersLoading}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("previous")}
                  </button>
                  <span className="px-3 py-1 text-sm bg-orange-600 text-white rounded">
                    {ordersPagination.currentPage}
                  </span>
                  <button
                    onClick={() => loadOrdersData(currentOrderPage + 1)}
                    disabled={currentOrderPage >= ordersPagination.totalPages || ordersLoading}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("next")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'statistics' && (
        <div className="space-y-6">
          {/* Balance Overview */}
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("balanceOverview")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statistics?.balances && Object.entries(statistics.balances).map(([currency, balance]) => (
                <div key={currency} className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <p className="text-sm font-medium text-gray-600">{currency}</p>
                  <p className="text-xl font-bold text-teal-600">
                    {formatCurrency(balance, currency)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {currency === selectedCurrency ? 'Primary' : 'Secondary'}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">{t("totalBalance")}</p>
              <p className="text-2xl font-bold text-teal-700">
                {formatCurrency(statistics?.totalBalance || 0, selectedCurrency)}
              </p>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("overallStatistics")}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("totalTransactions")}:</span>
                  <span className="font-semibold text-lg">{statistics?.overall?.totalTransactions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("totalEarned")}:</span>
                  <span className="font-semibold text-green-600 text-lg">
                    ${(statistics?.overall?.totalEarned || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("totalWithdrawn")}:</span>
                  <span className="font-semibold text-blue-600 text-lg">
                    ${(statistics?.overall?.totalWithdrawn || 0).toFixed(2)}
                  </span>
                </div>
                {statistics?.overall?.lastTransactionAt && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t("lastTransaction")}:</span>
                    <span className="font-medium text-gray-800 text-sm">
                      {new Date(statistics.overall.lastTransactionAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("thisMonth")} ({statistics?.period?.days || 30} {t("days")})
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("transactions")}:</span>
                  <span className="font-semibold text-lg">{statistics?.period?.totalTransactions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("earned")}:</span>
                  <span className="font-semibold text-green-600 text-lg">
                    ${(statistics?.period?.totalEarned || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("spent")}:</span>
                  <span className="font-semibold text-red-600 text-lg">
                    ${(statistics?.period?.totalSpent || 0).toFixed(2)}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">{t("netIncome")}:</span>
                    <span className="font-bold text-teal-600 text-lg">
                      ${((statistics?.period?.totalEarned || 0) - (statistics?.period?.totalSpent || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("performanceMetrics")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  ${statistics?.period?.totalTransactions > 0
                    ? ((statistics?.period?.totalEarned || 0) / statistics.period.totalTransactions).toFixed(2)
                    : '0.00'
                  }
                </div>
                <p className="text-sm text-gray-600 mt-1">{toast("averagePerTransaction")}</p>
                <p className="text-xs text-gray-500">({t("thisMonth")})</p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {statistics?.period?.days > 0
                    ? ((statistics?.period?.totalTransactions || 0) / statistics.period.days).toFixed(1)
                    : '0.0'
                  }
                </div>
                <p className="text-sm text-gray-600 mt-1">{t("transactionsPerDay")}</p>
                <p className="text-xs text-gray-500">({t("thisMonth")})</p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ${statistics?.period?.days > 0
                    ? ((statistics?.period?.totalEarned || 0) / statistics.period.days).toFixed(2)
                    : '0.00'
                  }
                </div>
                <p className="text-sm text-gray-600 mt-1">{t("dailyAverageEarnings")}</p>
              <p className="text-xs text-gray-500">({t("thisMonth")})</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("withdrawalMethod")}</h3>
            <form onSubmit={handleWithdraw}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("amount")}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={withdrawalData.amount}
                    onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("currency")}</label>
                  <select
                    value={withdrawalData.currency}
                    onChange={(e) => setWithdrawalData({ ...withdrawalData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="USD">USD</option>
                    <option value="AED">AED</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("withdrawalMethod")}</label>
                  <select
                    value={withdrawalData.withdrawalMethod}
                    onChange={(e) => setWithdrawalData({ ...withdrawalData, withdrawalMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                {/* Bank Account Selection - Only show for bank transfer */}
                {withdrawalData.withdrawalMethod === 'bank_transfer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t("selectBankAccount")}</label>
                    {loadingBankAccounts ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                        Loading bank accounts...
                      </div>
                    ) : bankAccounts.length === 0 ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>No bank accounts found</span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowWithdrawModal(false);
                              // Navigate to payment settings - you might want to implement this
                              toast.info('Please add a bank account in Payment Settings first');
                            }}
                            className="text-teal-600 hover:text-teal-700 text-sm underline"
                          >
                            Add Bank Account
                          </button>
                        </div>
                      </div>
                    ) : (
                      <select
                        value={withdrawalData.bankAccountId}
                        onChange={(e) => setWithdrawalData({ ...withdrawalData, bankAccountId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        required
                      >
                        <option value="">{t("selectBankAccount")}</option>
                        {bankAccounts.map((account) => (
                          <option key={account._id} value={account._id}>
                            <div className="flex items-center">
                              <Building2 className="w-4 h-4 mr-2" />
                              {account.bankName} - ****{account.lastFourDigits}
                              {account.isDefault && <Star className="w-3 h-3 ml-1" />}
                            </div>
                            {account.bankName} - ****{account.lastFourDigits} {account.isDefault ? '(Default)' : ''}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t("description")}</label>
                  <input
                    type="text"
                    value={withdrawalData.description}
                    onChange={(e) => setWithdrawalData({ ...withdrawalData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Withdrawal reason"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  {t("withdrawn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rating Modal for Orders */}
      {showRatingModal && selectedOrderForRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Rate Your Transaction</h3>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedOrderForRating(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <RatingPrompt
              transaction={selectedOrderForRating}
              onRatingSubmitted={(ratingData) => {
                console.log('✅ Rating submitted from wallet:', ratingData);
                toast.success('Thank you for your rating!');
                setShowRatingModal(false);
                setSelectedOrderForRating(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Withdrawal History Modal */}
      <WithdrawalHistory
        isOpen={showWithdrawalHistory}
        onClose={() => setShowWithdrawalHistory(false)}
      />
    </div>
  );
};

export default Wallet;
