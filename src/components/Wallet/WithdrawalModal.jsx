import React, { useState, useEffect } from 'react';
import { X, Building2, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { getBankAccounts } from '../../api/PaymentMethodService';
import { getPaypalAccounts } from '../../api/PaypalAccountService';
import { withdrawMoney, formatCurrency } from '../../api/WalletService';
import PayPalAccountManager from '../PayPal/PayPalAccountManager';
import { useTranslation } from 'react-i18next';

const WithdrawalModal = ({ 
  isOpen, 
  onClose, 
  wallet, 
  selectedCurrency, 
  onWithdrawalSuccess 
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [paypalAccounts, setPaypalAccounts] = useState([]);
  
  const [withdrawalData, setWithdrawalData] = useState({
    amount: '',
    currency: selectedCurrency || 'AED',
    withdrawalMethod: 'bank_transfer',
    bankAccountId: '',
    paypalAccountId: '',
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [showPayPalManager, setShowPayPalManager] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBankAccounts();
      loadPaypalAccounts();
      setWithdrawalData(prev => ({
        ...prev,
        currency: selectedCurrency || 'AED'
      }));
    }
  }, [isOpen, selectedCurrency]);

  const loadBankAccounts = async () => {
    try {
      setLoadingBankAccounts(true);
      const response = await getBankAccounts();
      if (response.success) {
        setBankAccounts(response.data.accounts || []);
        // Set default bank account if none selected
        if (!withdrawalData.bankAccountId && response.data.accounts?.length > 0) {
          const defaultAccount = response.data.accounts.find(acc => acc.isDefault) || response.data.accounts[0];
          setWithdrawalData(prev => ({ ...prev, bankAccountId: defaultAccount._id }));
        }
      }
    } catch (error) {
      console.error('Failed to load bank accounts:', error);
      toast.error('Failed to load bank accounts');
    } finally {
      setLoadingBankAccounts(false);
    }
  };

  const loadPaypalAccounts = async () => {
    try {
      const response = await getPaypalAccounts();
      if (response.success) {
        setPaypalAccounts(response.data.accounts || []);
        // Set default PayPal account if none selected
        if (!withdrawalData.paypalAccountId && response.data.accounts?.length > 0) {
          const defaultAccount = response.data.accounts.find(acc => acc.isDefault) || response.data.accounts[0];
          setWithdrawalData(prev => ({ ...prev, paypalAccountId: defaultAccount._id }));
        }
      }
    } catch (error) {
      console.error('Failed to load PayPal accounts:', error);
      toast.error('Failed to load PayPal accounts');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate amount
    if (!withdrawalData.amount || parseFloat(withdrawalData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid withdrawal amount';
    }

    // Check if amount exceeds balance
    const currentBalance = wallet?.balances?.[selectedCurrency] || 0;
    if (parseFloat(withdrawalData.amount) > currentBalance) {
      newErrors.amount = `Insufficient balance. Available: ${formatCurrency(currentBalance, selectedCurrency)}`;
    }

    // Validate withdrawal method selection
    if (withdrawalData.withdrawalMethod === 'bank_transfer' && !withdrawalData.bankAccountId) {
      newErrors.bankAccount = 'Please select a bank account for withdrawal';
    }

    if (withdrawalData.withdrawalMethod === 'paypal' && !withdrawalData.paypalAccountId) {
      newErrors.paypalAccount = 'Please select a PayPal account for withdrawal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await withdrawMoney(withdrawalData);

      if (response.success) {
        // Show detailed success message
        const accountInfo = withdrawalData.withdrawalMethod === 'bank_transfer' 
          ? bankAccounts.find(acc => acc._id === withdrawalData.bankAccountId)
          : paypalAccounts.find(acc => acc._id === withdrawalData.paypalAccountId);

        const accountDisplay = withdrawalData.withdrawalMethod === 'bank_transfer'
          ? `${accountInfo?.bankName} ****${accountInfo?.lastFourDigits}`
          : accountInfo?.email;

        toast.success(
          <div>
            <div className="font-semibold">Withdrawal Submitted Successfully!</div>
            <div className="text-sm mt-1">
              {formatCurrency(withdrawalData.amount, selectedCurrency)} will be transferred to {accountDisplay}
            </div>
            <div className="text-xs mt-1 text-gray-600">
              Processing time: {withdrawalData.withdrawalMethod === 'bank_transfer' ? '1-3 business days' : '1-2 business days'}
            </div>
          </div>,
          { autoClose: 8000 }
        );

        onClose();
        if (onWithdrawalSuccess) {
          onWithdrawalSuccess();
        }

        // Reset form
        setWithdrawalData({
          amount: '',
          currency: selectedCurrency || 'AED',
          withdrawalMethod: 'bank_transfer',
          bankAccountId: '',
          paypalAccountId: '',
          description: ''
        });

      } else {
        const errorMessage = response.error || response.message || 'Failed to process withdrawal';
        toast.error(
          <div>
            <div className="font-semibold">Withdrawal Failed</div>
            <div className="text-sm mt-1">{errorMessage}</div>
          </div>
        );
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to process withdrawal';
      toast.error(
        <div>
          <div className="font-semibold">Withdrawal Error</div>
          <div className="text-sm mt-1">{errorMessage}</div>
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

  const currentBalance = wallet?.balances?.[selectedCurrency] || 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Withdrawal Method</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleWithdraw}>
          <div className="space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={withdrawalData.amount}
                  onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500 ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter amount"
                />
                {errors.amount && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.amount}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Available: {formatCurrency(currentBalance, selectedCurrency)}
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={withdrawalData.currency}
                onChange={(e) => setWithdrawalData({ ...withdrawalData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="AED">AED</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            {/* Withdrawal Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawal Method</label>
              <select
                value={withdrawalData.withdrawalMethod}
                onChange={(e) => setWithdrawalData({ 
                  ...withdrawalData, 
                  withdrawalMethod: e.target.value,
                  bankAccountId: '',
                  paypalAccountId: ''
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>

            {/* Bank Account Selection */}
            {withdrawalData.withdrawalMethod === 'bank_transfer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Bank Account</label>
                {loadingBankAccounts ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    Loading bank accounts...
                  </div>
                ) : bankAccounts.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">No bank accounts found</span>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          toast.info('Please add a bank account in Payment Settings first');
                        }}
                        className="text-teal-600 hover:text-teal-700 text-sm underline"
                      >
                        Add Bank Account
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <select
                      value={withdrawalData.bankAccountId}
                      onChange={(e) => setWithdrawalData({ ...withdrawalData, bankAccountId: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500 ${
                        errors.bankAccount ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Bank Account</option>
                      {bankAccounts.map((account) => (
                        <option key={account._id} value={account._id}>
                          {account.bankName} - ****{account.lastFourDigits} {account.isDefault ? '(Default)' : ''}
                        </option>
                      ))}
                    </select>
                    {errors.bankAccount && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.bankAccount}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* PayPal Account Selection */}
            {withdrawalData.withdrawalMethod === 'paypal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select PayPal Account</label>
                {paypalAccounts.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">No PayPal accounts found</span>
                      <button
                        type="button"
                        onClick={() => setShowPayPalManager(true)}
                        className="text-teal-600 hover:text-teal-700 text-sm underline"
                      >
                        Connect PayPal Account
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <select
                      value={withdrawalData.paypalAccountId}
                      onChange={(e) => setWithdrawalData({ ...withdrawalData, paypalAccountId: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-teal-500 focus:border-teal-500 ${
                        errors.paypalAccount ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select PayPal Account</option>
                      {paypalAccounts.map((account) => (
                        <option key={account._id} value={account._id}>
                          {account.email} {account.isDefault ? '(Default)' : ''} {!account.isVerified ? '(Unverified)' : ''}
                        </option>
                      ))}
                    </select>
                    {errors.paypalAccount && (
                      <div className="flex items-center mt-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.paypalAccount}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={withdrawalData.description}
                onChange={(e) => setWithdrawalData({ ...withdrawalData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                placeholder="Withdrawal reason"
              />
            </div>

            {/* Processing Time Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
                <div className="text-sm text-blue-800">
                  <div className="font-medium">Processing Time</div>
                  <div className="mt-1">
                    {withdrawalData.withdrawalMethod === 'bank_transfer' 
                      ? 'Bank transfers typically take 1-3 business days to process.'
                      : 'PayPal transfers typically take 1-2 business days to process.'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        </form>

        {/* PayPal Account Manager Modal */}
        <PayPalAccountManager
          isOpen={showPayPalManager}
          onClose={() => setShowPayPalManager(false)}
          onAccountAdded={(account) => {
            // Reload PayPal accounts after adding new one
            loadPaypalAccounts();
            // Set the newly added account as selected if it's the first one
            if (paypalAccounts.length === 0) {
              setWithdrawalData(prev => ({ ...prev, paypalAccountId: account._id }));
            }
            toast.success('PayPal account connected successfully!');
          }}
        />
      </div>
    </div>
  );
};

export default WithdrawalModal;