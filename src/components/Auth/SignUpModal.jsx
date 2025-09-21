import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, X, Loader2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { register as registerAPI } from "../../api/AuthService"; // adjust the path
import { saveTokens } from '../../utils/TokenStorage';
import { toast } from 'react-toastify';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';

const SignUpModal = () => {
    const { showSignUp, setShowSignUp } = useAppContext();
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate()
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
        reset,
        watch,
        clearErrors,
        setError // <-- add this
    } = useForm({
        mode: 'onChange',
    });

    const [apiError, setApiError] = useState('');

    const onSubmit = async (data) => {
        try {
            const { agreeTerms, promoOptIn, ...dataToSend } = data;

            const res = await registerAPI(dataToSend);
            // console.log(res.data.data.user, "res>>>>>>>>>>>>>")

            if (res.success) {
                const { accessToken, refreshToken } = res.data.data;
                saveTokens({ accessToken, refreshToken });

                setApiError(''); // Clear error on success
                navigate("/email-verify", { state: { email: data.email, user: res.data.data.user } });
                setShowSignUp(false);

            } else {
                setApiError(res.error || "Registration failed");
            }
        } catch (err) {
            setApiError("Something went wrong. Please try again.");
            console.error('Error:', err);
        }
    };

    const handleClose = () => {
        setShowSignUp(false);
        reset();
        clearErrors();
        setApiError(false)
        // setSubmitted(false);
    };

    if (!showSignUp) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start pt-20 overflow-y-auto"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            <div className="bg-white rounded-xl w-full max-w-sm sm:w-[420px] mx-4 p-6 relative shadow-2xl">
                <button
                    onClick={handleClose}
                    className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-gray-500 hover:text-gray-700`}
                    aria-label={t("close_signup_modal")}
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-semibold text-center mb-6">{t("signup_with_email")}</h2>

                {apiError && (
                    <Alert severity="error" className="mb-4">
                        {apiError}
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-[15px]">
                    {/* Full Name */}
                    <div>
                        <input
                            {...register('fullName', {
                                required: t("full_name_required"),
                                validate: (value) => {
                                    const parts = value.trim().split(' ');
                                    return parts.length >= 2 && parts.every(part => part.length > 0)
                                        ? true
                                        : t("enter_full_name");
                                },
                            })}
                            className={`w-full mt-1 border px-3 py-2 rounded-lg focus:outline-none text-base font-medium ${errors.fullName ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder={t("full_name")}
                        />
                        <p className={`text-sm mt-1 ${errors.fullName ? 'text-red-500' : 'text-gray-500'}`}>
                            {errors.fullName ? errors.fullName.message : t("full_name_note")}
                        </p>
                    </div>

                    {/* Username */}
                    <div>
                        <input
                            {...register('userName', { required: t("username_required") })}
                            className={`w-full mt-1 border px-3 py-2 rounded-lg focus:outline-none text-base font-medium ${errors.userName ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder={t("username")}
                        />
                        <p className={`text-sm mt-1 ${errors.userName ? 'text-red-500' : 'text-gray-500'}`}>
                            {errors.userName
                                ? errors.userName.message
                                : t("username_note")}
                        </p>
                    </div>

                    {/* Email */}
                    <div>
                        <input
                            type="email"
                            {...register('email', {
                                required: t("email_required"),
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: t("invalid_email"),
                                },
                            })}
                            className={`w-full border px-3 py-2 rounded-lg focus:outline-none text-base font-medium ${errors.email ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder={t("email")}
                        />
                        <p className={`text-sm mb-1 ${errors.email ? 'text-red-500' : 'text-gray-500'}`}>
                            {errors.email ? errors.email.message : t("email_note")}
                        </p>
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            {...register('password', {
                                required: t("password_required"),
                                minLength: {
                                    value: 7,
                                    message: t("password_min_length"),
                                },
                                pattern: {
                                    value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                                    message: t("password_pattern"),
                                },
                            })}
                            className={`w-full mt-1 border px-3 py-2 rounded-lg focus:outline-none text-base font-medium ${errors.password ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder={t("password")}
                        />
                        <span
                            onClick={() => setShowPassword((prev) => !prev)}
                            className={`absolute top-3.5 text-xl text-gray-600 cursor-pointer ${isRTL ? 'left-3' : 'right-3'}`}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
                        <p className={`text-sm mt-1 ${errors.password ? 'text-red-500' : 'text-gray-500'}`}>
                            {errors.password
                                ? errors.password.message
                                : t("password_note")}
                        </p>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3 mt-2 text-lg text-gray-500">
                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                {...register('promoOptIn')}
                                className="accent-teal-600 w-5 h-5 shrink-0"
                            />
                            <span className="text-sm">{t("promo_opt_in")}</span>
                        </label>

                        <label className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                {...register('agreeTerms', { required: true })}
                                className="accent-teal-600 w-5 h-5 shrink-0"
                            />
                            <span className="text-sm">
                                {t("agree_terms_prefix")}{' '}
                                <a href="#" className="text-teal-600 underline">{t("terms_conditions")}</a>
                            </span>
                        </label>

                        {errors.agreeTerms && (
                            <p className="text-red-500 text-sm">{t("terms_required")}</p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!isValid || isSubmitting}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 mt-3 rounded-lg font-semibold flex justify-center items-center gap-2 disabled:opacity-60"
                    >
                        {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                        {t("continue")}
                    </button>
                </form>
            </div>
        </div>

    );
};

export default SignUpModal;
