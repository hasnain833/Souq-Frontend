// src/services/ShippingService.js

import apiService from './ApiService';

class ShippingService {
  async getProviders() {
    const res = await apiService({
      url: '/api/user/shipping/providers',
      method: 'GET',
      withAuth: true,
    });
    return res.data;
  }

  async getShippingRates(origin, destination, packageDetails, providerName = null) {
    const res = await apiService({
      url: '/api/user/shipping/rates',
      method: 'POST',
      data: {
        origin,
        destination,
        packageDetails,
        providerName,
      },
      withAuth: true,
    });
    return res.data;
  }

  async createShipment(orderId, providerName, serviceCode, shipmentData) {
    const res = await apiService({
      url: '/api/user/shipping/shipments',
      method: 'POST',
      data: {
        orderId,
        providerName,
        serviceCode,
        shipmentData,
      },
      withAuth: true,
    });
    return res.data;
  }

  async trackShipment(trackingNumber) {
    const res = await apiService({
      url: `/api/user/shipping/track/${trackingNumber}`,
      method: 'GET',
      withAuth: true,
    });
    return res.data;
  }

  async getDeliveryOptions() {
    const res = await apiService({
      url: '/api/user/shipping/delivery-options',
      method: 'GET',
      withAuth: true,
    });
    return res.data;
  }

  async saveDeliveryOption(deliveryOptionData, deliveryOptionId = null) {
    const url = deliveryOptionId
      ? `/api/user/shipping/delivery-options/${deliveryOptionId}`
      : '/api/user/shipping/delivery-options';

    const method = deliveryOptionId ? 'PUT' : 'POST';

    const res = await apiService({
      url,
      method,
      data: {
        deliveryOptionId,
        ...deliveryOptionData,
      },
      withAuth: true,
    });
    return res.data;
  }

  async deleteDeliveryOption(deliveryOptionId) {
    const res = await apiService({
      url: `/api/user/shipping/delivery-options/${deliveryOptionId}`,
      method: 'DELETE',
      withAuth: true,
    });
    return res.data;
  }

  async setDefaultDeliveryOption(deliveryOptionId) {
    const res = await apiService({
      url: `/api/user/shipping/delivery-options/${deliveryOptionId}/default`,
      method: 'PUT',
      withAuth: true,
    });
    return res.data;
  }

  async getOrders(role = 'buyer', status = null, page = 1, limit = 10) {
    const params = { role, page, limit };
    if (status) params.status = status;

    const res = await apiService({
      url: '/api/user/orders',
      method: 'GET',
      params,
      withAuth: true,
    });
    return res.data;
  }

  async getOrderDetails(orderId) {
    const res = await apiService({
      url: `/api/user/orders/${orderId}`,
      method: 'GET',
      withAuth: true,
    });
    return res.data;
  }

  async createOrder(orderData) {
    const res = await apiService({
      url: '/api/user/orders',
      method: 'POST',
      data: orderData,
      withAuth: true,
    });
    return res.data;
  }

  async updateOrderStatus(orderId, status, notes = '', shippingDetails = {}) {
    const res = await apiService({
      url: `/api/user/orders/${orderId}/status`,
      method: 'PUT',
      data: {
        status,
        notes,
        shippingDetails, // Add shippingDetails here
      },
      withAuth: true,
    });
    return res.data;
  }

  async confirmDelivery(orderId, rating = null, feedback = '') {
    const res = await apiService({
      url: `/api/user/orders/${orderId}/confirm-delivery`,
      method: 'POST',
      data: {
        rating,
        feedback,
      },
      withAuth: true,
    });
    return res.data;
  }

  async getOrderStatistics(role = 'buyer') {
    const res = await apiService({
      url: '/api/user/orders/statistics',
      method: 'GET',
      params: { role },
      withAuth: true,
    });
    return res.data;
  }

  formatProviderName(providerName) {
    const providerMap = {
      aramex: 'Aramex',
      fetchr: 'Fetchr',
      dhl: 'DHL Express',
      local_pickup: 'Local Pickup',
      local_dropoff: 'Drop-off Point',
      local_delivery: 'Local Delivery',
    };
    return providerMap[providerName] || providerName;
  }

  formatDeliveryStatus(status) {
    const statusMap = {
      pending_payment: 'Pending Payment',
      paid: 'Paid',
      processing: 'Processing',
      shipped: 'Shipped',
      in_transit: 'In Transit',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
      refunded: 'Refunded',
    };
    return statusMap[status] || status;
  }

  getStatusColor(status) {
    const colorMap = {
      pending_payment: 'text-yellow-600',
      paid: 'text-blue-600',
      funds_held: 'text-teal-600',
      processing: 'text-purple-600',
      shipped: 'text-indigo-600',
      in_transit: 'text-blue-500',
      out_for_delivery: 'text-orange-600',
      delivered: 'text-green-600',
      cancelled: 'text-red-600',
      returned: 'text-red-500',
      refunded: 'text-gray-600',
    };
    return colorMap[status] || 'text-gray-600';
  }

  calculateEstimatedDelivery(estimatedDays) {
    if (!estimatedDays) return null;
    const days = estimatedDays.max || estimatedDays.min || 3;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + days);
    return estimatedDate;
  }

  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }
}

export default new ShippingService();
