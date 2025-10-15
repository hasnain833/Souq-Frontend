import React, { useState } from 'react';
import { X, User, Shield, Flag, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { deleteChat, blockUser, reportUser } from '../../api/ChatService';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../common/ConfirmationModal';
import { useTranslation } from 'react-i18next';

const UserInformation = ({
    onClose,
    otherUser,
    chat,
    onChatDeleted
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation()
    const [reportReason, setReportReason] = useState('');
    const [reportDescription, setReportDescription] = useState('');

    const navigate = useNavigate();

    const reportReasons = [
        { value: 'spam', label: 'Spam' },
        { value: 'harassment', label: 'Harassment' },
        { value: 'inappropriate_content', label: 'Inappropriate Content' },
        { value: 'fake_profile', label: 'Fake Profile' },
        { value: 'scam_fraud', label: 'Scam/Fraud' },
        { value: 'hate_speech', label: 'Hate Speech' },
        { value: 'violence_threats', label: 'Violence/Threats' },
        { value: 'other', label: 'Other' }
    ];

    const resetReportForm = () => {
        setReportReason('');
        setReportDescription('');
    };

    const handleDeleteChat = async () => {
        try {
            setLoading(true);
            await deleteChat(chat.id);
            toast.success('Chat deleted successfully');
            onChatDeleted();
            onClose?.();
        } catch (error) {
            console.error('Error deleting chat:', error);
            toast.error('Failed to delete chat');
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    const handleBlockUser = async () => {
        try {
            setLoading(true);
            await blockUser(otherUser.id, 'other', 'Blocked from chat');
            toast.success('User blocked successfully');
            onClose?.();
        } catch (error) {
            console.error('Error blocking user:', error);
            toast.error('Failed to block user');
        } finally {
            setLoading(false);
            setShowBlockConfirm(false);
        }
    };

    const handleReportUser = async () => {
        if (!reportReason || !reportDescription.trim()) {
            toast.error('Please select a reason and provide a description');
            return;
        }

        try {
            setLoading(true);
            await reportUser(otherUser.id, reportReason, reportDescription);
            toast.success('User reported successfully');
            resetReportForm();
            setShowReportModal(false);
            onClose?.();
        } catch (error) {
            console.error('Error reporting user:', error);
            toast.error('Failed to report user');
        } finally {
            setLoading(false);
        }
    };

    const handleViewProfile = () => {
        navigate(`/profile/${otherUser.id}`);
        onClose?.();
    };

    return (
        <div className="w-full mx-auto">
            {/* Header */}
            {/* <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">User Information</h3>
                {onClose && (
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div> */}

            {/* User Info */}
            <div className="p-4">
                <div className="flex items-center space-x-3 mb-4 cursor-pointer rtl:space-x-reverse" onClick={handleViewProfile}>
                    {otherUser?.profile ? (
                        <img
                            // src={`${normalizedURL}${otherUser.profile}`}
                            src={otherUser.profile}
                            alt={otherUser.userName}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-400" />
                        </div>
                    )}
                    <div>
                        <h4 className="font-semibold">
                            {otherUser?.firstName && otherUser?.lastName
                                ? `${otherUser.firstName} ${otherUser.lastName}`
                                : otherUser?.userName}
                        </h4>
                        {/* <p className="text-sm text-gray-500">@{otherUser?.userName}</p> */}
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 rtl:space-y-reverse">
                    {/* <button
                        onClick={handleViewProfile}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition"
                    >
                        <User className="w-5 h-5 text-gray-600" />
                        <span>View Profile</span>
                    </button> */}

                    <button
                        onClick={() => setShowBlockConfirm(true)}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition text-orange-600 rtl:space-x-reverse"
                    >
                        <Shield className="w-5 h-5" />
                        <span>{t("block-user")}</span>
                    </button>

                    <button
                        onClick={() => setShowReportModal(true)}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition text-red-600 rtl:space-x-reverse"
                    >
                        <Flag className="w-5 h-5" />
                        <span>{t("report-user")}</span>
                    </button>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition text-red-600 rtl:space-x-reverse"
                    >
                        <Trash2 className="w-5 h-5" />
                        <span>{t("delete-chat")}</span>
                    </button>
                </div>
            </div>

            {/* Confirmation Modals */}
            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDeleteChat}
                title={t("delete-chat")}
                message={t("delete-chat-warning")}
                confirmText={t("delete")}
                cancelText={t("cancel")}
                loading={loading}
            />

            {showBlockConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full mx-4">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-orange-600">{t("block-user")}</h3>
                            <button
                                onClick={() => setShowBlockConfirm(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="flex items-center space-x-3 mb-4 rtl:space-x-reverse">
                                <Shield className="w-8 h-8 text-orange-500" />
                                <div>
                                    <p className="font-medium">{t("block")} {otherUser?.userName}</p>
                                    <p className="text-sm text-gray-600">
                                        {t("block-info")}
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-3 rtl:space-x-reverse">
                                <button
                                    onClick={() => setShowBlockConfirm(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={loading}
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    onClick={handleBlockUser}
                                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Blocking...' : t('block')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showReportModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-md w-full mx-4">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-red-600">{t("report-user")}</h3>
                            <button
                                onClick={() => setShowReportModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("report-reason")}
                                </label>
                                <select
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">{t("select-reason")}</option>
                                    {reportReasons.map((reason) => (
                                        <option key={reason.value} value={reason.value}>
                                            {reason.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t("description")}
                                </label>
                                <textarea
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    placeholder={t("report-description-placeholder")}
                                    className="w-full p-2 border border-gray-300 rounded-lg resize-none h-28 focus:outline-none"
                                    rows={4}
                                    maxLength={1000}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {reportDescription.length}/1000 {t("characters")}
                                </p>
                            </div>

                            <div className="flex space-x-3 rtl:space-x-reverse">
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    disabled={loading}
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    onClick={handleReportUser}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Reporting...' : t('report')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserInformation;
