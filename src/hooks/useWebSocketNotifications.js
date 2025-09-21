import { useEffect } from 'react';
import { getSharedSocket, releaseSharedSocket } from './sharedSocket';

export const useWebSocketNotifications = ({
  onNewNotification,
  onUnreadCountUpdate,
  onNotificationDeleted,
  onNotificationsRefresh
}) => {
  useEffect(() => {
    const socket = getSharedSocket();
    if (!socket) return;

    console.log('🔔 Initializing notification listeners');

    const handleNewNotification = (notification) => {
      console.log('🔔 New notification received:', notification);
      onNewNotification?.(notification);
    };

    const handleUnreadCountUpdate = (data) => {
      console.log('🔔 Unread count updated:', data.unreadCount);
      onUnreadCountUpdate?.(data.unreadCount);
    };

    const handleNotificationDeleted = (data) => {
      console.log('🔔 Notification deleted:', data.notificationId);
      onNotificationDeleted?.(data.notificationId);
    };

    const handleNotificationsRefresh = () => {
      console.log('🔔 Notifications refresh requested');
      onNotificationsRefresh?.();
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('unread_count_updated', handleUnreadCountUpdate);
    socket.on('notification_deleted', handleNotificationDeleted);
    socket.on('notifications_refresh', handleNotificationsRefresh);

    return () => {
      console.log('🔔 Cleaning up notification listeners');
      socket.off('new_notification', handleNewNotification);
      socket.off('unread_count_updated', handleUnreadCountUpdate);
      socket.off('notification_deleted', handleNotificationDeleted);
      socket.off('notifications_refresh', handleNotificationsRefresh);
      releaseSharedSocket();
    };
  }, [onNewNotification, onUnreadCountUpdate, onNotificationDeleted, onNotificationsRefresh]);

  return {
    connected: !!getSharedSocket()?.connected
  };
};