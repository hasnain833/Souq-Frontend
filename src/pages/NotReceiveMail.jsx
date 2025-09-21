import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { emailChange } from '../api/AuthService';

const NotReceiveMail = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [newEmail, setNewEmail] = useState('');
    const [currentEmail, setCurrentEmail] = useState('');

    useEffect(() => {
        if (location?.state?.email) {
            setCurrentEmail(location.state.email);
            setNewEmail(location.state.email); // pre-fill
        }
    }, [location]);

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = useForm();

    const onSubmit = async () => {
        try {
            if (!newEmail || !currentEmail) {
                toast.error("Please enter a valid email");
                return;
            }

            const payload = {
                currentEmail,
                newEmail,
            };

            const response = await emailChange(payload);

            if (response?.success) {
                toast.success("Verification code sent to your updated email");
                navigate('/email-verify', { state: { email: newEmail } });
            } else {
                toast.error(response?.message || "Failed to send verification code");
            }
        } catch (error) {
            console.error('Resend failed:', error);
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4">
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full mx-auto">
                <h1 className="text-2xl font-semibold mb-4 text-center">Didn’t Receive Email?</h1>

                <div className="space-y-3 text-gray-700 text-lg mb-6">
                    <ul className="list-disc list-inside space-y-2">
                        <li>Make sure you entered your email address correctly.</li>
                        <li>Check your spam folder.</li>
                        <li>If not received, you can update and resend it.</li>
                        <li>
                            Still having issues?{" "}
                            <a href="#" className="text-teal-600 underline font-medium">Contact Support</a>
                        </li>
                    </ul>
                </div>

                <div className="mb-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        New Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Enter your new email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md text-lg bg-white focus:outline-none"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                        We’ll resend the verification code to this new email.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {isSubmitting && (
                            <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                        )}
                        {isSubmitting ? 'Sending...' : 'Resend Verification Code'}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            if (!newEmail) {
                                toast.error("Enter a valid email first");
                                return;
                            }
                            navigate('/email-verify', { state: { email: newEmail } });
                        }}
                        className="w-full hover:bg-gray-100 text-teal-700 py-2 rounded-md font-semibold border border-teal-600"
                    >
                        Back to Verification
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NotReceiveMail;
