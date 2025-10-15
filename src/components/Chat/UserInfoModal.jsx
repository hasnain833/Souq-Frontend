import React, { useState } from 'react';
import { X, User, Shield, Flag, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { deleteChat, blockUser, reportUser } from '../../api/ChatService';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../common/ConfirmationModal';

const UserInfoModal = ({ 
  isOpen, 
  onClose, 
  otherUser, 
  chat,
  onChatDeleted 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Report form state
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');

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


  if (!isOpen) return null;

  const handleDeleteChat = async () => {
    try {
      setLoading(true);
      await deleteChat(chat.id);
      toast.success('Chat deleted successfully');
      onChatDeleted();
      onClose();
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
      onClose();
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
      onClose();
    } catch (error) {
      console.error('Error reporting user:', error);
      // toast.error('Failed to report user');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = () => {
    navigate(`/profile/${otherUser.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">User Information</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            {otherUser?.profile ? (
              <img
                src={`${normalizedURL}${otherUser.profile}`}
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
              <p className="text-sm text-gray-500">@{otherUser?.userName}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleViewProfile}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <User className="w-5 h-5 text-gray-600" />
              <span>View Profile</span>
            </button>

            <button
              onClick={() => setShowBlockConfirm(true)}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors text-orange-600"
            >
              <Shield className="w-5 h-5" />
              <span>Block User</span>
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors text-red-600"
            >
              <Flag className="w-5 h-5" />
              <span>Report User</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors text-red-600"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete Chat</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteChat}
          title="Delete Chat"
          message="This will permanently delete this chat and all messages. This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          loading={loading}
        />

        {/* Block Confirmation */}
        {showBlockConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
              <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-orange-600">Block User</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="font-medium">Block {otherUser?.userName}?</p>
                  <p className="text-sm text-gray-600">
                    They won't be able to message you or see your profile.
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBlockConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockUser}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Blocking...' : 'Block'}
                </button>
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-red-600">Report User</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reporting
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select a reason</option>
                  {reportReasons.map((reason) => (
                    <option key={reason.value} value={reason.value}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Please provide details about why you're reporting this user..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reportDescription.length}/1000 characters
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    // resetReportForm();
                    setShowReportModal(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                 onClick={() => {
                     onClose();
                   handleReportUser();
                    resetReportForm();
                    setShowReportModal(false);
                  }}
                 
                   
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Reporting...' : 'Report'}
                </button>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfoModal;
