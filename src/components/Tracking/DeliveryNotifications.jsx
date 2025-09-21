import React, { useState, useEffect } from 'react';
import { Bell, Package, Truck, CheckCircle, X, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ShippingService from '../../api/ShippingService';

const DeliveryNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   loadNotifications();
    
  //   // Set up periodic check for new notifications
  //   const interval = setInterval(loadNotifications, 2 * 60 * 1000); // Check every 2 minutes
  //   return () => clearInterval(interval);
  // }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      // Get recent orders with tracking updates
      const response = await ShippingService.getOrders('buyer', null, 1, 20);
      
      if (response.success) {
        const recentOrders = response.data.orders;
        const deliveryNotifications = [];

        for (const order of recentOrders) {
          if (order.shipping?.trackingNumber) {
            // Check if there are recent status updates
            const lastUpdate = order.timeline?.[0];
            if (lastUpdate && isRecentUpdate(lastUpdate.timestamp)) {
              deliveryNotifications.push({
                id: `${order._id}-${lastUpdate.timestamp}`,
                orderId: order._id,
                orderNumber: order.orderNumber,
                productTitle: order.product.title,
                productImage: order.product.product_photos?.[0],
                status: order.status,
                message: getNotificationMessage(order.status, order.product.title),
                timestamp: lastUpdate.timestamp,
                trackingNumber: order.shipping.trackingNumber,
                isRead: false // In a real app, this would come from user preferences
              });
            }
          }
        }

        setNotifications(deliveryNotifications);
        setUnreadCount(deliveryNotifications.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const isRecentUpdate = (timestamp) => {
    const updateTime = new Date(timestamp);
    const now = new Date();
    const hoursDiff = (now - updateTime) / (1000 * 60 * 60);
    return hoursDiff <= 24; // Consider updates within last 24 hours as recent
  };

  const getNotificationMessage = (status, productTitle) => {
    switch (status) {
      case 'shipped':
        return `Your order for "${productTitle}" has been shipped!`;
      case 'in_transit':
        return `Your order for "${productTitle}" is on its way!`;
      case 'out_for_delivery':
        return `Your order for "${productTitle}" is out for delivery!`;
      case 'delivered':
        return `Your order for "${productTitle}" has been delivered!`;
      default:
        return `Update on your order for "${productTitle}"`;
    }
  };

  const getNotificationIcon = (status) => {
    switch (status) {
      case 'shipped':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'in_transit':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'out_for_delivery':
        return <Truck className="w-5 h-5 text-orange-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    navigate(`/order/${notification.orderId}`);
    setShowDropdown(false);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-20">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Delivery Updates</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No recent delivery updates</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`text-sm ${
                                !notification.isRead ? 'font-medium text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Order #{notification.orderNumber}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatTimeAgo(notification.timestamp)}
                              </p>
                            </div>
                            {notification.productImage && (
                              <img
                                src={notification.productImage}
                                alt="Product"
                                className="w-10 h-10 rounded-md object-cover ml-3"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-gray-50">
                <button
                  onClick={() => {
                    navigate('/orders');
                    setShowDropdown(false);
                  }}
                  className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  View All Orders
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DeliveryNotifications;
