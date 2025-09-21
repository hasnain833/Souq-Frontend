import apiService from './ApiService';

class TrackingService {
  // Mark order as shipped with detailed tracking information
  async markOrderAsShipped(orderId, shippingData) {
    const response = await apiService({
      url: `/api/user/orders/${orderId}/ship`,
      method: 'POST',
      data: shippingData,
      withAuth: true,
    });
    return response.data;
  }

  // Get tracking information for an order
  async getTrackingInfo(orderId, trackingId) {
    const response = await apiService({
      url: `/api/user/tracking/${trackingId}`,
      method: 'GET',
      params: { orderId },
      withAuth: true,
    });
    return response.data;
  }

  // Update tracking status manually
  async updateTrackingStatus(trackingId, status, location, description) {
    const response = await apiService({
      url: `/api/user/tracking/${trackingId}/update`,
      method: 'POST',
      data: {
        status,
        location,
        description,
        timestamp: new Date().toISOString()
      },
      withAuth: true,
    });
    return response.data;
  }

  // Get all trackings for a user
  async getUserTrackings(userId) {
    const response = await apiService({
      url: `/api/user/${userId}/trackings`,
      method: 'GET',
      withAuth: true,
    });
    return response.data;
  }

  // Get tracking history
  async getTrackingHistory(trackingId) {
    const response = await apiService({
      url: `/api/user/tracking/${trackingId}/history`,
      method: 'GET',
      withAuth: true,
    });
    return response.data;
  }
}

export default new TrackingService();