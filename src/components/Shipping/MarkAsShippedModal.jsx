import React, { useState } from 'react';
import { X, Package, Truck, Calendar, Weight, Ruler } from 'lucide-react';
import { toast } from 'react-toastify';
import ShippingService from '../../api/ShippingService';

const MarkAsShippedModal = ({ isOpen, onClose, order, onSuccess }) => {
  const [formData, setFormData] = useState({
    trackingId: '',
    shippingProvider: 'aramex',
    estimatedDelivery: '',
    serviceType: 'standard',
    packageDetails: {
      weight: '',
      // dimensions: {
      //   length: '',
      //   width: '',
      //   height: ''
      // }
    }
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'weight') {
      setFormData(prev => ({
        ...prev,
        packageDetails: {
          ...prev.packageDetails,
          weight: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.trackingId.trim()) {
      newErrors.trackingId = 'Tracking ID is required';
    }
    
    if (!formData.estimatedDelivery) {
      newErrors.estimatedDelivery = 'Estimated delivery date is required';
    }
    
    if (!formData.packageDetails.weight) {
      newErrors.weight = 'Package weight is required';
    } else if (parseFloat(formData.packageDetails.weight) <= 0) {
      newErrors.weight = 'Package weight must be greater than 0';
    }

    // const { length, width, height } = formData.packageDetails.dimensions;
    // if (length || width || height) {
    //   if (!length || parseFloat(length) <= 0) {
    //     newErrors.dimensionsLength = 'Length is required and must be greater than 0';
    //   }
    //   if (!width || parseFloat(width) <= 0) {
    //     newErrors.dimensionsWidth = 'Width is required and must be greater than 0';
    //   }
    //   if (!height || parseFloat(height) <= 0) {
    //     newErrors.dimensionsHeight = 'Height is required and must be greater than 0';
    //   }
    // }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (order?.paymentStatus === 'pending_payment' || order?.paymentStatus === 'pending') {
      setErrors({ submit: 'Order payment is still pending. Cannot mark as shipped.' });
      toast.error('Order payment is still pending. Cannot mark as shipped.');
      return;
    }
 
     setLoading(true);
     try {
      // Create shipping data object
      const shippingData = {
        trackingNumber: formData.trackingId,
        // provider: formData.shippingProvider,
        // serviceType: formData.serviceType,
        estimatedDelivery: formData.estimatedDelivery,
        packageDetails: formData.packageDetails
      };


      // Update order status to shipped with shipping details
      const response = await ShippingService.updateOrderStatus(
        order._id,
        'shipped',
        `Shipped via ${formData.shippingProvider} - Tracking: ${formData.trackingId}`,
        shippingData // Pass the shippingData object
      );

      if (response.success) {
        toast.success('Order marked as shipped successfully!');
        onSuccess();
        onClose();
        
        // Reset form
        setFormData({
          trackingId: '',
          shippingProvider: 'aramex',
          estimatedDelivery: '',
          serviceType: 'standard',
          packageDetails: {
            weight: '',
            // dimensions: {
            //   length: '',
            //   width: '',
            //   height: ''
            // }
          }
        });
      } else {
        throw new Error(response.error || 'Failed to mark order as shipped');
      }
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to mark order as shipped' });
      toast.error(error.message || 'Failed to mark order as shipped');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Mark as Shipped</h2>
              <p className="text-sm text-gray-600">Order #{order?.orderNumber}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tracking Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Tracking Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking ID *
              </label>
              <input
                type="text"
                name="trackingId"
                value={formData.trackingId}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none hover:border-teal-500 focus:border-teal-500"
                placeholder="Enter tracking number"
              />
              {errors.trackingId && (
                <p className="text-red-500 text-sm mt-1">{errors.trackingId}</p>
              )}
            </div>

            {/* <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Provider
                </label>
                <select
                  name="shippingProvider"
                  value={formData.shippingProvider}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="aramex">Aramex</option>
                  <option value="emirates_post">Emirates Post</option>
                  <option value="fedex">FedEx</option>
                  <option value="dhl">DHL</option>
                  <option value="ups">UPS</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                  <option value="overnight">Overnight</option>
                </select>
              </div>
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Estimated Delivery *
              </label>
              <input
                type="date"
                name="estimatedDelivery"
                value={formData.estimatedDelivery}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none hover:border-teal-500 focus:border-teal-500"
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.estimatedDelivery && (
                <p className="text-red-500 text-sm mt-1">{errors.estimatedDelivery}</p>
              )}
            </div>
          </div>

          {/* Package Details */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Weight className="w-4 h-4" />
              Package Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Package Weight (kg) *
              </label>
              <input
                type="number"
                name="weight"
                value={formData.packageDetails.weight}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none hover:border-teal-500 focus:border-teal-500"
                placeholder="0.0"
                step="0.1"
                min="0"
              />
              {errors.weight && (
                <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
              )}
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Ruler className="w-4 h-4 inline mr-1" />
                Dimensions (cm)
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="number"
                    name="dimensions.length"
                    value={formData.packageDetails.dimensions.length}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Length"
                    min="0"
                  />
                  <label className="text-xs text-gray-500 mt-1 block">Length</label>
                  {errors.dimensionsLength && (
                    <p className="text-red-500 text-sm mt-1">{errors.dimensionsLength}</p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    name="dimensions.width"
                    value={formData.packageDetails.dimensions.width}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Width"
                    min="0"
                  />
                  <label className="text-xs text-gray-500 mt-1 block">Width</label>
                  {errors.dimensionsWidth && (
                    <p className="text-red-500 text-sm mt-1">{errors.dimensionsWidth}</p>
                  )}
                </div>
                <div>
                  <input
                    type="number"
                    name="dimensions.height"
                    value={formData.packageDetails.dimensions.height}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Height"
                    min="0"
                  />
                  <label className="text-xs text-gray-500 mt-1 block">Height</label>
                  {errors.dimensionsHeight && (
                    <p className="text-red-500 text-sm mt-1">{errors.dimensionsHeight}</p>
                  )}
                </div>
              </div>
            </div> */}
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Mark as Shipped'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkAsShippedModal;