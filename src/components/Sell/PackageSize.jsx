import React, { useState } from 'react';
import { Box, Package, PackageOpen, DollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PackageSize = ({ packageSize, category, onChange, customShippingCost, onCustomCostChange }) => {
  const { t } = useTranslation()
  const getPackageSizesForCategory = () => {
    return [
      {
        id: 'small',
        name: t('small'),
        description: 'For items that’d fit in a large envelope.',
        icon: <Box className="h-8 w-8 text-teal-600" />,
        // cost: 20,
      },
      {
        id: 'medium',
        name: t('medium'),
        description: 'For items that’d fit in a shoebox.',
        icon: <Package className="h-8 w-8 text-teal-600" />,
        // cost: 40,
      },
      {
        id: 'large',
        name: t('large'),
        description: 'For items that’d fit in a moving box.',
        icon: <PackageOpen className="h-8 w-8 text-teal-600" />,
        // cost: 60,
      },
      {
        id: 'custom',
        name: t('custom'),
        description: 'Enter a custom shipping cost.',
        icon: <DollarSign className="h-8 w-8 text-teal-600" />,
      }
    ];
  };

  const packageSizes = getPackageSizesForCategory();

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        {t("packageSizeHint")}
      </p>

      <div className="grid grid-cols-1 gap-3">
        {packageSizes.map((size) => (
          <label
            key={size.id}
            className={`border rounded-lg p-4 flex items-start cursor-pointer transition-colors duration-200 ${packageSize === size.id
              ? 'border-teal-600 bg-green-50'
              : 'border-gray-300 hover:border-gray-400'
              }`}
          >
            <input
              type="radio"
              name="packageSize"
              value={size.id}
              checked={packageSize === size.id}
              onChange={() => {
                onChange(size.id);
                if (size.id !== 'custom') {
                  onCustomCostChange(""); // reset custom cost when switching from custom
                }
              }}
              className="sr-only"
            />
            <div className="flex items-center space-x-3 rtl:space-x-reverse w-full">
              <div className="flex-shrink-0">
                {size.icon}
              </div>
              <div className="flex-grow">
                <p className="font-medium">{size.name}</p>
                {/* {packageSize === size.id && size.cost && (
                  <p className="text-sm text-gray-700 mt-1">Shipping Cost: ${size.cost}</p>
                )} */}
                {size.id === 'custom' && packageSize === 'custom' && (
                  <div className="mt-2">
                    <label className="block text-sm text-gray-600 mb-1">{t("enterCustomShipping")}</label>
                    <input
                      type="number"
                      min="0"
                      value={customShippingCost}
                      onChange={(e) => onCustomCostChange(Number(e.target.value))}
                      className="border border-gray-300 rounded-md px-3 py-1 w-full focus:outline-none"
                      placeholder="e.g., 150"
                    />
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <div
                  className={`w-5 h-5 rounded-full border ${packageSize === size.id
                    ? 'border-teal-600 bg-teal-600'
                    : 'border-gray-300'
                    } flex items-center justify-center`}
                >
                  {packageSize === size.id && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PackageSize;
