import React, { useState, useEffect } from 'react';
import { Package, Truck, Clock, CheckCircle, AlertCircle, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import TrackingService from '../../api/TrackingService';
import { useTranslation } from 'react-i18next';

const BuyerOrderTracking = ({ order }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation()
  // Extract tracking info from order
  const trackingId = order?.trackingId || order?.tracking_id;
  const orderId = order?.id || order?._id;
  const shippingProvider = order?.shippingProvider || order?.shipping_provider;
  const status = order?.status
  const estimatedDelivery = order?.estimatedDelivery || order?.estimated_delivery;

  useEffect(() => {
    // if (trackingId && orderId) {
    //   fetchTrackingData();
    // }
  }, [trackingId, orderId]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TrackingService.getTrackingInfo(orderId, trackingId);
      if (response.success) {
        setTrackingData(response.data);
      } else {
        setError(response.error || 'Failed to fetch tracking information');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch tracking information');
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingId = async () => {
    try {
      await navigator.clipboard.writeText(trackingId);
      setCopied(true);
      toast.success('Tracking ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = trackingId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('Tracking ID copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openAfterShipTracking = () => {
    window.open('https://www.aftership.com/track', '_blank');
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'shipped': 'bg-blue-100 text-blue-800 border-blue-200',
      'in_transit': 'bg-blue-100 text-blue-800 border-blue-200',
      'out_for_delivery': 'bg-purple-100 text-purple-800 border-purple-200',
      'delivered': 'bg-green-100 text-green-800 border-green-200',
      'exception': 'bg-red-100 text-red-800 border-red-200',
      'returned': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'shipped':
      case 'in_transit':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'exception':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // If no tracking ID, show order status only
  if (!trackingId) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {getStatusIcon(status)}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{t("orderStatus")}</h3>
              <p className="text-sm text-gray-600">{t("order")} #{orderId}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
            {status?.replace('_', ' ').toUpperCase() || 'PENDING'}
          </span>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Package className="w-5 h-5 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Your order is being processed. Tracking information will be available once shipped.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg shadow-md border py-3 border-gray-200 px-4 sm:px-6 max-w-full mx-auto">

      {/* Show tracking UI if NOT delivered */}
      {status !== 'delivered' && (
        <>
          <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(status)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{t("packageTracking")}</h3>
                <p className="text-sm text-gray-600 break-words">{t("order")} #{orderId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              {loading && <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />}
              <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(status)}`}>
                {status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              {t("trackingIdOrNumber")}
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <code className="bg-white px-3 py-2 rounded border text-xs sm:text-sm font-mono text-gray-900 flex-1 select-all break-words overflow-x-auto">
                {trackingId}
              </code>
              <button
                onClick={copyTrackingId}
                className={`flex items-center justify-center gap-1 px-3 py-2 rounded border transition-colors text-xs sm:text-sm 
                ${copied ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                title="Copy tracking ID"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium">Shipping Provider:</span> {shippingProvider || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium">Estimated Delivery:</span> {formatDate(estimatedDelivery)}
              </p>
            </div>
          </div> */}

          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-4">
            <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-2">📦 {t("trackOrderGuide")}:</h4>
            <ol className="text-xs sm:text-sm text-blue-800 space-y-2">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs flex items-center justify-center mr-2 rtl:ml-2 mt-0.5">1</span>
                {t("copyTrackingId")}
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs flex items-center justify-center mr-2 rtl:ml-2 mt-0.5">2</span>
                {t("clickTrackAfterShip")}
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs flex items-center justify-center mr-2 rtl:ml-2 mt-0.5">3</span>
                {t("pasteTrackingId")}
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs flex items-center justify-center mr-2 rtl:ml-2 mt-0.5">4</span>
                {t("realTimeUpdates")}
              </li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4 w-full">
            <button
              onClick={openAfterShipTracking}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-1"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{t("trackOnAfterShip")}</span>
            </button>
          </div>
        </>
      )}

      {/* Delivered message */}
      {status === 'delivered' && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-xs sm:text-sm text-green-800 font-medium">
              🎉 {t("packageDeliveredMsg")}
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link to="/" className="flex items-center justify-center gap-2 bg-teal-600 text-white px-3 py-2 rounded-lg hover:bg-teal-700 transition-colors flex-1">
              <ExternalLink className="w-4 h-4" />
              <span>{t("buyMoreProducts")}</span>
            </Link>
          </div>
        </div>
      )}

      {/* Exception message */}
      {status === 'exception' && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-xs sm:text-sm text-red-800 font-medium">
              ⚠️ {t("deliveryIssueMsg")}
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-xs sm:text-sm text-red-800">
              Error loading tracking details: {error}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {t("trackingPowered")}
        </p>
      </div>
    </div>
  );
};

export default BuyerOrderTracking;