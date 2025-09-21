import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const PriceSection = ({ price, onChange }) => {
    const { t } = useTranslation()
    const [estimatedEarnings, setEstimatedEarnings] = useState(0);

    useEffect(() => {
        if (price) {
            const priceNum = parseFloat(price);
            const platformFee = priceNum * 0.05; // 5% platform fee
            const earningsAfterFee = priceNum - platformFee;
            setEstimatedEarnings(Math.max(0, earningsAfterFee));
        } else {
            setEstimatedEarnings(0);
        }
    }, [price]);

    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("price")} ($)
                </label>
                <input
                    type="text"
                    id="price"
                    value={price}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
                            onChange(value);
                        }
                    }}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors duration-200"
                />
            </div>

            {/* <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Vinted fee</span>
                    <span className="font-medium">
                        {price ? `$${(parseFloat(price) * 0.05).toFixed(2)}` : '$0.00'}
                    </span>
                </div>
                <div className="flex justify-between font-medium">
                    <span>You'll earn</span>
                    <span className="text-teal-600">${estimatedEarnings.toFixed(2)}</span>
                </div>
            </div> */}

            {/* <div className="pt-2">
                <p className="text-sm text-gray-500">
                    Buyers can still make offers. The final price can be negotiated with the buyer.
                </p>
            </div> */}
        </div>
    );
};

export default PriceSection;
