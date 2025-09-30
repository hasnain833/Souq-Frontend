import React, { useState } from 'react';
import { FaApple, FaFacebookSquare } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import LoginModal from './LoginModal';
import { useTranslation } from 'react-i18next';

const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode, setShowEmailLogin, showSignUp, setShowSignUp } = useAppContext();
  // const [showEmailLogin, setShowEmailLogin] = useState(false);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  if (!isAuthModalOpen) return null;

  const loginModal = () => {
    setIsAuthModalOpen(false)
    setShowEmailLogin(true)
  }

  const signUpModal = () => {
    setIsAuthModalOpen(false)
    setShowSignUp(true)
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-gray-500 hover:text-gray-700`}
          >
            <X size={24} />
          </button>

          <div className="p-6">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center mt-4">
              {authMode !== 'login'
                ? t('join_and_sell')
                : t('welcome_back')}
            </h2>

            <div className="space-y-4">
              {/** Build API base: in dev use same-origin; in prod use VITE_API_BASE_URL **/}
              {/** We compute at click time to avoid SSR issues **/}
              <button
                className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-200"
                onClick={() => {
                  const apiBase = import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL : '';
                  window.location.href = `${apiBase}/api/user/auth/google`;
                }}
              >
                <FcGoogle size={22} className="mr-2 rtl:ml-2" />
                <span>{authMode === 'login' ? t('continue_with_google') : t('signup_with_google')}</span>
              </button>
              {/* <button className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-200">
                <FaApple size={22} className="text-black mr-2 rtl:ml-2" />
                <span>{authMode === 'login' ? t('continue_with_apple') : t('signup_with_apple')}</span>
              </button> */}
              <button
                className="flex items-center justify-center w-full py-2.5 px-4 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-200"
                onClick={() => {
                  const apiBase = import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL : '';
                  window.location.href = `${apiBase}/api/user/auth/facebook`;
                }}
              >
                <FaFacebookSquare size={22} className="text-blue-600 mr-2 rounded-full rtl:ml-2" />
                <span>{authMode === 'login' ? t('continue_with_facebook') : t('signup_with_facebook')}</span>
              </button>
            </div>

            <div className="mt-4 text-center text-gray-700 text-base">
              {authMode === 'login' ? (
                <p>
                  {t('login_with')}{' '}
                  <button
                    className="text-teal-600 hover:text-teal-700 underline font-medium"
                    onClick={loginModal}
                  >
                    {t('email')}
                  </button>
                </p>
              ) : (
                <p>
                  {t('register_with')}{' '}
                  <button
                    className="text-teal-600 hover:text-teal-700 underline font-medium"
                    onClick={signUpModal}
                  >
                    {t('email')}
                  </button>
                </p>
              )}
            </div>

            <div className="mt-2 text-center text-gray-700 text-base">
              {authMode === 'login' ? (
                <p>
                  {t('dont_have_account')}{' '}
                  <button
                    onClick={() => setAuthMode('signup')}
                    className="text-teal-600 hover:text-teal-700 font-medium underline"
                  >
                    {t('sign_up')}
                  </button>
                </p>
              ) : (
                <p>
                  {t('already_have_account')}{' '}
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-teal-600 hover:text-teal-700 font-medium underline"
                  >
                    {t('log_in')}
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModal;
