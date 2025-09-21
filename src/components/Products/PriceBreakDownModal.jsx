import React from "react";
import { useTranslation } from "react-i18next";
import { AiOutlineClose, AiOutlineInfoCircle } from "react-icons/ai";

const PriceBreakdownModal = ({ isOpen, onClose, itemPrice, protectionFee }) => {
    const { t, i18n } = useTranslation();
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-xl w-[90%] max-w-md shadow-lg relative p-6">
                {/* Close Button */}
                <button
                    className={`absolute top-4 ${i18n.language === 'ar' ? 'left-4' : 'right-4'
                        } text-gray-500 hover:text-gray-800`}
                    onClick={onClose}
                >
                    <AiOutlineClose size={20} />
                </button>

                <h2 className="text-xl font-semibold mb-6 text-center">{t("price_breakdown")}</h2>

                {/* Price List */}
                <div className="text-lg text-gray-700 space-y-3">
                    <div className="flex justify-between">
                        <span className="text-gray-900 font-semibold">{t("item")}</span>
                        <span className="text-gray-600">${itemPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="flex items-center gap-1 text-gray-900 font-semibold">
                            {t("buyer_protection_fee")} <AiOutlineInfoCircle className="text-gray-500" />
                        </span>
                        <span className="text-gray-600">${protectionFee.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{t("shipping_note")}</p>
                </div>

                {/* Info Box */}
                <div className="mt-6 text-sm text-gray-600 leading-snug border-t pt-4">
                    <p>{t("buyer_protection_info")}</p>
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="mt-6 w-full bg-teal-700 text-white py-2 rounded-md font-semibold hover:bg-teal-800 transition"
                >
                    {t("ok_close")}
                </button>
            </div>
        </div>
    );
};

export default PriceBreakdownModal;
