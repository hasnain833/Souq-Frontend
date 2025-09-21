import { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { createOffer } from '../../api/OfferService';

const MakeOfferModal = ({
  isOpen,
  onClose,
  product,
  chatId,
  onOfferCreated
}) => {
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');



  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredAmount = parseFloat(offerAmount);

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      setError('Please enter a valid offer amount');
      return;
    }

    if (enteredAmount === product.price) {
      setError('Offer must be lower than the original price');
      return;
    }

    if (parseFloat(offerAmount) > productPrice) {
      setError('Offer amount cannot exceed the original price');
      return;
    }

    // Check if discount is more than 80%
    const discountPercentage = ((productPrice - parseFloat(offerAmount)) / productPrice) * 100;
    if (discountPercentage > 80) {
      setError('Offer cannot be more than 80% discount from the original price');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await createOffer(chatId, {
        offerAmount: parseFloat(offerAmount),
        message: message.trim()
      });

      if (response.success) {
        onOfferCreated(response.data);
        onClose();
        setOfferAmount('');
        setMessage('');
      }
    } catch (error) {
      console.error('Create offer error:', error);
      setError(error.message || 'Failed to create offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setOfferAmount('');
      setMessage('');
      setError('');
      onClose();
    }
  };

  if (!isOpen || !product) return null;

  const productPrice = product.price ? Number(product.price) : 0;
  const discountPercentage = offerAmount && productPrice
    ? Math.round(((productPrice - parseFloat(offerAmount)) / productPrice) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Make an offer</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            {(product.product_photos?.[0] || product.photos?.[0]) && (
              <img
                src={`${import.meta.env.VITE_API_BASE_URL?.endsWith('/') ? import.meta.env.VITE_API_BASE_URL.slice(0, -1) : import.meta.env.VITE_API_BASE_URL}${product.product_photos?.[0] || product.photos?.[0]}`}
                alt={product.title}
                className="w-20 h-20 object-cover rounded-lg border"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {product.title}
              </h3>
              <p className="text-lg font-bold text-gray-900">
                ${product.price ? Number(product.price).toFixed(2) : 'Price not available'}
              </p>
              {product.size && product.condition && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span>{product.size}</span>
                  <span>•</span>
                  <span>{product.condition}</span>
                  {product.brand && (
                    <>
                      <span>•</span>
                      <span>{product.brand}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <DollarSign size={18} className="text-gray-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={productPrice}
                value={offerAmount}
                onChange={(e) => {
                  setOfferAmount(e.target.value);
                  // Clear error when user starts typing
                  if (error) setError('');
                }}
                placeholder="Enter your offer amount"
                className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={isSubmitting}
                required
              />
            </div>
            {offerAmount && parseFloat(offerAmount) > 0 && productPrice > 0 && (
              <div className="mt-2 text-sm">
                {(() => {
                  const isOverLimit = discountPercentage > 80;
                  return (
                    <div className={`font-medium ${isOverLimit ? 'text-red-600' : 'text-green-600'}`}>
                      Save ${(productPrice - parseFloat(offerAmount)).toFixed(2)} ({discountPercentage}% off)
                      {isOverLimit && (
                        <div className="text-red-600 text-xs mt-1">
                          ⚠️ Maximum discount allowed is 80%
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {productPrice > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setOfferAmount((productPrice * 0.9).toFixed(2))}
                  disabled={isSubmitting}
                  className="p-4 text-center border-2 border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all disabled:opacity-50"
                >
                  <div className="font-bold text-lg text-gray-900">${(productPrice * 0.9).toFixed(2)}</div>
                  <div className="text-sm text-gray-600 mt-1">10% off</div>
                </button>

                <button
                  type="button"
                  onClick={() => setOfferAmount((productPrice * 0.7).toFixed(2))}
                  disabled={isSubmitting}
                  className="p-4 text-center border-2 border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50 transition-all disabled:opacity-50"
                >
                  <div className="font-bold text-lg text-gray-900">${(productPrice * 0.7).toFixed(2)}</div>
                  <div className="text-sm text-gray-600 mt-1">30% off</div>
                </button>

                <div className="p-4 text-center border-2 border-teal-200 rounded-lg bg-teal-50">
                  <div className="font-bold text-lg text-teal-700">Custom</div>
                  <div className="text-sm text-teal-600 mt-1">Set price</div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">${offerAmount || '0.00'} incl. Buyer Protection fee</span>
            </div>
          </div>

          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              You have 25 offers remaining. We set a limit to make it easier for
              our members to manage and review offers.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !offerAmount}
            className="w-full bg-teal-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isSubmitting ? 'Creating Offer...' : `Offer $${offerAmount || '0.00'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MakeOfferModal;
