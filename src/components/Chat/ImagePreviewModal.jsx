import React, { useEffect } from 'react';

const ImagePreviewModal = ({ 
  isOpen, 
  imageUrl, 
  onClose, 
  senderName = 'Unknown User',
  timestamp = null 
}) => {
  // Close modal on Escape key press and handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Prevent default behavior for space and arrow keys to avoid page scrolling
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      // Focus the modal for keyboard accessibility
      document.activeElement?.blur();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleBackdropClick = (e) => {
    // Close modal when clicking on backdrop (not on the image)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = () => {
    try {
      // Create a temporary link element to download the image
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `chat-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-full max-w-6xl max-h-full flex flex-col">
        {/* Header with sender info and close button */}
        <div className="flex items-center justify-between mb-2 sm:mb-4 text-white px-2 sm:px-0">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm sm:text-base truncate">{senderName}</p>
              {timestamp && (
                <p className="text-xs sm:text-sm text-gray-300">
                  {new Date(timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Download button */}
            <button
              onClick={handleDownload}
              className="p-1.5 sm:p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              title="Download image"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
              title="Close (Esc)"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image container */}
        <div className="flex items-center justify-center flex-1 min-h-0">
          <img
            src={imageUrl}
            alt="Full size preview"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on image
            onError={(e) => {
              console.error('Failed to load image:', imageUrl);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />

          {/* Error fallback */}
          <div
            className="hidden text-white text-center p-4 sm:p-8 bg-gray-800 rounded-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-base sm:text-lg font-medium mb-2">Failed to load image</p>
            <p className="text-sm sm:text-base text-gray-400">The image could not be displayed</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-2 sm:mt-4 text-center text-gray-300 text-xs sm:text-sm px-2">
          <p className="hidden sm:block">Click outside the image or press Esc to close</p>
          <p className="sm:hidden">Tap outside the image to close</p>
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
