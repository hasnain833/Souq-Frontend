import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useTranslation } from 'react-i18next';
import { emailChange } from '../api/AuthService';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';

const EmailChange = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        if (location?.state?.email) {
            setEmail(location.state.email);
        }
    }, [location]);

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = useForm();

    const onSubmit = async () => {
        try {
            if (!email) {
                toast.error(t("Please enter a valid email"));
                return;
            }

            const payload = {
                currentEmail: location?.state?.email,
                newEmail: email,
            };

            const response = await emailChange(payload);

            if (response?.success) {
                toast.success(t("Verification code sent to your email"));
                navigate('/email-verify', {
                    state: {
                        email,
                        emailChange: true,
                    }
                });
            } else {
                toast.error(response?.message || t("Failed to send email"));
            }
        } catch (error) {
            console.error('Resend failed:', error);
            toast.error(error?.response?.data?.message || t("Something went wrong"));
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4">
            <Helmet>
                <title>Email change - Souq</title>
                <meta
                    name="description"
                    content="Welcome to My Website. We provide the best services for your needs."
                />
            </Helmet>
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full mx-auto">
                <h1 className="text-2xl font-semibold mb-4 text-center">
                    {t("title_confirm")}
                </h1>
                <p className="text-center text-gray-600 mb-6 leading-relaxed">
                    {t("description_confirm")}{" "}
                    <span className="text-teal-600 font-medium">{email}</span>{" "}
                    {t("is_your_email_is")}
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-md font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {isSubmitting && (
                            <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                        )}
                        {t("sendBtn")}
                    </button>

                    <button
                        type="button"
                        className="w-full hover:bg-gray-100 text-teal-700 py-2 rounded-md font-semibold border border-teal-600"
                        onClick={() => navigate(-1)}
                    >
                        {t("noAccess")}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EmailChange;
