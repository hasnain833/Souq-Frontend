import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, Check, Trash2, Filter, ChevronDown, Square, CheckSquare, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getNotificationIcon, getNotificationColor, formatTimeAgo } from '../api/NotificationService';
import NotificationSkeleton from '../components/Skeleton/NotificationSkeleton';
import DeleteConfirmationModal from '../components/Notification/DeleteConfirmationModal';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../context/AppContext';
import { Helmet } from 'react-helmet';

const Notifications = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalType, setDeleteModalType] = useState('multiple');
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
    deleteMultipleNotifications,
    deleteAllNotifications
  } = useAppContext();

  // Filter options
  const filterOptions = [
    { label: t("all"), value: "All", count: 0 },
    { label: t("unread"), value: "unread", count: 0 },
    { label: t("read"), value: "read", count: 0 },
  ];

  useEffect(() => {
    const status = activeFilter === 'All' ? null : activeFilter;
    loadNotifications(1, 20, status, true).then(response => {
      setHasMore(response.pagination.hasNextPage);
      setPage(1);
    });
  }, [activeFilter]); // Remove loadNotifications from dependencies to avoid infinite loop

  const handleLoadMore = async () => {
    try {
      const status = activeFilter === 'All' ? null : activeFilter;
      const response = await loadNotifications(page + 1, 20, status, false);
      setHasMore(response.pagination.hasNextPage);
      setPage(page + 1);
    } catch (error) {
      console.error('Error loading more notifications:', error);
      toast.error('Failed to load more notifications');
    }
  };

  const handleNotificationClick = async (notification) => {
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
    setDeleteModalType('multiple');
    setShowDeleteModal(true);
  };

  const handleDeleteAll = () => {
    if (notifications.length === 0) {
      toast.error('No notifications to delete');
      return;
    }
    setDeleteModalType('all');
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteModalType === 'all') {
        await deleteAllNotifications();
        toast.success('All notifications deleted successfully');
        setSelectedNotifications([]);
        setIsSelectionMode(false);
      } else {
        await deleteMultipleNotifications(selectedNotifications);
        toast.success(`${selectedNotifications.length} notifications deleted successfully`);
        setSelectedNotifications([]);
        setIsSelectionMode(false);
      }
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
    const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '');

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
            className="w-12 h-12 rounded-full object-cover"
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
          <div className="fallback-icon invisible absolute inset-0 flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
            <span className="text-xl">{emoji}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
        <span className="text-xl">{emoji}</span>
      </div>
    );
  };

  const getFilteredCount = (filter) => {
    if (filter === 'All') return notifications.length;
    return notifications.filter(n => n.status === filter).length;
  };

  if (loading) {
    return <NotificationSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Notification - Habibi ماركت</title>
        <meta
          name="description"
          content="Welcome to My Website. We provide the best services for your needs."
        />
      </Helmet>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-y-3">
            {/* Left: Back + Heading */}
            <div className="flex items-start sm:items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">{t("notifications")}</h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {isSelectionMode
                    ? `${selectedNotifications.length} selected`
                    : `${unreadCount} ${t("unread_notifications")}`
                  }
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {isSelectionMode ? (
                <>
                  {/* Selection Mode Actions */}
                  <button
                    onClick={selectAllNotifications}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {selectedNotifications.length === notifications.length ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <CheckSquare className="w-4 h-4" />
                    )}
                    <span className="font-medium">
                      {selectedNotifications.length === notifications.length ? t('deselectAll') : t('selectAll')}
                    </span>
                  </button>

                  {selectedNotifications.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="font-medium">{t("delete")} ({selectedNotifications.length})</span>
                    </button>
                  )}

                  <button
                    onClick={clearSelection}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className="font-medium">{t("cancel")}</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Normal Mode Actions */}
                  {notifications.length > 0 && (
                    <button
                      onClick={() => setIsSelectionMode(true)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Square className="w-4 h-4" />
                      <span className="font-medium">{t("select")}</span>
                    </button>
                  )}

                  {notifications.length > 0 && (
                    <button
                      onClick={handleDeleteAll}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="font-medium">{t("deleteAll")}</span>
                    </button>
                  )}

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span className="font-medium">{t("mark_all_read")}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-1 bg-white rounded-lg p-1 border">
          {filterOptions.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeFilter === filter.value
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              {filter.label} ({filter.value === 'All' ? notifications.length : getFilteredCount(filter.value)})
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg border">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{t("no_notifications")}</h3>
              <p className="text-gray-500">{t("notify_when_happens")}</p>
            </div>
          ) : (
            <div className="divide-y"> {/* or "dir='rtl'" / "ltr" manually */}
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative border-b border-gray-100 
    ${notification.status === 'unread' ? 'bg-blue-50' : ''} 
    ${isSelectionMode ? 'pl-12' : ''}`}
                  onClick={() =>
                    isSelectionMode
                      ? toggleNotificationSelection(notification._id)
                      : handleNotificationClick(notification)
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left side (icon + message) */}
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
                              <CheckSquare className="w-5 h-5 text-teal-600" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      )}

                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIconComponent(notification.type, notification)}
                      </div>

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
                          className="w-12 h-12 rounded-md object-cover"
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

              {hasMore && (
                <div className="p-6 text-center border-t">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-2 text-teal-600 hover:text-teal-700 text-sm font-medium disabled:opacity-50 hover:bg-teal-50 rounded-lg transition-colors"
                  >
                    {loading ? t('loading') : t('loadMoreNotifications')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        type={deleteModalType}
        isLoading={isDeleting}
        title={deleteModalType === 'all' ? t('deleteAllNotifications') : t('deleteSelectedNotificationsTitle')}
        message={
          deleteModalType === 'all'
            ? t('deleteAllConfirm')
            : t("deleteSelectedNotificationsConfirm", { count: selectedNotifications.length })
        }
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

// Helper function to get notification titles
const getNotificationTitle = (type) => {
  const titles = {
    'order_confirmed': 'Order Confirmed',
    'order_shipped': 'Item Shipped',
    'order_delivered': 'Item Delivered',
    'offer_received': 'New Offer',
    'offer_accepted': 'Offer Accepted',
    'offer_declined': 'Offer Declined',
    'new_message': 'New Message',
    'new_follower': 'New Follower',
    'new_rating': 'New Rating',
    'payment_received': 'Payment Received',
    'product_liked': 'Product Liked',
    'system': 'System Notification',
    'admin': 'Admin Notification'
  };
  return titles[type] || 'Notification';
};

export default Notifications;
