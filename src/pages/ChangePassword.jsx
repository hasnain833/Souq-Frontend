import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { changePassword, resetPassword } from '../api/AuthService';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';

const ChangePassword = () => {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset } = useForm();
  const [apiMessage, setApiMessage] = useState('');
  const [alertType, setAlertType] = useState('success');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const token = searchParams.get('token')
  const navigate = useNavigate()


  const onSubmit = async (data) => {
    setApiMessage('');
    setAlertType('');

    try {
      let response;

      if (token) {
        response = await resetPassword(searchParams.get('token'), data);
      } else {
        response = await changePassword(data);
      }
      if (response.success) {
        toast.success('Password changed successfully!');
        setApiMessage('Password changed successfully.');
        setAlertType('success');
        reset();
        navigate('/');
      } else {
        setApiMessage(response.error || 'Failed to change password.');
        setAlertType('error');
      }
    } catch (err) {
      setApiMessage('Something went wrong. Please try again.');
      setAlertType('error');
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <Helmet>
        <title>Change password - Souq</title>
        <meta
          name="description"
          content="Welcome to My Website. We provide the best services for your needs."
        />
      </Helmet>
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full mx-auto">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          {t('change_password_title')}
        </h1>

        {apiMessage && (
          <Alert severity={alertType} className="mb-4">
            {apiMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* New Password */}
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder={t('new_password_placeholder')}
              className={`w-full border rounded-lg px-4 py-2 pr-10 rtl:pr-3 rtl:pl-10 focus:outline-none ${errors.reEnterNewPassword ? 'border-red-500' : 'border-gray-300'}`}
              {...register('newPassword', {
                required: t('new_password_required'),
                minLength: {
                  value: 7,
                  message: t('password_min_length'),
                },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                  message: t('password_pattern'),
                },
              })}
            />
            <span
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 rtl:left-3 rtl:right-auto top-2.5 cursor-pointer text-xl text-gray-600"
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
            {errors.newPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder={t('confirm_password_placeholder')}
              className={`w-full border rounded-lg px-4 py-2 pr-10 rtl:pr-3 rtl:pl-10 focus:outline-none ${errors.reEnterNewPassword ? 'border-red-500' : 'border-gray-300'}`}
              {...register('reEnterNewPassword', {
                required: t('confirm_password_required'),
                validate: (value) =>
                  value === watch('newPassword') || t('passwords_not_match'),
              })}
            />
            <span
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 rtl:left-3 rtl:right-auto top-2.5 cursor-pointer text-xl text-gray-600"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
            {errors.reEnterNewPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.reEnterNewPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50"
          >
            {isSubmitting
              ? t('updating_password')
              : t('change_password_button')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
