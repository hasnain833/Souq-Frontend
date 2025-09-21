import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useTranslation } from 'react-i18next';

const ActionButtons = ({ onUpload, onSaveDraft, isValid, isUploading }) => {
    const { t } = useTranslation()
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="flex justify-end flex-col sm:flex-row gap-3 mt-6 mb-12">
            {/* <button
                type="button"
                onClick={onSaveDraft}
                className="flex items-center justify-center sm:justify-start gap-2 px-6 py-3 hover:bg-gray-100 text-teal-700 rounded-md font-semibold border border-teal-600 w-full sm:w-auto"
            >
                <Save className="h-5 w-5" />
                <span>{t("saveAsDraft")}</span>
            </button> */}

            <div 
                className="relative w-full sm:w-auto"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <button
                    type="button"
                    onClick={onUpload}
                    disabled={!isValid || isUploading}
                    className={`px-6 py-3 rounded-md font-medium text-white w-full sm:w-auto flex items-center justify-center gap-2 transition-colors duration-200 ${isValid && !isUploading
                        ? 'bg-teal-600 hover:bg-teal-700'
                        : 'bg-gray-300 cursor-not-allowed'
                        }`}
                >
                    {isUploading && (
                        <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                    )}
                    {isUploading ? t('uploading') : t('upload')}
                </button>
                
                {/* Tooltip for disabled state */}
                {!isValid && !isUploading && showTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2">
                        <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                            {t('pleaseFillAllFields')}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActionButtons;