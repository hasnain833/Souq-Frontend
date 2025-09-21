import React from 'react'
import { useTranslation } from 'react-i18next';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemType = 'item' }) => {
    const { t } = useTranslation()
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-lg font-semibold text-gray-800"> {t("delete")} {itemType}</h2>
                <p className="text-sm text-gray-600 mt-2">
                    {t("delete_confirmation", { itemType })}
                </p>

                <div className="mt-6 flex justify-end space-x-3 rtl:space-x-reverse">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                        {t("delete")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal