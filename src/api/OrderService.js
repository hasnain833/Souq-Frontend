import ApiService from './ApiService';

class OrderService {
  // Get order details by ID
  static async getOrderDetails(orderId) {
    try {
      const response = await ApiService.get(`/orders/${orderId}`);
      return response;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  // Get user's orders
  static async getUserOrders(userId, filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = userId 
        ? `/users/${userId}/orders${queryParams ? `?${queryParams}` : ''}`
        : `/orders${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await ApiService.get(url);
      return response;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  // Update order status
  static async updateOrderStatus(orderId, status, additionalData = {}) {
    try {
      const response = await ApiService.put(`/orders/${orderId}/status`, {
        status,
        ...additionalData
      });
      return response;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Get order by tracking ID
  static async getOrderByTrackingId(trackingId) {
    try {
      const response = await ApiService.get(`/orders/tracking/${trackingId}`);
      return response;
    } catch (error) {
      console.error('Error fetching order by tracking ID:', error);
      throw error;
    }
  }

  // Mark order as shipped
  static async markOrderAsShipped(orderId, shippingData) {
    try {
      const response = await ApiService.post(`/orders/${orderId}/ship`, shippingData);
      return response;
    } catch (error) {
      console.error('Error marking order as shipped:', error);
      throw error;
    }
  }

  // Cancel order
  static async cancelOrder(orderId, reason = '') {
    try {
      const response = await ApiService.post(`/orders/${orderId}/cancel`, { reason });
      return response;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Get order tracking information
  static async getOrderTracking(orderId) {
    try {
      const response = await ApiService.get(`/orders/${orderId}/tracking`);
      return response;
    } catch (error) {
      console.error('Error fetching order tracking:', error);
      throw error;
    }
  }

  // Update order tracking
  static async updateOrderTracking(orderId, trackingData) {
    try {
      const response = await ApiService.put(`/orders/${orderId}/tracking`, trackingData);
      return response;
    } catch (error) {
      console.error('Error updating order tracking:', error);
      throw error;
    }
  }
}

export default OrderService;

// Named exports for convenience
export const {
  getOrderDetails,
  getUserOrders,
  updateOrderStatus,
  getOrderByTrackingId,
  markOrderAsShipped,
  cancelOrder,
  getOrderTracking,
  updateOrderTracking
} = OrderService;