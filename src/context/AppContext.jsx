import React, { createContext, useState, useContext, useEffect } from "react";
import { NotificationService } from "../api/NotificationService";
import { useWebSocketNotifications } from "../hooks/useWebSocketNotifications";
import { toast } from "react-toastify";
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  // const { connected } = useWebSocketNotifications({
  //   onNewNotification: (notification) => {
  //     setNotifications((prev) => [notification, ...prev]);
  //     setUnreadCount((prev) => prev + 1);

  //     // Show toast for high priority notifications
  //     if (
  //       notification.priority === "high" ||
  //       notification.priority === "urgent"
  //     ) {
  //       toast.info(notification.message);
  //     }
  //   },
  //   onUnreadCountUpdate: (count) => {
  //     setUnreadCount(count);
  //   },
  //   onNotificationDeleted: (notificationId) => {
  //     // Remove the deleted notification from the list
  //     setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
  //     // Update unread count if the deleted notification was unread
  //     setNotifications((prev) => {
  //       const deletedNotification = prev.find((n) => n._id === notificationId);
  //       if (deletedNotification && deletedNotification.status === "unread") {
  //         setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
  //       }
  //       return prev.filter((n) => n._id !== notificationId);
  //     });
  //   },
  //   onNotificationsRefresh: () => {
  //     // Refresh the notifications list
  //     loadNotifications();
  //   },
  // });

  // Load notifications function
  const loadNotifications = async (
    page = 1,
    limit = 20,
    status = null,
    reset = true
  ) => {
    try {
      setNotificationsLoading(true);
      const response = await NotificationService.getNotifications(
        page,
        limit,
        status
      );

      if (reset || page === 1) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications((prev) => [...prev, ...response.data.notifications]);
      }

      return response.data;
    } catch (error) {
      console.error("Error loading notifications:", error);
      throw error;
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Load unread count
  const loadUnreadCount = async () => {
    try {
      const user = localStorage.getItem("user"); // or "token" depending on your auth
      if (!user) return; // ⛔ no API call if user not found

      const response = await NotificationService.getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  // const [user, setUser] = useState(() => localStorage.getItem("user"));

  useEffect(() => {
    const handleStorageChange = () => {
      setUser(localStorage.getItem("users"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: "read" } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, status: "read" })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await NotificationService.deleteNotification(notificationId);

      // Update local state
      setNotifications((prev) => {
        const deletedNotification = prev.find((n) => n._id === notificationId);
        if (deletedNotification && deletedNotification.status === "unread") {
          setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
        }
        return prev.filter((n) => n._id !== notificationId);
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  };

  // Delete multiple notifications
  const deleteMultipleNotifications = async (notificationIds) => {
    try {
      await NotificationService.deleteMultipleNotifications(notificationIds);

      // Update local state
      setNotifications((prev) => {
        const deletedNotifications = prev.filter((n) =>
          notificationIds.includes(n._id)
        );
        const unreadDeleted = deletedNotifications.filter(
          (n) => n.status === "unread"
        ).length;

        if (unreadDeleted > 0) {
          setUnreadCount((prevCount) => Math.max(0, prevCount - unreadDeleted));
        }

        return prev.filter((n) => !notificationIds.includes(n._id));
      });
    } catch (error) {
      console.error("Error deleting multiple notifications:", error);
      throw error;
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      await NotificationService.deleteAllNotifications();

      // Update local state
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      throw error;
    }
  };

  // Initialize notifications on mount
  useEffect(() => {
    loadUnreadCount();
  }, []);

  return (
    <AppContext.Provider
      value={{
        isMegaMenuOpen,
        setIsMegaMenuOpen,
        activeCategory,
        setActiveCategory,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        setShowEmailLogin,
        setShowForgotPassword,
        showForgotPassword,
        showEmailLogin,
        showSignUp,
        setShowSignUp,
        // Notification state and functions
        notifications,
        setNotifications,
        unreadCount,
        setUnreadCount,
        notificationsLoading,
        loadNotifications,
        loadUnreadCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        deleteMultipleNotifications,
        deleteAllNotifications,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
