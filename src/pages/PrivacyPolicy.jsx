import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Eye, Lock, Users } from 'lucide-react';
import { Helmet } from 'react-helmet';
// import AuthModal from '../components/Auth/AuthModal';
import LoginModal from '../components/Auth/LoginModal';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal';
import SignUpModal from '../components/Auth/SignUpModal';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  const lastUpdated = "January 15, 2024";

  return (
    <>
      <Helmet>
        <title>Privacy Policy - Habibi ماركت</title>
        <meta
          name="description"
          content="Welcome to Habibi ماركت. We provide the best services for your needs."
        />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-teal-600 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-center">{t('privacy_policy')}</h1>
            <p className="text-center mt-2">
              {t('last_updated')}: August 21, 2025
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
            {/* Privacy Policy content goes here */}
            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">{t('introduction')}</h2>
              <p className="text-gray-700">
                {t('privacy_intro_text')}
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">{t('information_we_collect')}</h2>
              <p className="text-gray-700 mb-3">
                {t('information_collect_text')}
              </p>
              <ul className="list-disc pl-5 rtl:pr-5 text-gray-700">
                <li className="mb-2">{t('personal_info_item')}</li>
                <li className="mb-2">{t('usage_info_item')}</li>
                <li className="mb-2">{t('device_info_item')}</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">{t('how_we_use_information')}</h2>
              <p className="text-gray-700 mb-3">
                {t('use_information_text')}
              </p>
              <ul className="list-disc pl-5 rtl:pr-5 text-gray-700">
                <li className="mb-2">{t('provide_services_item')}</li>
                <li className="mb-2">{t('improve_services_item')}</li>
                <li className="mb-2">{t('communicate_item')}</li>
                <li className="mb-2">{t('security_item')}</li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">{t('sharing_information')}</h2>
              <p className="text-gray-700">
                {t('sharing_information_text')}
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">{t('your_rights')}</h2>
              <p className="text-gray-700">
                {t('your_rights_text')}
              </p>
            </section>

            <section className="mb-6">
              <h2 className="text-xl font-semibold mb-3">{t('contact_us')}</h2>
              <p className="text-gray-700">
                {t('privacy_contact_text')}
              </p>
            </section>
          </div>
        </div>

        {/* Key Privacy Features */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">How We Protect Your Privacy</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="text-gray-700" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Data Protection</h3>
                  <p className="text-gray-600">Advanced security measures to protect your personal information</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="text-gray-700" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Secure Payments</h3>
                  <p className="text-gray-600">Encrypted payment processing through trusted partners</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="text-gray-700" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Transparency</h3>
                  <p className="text-gray-600">Clear information about how we use your data</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="text-gray-700" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">User Control</h3>
                  <p className="text-gray-600">Options to manage your privacy preferences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AuthModal />
      <LoginModal />
      <ForgotPasswordModal />
      <SignUpModal />
    </>
  );
};

export default PrivacyPolicy;




