import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Alert } from '@mui/material';
import { forgotPassword } from '../../api/AuthService';
import { useTranslation } from 'react-i18next';

const ForgotPasswordModal = () => {
  const { showForgotPassword, setShowForgotPassword } = useAppContext();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();
  const [apiMessage, setApiMessage] = useState('');

  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const onSubmit = async (data) => {
    setApiMessage('');

    try {
      const response = await forgotPassword(data);

      if (response.success) {
        setApiMessage('✅ Password reset link sent to your email.');
      } else {
        setApiMessage(response.error || '❌ Failed to send reset link.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setApiMessage('❌ Something went wrong. Please try again.');
    }
  };

  if (!showForgotPassword) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto p-6">
        <button
          className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-gray-500 hover:text-gray-700`}
          onClick={() => {
            reset();
            setShowForgotPassword(false);
            setApiMessage('');
          }}
          aria-label={t('close_forgot_password_modal')}
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-semibold text-center mb-4">{t('forgot_password')}</h2>

        {apiMessage ? (
          <Alert severity="success" className="text-sm mb-6">
            {t('reset_email_sent')}
          </Alert>
        ) : (
          <p className="text-sm text-gray-600 text-center mb-6">
            {t('enter_email_reset_link')}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder={t('email')}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none ${errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              {...register('email', {
                required: t('email_required'),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t('invalid_email'),
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

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('sending') : t('send_reset_link')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
