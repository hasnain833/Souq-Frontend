import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, MapPin, Clock, Mail, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import ShippingService from '../api/ShippingService';
import TransactionProgress from '../components/Transaction/TransactionProgress';

import EscrowTransactionStatus from '../components/Escrow/EscrowTransactionStatus';
import BuyerOrderTracking from '../components/Buyer/BuyerOrderTracking';
import BuyerOrderStatusDisplay from '../components/Buyer/BuyerOrderStatusDisplay';
import { useTranslation } from 'react-i18next';
import OrderDetailsSkeleton from '../components/Skeleton/OrderDetailsSkeleton';

const OrderDetails = () => {
    const navigate = useNavigate();
    const { t } = useTranslation()
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trackingLoading, setTrackingLoading] = useState(false);
    console.log(order, "order")

    // Base URL configuration for images
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await ShippingService.getOrderDetails(orderId);

            if (response.success) {
                setOrder(response.data.order);
                setShipment(response.data.shipment);

                // Debug: Log order structure for transaction debugging
                console.log('🔍 OrderDetails - Order structure:', {
                    _id: response.data.order?._id,
                    orderNumber: response.data.order?.orderNumber,
                    type: response.data.order?.type,
                    status: response.data.order?.status,
                    payment: response.data.order?.payment,
                    product: response.data.order?.product,
                    seller: response.data.order?.seller,
                    productPhotos: response.data.order?.product?.product_photos
                });

                console.log('🎯 Transaction ID for API calls:', {
                    orderId: response.data.order?._id,
                    transactionId: response.data.order?.payment?.transactionId,
                    escrowTransactionId: response.data.order?.payment?.escrowTransactionId,
                    usingForEscrow: response.data.order?.payment?.escrowTransactionId || response.data.order?.payment?.transactionId || response.data.order?._id,
                    usingForStandard: response.data.order?.payment?.transactionId || response.data.order?._id
                });
            }
        } catch (error) {
            console.error('Failed to load order details:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const refreshTracking = async () => {
        if (!order?.shipping?.trackingNumber) return;

        try {
            setTrackingLoading(true);
            const response = await ShippingService.trackShipment(order.shipping.trackingNumber);

            if (response.success) {
                setShipment(response.data.tracking);
                toast.success('Tracking information updated');
            }
        } catch (error) {
            console.error('Failed to refresh tracking:', error);
            toast.error('Failed to refresh tracking information');
        } finally {
            setTrackingLoading(false);
        }
    };

    const handleConfirmDelivery = async () => {
        try {
            const response = await ShippingService.confirmDelivery(orderId);
            if (response.success) {
                toast.success('Delivery confirmed');
                loadOrderDetails();
            }
        } catch (error) {
            console.error('Failed to confirm delivery:', error);
            toast.error(error.error || 'Failed to confirm delivery');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'created':
            case 'pending_payment':
                return '📦';
            case 'paid':
            case 'processing':
                return '⚙️';
            case 'picked_up':
            case 'shipped':
                return '📤';
            case 'in_transit':
                return '🚛';
            case 'out_for_delivery':
                return '🚚';
            case 'delivered':
                return '✅';
            case 'cancelled':
                return '❌';
            default:
                return '📦';
        }
    };

    if (loading) {
        return (
           <OrderDetailsSkeleton/>
        )
    }

    if (!order) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have access to it.</p>
                    <button
                        onClick={() => navigate('/orders')}
                        className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const authUser = JSON.parse(localStorage.getItem("user"));

    const sellerProfile = () => {
        if (authUser?.id === order.seller?._id) {
            navigate("/member-profile")
        } else {
            navigate(`/profile/${order.seller?._id}`)
        }
    }

    const buyerProfile = () => {
        if (authUser?.id === order.buyer?._id) {
            navigate("/member-profile")
        } else {
            navigate(`/profile/${order.buyer?._id}`)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 ">
                {/* Header */}
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <button
                        onClick={() => navigate('/orders')}
                        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>

                    <div className="flex-1">
                        <h1 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 break-all">
                            {t("order")} #{order.orderNumber || 'N/A'}
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600">
                            {t("placedOn")} {formatDate(order.createdAt)}
                        </p>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <span
                            className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full ${ShippingService.getStatusColor(order.status)} bg-gray-100`}
                        >
                            {ShippingService.formatDeliveryStatus(order?.status)}
                        </span>
                    </div>
                </div>


                {/* Transaction Progress */}
                {order && (
                    <div className="mb-8">
                        {order.type === 'escrow' ? (
                            <EscrowTransactionStatus
                                transaction={{
                                    _id: order.payment?.escrowTransactionId || order.payment?.transactionId || order._id,
                                    transactionId: order.payment?.transactionId || order.orderNumber,
                                    status: order.payment?.status || order.status,
                                    totalAmount: order.orderDetails?.productPrice,
                                    currency: order.orderDetails?.currency,
                                    buyer: order.buyer,
                                    seller: order.seller,
                                    product: order.product,
                                    createdAt: order.createdAt,
                                    updatedAt: order.updatedAt
                                }}
                                userRole={order.buyer?._id === order.currentUserId ? 'buyer' : 'seller'}
                                onTransactionUpdate={(updatedTransaction) => {
                                    console.log('Escrow transaction updated:', updatedTransaction);
                                    loadOrderDetails();
                                }}
                                paymentType="escrow"
                            />
                        ) : (
                            <TransactionProgress
                                transaction={{
                                    transactionId: order.payment?.transactionId || order._id,
                                    status: order.status,
                                    type: order.type
                                }}
                                transactionType={order.type || 'standard'}
                                onRefresh={loadOrderDetails}
                            />
                        )}
                    </div>
                )}

                {/* Buyer Order Status Display */}
                {/* {order && (
                    <div className="mb-8">
                        <BuyerOrderStatusDisplay 
                            transactionId={order.payment?.transactionId || order.orderNumber}
                            orderId={order._id}
                        />
                    </div>
                )} */}

                {/* Transaction Management */}
                {/* {order && (
                    <div className="mb-8">
                        <TransactionManager
                            transactionId={
                                order.type === 'escrow'
                                    ? (order.payment?.escrowTransactionId || order.payment?.transactionId || order._id)
                                    : (order.payment?.transactionId || order._id)
                            }
                            userRole={order.buyer?._id === order.currentUserId ? 'buyer' : 'seller'}
                            onStatusUpdate={(newStatus, data) => {
                                console.log('Transaction status updated:', newStatus, data);
                                // Refresh order details
                                loadOrderDetails();
                            }}
                        />
                    </div>
                )} */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Information */}
                        <div className="bg-white rounded-lg border shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                {t("productDetails")}
                            </h2>
                            <div className="flex gap-4">
                                <img
                                    // src={order.product?.product_photos?.[0]
                                    //     ? `${normalizedBaseURL}${order.product.product_photos[0]}`
                                    //     : 'https://via.placeholder.com/96x96?text=No+Image'
                                    // }
                                    src={order.product?.product_photos?.[0]
                                        ? order.product?.product_photos?.[0]
                                        : 'https://via.placeholder.com/96x96?text=No+Image'
                                    }
                                    alt={order.product?.title || 'Product'}
                                    className="w-24 h-24 object-cover rounded-md cursor-pointer"
                                    onError={(e) => {
                                        console.log('OrderDetails: Product image failed to load:', e.target.src);
                                        e.target.src = 'https://via.placeholder.com/96x96?text=No+Image';
                                    }}
                                    onLoad={() => {
                                        console.log('OrderDetails: Product image loaded successfully');
                                    }}
                                    onClick={() => navigate(`/product-details/${order.product?._id}`)}
                                />
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 mb-2">{order.product?.title || 'Product'}</h3>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p>{t("brand")}: {order.product?.brand || 'N/A'}</p>
                                        <p>{t("size")}: {order.product?.size || 'N/A'}</p>
                                        <p>{t("condition")}: {order.product?.condition || 'N/A'}</p>
                                        {order.product?.material && <p>{t("material")}: {order.product.material}</p>}
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-lg font-semibold text-gray-900">
                                            ${Number(order.product?.price || 0).toFixed(2)}
                                        </p>

                                        {order.orderDetails?.offerAmount && (
                                            <p className="text-sm text-green-600">
                                                Offer price (was ${Number(order.orderDetails?.productPrice || 0).toFixed(2)})
                                            </p>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Tracking Information Section */}
                        <div className="bg-white rounded-lg border shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                {order?.status === 'delivered' ? (
                                    <>
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <Truck className="w-5 h-5" />
                                            {t("productDelivered")}
                                        </h2>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-lg font-semibold flex items-center gap-2">
                                            <Truck className="w-5 h-5" />
                                            {t("trackingInfo")}
                                        </h2>
                                    </>
                                )}

                                {/* {order.shipping?.trackingNumber && (
                                    <button
                                        onClick={refreshTracking}
                                        disabled={trackingLoading}
                                        className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${trackingLoading ? 'animate-spin' : ''}`} />
                                        {trackingLoading ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                )} */}
                            </div>

                            {order.shipping?.trackingNumber ? (
                                // Show tracking details when available
                                <div className="space-y-4">

                                    {order.status === 'shipped' && (
                                        <>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="flex items-center space-x-2 mb-2 rtl:space-x-reverse">
                                                    <Truck className="w-5 h-5 text-green-600" />
                                                    <h3 className="font-medium text-green-800">{t("packageShipped")}</h3>
                                                </div>
                                                <div className="space-y-2 text-sm rtl:space-y-reverse">
                                                    <div className="flex justify-between">
                                                        <span className="text-green-700">{t("trackingNumber")}:</span>
                                                        <span className="font-mono font-medium text-green-900">{order.shipping.trackingNumber}</span>
                                                    </div>
                                                    {order.shipping.provider && (
                                                        <div className="flex justify-between">
                                                            {/* <span className="text-green-700">Shipping Provider:</span>
                                                    <span className="font-medium text-green-900">{order.shipping.provider}</span> */}
                                                        </div>
                                                    )}
                                                    {order.shipping.estimatedDelivery && (
                                                        <div className="flex justify-between">
                                                            <span className="text-green-700">{t("estimatedDelivery")}:</span>
                                                            <span className="font-medium text-green-900">{formatDate(order.shipping.estimatedDelivery)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}


                                    {/* BuyerOrderTracking Component */}
                                    <BuyerOrderTracking
                                        order={{
                                            id: order.orderNumber || order._id,
                                            trackingId: order.shipping.trackingNumber,
                                            shippingProvider: shipment?.provider?.displayName || order.shipping?.provider || 'Unknown',
                                            status: order.status,
                                            estimatedDelivery: order.shipping?.estimatedDelivery
                                        }}
                                    />
                                </div>
                            ) : (
                                // Show processing message when tracking is not available
                                <div className="space-y-4">
                                    {(['paid', 'processing', 'confirmed', 'completed'].includes(order.status) ||
                                        ['paid', 'processing', 'completed'].includes(order.payment?.status)) ? (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-2 rtl:space-x-reverse">
                                                <Package className="w-5 h-5 text-yellow-600" />
                                                <h3 className="font-medium text-yellow-800">{t("orderProcessing")}</h3>
                                            </div>
                                            <p className="text-sm text-yellow-700">
                                                {t("orderProcessingMsg")}
                                            </p>
                                            <div className="mt-3 text-sm space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-yellow-700">{t("orderStatus")}:</span>
                                                    <span className="font-medium text-yellow-900 capitalize">
                                                        {order.status?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-yellow-700">{t("paymentStatus")}:</span>
                                                    <span className="font-medium text-yellow-900 capitalize">
                                                        {order.payment?.status?.replace('_', ' ') || 'Completed'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // Show basic order status for other states
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-2 rtl:space-x-reverse">
                                                <Package className="w-5 h-5 text-gray-600" />
                                                <h3 className="font-medium text-gray-800">{t("orderStatus")}</h3>
                                            </div>
                                            <p className="text-sm text-gray-700">
                                                {t("orderStatus")}: <span className="font-medium capitalize">{order.status?.replace('_', ' ') === 'pending payment' ? t('paymentFailed') : order.status?.replace('_', ' ') || 'N/A'}</span>
                                            </p>
                                            {order.status === 'pending_payment' && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {t("waitingPayment")}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Order Timeline */}
                        {/* <div className="bg-white rounded-lg border shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
                            <div className="space-y-3">
                                {order.timeline && order.timeline.length > 0 ? (
                                    order.timeline.map((event, index) => (
                                        <div key={index} className="flex gap-3">
                                            <div className="flex-shrink-0 w-3 h-3 bg-teal-600 rounded-full mt-2"></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-gray-900">{event.description}</p>
                                                        <p className="text-sm text-gray-600">Updated by {event.updatedBy}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-500">{formatDate(event.timestamp)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500">No timeline events available</p>
                                    </div>
                                )}
                            </div>
                        </div> */}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-lg border shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">{t("order_summary")}</h2>
                            <div className="space-y-3 text-sm">
                                {/* Product Price */}
                                <div className="flex justify-between">
                                    <span>{t("productPrice")}</span>
                                    <span>
                                        $
                                        {Number(order.product?.price || 0).toFixed(2)}
                                    </span>
                                </div>

                                {/* Offer Discount */}
                                {order.orderDetails?.offerAmount && (
                                    <div className="flex justify-between text-green-600">
                                        <span>{t("offerDiscount")}</span>
                                        <span>
                                            -$
                                            {(
                                                (order.orderDetails?.productPrice || 0) -
                                                (order.orderDetails?.offerAmount || 0)
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                )}

                                {/* Platform Fee */}
                                <div className="flex justify-between">
                                    <span>{t("platformFee")}</span>
                                    <span>
                                        $
                                        {Number(order.payment?.fees?.platformFee || 0).toFixed(2)}
                                    </span>
                                </div>

                                {/* Shipping */}
                                <div className="flex justify-between">
                                    <span>{t("shipping")}</span>
                                    <span>
                                        $
                                        {Number(order.payment?.fees?.shippingFee || 0).toFixed(2)}
                                    </span>
                                </div>

                                {/* Tax */}
                                <div className="flex justify-between">
                                    <span>{t("sales_tax")}</span>
                                    <span>
                                        $
                                        {Number(order.payment?.fees?.tax || 0).toFixed(2)}
                                    </span>
                                </div>

                                <hr />

                                {/* Total */}
                                <div className="flex justify-between font-semibold">
                                    <span>{t("total")}</span>
                                    <span>
                                        $
                                        {Number(
                                            order.payment?.fees?.total ||
                                            order.orderDetails?.offerAmount ||
                                            order.orderDetails?.productPrice ||
                                            0
                                        ).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Contact Information */}
                        <div className="bg-white rounded-lg border shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">{t("contactInfo")}</h2>
                            <div className="space-y-6">
                                {/* Seller */}
                                <div>
                                    <p className="font-medium text-gray-900 mb-2">{t("seller")}</p>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={order.seller?.profile || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                            alt="Seller"
                                            className="w-10 h-10 rounded-full cursor-pointer"
                                            onError={(e) => {
                                                console.log("OrderDetails: Seller image failed to load:", e.target.src);
                                            }}
                                            onClick={sellerProfile}
                                        />
                                        <div>
                                            <p className="font-medium">{order.seller?.userName || "Unknown Seller"}</p>
                                            {order.seller?.email && (
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {order.seller.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Buyer */}
                                <div>
                                    <p className="font-medium text-gray-900 mb-2">{t("buyer")}</p>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={order.buyer?.profile || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                                            alt="Buyer"
                                            className="w-10 h-10 rounded-full cursor-pointer"
                                            onError={(e) => {
                                                console.log("OrderDetails: Buyer image failed to load:", e.target.src);
                                            }}
                                            onClick={buyerProfile}
                                        />
                                        <div>
                                            <p className="font-medium">{order.buyer?.userName || "Unknown Buyer"}</p>
                                            {order.buyer?.email && (
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {order.buyer.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div>
                                    <p className="font-medium text-gray-900 mb-2">{t("shippingAddress")}</p>
                                    <div className="text-sm text-gray-600">
                                        <p>{order.shipping?.toAddress?.fullName || "N/A"}</p>
                                        <p>{order.shipping?.toAddress?.street1 || "N/A"}</p>
                                        {order.shipping?.toAddress?.street2 && <p>{order.shipping.toAddress.street2}</p>}
                                        <p>
                                            {order.shipping?.toAddress?.city || "N/A"},{" "}
                                            {order.shipping?.toAddress?.state || "N/A"}{" "}
                                            {order.shipping?.toAddress?.zipCode || ""}
                                        </p>
                                        <p>{order.shipping?.toAddress?.country || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Actions */}
                        {/* {['shipped', 'in_transit', 'out_for_delivery'].includes(order.status) && (
                            <div className="bg-white rounded-lg border shadow-sm p-6">
                                <h2 className="text-lg font-semibold mb-4">Actions</h2>
                                <button
                                    onClick={handleConfirmDelivery}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Confirm Delivery
                                </button>
                                <p className="text-xs text-gray-500 mt-2">
                                    Click this button when you receive your order
                                </p>
                            </div>
                        )} */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
