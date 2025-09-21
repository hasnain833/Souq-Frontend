import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, AlertCircle, Mail, Shield, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  getPaypalAccounts, 
  addPaypalAccount, 
  deletePaypalAccount, 
  setDefaultPaypalAccount,
  verifyPaypalAccount,
  validatePaypalEmail 
} from '../../api/PaypalAccountService';
import { useTranslation } from 'react-i18next';

const PayPalAccountManager = ({ isOpen, onClose, onAccountAdded }) => {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    accountType: 'personal',
    setAsDefault: false
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const response = await getPaypalAccounts();
      if (response.success) {
        setAccounts(response.data.accounts || []);
      }
    } catch (error) {
      console.error('Failed to load PayPal accounts:', error);
      toast.error('Failed to load PayPal accounts');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!validatePaypalEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await addPaypalAccount(formData);
      
      if (response.success) {
        toast.success('PayPal account added successfully!');
        setFormData({ email: '', accountType: 'personal', setAsDefault: false });
        setShowAddForm(false);
        await loadAccounts();
        
        if (onAccountAdded) {
          onAccountAdded(response.data.account);
        }
      } else {
        toast.error(response.error || 'Failed to add PayPal account');
      }
    } catch (error) {
      console.error('Error adding PayPal account:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to add PayPal account';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to remove this PayPal account?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await deletePaypalAccount(accountId);
      
      if (response.success) {
        toast.success('PayPal account removed successfully');
        await loadAccounts();
      } else {
        toast.error(response.error || 'Failed to remove PayPal account');
      }
    } catch (error) {
      console.error('Error deleting PayPal account:', error);
      toast.error('Failed to remove PayPal account');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (accountId) => {
    try {
      setLoading(true);
      const response = await setDefaultPaypalAccount(accountId);
      
      if (response.success) {
        toast.success('Default PayPal account updated');
        await loadAccounts();
      } else {
        toast.error(response.error || 'Failed to set default account');
      }
    } catch (error) {
      console.error('Error setting default account:', error);
      toast.error('Failed to set default account');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async (accountId) => {
    try {
      setLoading(true);
      const response = await verifyPaypalAccount(accountId);
      
      if (response.success) {
        toast.success('PayPal account verified successfully!');
        await loadAccounts();
      } else {
        toast.error(response.error || 'Failed to verify PayPal account');
      }
    } catch (error) {
      console.error('Error verifying PayPal account:', error);
      toast.error('Failed to verify PayPal account');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">PayPal Account Management</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Add Account Button */}
        {!showAddForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Connect PayPal Account
            </button>
          </div>
        )}

        {/* Add Account Form */}
        {showAddForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Add PayPal Account</h4>
            <form onSubmit={handleAddAccount}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PayPal Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your PayPal email"
                    />
                  </div>
                  {formErrors.email && (
                    <div className="flex items-center mt-1 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="personal">Personal</option>
                    <option value="business">Business</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="setAsDefault"
                    checked={formData.setAsDefault}
                    onChange={(e) => setFormData({ ...formData, setAsDefault: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="setAsDefault" className="ml-2 block text-sm text-gray-700">
                    Set as default PayPal account
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ email: '', accountType: 'personal', setAsDefault: false });
                    setFormErrors({});
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Account'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Accounts List */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Connected PayPal Accounts</h4>
          
          {loading && accounts.length === 0 ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading PayPal accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No PayPal accounts connected</p>
              <p className="text-sm text-gray-500 mt-1">Add a PayPal account to enable withdrawals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account._id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
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

                  <div className="flex items-center space-x-2">
                    {!account.isVerified && (
                      <button
                        onClick={() => handleVerifyAccount(account._id)}
                        className="flex items-center px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        disabled={loading}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Verify
                      </button>
                    )}
                    
                    {!account.isDefault && (
                      <button
                        onClick={() => handleSetDefault(account._id)}
                        className="flex items-center px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        disabled={loading}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Set Default
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteAccount(account._id)}
                      className="flex items-center px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      disabled={loading}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
            <div className="text-sm text-blue-800">
              <div className="font-medium">PayPal Account Requirements</div>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>PayPal account must be verified to enable withdrawals</li>
                <li>Withdrawals typically take 1-2 business days to process</li>
                <li>Ensure your PayPal account can receive payments</li>
                <li>You can set one account as default for quick withdrawals</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayPalAccountManager;