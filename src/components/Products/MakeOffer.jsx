import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";
import { createOrGetChat } from "../../api/ChatService";
import { createOffer } from "../../api/OfferService";
import { useTranslation } from "react-i18next";

export default function MakeOfferModal({ product, onClose, isOpen, chatId, onOfferCreated }) {
    const { t } = useTranslation()
    const [customPrice, setCustomPrice] = useState("");
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const normalizedBaseURL = baseURL.endsWith("/") ? baseURL : `${baseURL}/`;

    useEffect(() => {
        if (isOpen && product) {
            console.log('MakeOffer opened with product:', product);
            console.log('Product price:', product?.price);
            console.log('Product photos:', product?.photos);
            setSelectedOffer(discountedPrice(30)); // Default to 30% off like in the image
            setCustomPrice("");
            setError("");
        } else if (!isOpen) {
            setSelectedOffer(null);
            setCustomPrice("");
            setError("");
        }
    }, [isOpen, product]);

    const discountedPrice = (percent) => {
        if (!product?.price || isNaN(product.price)) return "0.00";
        const price = Number(product.price);
        return (price - price * (percent / 100)).toFixed(2);
    };

    const handleOfferSubmit = async () => {
        const offerPrice = selectedOffer || customPrice;

        if (!offerPrice || parseFloat(offerPrice) <= 0) {
            setError("Please enter a valid offer amount");
            return;
        }

        if (parseFloat(offerPrice) > product.price) {
            setError("Offer amount cannot exceed the original price");
            return;
        }

        // Check if discount is more than 80%
        const discountPercentage = ((product.price - parseFloat(offerPrice)) / product.price) * 100;
        if (discountPercentage > 80) {
            setError("Offer cannot be more than 80% discount from the original price");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            // If chatId is provided, we're in chat context - create offer directly
            if (chatId) {
                const response = await createOffer(chatId, {
                    offerAmount: parseFloat(offerPrice),
                    message: `I'd like to offer $${offerPrice} for this item.`
                });

                if (response.success) {
                    if (onOfferCreated) {
                        onOfferCreated(response.data);
                    }
                    onClose();
                    setSelectedOffer(null);
                    setCustomPrice("");
                } else {
                    setError(response.message || 'Failed to create offer');
                }
            } else {
                // Original behavior: redirect to chat with offer amount
                onClose();
                navigate(`/chat-layout?productId=${product.id}&offerAmount=${offerPrice}`);
            }
        } catch (error) {
            console.error("Offer submission error:", error);
            setError(error.message || "Failed to submit offer. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <div className="text-center flex-1 font-semibold text-lg">{t("makeAnOffer")}</div>
                    <button
                        className="text-gray-500 hover:text-gray-800"
                        onClick={onClose}
                    >
                        <AiOutlineClose size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    {(product.photos?.[0] || product.product_photos?.[0]) && (
                        <img
                            src={product.photos?.[0] || product.product_photos?.[0]}
                            alt={product.title || product.name}
                            className="w-16 h-16 object-cover rounded border border-gray-100"
                            onError={(e) => {
                                console.log('MakeOffer image failed to load:', e.target.src);
                                e.target.style.display = 'none';
                            }}
                            onLoad={() => {
                                console.log('MakeOffer image loaded successfully:', e.target.src);
                            }}
                        />
                    )}
                    {!(product.photos?.[0] || product.product_photos?.[0]) && (
                        <div className="w-16 h-16 bg-gray-200 rounded border border-gray-100 flex items-center justify-center">
                            <span className="text-xs text-gray-500">{t("noImage")}</span>
                        </div>
                    )}
                    <div>
                        <h2 className="font-semibold">{product.title}</h2>
                        <p className="text-sm text-gray-500">{t("itemPrice")}: ${product.price ? Number(product.price).toFixed(2) : 'N/A'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                    {[10, 30].map((discount) => (
                        <button
                            key={discount}
                            onClick={() => {
                                setSelectedOffer(discountedPrice(discount));
                                setCustomPrice("");
                            }}
                            className={`border rounded-md p-2 text-center text-sm ${selectedOffer === discountedPrice(discount)
                                ? "border-teal-600 text-teal-600 font-semibold"
                                : "hover:border-teal-600"
                                }`}
                        >
                            ${discountedPrice(discount)} <br />
                            <span className="text-xs text-gray-500">{discount}% {t("off")}</span>
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            setSelectedOffer(null);
                            setCustomPrice("");
                        }}
                        className={`border rounded-md p-2 text-center text-sm ${selectedOffer === null
                            ? "border-teal-600 text-teal-600 font-semibold"
                            : "hover:border-teal-600"
                            }`}
                    >
                        {t("custom")} <br />
                        <span className="text-xs text-gray-500">{t("setPrice")}</span>
                    </button>
                </div>

                {/* Custom Price Input */}
                {selectedOffer === null && (
                    <div className="mb-4">
                        <input
                            type="number"
                            placeholder={t("enterOffer")}
                            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-0"
                            value={customPrice}
                            onChange={(e) => {
                                setCustomPrice(e.target.value);
                                // Clear error when user starts typing
                                if (error) setError("");
                            }}
                        />
                        {/* Real-time discount percentage display */}
                        {/* {customPrice && parseFloat(customPrice) > 0 && product?.price && (
                            <div className="mt-2 text-sm">
                                {(() => {
                                    const discountPercentage = ((product.price - parseFloat(customPrice)) / product.price) * 100;
                                    const isOverLimit = discountPercentage > 80;
                                    return (
                                        <div className={`${isOverLimit ? 'text-red-600' : 'text-green-600'}`}>
                                            {discountPercentage > 0 ? (
                                                <>
                                                    Save ${(product.price - parseFloat(customPrice)).toFixed(2)} ({discountPercentage.toFixed(1)}% off)
                                                    {isOverLimit && (
                                                        <div className="text-red-600 text-xs mt-1">
                                                            ⚠️ Maximum discount allowed is 80%
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-red-600">Offer cannot exceed original price</span>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        )} */}
                    </div>
                )}


                <div className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">${Number((product.price * 0.05).toFixed(2))}</span> {t("incl")}. {t("buyerProtectionFee")}
                </div>


                {/* <div className="mt-4 text-sm text-gray-500">
                    You have 25 offers remaining. We set a limit to make it easier for our members to manage and review offers.
                </div> */}

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <button
                    className="w-full bg-teal-700 text-white font-semibold py-2 rounded mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleOfferSubmit}
                    disabled={(!selectedOffer && !customPrice) || isSubmitting}
                >
                    {isSubmitting ? t('submitting') : `${t("offer")} $${selectedOffer || customPrice || "—"}`}
                </button>
            </div>
        </div>
    );
}
