import React, { useState } from 'react';
import { Copy, ExternalLink, Package, Truck, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const BuyerTrackingCard = ({ order, trackingId, shippingProvider, status, estimatedDelivery }) => {
  const [copied, setCopied] = useState(false);

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

  const getTrackingInstructions = () => {
    return [
      "Copy your tracking ID using the button below",
      "Click on the 'Track on AfterShip' link",
      "Paste your tracking ID in the search box",
      "Get real-time updates on your package"
    ];
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(status)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Package Tracking</h3>
            <p className="text-sm text-gray-600">Order #{order?.id || 'N/A'}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(status)}`}>
          {status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
        </span>
      </div>

      {/* Tracking ID Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tracking ID
            </label>
            <div className="flex items-center space-x-2">
              <code className="bg-white px-3 py-2 rounded border text-sm font-mono text-gray-900 flex-1">
                {trackingId}
              </code>
              <button
                onClick={copyTrackingId}
                className={`flex items-center space-x-1 px-3 py-2 rounded border transition-colors ${
                  copied 
                    ? 'bg-green-100 text-green-700 border-green-300' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                title="Copy tracking ID"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Shipping Provider:</span> {shippingProvider || 'Not specified'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Estimated Delivery:</span> {formatDate(estimatedDelivery)}
          </p>
        </div>
      </div>

      {/* Tracking Instructions */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How to Track Your Package:</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          {getTrackingInstructions().map((instruction, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-200 text-blue-800 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5">
                {index + 1}
              </span>
              {instruction}
            </li>
          ))}
        </ol>
      </div>

      {/* AfterShip Link */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={openAfterShipTracking}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex-1"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Track on AfterShip</span>
        </button>
        
        <div className="text-center sm:text-left">
          <p className="text-xs text-gray-500">
            Click the link above and paste your tracking ID
          </p>
          <p className="text-xs text-gray-400">
            Powered by AfterShip tracking service
          </p>
        </div>
      </div>

      {/* Status Message */}
      {status === 'delivered' && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 font-medium">
              Package delivered successfully! 🎉
            </p>
          </div>
        </div>
      )}

      {status === 'exception' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800 font-medium">
              There's an issue with your package. Please contact support.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerTrackingCard;