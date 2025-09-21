// components/DeleteConfirmationModal.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
    const { t } = useTranslation()
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-md shadow-md w-[90%] max-w-sm text-center">
                <h2 className="text-lg font-semibold mb-4">{t("areYouSure")}</h2>
                <p className="text-gray-600 mb-6">{t("deleteConfirmation")}</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                    >
                        {isDeleting ? (
                            <span className="flex items-center gap-2">
                                <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                                {t("deleting")}
                            </span>
                        ) : (
                            t("delete")
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
