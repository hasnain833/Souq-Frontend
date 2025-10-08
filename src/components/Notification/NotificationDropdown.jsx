// import React, { useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Eye, Bell } from 'lucide-react';
// import NotificationItem from './NotificationItem';

// const NotificationDropdown = ({
//   notifications,
//   isOpen,
//   onClose,
//   showAll,
//   onToggleShowAll
// }) => {
//   const dropdownRef = useRef(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isOpen, onClose]);

//   const handleViewAllNotifications = () => {
//     navigate('/notification');
//     onClose();
//   };

//   if (!isOpen) return null;

//   const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);
//   const unreadCount = notifications.filter(n => !n.isRead).length;

//   return (
//     <div 
//       ref={dropdownRef}
//       className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden"
//     >
//       {/* Header */}
//       <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
//           {unreadCount > 0 && (
//             <span className="bg-teal-600 text-white text-xs font-medium px-2 py-1 rounded-full">
//               {unreadCount} new
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Notifications List */}
//       <div className="max-h-96 overflow-y-auto">
//         {displayedNotifications.length > 0 ? (
//           displayedNotifications.map((notification) => (
//             <NotificationItem key={notification.id} notification={notification} />
//           ))
//         ) : (
//           <div className="p-8 text-center text-gray-500">
//             <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
//             <p>No notifications yet</p>
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       {notifications.length > 5 && (
//         <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
//           <button
//             onClick={showAll ? onToggleShowAll : handleViewAllNotifications}
//             className="w-full flex items-center justify-center space-x-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
//           >
//             <Eye className="w-4 h-4" />
//             <span>
//               {showAll 
//                 ? 'Show less' 
//                 : `View all notifications (${notifications.length})`
//               }
//             </span>
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationDropdown;


import { useState, useEffect, useRef } from 'react';
import { Bell, X, Settings, Check, Trash2, Square, CheckSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getNotificationIcon, getNotificationColor, formatTimeAgo } from '../../api/NotificationService';
import { LuBell } from 'react-icons/lu';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../context/AppContext';
import { HeaderNotificationSkeleton } from '../Skeleton/HeaderNotificationSkeleton';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { t } = useTranslation();

  // Use global notification context
  const {
    notifications,
    unreadCount,
    notificationsLoading: loading,
    loadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteMultipleNotifications
  } = useAppContext();

  useEffect(() => {
    if (showDropdown && notifications.length === 0) {
      loadNotifications(1, 5); // Load only 5 notifications for dropdown
    }
  }, [showDropdown]); // Remove loadNotifications from dependencies to avoid infinite loop

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    console.log(notification.sender._id, "notification")
    try {
      // Mark as read if unread
      if (notification.status === 'unread') {
        await markNotificationAsRead(notification._id);
      }

      // Navigate based on notification type
      switch (notification.type) {
        case 'order_confirmed':
        case 'order_shipped':
        case 'order_delivered':
          navigate('/orders', { state: { activeTab: 'Wallet' } });
          break;
        case 'offer_received':
        case 'offer_accepted':
        case 'offer_declined':
          if (notification.relatedData.product) {
            navigate(`/product-details/${notification.relatedData.product._id}`);
          }
          break;
        case 'new_message':
          navigate('/chat-layout');
          break;
        case 'new_follower':
          navigate(`/profile/${notification.sender._id}`)
          break;
        case 'new_rating':
          navigate('/member-profile');
          break;
        case 'payment_received':
          navigate('/settings', { state: { activeTab: 'Wallet' } });
          break;
        default:
          break;
      }

      setShowDropdown(false);
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await deleteNotification(notificationId);
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Selection functions
  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  const selectAllNotifications = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n._id));
    }
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
    setIsSelectionMode(false);
  };

  // Bulk delete functions
  const handleBulkDelete = () => {
    if (selectedNotifications.length === 0) {
      toast.error('Please select notifications to delete');
      return;
    }
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMultipleNotifications(selectedNotifications);
      toast.success(`${selectedNotifications.length} notifications deleted successfully`);
      setSelectedNotifications([]);
      setIsSelectionMode(false);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting notifications:', error);
      toast.error('Failed to delete notifications');
    } finally {
      setIsDeleting(false);
    }
  };



  // Helper function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Get base URL without /api
    const baseUrl =  'http://localhost:5000';

    // Handle different path formats
    if (imagePath.startsWith('/uploads/')) {
      // Path already has leading slash
      return `${baseUrl}${imagePath}`;
    } else if (imagePath.startsWith('uploads/')) {
      // Path without leading slash
      return `${baseUrl}/${imagePath}`;
    } else {
      // Other paths - add uploads/ prefix
      return `${baseUrl}/uploads/${imagePath}`;
    }
  };

  const getNotificationIconComponent = (type, notification) => {
    const emoji = getNotificationIcon(type);

    // Use sender profile image if available, otherwise use emoji
    if (notification.sender?.profile) {
      const profileImageUrl = getFullImageUrl(notification.sender.profile);

      return (
        <div className="relative">
          <img
            src={profileImageUrl}
            alt={`${notification.sender.firstName} ${notification.sender.lastName}`}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              console.log('Profile image failed to load:', profileImageUrl);
              // Hide the image
              e.target.style.display = 'none';
              // Show the fallback icon
              const fallbackIcon = e.target.parentNode.querySelector('.fallback-icon');
              if (fallbackIcon) {
                fallbackIcon.style.display = 'flex';
              } else {
                console.error('Fallback icon element not found');
              }
            }}
          />
          <div className="fallback-icon invisible absolute inset-0 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
            <span className="text-lg">{emoji}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
        <span className="text-lg">{emoji}</span>
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <LuBell className="w-5 h-5 text-gray-600 cursor-pointer" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg border z-50 flex flex-col max-h-96 rounded-lg">
          <div className="p-4 border-b bg-gray-50 rounded-t-lg">
            <div className="">
              <div className='flex justify-between items-center'>
                <h3 className="text-lg font-semibold text-gray-900">{t("notifications")}</h3>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isSelectionMode ? (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.length} {t("selected")}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={selectAllNotifications}
                      className="text-xs text-teal-600 hover:text-teal-700 flex items-center space-x-1 rtl:space-x-reverse"
                    >
                      <CheckSquare className="w-3 h-3" />
                      <span>{selectedNotifications.length === notifications.length ? t('deselectAll') : t('selectAll')}</span>
                    </button>
                    {selectedNotifications.length > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        className="text-xs text-red-600 hover:text-red-700 flex items-center space-x-1 rtl:space-x-reverse"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{t("delete")}</span>
                      </button>
                    )}
                    <button
                      onClick={clearSelection}
                      className="text-xs text-gray-600 hover:text-gray-700"
                    >
                      {t("cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center space-x-2">
                    {unreadCount > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        {unreadCount} {t("new")}
                      </span>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={() => setIsSelectionMode(true)}
                        className="text-xs text-gray-600 hover:text-gray-700 flex items-center space-x-1 rtl:space-x-reverse"
                      >
                        <Square className="w-4 h-4" />
                        <span>{t("select")}</span>
                      </button>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-teal-600 hover:text-teal-700 flex items-center space-x-1 rtl:space-x-reverse"
                    >
                      <Check className="w-3 h-3" />
                      <span>{t("mark_all_read")}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              // <div className="p-4 text-center">
              //   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto"></div>
              // </div>
              <HeaderNotificationSkeleton />
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">{t("no_notifications")}</p>
                <p className="text-sm">{t("notify_when_happens")}</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors relative border-b border-gray-100 
    ${notification.status === 'unread' ? 'bg-blue-50' : ''} 
    ${isSelectionMode ? 'pl-8' : ''}`}
                    onClick={() =>
                      isSelectionMode
                        ? toggleNotificationSelection(notification._id)
                        : handleNotificationClick(notification)
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left side (checkbox + icon + text) */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Selection Checkbox */}
                        {isSelectionMode && (
                          <div className="flex-shrink-0 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleNotificationSelection(notification._id);
                              }}
                              className="text-gray-400 hover:text-teal-600 transition-colors"
                            >
                              {selectedNotifications.includes(notification._id) ? (
                                <CheckSquare className="w-4 h-4 text-teal-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Notification icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIconComponent(notification.type, notification)}
                        </div>

                        {/* Message + time */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm leading-relaxed ${notification.status === 'unread'
                                ? 'font-medium text-gray-900'
                                : 'text-gray-700'
                              }`}
                          >
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Right side (dot + product image + delete button) */}
                      <div className="flex items-center gap-2 shrink-0">
                        {notification.status === 'unread' && (
                          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        )}

                        {notification.relatedData?.product?.product_photos?.[0] && (
                          <img
                            src={getFullImageUrl(notification.relatedData.product.product_photos[0])}
                            alt="Product"
                            className="w-8 h-8 rounded-md object-cover"
                            onError={(e) => {
                              console.log('Product image failed to load:', e.target.src);
                              e.target.style.display = 'none';
                            }}
                          />
                        )}

                        {!isSelectionMode && (
                          <button
                            onClick={(e) => handleDeleteNotification(notification._id, e)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            )}
          </div>

          {/* Sticky Footer Button */}
          {notifications.length > 0 && (
            <div className="p-4 text-center border-t">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/notification');
                }}
                className="w-full py-2 px-4 bg-teal-50 hover:bg-teal-100 text-teal-600 hover:text-teal-700 text-sm font-medium rounded-md transition-colors"
              >
                {t("view_all_notifications")} {hasMore && `(${unreadCount} ${t("unread")})`}
              </button>
            </div>
          )}
        </div>

      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        type="multiple"
        isLoading={isDeleting}
        title={t('deleteSelectedNotificationsTitle')}
        message={t("deleteSelectedNotificationsConfirm", { count: selectedNotifications.length })}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default NotificationDropdown;

