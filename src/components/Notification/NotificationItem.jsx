import React from 'react';
import { Package, MessageCircle, Bell, Tag } from 'lucide-react';

const NotificationItem = ({ notification }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'sale':
        return <Package className="w-5 h-5 text-green-500" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'promotion':
        return <Tag className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div
      className={`flex items-start space-x-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex-shrink-0">
        {notification.avatar ? (
          <img
            src={notification.avatar}
            alt=""
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {getIcon()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p
            className={`text-sm font-medium text-gray-900 ${
              !notification.isRead ? 'font-semibold' : ''
            }`}
          >
            {notification.title}
          </p>
          {!notification.isRead && (
            <div className="w-2 h-2 bg-teal-600 rounded-full"></div>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-gray-400 mt-2">{notification.timestamp}</p>
      </div>
    </div>
  );
};

export default NotificationItem;
