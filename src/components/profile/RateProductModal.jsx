import React, { useState, useEffect } from 'react';
import { X, Star, Package, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { submitProductRating } from '../../api/RatingService';
import LoadingSpinner from '../common/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const RateProductModal = ({
    isOpen,
    onClose,
    sellerProfile,
    sellerProducts = [],
    onRatingSubmitted
}) => {
    const { t } = useTranslation()
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [categories, setCategories] = useState({
        quality: 0,
        communication: 0,
        shipping: 0,
        description: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1); // 1: Select Product, 2: Rate Product

    const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/api$/, '') || '';

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setSelectedProduct(null);
            setRating(0);
            setHoverRating(0);
            setReview('');
            setCategories({
                quality: 0,
                communication: 0,
                shipping: 0,
                description: 0
            });
            setStep(1);
        }
    }, [isOpen]);

    const handleProductSelect = (product) => {
        setSelectedProduct(product);
        setStep(2);
    };

    const handleCategoryRating = (category, value) => {
        setCategories(prev => ({
            ...prev,
            [category]: value
        }));
    };

    const handleSubmitRating = async () => {
        if (!selectedProduct) {
            toast.error('Please select a product to rate');
            return;
        }

        if (rating === 0) {
            toast.error('Please provide a rating');
            return;
        }

        try {
            setIsSubmitting(true);

            const ratingData = {
                rating,
                review: review.trim(),
                ratingType: 'buyer_to_seller',
                categories: Object.fromEntries(
                    Object.entries(categories).filter(([_, value]) => value > 0)
                )
            };

            const productId = selectedProduct.id || selectedProduct._id;
            const res = await submitProductRating(productId, ratingData);

            if (res?.success) {
                toast.success(res.message || 'Thank you for your rating! Your feedback helps other buyers.');

                if (onRatingSubmitted) {
                    onRatingSubmitted({
                        product: selectedProduct,
                        rating,
                        review,
                        categories
                    });
                }

                onClose();
            } else {
                console.log(res, "res")
                toast.error(res?.error || res?.message || 'You have already rated this product');
            }

        } catch (error) {
            console.error('❌ Error submitting rating:', error);

            // Get error from API if available
            const apiMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'An unexpected error occurred while submitting your rating.';

            toast.error(apiMessage);
        } finally {
            setIsSubmitting(false);
        }
    };


    const getProductImage = (product) => {
        const photos = product.product_photos || product.photos || [];
        if (photos.length > 0) {
            const imageUrl = photos[0];
            if (imageUrl.startsWith('http')) {
                return imageUrl;
            } else {
                const cleanUrl = imageUrl.startsWith('/') ? imageUrl.substring(1) : imageUrl;
                return `${baseURL}/${cleanUrl}`;
            }
        }
        return null;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {step === 1 ? t("select-product-to-rate") : t('rate-product')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 1 ? (
                        // Step 1: Product Selection
                        <div>
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <img
                                        // src={sellerProfile?.profile
                                        //     ? `${baseURL}${sellerProfile.profile}`
                                        //     : `https://ui-avatars.com/api/?name=${sellerProfile?.firstName?.[0] || 'U'}&background=e5e7eb&color=6b7280&size=40`
                                        // }
                                        src={sellerProfile?.profile
                                            ? sellerProfile?.profile
                                            : `https://ui-avatars.com/api/?name=${sellerProfile?.firstName?.[0] || 'U'}&background=e5e7eb&color=6b7280&size=40`
                                        }
                                        alt={`${sellerProfile?.firstName || ''} ${sellerProfile?.lastName || ''}`.trim()}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {sellerProfile?.firstName} {sellerProfile?.lastName}
                                        </p>
                                        <p className="text-sm text-gray-500">{t("select-product-to-rate")}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Product Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                                {sellerProducts.length > 0 ? (
                                    sellerProducts.map((product) => (
                                        <div
                                            key={product.id || product._id}
                                            onClick={() => handleProductSelect(product)}
                                            className="border rounded-lg p-4 hover:border-teal-500 hover:shadow-md transition-all cursor-pointer"
                                        >
                                            <div className="flex gap-3">
                                                {getProductImage(product) ? (
                                                    <img
                                                        src={getProductImage(product)}
                                                        alt={product.title}
                                                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <Package className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                                                        {product.title}
                                                    </h3>
                                                    <p className="text-teal-600 font-semibold text-sm">
                                                        ${product.price}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {product.condition} • {product.brand}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-8">
                                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">{t("no-products-to-rate")}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        // Step 2: Rating Form
                        <div>
                            {/* Selected Product Info */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex gap-3">
                                    {getProductImage(selectedProduct) ? (
                                        <img
                                            src={getProductImage(selectedProduct)}
                                            alt={selectedProduct.title}
                                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Package className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 mb-1">
                                            {selectedProduct?.title}
                                        </h3>
                                        <p className="text-teal-600 font-semibold">
                                            ${selectedProduct?.price}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            by {sellerProfile?.firstName} {sellerProfile?.lastName}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Overall Rating */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    {t("overall-rating")} *
                                </label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="text-2xl transition-colors"
                                        >
                                            <Star
                                                className={`w-8 h-8 ${star <= (hoverRating || rating)
                                                    ? 'text-yellow-500 fill-current'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm text-gray-600">
                                        {rating > 0 && `${rating}/5`}
                                    </span>
                                </div>
                            </div>

                            {/* Category Ratings */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    {t("detailed-ratings-optional")}
                                </label>
                                <div className="space-y-3">
                                    {Object.entries({
                                        quality: 'Product Quality',
                                        communication: 'Seller Communication',
                                        shipping: 'Shipping Speed',
                                        description: 'Item as Described'
                                    }).map(([key, label]) => (
                                        <div key={key} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{label}</span>
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => handleCategoryRating(key, star)}
                                                        className="text-lg"
                                                    >
                                                        <Star
                                                            className={`w-5 h-5 ${star <= categories[key]
                                                                ? 'text-yellow-500 fill-current'
                                                                : 'text-gray-300'
                                                                }`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Review Text */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("review-optional")}
                                </label>
                                <textarea
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    placeholder={t("share-experience")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                                    rows={4}
                                    maxLength={1000}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {review.length}/1000 {t("characters")}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 max-sm:flex-col">
                                <button
                                    onClick={() => setStep(1)}
                                    className="
      flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg 
      hover:bg-gray-50 transition-colors
      sm:px-3 sm:py-2 sm:text-sm
      max-sm:px-2 max-sm:py-1 max-sm:text-xs
    "
                                >
                                    {t("back-to-products")}
                                </button>

                                <button
                                    onClick={handleSubmitRating}
                                    disabled={rating === 0 || isSubmitting}
                                    className="
    flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700
    disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors 
    flex items-center justify-center gap-2
    sm:px-3 sm:py-2 sm:text-sm
    max-sm:px-2 max-sm:py-1 max-sm:text-xs
  "
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            {t("submitting")}...
                                        </>
                                    ) : (
                                        t("submit-rating")
                                    )}
                                </button>

                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RateProductModal;
