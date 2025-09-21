import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import {
    addCard, addBankAccount, getCards, getBankAccounts, setDefaultCard, deleteCard, setDefaultBankAccount, deleteBankAccount, formatCardNumber, formatExpiryDate, validateCardNumber, validateExpiryDate, getCardBrand
} from '../../api/PaymentMethodService';
import { Trash2, CreditCard, Building2, Star, StarOff, X, Lock, LockIcon } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useTranslation } from 'react-i18next';
import PaymentAndBankSkeleton from '../Skeleton/PaymentAndBankSkeleton ';

export default function PaymentOptions() {
    const { t } = useTranslation();
    const [openCard, setOpenCard] = useState(false);
    const [openBank, setOpenBank] = useState(false);
    const [cards, setCards] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const cardSchema = Yup.object().shape({
        cardholderName: Yup.string().min(2).max(100).required('Cardholder name is required'),
        cardNumber: Yup.string()
            .required('Card number is required')
            .test('valid-card', 'Invalid card number', value => {
                if (!value) return false;
                const cleanNumber = value.replace(/\D/g, '');
                return validateCardNumber(cleanNumber);
            }),
        expiry: Yup.string()
            .required('Expiration date is required')
            .test('valid-expiry', 'Invalid or expired date', value => {
                return validateExpiryDate(value);
            }),
        cvv: Yup.string().matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits').required('CVV is required'),
        billingAddress: Yup.string().min(5).required('Billing address is required')
    });

    const bankSchema = Yup.object().shape({
        accountHolderName: Yup.string().min(2).max(100).required('Account holder name is required'),
        accountNumber: Yup.string().matches(/^\d{9,18}$/, 'Account number must be 9–18 digits').required('Account number is required'),
        routingNumber: Yup.string().matches(/^\d{9}$/, 'Routing number must be 9 digits').required('Routing number is required'),
        accountType: Yup.string().required('Account type is required'),
        bankName: Yup.string().min(2).required('Bank name is required'),
        billingAddress: Yup.string().min(5).required('Billing address is required')
    });

    const {
        register: registerCard,
        handleSubmit: handleCardSubmit,
        control: controlCard,
        reset: resetCard,
        formState: { errors: cardErrors }
    } = useForm({
        resolver: yupResolver(cardSchema),
        defaultValues: {
            cardholderName: '',
            cardNumber: '',
            expiry: '',
            cvv: '',
            billingAddress: ''
        }
    });

    const {
        register: registerBank,
        handleSubmit: handleBankSubmit,
        reset: resetBank,
        formState: { errors: bankErrors }
    } = useForm({
        resolver: yupResolver(bankSchema),
        defaultValues: {
            accountHolderName: '',
            accountNumber: '',
            routingNumber: '',
            accountType: 'checking',
            bankName: '',
            billingAddress: ''
        }
    });

    // Fetch payment methods on component mount
    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            setLoading(true);
            console.log('🔄 Fetching payment methods...');

            // Fetch cards and bank accounts separately with activeOnly=true
            const [cardsResponse, bankAccountsResponse] = await Promise.allSettled([
                getCards(true), // Explicitly pass activeOnly=true
                getBankAccounts(true) // Explicitly pass activeOnly=true
            ]);

            console.log('📋 Cards response:', cardsResponse);
            console.log('📋 Bank accounts response:', bankAccountsResponse);

            // Handle cards response
            if (cardsResponse.status === 'fulfilled' && cardsResponse.value.success) {
                const fetchedCards = cardsResponse.value.data.cards || [];
                console.log('✅ Cards fetched:', fetchedCards.length, 'cards');
                setCards(fetchedCards);
            } else {
                console.error('❌ Failed to fetch cards:', cardsResponse.reason);
                setCards([]);
            }

            // Handle bank accounts response
            if (bankAccountsResponse.status === 'fulfilled' && bankAccountsResponse.value.success) {
                const fetchedAccounts = bankAccountsResponse.value.data.accounts || [];
                console.log('✅ Bank accounts fetched:', fetchedAccounts.length, 'accounts');
                setBankAccounts(fetchedAccounts);
            } else {
                console.error('❌ Failed to fetch bank accounts:', bankAccountsResponse.reason);
                setBankAccounts([]);
            }

        } catch (error) {
            console.error('❌ Failed to fetch payment methods:', error);
            toast.error('Failed to load payment methods');
            setCards([]);
            setBankAccounts([]);
        } finally {
            setLoading(false);
            console.log('✅ Payment methods fetch completed');
        }
    };

    const onCardSubmit = async (data) => {
        try {
            setSubmitting(true);

            // Parse expiry date
            const [expiryMonth, expiryYear] = data.expiry.split('/');

            const cardData = {
                cardholderName: data.cardholderName,
                cardNumber: data.cardNumber.replace(/\D/g, ''), // Remove spaces
                expiryMonth,
                expiryYear, // Keep as 2-digit format (YY) to match backend validation
                cvv: data.cvv,
                billingAddress: {
                    street1: data.billingAddress
                },
                isDefault: cards.length === 0 // Set as default if it's the first card
            };

            const response = await addCard(cardData);
            if (response.success) {
                toast.success('Card added successfully!');
                setOpenCard(false);
                resetCard();
                fetchPaymentMethods(); // Refresh the list
            }
        } catch (error) {
            console.error('Failed to add card:', error);
            toast.error(error.error || 'Failed to add card');
        } finally {
            setSubmitting(false);
        }
    };

    const onBankSubmit = async (data) => {
        try {
            setSubmitting(true);

            const bankData = {
                accountHolderName: data.accountHolderName,
                accountNumber: data.accountNumber,
                routingNumber: data.routingNumber,
                accountType: data.accountType,
                bankName: data.bankName,
                billingAddress: {
                    street1: data.billingAddress
                },
                isDefault: bankAccounts.length === 0 // Set as default if it's the first account
            };

            const response = await addBankAccount(bankData);
            if (response.success) {
                toast.success('Bank account added successfully!');
                setOpenBank(false);
                resetBank();
                fetchPaymentMethods(); // Refresh the list
            }
        } catch (error) {
            console.error('Failed to add bank account:', error);
            toast.error(error.error || 'Failed to add bank account');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetDefault = async (itemId, type) => {
        try {
            let response;
            if (type === 'card') {
                response = await setDefaultCard(itemId);
            } else {
                response = await setDefaultBankAccount(itemId);
            }

            if (response.success) {
                toast.success(`Default ${type} updated!`);
                fetchPaymentMethods(); // Refresh the list
            }
        } catch (error) {
            console.error('Failed to set default:', error);
            toast.error(error.error || `Failed to update default ${type}`);
        }
    };

    const [deleteTarget, setDeleteTarget] = useState({ id: null, type: '' });
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);


    const handleDelete = async (itemId, type) => {
        try {
            console.log(`🗑️ Deleting ${type} with ID:`, itemId);

            // Optimistically update UI
            if (type === 'card') {
                setCards(prev => prev.filter(card => card._id !== itemId));
            } else {
                setBankAccounts(prev => prev.filter(acc => acc._id !== itemId));
            }

            let response =
                type === 'card' ? await deleteCard(itemId) : await deleteBankAccount(itemId);

            if (response.success) {
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
                console.log(`✅ ${type} deleted successfully`);
            } else {
                toast.error(response.error || `Failed to delete ${type}`);
            }
        } catch (error) {
            toast.error(error.message || `Failed to delete ${type}`);
        } finally {
            await fetchPaymentMethods(); // Always refresh UI
        }
    };


    const handleCardNumberChange = (value, onChange) => {
        const formatted = formatCardNumber(value);
        onChange(formatted);
    };

    const handleExpiryChange = (value, onChange) => {
        const formatted = formatExpiryDate(value);
        onChange(formatted);
    };

    const getCardBrandIcon = (brand) => {
        switch (brand) {
            case 'visa': return '💳';
            case 'mastercard': return '💳';
            case 'amex': return '💳';
            case 'discover': return '💳';
            default: return '💳';
        }
    };

    if (loading) {
        return (
            <PaymentAndBankSkeleton />
        );
    }

    return (
        <>
            <div className="p-4 container mx-auto space-y-6">
                {/* Payment Cards Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-medium text-gray-500">{t('paymentOptions')}</p>
                        <button
                            className="px-4 py-2 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 transition-colors"
                            onClick={() => setOpenCard(true)}
                        >
                            {t('addNewCard')}
                        </button>
                    </div>

                    {/* Cards List */}
                    <div className="space-y-3">
                        {cards.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>{t("no_cards")}</p>
                            </div>
                        ) : (
                            cards.map((card) => (
                                <div key={card._id} className="border rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                        <div className="text-2xl">{getCardBrandIcon(card.cardBrand)}</div>
                                        <div>
                                            <p className="font-medium">**** **** **** {card.lastFourDigits}</p>
                                            <p className="text-sm text-gray-500">
                                                {card.cardholderName} • Expires {card.expiryMonth}/{card.expiryYear}
                                            </p>
                                            {card.isDefault && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    {t("default")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {!card.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(card._id, 'card')}
                                                className="p-2 text-gray-400 hover:text-teal-600 transition-colors"
                                                title="Set as default"
                                            >
                                                <StarOff className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setDeleteTarget({ id: card._id, type: 'card' });
                                                setDeleteModalOpen(true);
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete card"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Bank Accounts Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-medium text-gray-500">{t('payoutOptions')}</p>
                        <button
                            className="px-4 py-2 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 transition-colors"
                            onClick={() => setOpenBank(true)}
                        >
                            {t('addBankAccount')}
                        </button>
                    </div>

                    {/* Bank Accounts List */}
                    <div className="space-y-3">
                        {bankAccounts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Building2 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                                <p>{t("no_bank_accounts")}</p>
                            </div>
                        ) : (
                            bankAccounts.map((account) => (
                                <div key={account._id} className="border rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                        <div className="text-2xl">🏦</div>
                                        <div>
                                            <p className="font-medium">****{account.lastFourDigits}</p>
                                            <p className="text-sm text-gray-500">
                                                {account.accountHolderName} • {account.bankName || 'Bank Account'}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} {t("account")}
                                            </p>
                                            {account.isDefault && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800 mt-1">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    {t("default")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        {!account.isDefault && (
                                            <button
                                                onClick={() => handleSetDefault(account._id, 'bank account')}
                                                className="p-2 text-gray-400 hover:text-teal-600 transition-colors"
                                                title="Set as default"
                                            >
                                                <StarOff className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                setDeleteTarget({ id: account._id, type: 'bank account' });
                                                setDeleteModalOpen(true);
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete account"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Card Modal */}
                {/* <Dialog open={openCard} onClose={() => !submitting && setOpenCard(false)} className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <Dialog.Panel className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <Dialog.Title className="text-xl font-semibold">{t('cardDetails')}</Dialog.Title>
                                <button
                                    onClick={() => setOpenCard(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500">{t('cardInfoSecure')}</p>
                            <form onSubmit={handleCardSubmit(onCardSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium">{t('cardHolder')}</label>
                                    <input
                                        {...registerCard('cardholderName')}
                                        className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500 "
                                        placeholder="John Doe"
                                    />
                                    {cardErrors.cardholderName && <p className="text-red-500 text-sm mt-1">{cardErrors.cardholderName.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('cardNumber')}</label>
                                    <Controller
                                        name="cardNumber"
                                        control={controlCard}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                onChange={(e) => handleCardNumberChange(e.target.value, field.onChange)}
                                                placeholder="1234 5678 9012 3456"
                                                className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500 "
                                                maxLength={19}
                                            />
                                        )}
                                    />
                                    {cardErrors.cardNumber && <p className="text-red-500 text-sm mt-1">{cardErrors.cardNumber.message}</p>}
                                </div>
                                <div className="flex space-x-4 rtl:space-x-reverse">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium">{t('expiryDate')}</label>
                                        <Controller
                                            name="expiry"
                                            control={controlCard}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    onChange={(e) => handleExpiryChange(e.target.value, field.onChange)}
                                                    placeholder="MM/YY"
                                                    className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500"
                                                    maxLength={5}
                                                />
                                            )}
                                        />
                                        {cardErrors.expiry && <p className="text-red-500 text-sm mt-1">{cardErrors.expiry.message}</p>}
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium">{t('securityCode')}</label>
                                        <input
                                            {...registerCard('cvv')}
                                            placeholder="123"
                                            className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500 "
                                            maxLength={4}
                                        />
                                        {cardErrors.cvv && <p className="text-red-500 text-sm mt-1">{cardErrors.cvv.message}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('billingAddress')}</label>
                                    <input
                                        {...registerCard('billingAddress')}
                                        placeholder="123 Main St, City, State, ZIP"
                                        className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500 "
                                    />
                                    {cardErrors.billingAddress && <p className="text-red-500 text-sm mt-1">{cardErrors.billingAddress.message}</p>}
                                </div>
                                <div className="flex space-x-3 pt-4 rtl:space-x-reverse">
                                    <button
                                        type="button"
                                        onClick={() => setOpenCard(false)}
                                        disabled={submitting}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-teal-600 text-white py-2 rounded hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Adding...' : t('Add Card')}
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                </Dialog> */}

                <Dialog open={openCard} onClose={() => !submitting && setOpenCard(false)} className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 sm:mx-auto p-6 space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <Dialog.Title className="text-lg font-semibold">{t("cardDetails")}</Dialog.Title>
                            <button onClick={() => setOpenCard(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Subtext */}
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            {t("cardInfoSecure")} <LockIcon className='w-4 h-4' />
                        </p>

                        {/* Payment Logos */}
                        <div className="flex space-x-2 rtl:space-x-reverse">
                            <img src="https://img.icons8.com/color/48/000000/mastercard-logo.png" className="h-6" alt="Mastercard" />
                            <img src="https://img.icons8.com/color/48/000000/visa.png" className="h-6" alt="Visa" />
                            <img src="https://img.icons8.com/color/48/000000/discover.png" className="h-6" alt="Discover" />
                        </div>

                        {/* Card Input Box (Bordered Section like Image) */}
                        <div className="border rounded-md p-4 space-y-4">
                            <form onSubmit={handleCardSubmit(onCardSubmit)} className="space-y-4">

                                {/* Cardholder Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t("cardHolder")}</label>
                                    <input
                                        {...registerCard('cardholderName')}
                                        className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500"
                                        placeholder="John Doe"
                                    />
                                    {cardErrors.cardholderName && <p className="text-red-500 text-sm mt-1">{cardErrors.cardholderName.message}</p>}
                                </div>

                                {/* Card Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t("cardNumber")}</label>
                                    <Controller
                                        name="cardNumber"
                                        control={controlCard}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                onChange={(e) => handleCardNumberChange(e.target.value, field.onChange)}
                                                placeholder="e.g. 1234 1234 1234 1234"
                                                className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500"
                                                maxLength={19}
                                            />
                                        )}
                                    />
                                    {cardErrors.cardNumber && <p className="text-red-500 text-sm mt-1">{cardErrors.cardNumber.message}</p>}
                                </div>

                                {/* Expiry + CVV */}
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700">{t("expiryDate")}</label>
                                        <Controller
                                            name="expiry"
                                            control={controlCard}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    onChange={(e) => handleExpiryChange(e.target.value, field.onChange)}
                                                    placeholder="MM/YY"
                                                    className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500"
                                                    maxLength={5}
                                                />
                                            )}
                                        />
                                        {cardErrors.expiry && <p className="text-red-500 text-sm mt-1">{cardErrors.expiry.message}</p>}
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700">{t("securityCode")}</label>
                                        <input
                                            {...registerCard('cvv')}
                                            placeholder="e.g. 123"
                                            className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500"
                                            maxLength={4}
                                        />
                                        {cardErrors.cvv && <p className="text-red-500 text-sm mt-1">{cardErrors.cvv.message}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">{t("billingAddress")}</label>
                                    <input
                                        {...registerCard('billingAddress')}
                                        placeholder="123 Main St, City, State, ZIP"
                                        className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500"
                                    />
                                    {cardErrors.billingAddress && <p className="text-red-500 text-sm mt-1">{cardErrors.billingAddress.message}</p>}
                                </div>
                            </form>
                        </div>

                        {/* Billing Address (Outside the Card Box, like in Image) */}


                        {/* Action Buttons */}
                        <div className="pt-4 flex space-x-3 rtl:space-x-reverse">
                            <button
                                type="button"
                                onClick={() => setOpenCard(false)}
                                disabled={submitting}
                                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                type="submit"
                                onClick={handleCardSubmit(onCardSubmit)}
                                disabled={submitting}
                                className="flex-1 bg-teal-600 text-white py-2 rounded hover:bg-teal-700 disabled:opacity-50"
                            >
                                {submitting ? 'Adding...' : t('useCard')}
                            </button>
                        </div>
                    </div>
                </Dialog>

                {/* Bank Modal */}
                <Dialog open={openBank} onClose={() => !submitting && setOpenBank(false)} className="fixed z-50 inset-0 overflow-y-auto bg-black bg-opacity-50">
                    <div className="flex items-center justify-center min-h-screen p-4">
                        <Dialog.Panel className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <Dialog.Title className="text-xl font-semibold">{t('accountDetails')}</Dialog.Title>
                                <button
                                    onClick={() => setOpenBank(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleBankSubmit(onBankSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium">{t('accountHolder')}</label>
                                    <input
                                        {...registerBank('accountHolderName')}
                                        placeholder="John Doe"
                                        className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500"
                                    />
                                    {bankErrors.accountHolderName && <p className="text-red-500 text-sm mt-1">{bankErrors.accountHolderName.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('bank_name')}</label>
                                    <input
                                        {...registerBank('bankName')}
                                        placeholder="e.g. Chase Bank"
                                        className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500"
                                    />
                                    {bankErrors.bankName && <p className="text-red-500 text-sm mt-1">{bankErrors.bankName.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('accountNumber')}</label>
                                    <input
                                        {...registerBank('accountNumber')}
                                        placeholder="e.g. 3020041011"
                                        className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500"
                                    />
                                    {bankErrors.accountNumber && <p className="text-red-500 text-sm mt-1">{bankErrors.accountNumber.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('routingNumber')}</label>
                                    <input
                                        {...registerBank('routingNumber')}
                                        placeholder="e.g. 110000000"
                                        className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500"
                                    />
                                    {bankErrors.routingNumber && <p className="text-red-500 text-sm mt-1">{bankErrors.routingNumber.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('accountType')}</label>
                                    <select
                                        {...registerBank('accountType')}
                                        className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500"
                                    >
                                        <option value="checking">{t('checking')}</option>
                                        <option value="savings">{t('savings')}</option>
                                    </select>
                                    {bankErrors.accountType && <p className="text-red-500 text-sm mt-1">{bankErrors.accountType.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">{t('billingAddress')}</label>
                                    <input
                                        {...registerBank('billingAddress')}
                                        placeholder="123 Main St, City, State, ZIP"
                                        className="w-full mt-1 border px-3 py-2 rounded outline-none hover:border-teal-500 focus:border-teal-500"
                                    />
                                    {bankErrors.billingAddress && <p className="text-red-500 text-sm mt-1">{bankErrors.billingAddress.message}</p>}
                                </div>
                                <div className="flex space-x-3 pt-4 rtl:space-x-reverse">
                                    <button
                                        type="button"
                                        onClick={() => setOpenBank(false)}
                                        disabled={submitting}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 bg-teal-600 text-white py-2 rounded hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Adding...' : t("add_account")}
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            </div>
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                itemType={deleteTarget.type}
                onConfirm={async () => {
                    await handleDelete(deleteTarget.id, deleteTarget.type);
                    setDeleteModalOpen(false); // Close after deletion
                    setDeleteTarget({ id: null, type: '' }); // Reset
                }}
            />
        </>

    );
}
