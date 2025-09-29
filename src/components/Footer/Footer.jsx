import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import Logo from '../common/Logo';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <footer className="bg-white border-t border-gray-100 pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Logo />
            <p className="mt-4 text-gray-600 text-sm">
              {t('footer_description')}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse mt-6">
              <a
                href="#"
                aria-label="Facebook"
                className="text-gray-500 hover:text-teal-500"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-gray-500 hover:text-teal-500"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-gray-500 hover:text-teal-500"
              >
                <Twitter size={20} />
              </a>
            </div>

          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4">{t('company')}</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/about')} className="text-gray-600 hover:text-teal-500 text-sm">{t('about')}</button></li>
              <li><button onClick={() => navigate('/careers')} className="text-gray-600 hover:text-teal-500 text-sm">{t('careers')}</button></li>
              <li><button onClick={() => navigate('/press')} className="text-gray-600 hover:text-teal-500 text-sm">{t('press')}</button></li>
              <li><button onClick={() => navigate('/sustainability')} className="text-gray-600 hover:text-teal-500 text-sm">{t('sustainability')}</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4">{t('support')}</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/help')} className="text-gray-600 hover:text-teal-500 text-sm">{t('help_center')}</button></li>
              <li><button onClick={() => navigate('/safety-center')} className="text-gray-600 hover:text-teal-500 text-sm">{t('safety_center')}</button></li>
              <li><button onClick={() => navigate('/community-guidelines')} className="text-gray-600 hover:text-teal-500 text-sm">{t('community_guidelines')}</button></li>
              <li><button onClick={() => navigate('/contact')} className="text-gray-600 hover:text-teal-500 text-sm">{t('contact_us')}</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4">{t('legal')}</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/privacy')} className="text-gray-600 hover:text-teal-500 text-sm">{t('privacy_policy')}</button></li>
              <li><button onClick={() => navigate('/terms')} className="text-gray-600 hover:text-teal-500 text-sm">{t('terms_of_service')}</button></li>
              <li><button onClick={() => navigate('/cookies')} className="text-gray-600 hover:text-teal-500 text-sm">{t('cookie_policy')}</button></li>
              <li><a href="#" className="text-gray-600 hover:text-teal-500 text-sm">{t('accessibility')}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-6">
          <p className="text-center text-gray-500 text-xs">
            © {new Date().getFullYear()} HaBiBi ماركت {t('all_rights_reserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



