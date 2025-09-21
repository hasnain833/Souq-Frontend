import React from 'react';
import { X, Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

const NetworkErrorModal = ({
    isOpen,
    onClose,
    onRetry,
    title = "Network Connection Error",
    message = "Network is not connected. Please check your internet connection and try again later.",
    showRetryButton = true,
    autoRetry = false,
    retryCount = 0,
    maxRetries = 3
}) => {
    if (!isOpen) return null;

    const handleRetry = () => {
        if (onRetry) {
            onRetry();
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    const getErrorIcon = () => {
        if (navigator.onLine === false) {
            return <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />;
        }
        return <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />;
    };

    const getErrorTitle = () => {
        if (navigator.onLine === false) {
            return "No Internet Connection";
        }
        return title;
    };

    const getErrorMessage = () => {
        if (navigator.onLine === false) {
            return "Please check your internet connection and try again.";
        }
        return message;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>

                <div className="p-8 text-center">
                    {/* Error Icon */}
                    {getErrorIcon()}

                    {/* Title */}
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                        {getErrorTitle()}
                    </h2>

                    {/* Message */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                        {getErrorMessage()}
                    </p>

                    {/* Connection Status */}
                    <div className="flex items-center justify-center mb-6 p-3 bg-gray-50 rounded-lg">
                        {navigator.onLine ? (
                            <>
                                <Wifi className="w-5 h-5 text-green-500 mr-2" />
                                <span className="text-sm text-green-600 font-medium">Internet Connected</span>
                            </>
                        ) : (
                            <>
                                <WifiOff className="w-5 h-5 text-red-500 mr-2" />
                                <span className="text-sm text-red-600 font-medium">No Internet Connection</span>
                            </>
                        )}
                    </div>

                    {/* Retry Information */}
                    {autoRetry && retryCount > 0 && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-600">
                                Retry attempt {retryCount} of {maxRetries}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        {showRetryButton && (
                            <button
                                onClick={handleRetry}
                                className="flex items-center justify-center px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </button>
                        )}

                        <button
                            onClick={handleClose}
                            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                        >
                            Close
                        </button>
                    </div>

                    {/* Tips */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Troubleshooting Tips:</h4>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Check your WiFi or mobile data connection</li>
                            <li>• Try refreshing the page</li>
                            <li>• Check if other websites are working</li>
                            <li>• Contact your internet service provider if the issue persists</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkErrorModal;
