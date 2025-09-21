import React, { useState, useEffect } from 'react';
import { Plus, Mail, Check, AlertCircle, Star, Settings } from 'lucide-react';
import { toast } from 'react-toastify';
import { getPaypalAccounts } from '../../api/PaypalAccountService';
import PayPalAccountManager from './PayPalAccountManager';

const PayPalConnectionCard = ({ showTitle = true, compact = false }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await getPaypalAccounts();
      if (response.success) {
        setAccounts(response.data.accounts || []);
      }
    } catch (error) {
      console.error('Failed to load PayPal accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVerificationStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVerificationStatusText = (status) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'pending': return 'Pending';
      case 'failed': return 'Failed';
      default: return 'Unverified';
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">PayPal Accounts</h3>
          </div>
          <button
            onClick={() => setShowManager(true)}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-3">
            <p className="text-sm text-gray-500 mb-2">No PayPal accounts connected</p>
            <button
              onClick={() => setShowManager(true)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Connect PayPal Account
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {accounts.slice(0, 2).map((account) => (
              <div key={account._id} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="text-gray-900">{account.email}</span>
                  {account.isDefault && (
                    <Star className="w-3 h-3 text-blue-600 ml-1" />
                  )}
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getVerificationStatusColor(
                    account.verificationStatus
                  )}`}
                >
                  {account.isVerified ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                </span>
              </div>
            ))}
            {accounts.length > 2 && (
              <div className="text-xs text-gray-500 text-center">
                +{accounts.length - 2} more accounts
              </div>
            )}
          </div>
        )}

        <PayPalAccountManager
          isOpen={showManager}
          onClose={() => setShowManager(false)}
          onAccountAdded={() => {
            loadAccounts();
            toast.success('PayPal account connected successfully!');
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {showTitle && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Mail className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">PayPal Accounts</h3>
              <p className="text-sm text-gray-600">Connect your PayPal accounts for withdrawals</p>
            </div>
          </div>
          <button
            onClick={() => setShowManager(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect Account
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading PayPal accounts...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-8">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No PayPal Accounts Connected</h4>
          <p className="text-gray-600 mb-4">
            Connect your PayPal account to enable quick and secure withdrawals from your wallet.
          </p>
          <button
            onClick={() => setShowManager(true)}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Connect PayPal Account
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account._id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">{account.email}</p>
                    {account.isDefault && (
                      <span className="flex items-center text-xs text-blue-600">
                        <Star className="w-3 h-3 mr-1" />
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500 capitalize">{account.accountType}</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getVerificationStatusColor(
                        account.verificationStatus
                      )}`}
                    >
                      {account.isVerified && <Check className="w-3 h-3 mr-1" />}
                      {!account.isVerified && <AlertCircle className="w-3 h-3 mr-1" />}
                      {getVerificationStatusText(account.verificationStatus)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Added {new Date(account.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowManager(true)}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage PayPal Accounts
            </button>
          </div>
        </div>
      )}

      <PayPalAccountManager
        isOpen={showManager}
        onClose={() => setShowManager(false)}
        onAccountAdded={() => {
          loadAccounts();
          toast.success('PayPal account connected successfully!');
        }}
      />
    </div>
  );
};

export default PayPalConnectionCard;