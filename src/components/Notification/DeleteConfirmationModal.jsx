import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  isLoading = false,
  type = "multiple" // "multiple", "all", "single"
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'all':
        return <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />;
      default:
        return <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />;
    }
  };

  const getTitle = () => {
    if (title) return title;

    switch (type) {
      case 'all':
        return t('delete_all_notifications');
      case 'multiple':
        return t('delete_selected_notifications');
      default:
        return t('delete_notification');
    }
  };

  const getMessage = () => {
    if (message) return message;

    switch (type) {
      case 'all':
        return t('delete_all_notifications_message');
      case 'multiple':
        return t('delete_selected_notifications_message');
      default:
        return t('delete_notification_message');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {getTitle()}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          {getIcon()}
          <p className="text-gray-600 mb-6">
            {getMessage()}
          </p>

          {/* {type === 'all' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>{t('warning')}:</strong> {t('delete_all_warning')}
              </p>
            </div>
          )} */}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 rtl:space-x-reverse">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{t('deleting')}...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{t("delete")}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;