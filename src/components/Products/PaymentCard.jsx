import { Dialog } from '@headlessui/react';
import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
    verifyAndSaveCard,
    detectCardBrand,
    formatCardNumber,
    validateCardNumber,
    getCardBrandInfo,
    isAuthenticated,
    testAuthentication
} from '../../api/CardService';

export default function CardModal({ openCard, setOpenCard, onCardSaved }) {
    const [isVerifying, setIsVerifying] = useState(false);
    const [cardBrand, setCardBrand] = useState('unknown');
    const [isCardValid, setIsCardValid] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState(null);

    // react-hook-form setup
    const {
        register: registerCard,
        handleSubmit: handleCardSubmit,
        control: controlCard,
        formState: { errors: cardErrors },
        watch,
        setValue,
        reset
    } = useForm();

    const watchedCardNumber = watch('number');

    // Real-time card validation and brand detection
    useEffect(() => {
        if (watchedCardNumber && watchedCardNumber.length >= 13) {
            const cleanNumber = watchedCardNumber.replace(/\s/g, '');
            const brand = detectCardBrand(cleanNumber);
            const isValid = validateCardNumber(cleanNumber);

            setCardBrand(brand);
            setIsCardValid(isValid);
        } else {
            setCardBrand('unknown');
            setIsCardValid(false);
        }
    }, [watchedCardNumber]);

    // Format expiry date as MM/YY
    const handleExpiryInput = (value) => {
        const cleaned = value.replace(/[^\d]/g, '').slice(0, 4);
        if (cleaned.length >= 3) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        }
        return cleaned;
    };

    // Format card number with spaces
    const handleCardNumberInput = (value) => {
        return formatCardNumber(value);
    };

    // Test authentication function
    const handleTestAuth = async () => {
        try {
            console.log('🧪 Testing authentication...');
            const result = await testAuthentication();
            toast.success(`Authentication successful! User: ${result.user.name}`);
        } catch (error) {
            console.error('❌ Authentication test failed:', error);
            toast.error(error.error || 'Authentication test failed');
        }
    };

    const onSubmit = async (data) => {
        try {
            setIsVerifying(true);
            setVerificationStatus('verifying');

            // Check authentication first
            if (!isAuthenticated()) {
                setVerificationStatus('failed');
                toast.error('Please log in to save your card');
                return;
            }

            // Parse expiry date
            const [expiryMonth, expiryYear] = data.expiry.split('/');

            const cardData = {
                cardNumber: data.number.replace(/\s/g, ''),
                expiryMonth: expiryMonth,
                expiryYear: expiryYear,
                cvv: data.cvv,
                cardholderName: data.name
            };

            console.log('🔍 Verifying card for user:', { ...cardData, cardNumber: '****', cvv: '***' });

            const result = await verifyAndSaveCard(cardData, 'stripe', false);

            if (result.success) {
                setVerificationStatus('success');
                toast.success('Card verified and saved successfully!');

                // Call callback if provided
                if (onCardSaved) {
                    onCardSaved(result.data.card);
                }

                // Reset form and close modal
                reset();
                setOpenCard(false);
            } else {
                setVerificationStatus('failed');
                toast.error(result.error || 'Card verification failed');
            }

        } catch (error) {
            console.error('❌ Card verification error:', error);
            setVerificationStatus('failed');

            // Handle specific error types
            if (error.error === 'User not authenticated. Please log in.') {
                toast.error('Please log in to save your card');
            } else if (error.message && error.message.includes('401')) {
                toast.error('Authentication required. Please log in again.');
            } else {
                toast.error(error.error || 'Card verification failed');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Dialog
            open={openCard}
            onClose={() => setOpenCard(false)}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
            <div className="flex items-center justify-center min-h-screen p-4">
                <Dialog.Panel className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                    <Dialog.Title className="text-xl font-semibold">Card details</Dialog.Title>
                    <p className="text-sm text-gray-500">
                        Your card information is securely encrypted
                    </p>
                    <form onSubmit={handleCardSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Cardholder's name</label>
                            <input
                                {...registerCard('name', { required: 'Cardholder name is required' })}
                                className="w-full mt-1 border px-3 py-2 rounded"
                                placeholder="John Doe"
                            />
                            {cardErrors.name && (
                                <p className="text-red-500 text-sm mt-1">{cardErrors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Card number</label>
                            <div className="relative">
                                <Controller
                                    name="number"
                                    control={controlCard}
                                    rules={{
                                        required: 'Card number is required',
                                        validate: (value) => {
                                            const cleanNumber = value.replace(/\s/g, '');
                                            if (cleanNumber.length < 13 || cleanNumber.length > 19) {
                                                return 'Card number must be between 13-19 digits';
                                            }
                                            if (!validateCardNumber(cleanNumber)) {
                                                return 'Invalid card number';
                                            }
                                            return true;
                                        }
                                    }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            onChange={(e) => field.onChange(handleCardNumberInput(e.target.value))}
                                            placeholder="1234 5678 9012 3456"
                                            className={`w-full mt-1 border px-3 py-2 pr-12 rounded ${
                                                cardErrors.number ? 'border-red-500' :
                                                isCardValid ? 'border-green-500' : 'border-gray-300'
                                            }`}
                                            maxLength={23} // Account for spaces
                                            inputMode="numeric"
                                        />
                                    )}
                                />
                                {/* Card brand indicator */}
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    {cardBrand !== 'unknown' && (
                                        <div className="flex items-center space-x-1">
                                            <span style={{ color: getCardBrandInfo(cardBrand).color }}>
                                                {getCardBrandInfo(cardBrand).icon}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {getCardBrandInfo(cardBrand).name}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {cardErrors.number && (
                                <p className="text-red-500 text-sm mt-1">{cardErrors.number.message}</p>
                            )}
                            {isCardValid && !cardErrors.number && (
                                <p className="text-green-500 text-sm mt-1">✓ Valid card number</p>
                            )}
                        </div>

                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium">Expiration date</label>
                                <Controller
                                    name="expiry"
                                    control={controlCard}
                                    rules={{
                                        required: 'Expiration date is required',
                                        pattern: {
                                            value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                                            message: 'Expiry must be in MM/YY format',
                                        },
                                    }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            onChange={(e) => field.onChange(handleExpiryInput(e.target.value))}
                                            placeholder="MM/YY"
                                            className="w-full mt-1 border px-3 py-2 rounded"
                                            maxLength={5}
                                            inputMode="numeric"
                                        />
                                    )}
                                />
                                {cardErrors.expiry && (
                                    <p className="text-red-500 text-sm mt-1">{cardErrors.expiry.message}</p>
                                )}
                            </div>

                            <div className="flex-1">
                                <label className="block text-sm font-medium">Security code</label>
                                <input
                                    {...registerCard('cvv', {
                                        required: 'Security code is required',
                                        pattern: {
                                            value: /^\d{3,4}$/,
                                            message: 'CVV must be 3 or 4 digits',
                                        },
                                    })}
                                    placeholder="e.g. 123"
                                    className="w-full mt-1 border px-3 py-2 rounded"
                                    type="password"
                                    maxLength={4}
                                    inputMode="numeric"
                                />
                                {cardErrors.cvv && (
                                    <p className="text-red-500 text-sm mt-1">{cardErrors.cvv.message}</p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isVerifying}
                            className={`w-full mt-4 py-2 rounded transition-colors ${
                                isVerifying
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-teal-600 hover:bg-teal-700'
                            } text-white`}
                        >
                            {isVerifying ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Verifying Card...</span>
                                </div>
                            ) : (
                                'Verify & Save Card'
                            )}
                        </button>

                        {/* Debug Authentication Status */}
                        {/* <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <strong>Debug Info:</strong><br/>
                            Auth Status: {isAuthenticated() ? '✅ Logged In' : '❌ Not Logged In'}<br/>
                            Token: {localStorage.getItem('accessToken') ? 'Present' : 'Missing'}<br/>
                            <button
                                type="button"
                                onClick={handleTestAuth}
                                className="mt-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                            >
                                Test Auth
                            </button>
                        </div> */}

                        {/* Verification status */}
                        {verificationStatus && (
                            <div className={`mt-2 p-2 rounded text-sm ${
                                verificationStatus === 'success'
                                    ? 'bg-green-100 text-green-800'
                                    : verificationStatus === 'failed'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                            }`}>
                                {verificationStatus === 'success' && '✓ Card verified successfully!'}
                                {verificationStatus === 'failed' && '✗ Card verification failed'}
                                {verificationStatus === 'verifying' && '⏳ Verifying card details...'}
                            </div>
                        )}
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
