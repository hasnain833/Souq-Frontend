import apiService from './ApiService';

const NOTIFICATION_BASE = '/api/user/notifications';

export const NotificationService = {
  async getNotifications(page = 1, limit = 20, status = null, type = null) {
    try {
      const params = { page, limit };
      if (status) params.status = status;
      if (type) params.type = type;

      const res = await apiService({
        url: `${NOTIFICATION_BASE}`,
        method: 'GET',
        params,
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async getUnreadCount() {
    try {
      const res = await apiService({
        url: `${NOTIFICATION_BASE}/unread-count`,
        method: 'GET',
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async markAsRead(notificationId) {
    try {
      const res = await apiService({
        url: `${NOTIFICATION_BASE}/${notificationId}/read`,
        method: 'PATCH',
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async markAllAsRead() {
    try {
      const res = await apiService({
        url: `${NOTIFICATION_BASE}/mark-all-read`,
        method: 'PATCH',
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteNotification(notificationId) {
    try {
      const res = await apiService({
        url: `${NOTIFICATION_BASE}/${notificationId}`,
        method: 'DELETE',
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteMultipleNotifications(notificationIds) {
    try {
      const res = await apiService({
        url: `${NOTIFICATION_BASE}/bulk/delete`,
        method: 'DELETE',
        data: { notificationIds },
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteAllNotifications() {
    try {
      const res = await apiService({
        url: `${NOTIFICATION_BASE}/bulk/delete-all`,
        method: 'DELETE',
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async getNotificationSettings() {
    try {
      const res = await apiService({
        url: `${NOTIFICATION_BASE}/settings`,
        method: 'GET',
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  async updateNotificationSettings(settings) {
    try {
      const res = await apiService({
        url: `${NOTIFICATION_BASE}/settings`,
        method: 'PUT',
        data: settings,
      });

      return res.data;
    } catch (error) {
      throw error;
    }
  }
};

export const NotificationTypes = {
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  OFFER_RECEIVED: 'offer_received',
  OFFER_ACCEPTED: 'offer_accepted',
  OFFER_DECLINED: 'offer_declined',
  OFFER_EXPIRED: 'offer_expired',
  NEW_FOLLOWER: 'new_follower',
  NEW_MESSAGE: 'new_message',
  NEW_RATING: 'new_rating',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_COMPLETED: 'payment_completed',
  PRODUCT_LIKED: 'product_liked',
  SYSTEM_ANNOUNCEMENT: 'system_announcement'
};

export const getNotificationIcon = (type) => {
  const iconMap = {
    [NotificationTypes.ORDER_CONFIRMED]: '📦',
    [NotificationTypes.ORDER_SHIPPED]: '🚚',
    [NotificationTypes.ORDER_DELIVERED]: '✅',
    [NotificationTypes.OFFER_RECEIVED]: '💰',
    [NotificationTypes.OFFER_ACCEPTED]: '✅',
    [NotificationTypes.OFFER_DECLINED]: '❌',
    [NotificationTypes.OFFER_EXPIRED]: '⏰',
    [NotificationTypes.NEW_FOLLOWER]: '👤',
    [NotificationTypes.NEW_MESSAGE]: '💬',
    [NotificationTypes.NEW_RATING]: '⭐',
    [NotificationTypes.PAYMENT_RECEIVED]: '💳',
    [NotificationTypes.PAYMENT_COMPLETED]: '✅',
    [NotificationTypes.PRODUCT_LIKED]: '❤️',
    [NotificationTypes.SYSTEM_ANNOUNCEMENT]: '📢'
  };

  return iconMap[type] || '🔔';
};

export const getNotificationColor = (type) => {
  const colorMap = {
    [NotificationTypes.ORDER_CONFIRMED]: 'text-blue-600',
    [NotificationTypes.ORDER_SHIPPED]: 'text-purple-600',
    [NotificationTypes.ORDER_DELIVERED]: 'text-green-600',
    [NotificationTypes.OFFER_RECEIVED]: 'text-yellow-600',
    [NotificationTypes.OFFER_ACCEPTED]: 'text-green-600',
    [NotificationTypes.OFFER_DECLINED]: 'text-red-600',
    [NotificationTypes.OFFER_EXPIRED]: 'text-gray-600',
    [NotificationTypes.NEW_FOLLOWER]: 'text-blue-600',
    [NotificationTypes.NEW_MESSAGE]: 'text-teal-600',
    [NotificationTypes.NEW_RATING]: 'text-yellow-600',
    [NotificationTypes.PAYMENT_RECEIVED]: 'text-green-600',
    [NotificationTypes.PAYMENT_COMPLETED]: 'text-green-600',
    [NotificationTypes.PRODUCT_LIKED]: 'text-red-600',
    [NotificationTypes.SYSTEM_ANNOUNCEMENT]: 'text-blue-600'
  };

  return colorMap[type] || 'text-gray-600';
};

export const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = now - time;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return time.toLocaleDateString();
};

export default NotificationService;
