import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CardManagement from '../components/Cards/CardManagement';

const PaymentMethods = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
                    <p className="text-gray-600 mt-2">
                        Manage your saved payment methods for faster checkout
                    </p>
                </div>

                {/* Card Management Component */}
                <CardManagement />

                {/* Security Notice */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-blue-900">Security Information</h3>
                            <div className="mt-2 text-sm text-blue-800">
                                <ul className="list-disc list-inside space-y-1">
                                    <li>All card information is encrypted and stored securely</li>
                                    <li>We never store your CVV security code</li>
                                    <li>Cards are verified with your bank before saving</li>
                                    <li>You can delete saved cards at any time</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentMethods;
