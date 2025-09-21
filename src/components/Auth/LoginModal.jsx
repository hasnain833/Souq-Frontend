import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { AiOutlineLoading3Quarters } from 'react-icons/ai'; // Loading spinner icon
import { login } from '../../api/AuthService';
import { Alert } from '@mui/material';
import { saveTokens, saveUser } from '../../utils/TokenStorage';
import { useDispatch } from 'react-redux';
import { setProfileImage } from '../../redux/slices/ProfileSlice';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const LoginModal = () => {
    const { showEmailLogin, setShowEmailLogin, setShowForgotPassword } = useAppContext();
    const [showPassword, setShowPassword] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
        reset,
    } = useForm({ mode: 'onChange' });

    const [apiError, setApiError] = useState('');
    const dispatch = useDispatch()
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    const onSubmit = async (data) => {
        try {
            setApiError('');

            const response = await login(data);

            if (response.success) {
                const { accessToken, refreshToken, user } = response.data.data;
                if (user.profile) {
                    // const imageUrl = `${baseURL}${user.profile}`;
                    const imageUrl = user.profile
                    dispatch(setProfileImage(imageUrl))
                }
                i18n.changeLanguage(user.language);
                localStorage.setItem("lang", user.language);
                document.documentElement.lang = user.language;
                document.documentElement.dir = user.language === "ar" ? "rtl" : "ltr";
                saveTokens({ accessToken, refreshToken });
                saveUser(user);
                reset();
                setShowEmailLogin(false);
                toast.success(response.data.message)
            } else {
                setApiError(response.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            setApiError('Something went wrong. Please try again.');
        }
    };


    if (!showEmailLogin) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto p-6">
                <button
                    className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-gray-500 hover:text-gray-700`}
                    onClick={() => {
                        reset();
                        setShowEmailLogin(false);
                        setApiError('');
                    }}
                    aria-label={t("close_login_modal")}
                >
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-semibold text-center mb-6">{t("login_with_email")}</h2>

                {apiError && (
                    <Alert severity="error" className="mb-4">
                        {apiError}
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder={t("email")}
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                            {...register("email", {
                                required: t("email_required"),
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: t("invalid_email"),
                                },
                            })}
                            aria-invalid={errors.email ? 'true' : 'false'}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1" role="alert">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder={t("password")}
                            className={`w-full border rounded-lg py-2 ${isRTL ? 'pl-10' : 'pr-10'} px-4 focus:outline-none ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                            {...register("password", {
                                required: t("password_required"),
                                minLength: {
                                    value: 6,
                                    message: t("password_min_length"),
                                },
                            })}
                            aria-invalid={errors.password ? 'true' : 'false'}
                        />
                        <span
                            onClick={() => setShowPassword(prev => !prev)}
                            className={`absolute top-2.5 cursor-pointer text-xl text-gray-600 ${isRTL ? 'left-3' : 'right-3'}`}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </span>
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1" role="alert">
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-semibold flex justify-center items-center gap-2 disabled:opacity-50"
                        disabled={!isValid || isSubmitting}
                    >
                        {isSubmitting && <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />}
                        {isSubmitting ? t("logging_in") : t("log_in")}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        className="text-sm text-teal-600 underline mt-2"
                        type="button"
                        onClick={() => {
                            setShowEmailLogin(false);
                            setShowForgotPassword(true);
                        }}
                    >
                        {t("forgot_password")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
