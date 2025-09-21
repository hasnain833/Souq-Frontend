import React from 'react';
import { useTranslation } from 'react-i18next';

const ItemDetails = ({ title, description, onTitleChange, onDescriptionChange }) => {
    const { t } = useTranslation()
    return (
        <div className="space-y-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("title")}
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder={t("exampleItem")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none transition-colors duration-200"
                    maxLength={80}
                />
                <div className="flex justify-end mt-1">
                    <span className="text-xs text-gray-500">{title.length}/80</span>
                </div>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("description")}
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    placeholder={t("describeItem")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none h-28 resize-none transition-colors duration-200 min-h-[120px]"
                    maxLength={1000}
                />
                <div className="flex justify-end mt-1">
                    <span className="text-xs text-gray-500">{description.length}/1000</span>
                </div>
            </div>
        </div>
    );
};

export default ItemDetails;
