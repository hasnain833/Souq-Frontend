import React from 'react';
import { X, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const StatusConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  productTitle,
  currentStatus,
  isLoading = false
}) => {

  const { t } = useTranslation()

  if (!isOpen) return null;

  const getActionConfig = () => {
    switch (action) {
      case 'sold':
        return {
          title: t('markAsSold'),
          message: t('confirmMarkSold'),
          description: t('confirmMarkSoldNote'),
          icon: <CheckCircle className="w-6 h-6 text-red-600" />,
          confirmText: t('markAsSold'),
          confirmClass: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'reserved':
        return {
          title: t('markAsReserved'),
          message: t('confirmMarkReserved'),
          description: t('confirmMarkReservedNote'),
          icon: <Clock className="w-6 h-6 text-yellow-600" />,
          confirmText: t('markAsReserved'),
          confirmClass: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'reactivate':
        const isFromSold = currentStatus === 'sold';
        const isFromReserved = currentStatus === 'reserved';
        return {
          title: isFromSold ? t('mark-as-unsold') : isFromReserved ? t('mark-as-unreserved') : t('markAvailable'),
          message: isFromSold ? t('confirmMarkUnsold') :
            isFromReserved ? t('confirmMarkUnreserved') :
              t('confirmMakeAvailable'),
          description: t('confirmMakeAvailableNote'),
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          confirmText: isFromSold ? t('mark-as-unsold') : isFromReserved ? t('mark-as-unreserved') : t('markAvailable'),
          confirmClass: 'bg-green-600 hover:bg-green-700 text-white'
        };
      default:
        return {
          title: 'Confirm Action',
          message: t('confirmProceed'),
          description: '',
          icon: <AlertTriangle className="w-6 h-6 text-gray-600" />,
          confirmText: 'Confirm',
          confirmClass: 'bg-teal-600 hover:bg-teal-700 text-white'
        };
    }
  };

  const config = getActionConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {config.title}
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
        <div className="p-6">
          <div className="flex items-start space-x-4 rtl:space-x-reverse">
            <div className="flex-shrink-0">
              {config.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-2">
                {config.message}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                {t("product")}: <span className="font-medium">{productTitle}</span>
              </p>
              {config.description && (
                <p className="text-sm text-gray-500">
                  {config.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 rtl:space-x-reverse">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            {t("cancel")}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${config.confirmClass} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            disabled={isLoading}
          >
            {isLoading ? t('processing') : config.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusConfirmationModal;
