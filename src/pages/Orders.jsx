import React, { useState, useEffect } from 'react';
import { Package, Truck, MapPin, Clock, Star, Eye, RefreshCw, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ShippingService from '../api/ShippingService';
import RatingService from '../api/RatingService';
import MyOrdersSkeleton from '../components/Skeleton/MyOrdersSkeleton';
import MarkAsShippedModal from '../components/Shipping/MarkAsShippedModal';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { X } from 'lucide-react';

const Orders = () => {
  const navigate = useNavigate();
  const { t } = useTranslation()
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buyer');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false
  });

  // Modal states
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Rating states
  const [ratingStates, setRatingStates] = useState({});

  // Base URL configuration for images
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  // const normalizedBaseURL = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading orders with params:', {
        role: activeTab,
        status: statusFilter || null,
        page: currentPage,
        limit: 10
      });

      const response = await ShippingService.getOrders(
        activeTab,
        statusFilter || null,
        currentPage,
        10
      );

      console.log('📦 Orders API response:', response);

      if (response.success) {
        const orders = response.data.orders || [];
        setOrders(orders);
        setPagination(response.data.pagination || {
          totalPages: 1,
          totalOrders: 0,
          hasNext: false,
          hasPrev: false
        });
        console.log('✅ Orders loaded successfully:', orders.length, 'orders');

        // Check rating status for each order
        checkRatingStatus(orders);

        // Debug: Log first order structure for image debugging
        if (orders.length > 0) {
          console.log('🔍 First order structure:', {
            product: orders[0].product,
            seller: orders[0].seller,
            buyer: orders[0].buyer
          });
        }
      } else {
        console.warn('⚠️ Orders API returned success: false');
        toast.error(response.error || 'Failed to load orders');
      }
    } catch (error) {
      console.error('❌ Failed to load orders:', error);
      toast.error(error.error || error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const checkRatingStatus = async (orders) => {
    const newRatingStates = {};

    for (const order of orders) {
      try {
        // Get the transaction ID for rating check
        const transactionId = order.payment?.escrowTransactionId || order.payment?.transactionId || order._id;
        const transactionType = order.type === 'escrow' ? 'escrow' : 'standard';

        console.log('🌟 Checking rating status for order:', order._id, 'transactionId:', transactionId, 'type:', transactionType);

        // COMMENTED OUT: Check if user can rate this transaction - API returns 404
        // const canRateResponse = await RatingService.canRateTransaction(transactionId, transactionType);

        // if (canRateResponse.success) {
        //   newRatingStates[order._id] = {
        //     canRate: canRateResponse.data.canRate,
        //     reason: canRateResponse.data.reason,
        //     ratingType: canRateResponse.data.ratingType,
        //     userRole: canRateResponse.data.userRole,
        //     transactionType: canRateResponse.data.transactionType,
        //     transactionId: transactionId
        //   };

        //   console.log('✅ Rating status for order', order._id, ':', canRateResponse.data);
        // }

        // Temporary: Set default rating state to avoid errors
        newRatingStates[order._id] = {
          canRate: false,
          reason: 'Rating API temporarily disabled'
        };

      } catch (error) {
        console.error('❌ Failed to check rating status for order:', order._id, error);
        newRatingStates[order._id] = {
          canRate: false,
          reason: 'Error checking rating status'
        };
      }
    }

    setRatingStates(newRatingStates);
  };

  useEffect(() => {
    console.log('🔄 useEffect triggered - activeTab:', activeTab, 'statusFilter:', statusFilter, 'currentPage:', currentPage);
    loadOrders();
  }, [activeTab, statusFilter, currentPage]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await ShippingService.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        toast.success('Order status updated');
        loadOrders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error(error.error || 'Failed to update order status');
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleConfirmDelivery = async (orderId) => {
    try {
      setConfirmLoading(true);
      const response = await ShippingService.confirmDelivery(orderId);
      if (response.success) {
        toast.success("Delivery confirmed");
        loadOrders();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Failed to confirm delivery:", error);
      toast.error(error.error || "Failed to confirm delivery");
    } finally {
      setConfirmLoading(false);
    }
  }


  const handleMarkAsShipped = (order) => {
    setSelectedOrder(order);
    setShowShippingModal(true);
  };

  const handleShippingSuccess = () => {
    loadOrders(); // Refresh orders
    setSelectedOrder(null);
  };

  const getStatusBadge = (status) => {
    const colorClass = ShippingService.getStatusColor(status);
    console.log('getStatusBadge called with status:', status, 'and colorClass:', colorClass);
    console.log("status", status)
    return (
      <span className={`px-2 py-1 text-xs rounded-full bg-gray-100 ${colorClass}`}>
        {ShippingService.formatDeliveryStatus(status)}
      </span>
    );
  };

  const handleRateTransaction = (order) => {
    const ratingState = ratingStates[order._id];
    if (!ratingState || !ratingState.canRate) {
      toast.error('Cannot rate this transaction at this time');
      return;
    }

    // Navigate to existing rating page with query parameters
    const transactionType = order.type === 'escrow' ? 'escrow' : 'standard';
    navigate(`/rating?transaction=${ratingState.transactionId}&type=${transactionType}`);
  };

  const getActionButtons = (order) => {
    const isBuyer = activeTab === 'buyer';
    const isSeller = activeTab === 'seller';
    const ratingState = ratingStates[order._id];

    return (
      <div className="flex gap-2">
        {/* {isSeller && order.status === 'paid' && (
          <button
            onClick={() => handleStatusUpdate(order._id, 'processing')}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Mark Processing
          </button>
        )} */}

        {isSeller && ['funds_held', 'completed'].includes(order.payment.status) && order.status !== 'shipped' && (
          <button
            onClick={() => handleMarkAsShipped(order)}
            className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {t("markShipped")}
          </button>
        )}
        {isSeller && ['paid', 'completed'].includes(order.status) && order.status !== 'shipped' && (
          <button
            onClick={() => handleMarkAsShipped(order)}
            className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {t("markShipped")}
          </button>
        )}

        {isBuyer && ["shipped", "in_transit"].includes(order.status) && (
          <button
            onClick={() => {
              setSelectedOrderId(order._id);
              setShowModal(true);
            }}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
          >
            {t("confirmDelivery")}
          </button>
        )}

        {order.status === 'delivered' &&
          <div>
            <h2 className='text-teal-600'>{t("productDelivered")}</h2>
          </div>
        }

        {/* Rating Button */}
        {ratingState && ratingState.canRate && (
          <button
            onClick={() => handleRateTransaction(order)}
            className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center gap-1"
            title="Rate this transaction"
          >
            <Star className="w-3 h-3" />
            Rate
          </button>
        )}

        {/* Show rating status for debugging */}
        {/* {ratingState && !ratingState.canRate && ratingState.reason && (
          <span className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded" title={ratingState.reason}>
            {ratingState.reason === 'Already rated' ? 'Rated' : 'No Rating'}
          </span>
        )} */}

        <button
          onClick={() => navigate(`/order/${order._id}`)}
          className="ml-2 rtl:mr-2 text-gray-400 hover:text-blue-600 transition-colors"
          title="View details"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    );
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

  if (loading && orders.length === 0) {
    return (
      <MyOrdersSkeleton />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Orders - Habibi ماركت</title>
        <meta
          name="description"
          content="Welcome to My Website. We provide the best services for your needs."
        />
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        {/* Debug Info - Remove in production */}
        {/* {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <strong>Debug Info:</strong> API URL: <code>http://localhost:5000/api/user/orders?role={activeTab}&page={pagination.currentPage}&limit=10</code>
          {statusFilter && <span> &status={statusFilter}</span>}
          <br />
          <strong>Orders Count:</strong> {orders.length} | <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </div>
      )} */}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{t("my_orders")}</h1>
            <p className="text-sm sm:text-base text-gray-600">{t("trackOrders")}</p>
          </div>
          <button
            onClick={loadOrders}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t("refresh")}
          </button>

        </div>

        {/* Tabs */}
        <div className="flex space-x-3 mb-6 rtl:space-x-reverse">
          {['buyer', 'seller'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                console.log('🔄 Tab switched to:', tab);
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === tab
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {tab === 'buyer' ? t('myPurchases') : t('mySales')}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                console.log('🔍 Status filter changed to:', e.target.value);
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="">{t("allStatus")}</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="paid">Paid</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {pagination.totalOrders} {t("totalOrders")}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t("noOrdersFound")}</h3>
              <p className="text-gray-600">
                {activeTab === 'buyer'
                  ? t("noPurchases")
                  : t("noSales")
                }
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg border shadow-sm p-4 sm:p-6 text-sm">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-4 gap-2 sm:gap-0">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base sm:text-lg">{t("order")} #{order.orderNumber}</h3>
                      {order?.type === 'escrow' ? getStatusBadge(order?.status) : getStatusBadge(order.status)}

                      <span className={`px-2 py-1 text-xs rounded-full ${order.type === 'escrow' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {order.type === 'escrow' ? 'Escrow' : 'Standard'}
                      </span>
                    </div>

                    {/* Flex row for date + buttons */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600">
                        {t("placedOn")} {formatDate(order.createdAt)}
                      </p>
                      <div className="sm:hidden">{getActionButtons(order)}</div>
                    </div>
                  </div>

                  {/* Show buttons on right for larger screens only */}
                  <div className="hidden sm:block">{getActionButtons(order)}</div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                  {/* Product Info */}
                  <div className="flex gap-3">
                    <img
                      src={order?.product?.product_photos?.[0] || 'https://via.placeholder.com/64x64?text=No+Image'}
                      alt={order?.product?.title || 'Product'}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">{order?.product?.title || 'Product'}</h4>
                      <p className="text-xs text-gray-600">{order?.product?.brand || 'N/A'} • {order?.product?.size || 'N/A'}</p>
                      <p className="text-sm font-medium text-gray-900">${order.product?.price || '0.00'}</p>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <Truck className="w-4 h-4" />
                      {t("shipping")}
                    </h5>
                    {order?.shipping?.trackingNumber ? (
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600">{t("tracking")}: {order.shipping.trackingNumber}</p>
                        {order?.shipping?.estimatedDelivery && (
                          <p className="text-gray-600 flex items-center gap-1 text-sm">
                            <Clock className="w-3 h-3" />
                            {t("est")}. {formatDate(order.shipping.estimatedDelivery)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {order?.status === 'shipped'
                          ? t("productShipped")
                          : order?.status === 'delivered'
                            ? t("productDelivered")
                            : t("notShippedYet")}
                      </p>
                    )}
                  </div>

                  {/* Payment Info */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <span className="w-4 h-4 text-green-600">💳</span>
                      {t("paymentDetails")}
                    </h5>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">{t("method")}: <span className="font-medium">{order.payment?.method || order.type}</span></p>
                      <p className="text-gray-600">{t("gateway")}: <span className="font-medium">{order.payment?.paymentGateway || 'N/A'}</span></p>
                      <p className="text-gray-600">{t("total")}: <span className="font-medium text-green-600">${order.payment?.fees?.total?.toFixed(2) || order.orderDetails?.productPrice?.toFixed(2)}</span></p>
                      {order.payment?.fees?.platformFee && (
                        <p className="text-gray-500">{t("platformFee")}: ${order.payment.fees.platformFee.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Timeline Section */}
                {order.timeline && order.timeline.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{t("recentUpdates")}</h5>
                    <div className="space-y-1">
                      {order.timeline.slice(-2).map((event, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
                          <span>{event.description} - {formatDate(event.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => {
                console.log('📄 Previous page clicked, current page:', currentPage);
                setCurrentPage(prev => prev - 1);
              }}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {t("previous")}
            </button>
            <span className="text-sm text-gray-600">
              {t("page")} {currentPage} {t("of")} {pagination.totalPages}
            </span>
            <button
              onClick={() => {
                console.log('📄 Next page clicked, current page:', currentPage);
                setCurrentPage(prev => prev + 1);
              }}
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {t("next")}
            </button>
          </div>
        )}

        {/* Mark as Shipped Modal */}
        <MarkAsShippedModal
          isOpen={showShippingModal}
          onClose={() => setShowShippingModal(false)}
          order={selectedOrder}
          onSuccess={handleShippingSuccess}
        />
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative">
            {/* Header with Title + Close Icon */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t("confirmDelivery")}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <p className="text-sm text-gray-600 mb-6">
              {t("confirmDeliveryPrompt")}
            </p>

            {/* Footer */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              >
                {t("cancel")}
              </button>
              <button
                onClick={() => handleConfirmDelivery(selectedOrderId)}
                disabled={confirmLoading}
                className={`px-4 py-2 rounded text-sm flex items-center gap-2 ${confirmLoading
                  ? "bg-green-400 cursor-not-allowed text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
              >
                {confirmLoading && (
                  <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                )}
                {confirmLoading ? t("confirming") : t("yesConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
