import React from 'react';
import { useTranslation } from 'react-i18next';
import { Newspaper, Calendar, Download, Mail } from 'lucide-react';
import AuthModal from '../components/Auth/AuthModal';
import LoginModal from '../components/Auth/LoginModal';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal';
import SignUpModal from '../components/Auth/SignUpModal';

const Press = () => {
  const { t } = useTranslation();

  const pressReleases = [
    {
      date: 'March 15, 2024',
      title: 'Habibi ماركت Reaches 1 Million Active Users Milestone',
      excerpt: 'Leading marketplace platform celebrates significant growth in sustainable fashion trading.',
      downloadLink: '#'
    },
    {
      date: 'February 28, 2024',
      title: 'Habibi ماركت Launches Enhanced Security Features',
      excerpt: 'New buyer protection and verification systems strengthen marketplace safety.',
      downloadLink: '#'
    },
    {
      date: 'January 20, 2024',
      title: 'Habibi ماركت Expands to New Markets',
      excerpt: 'Platform announces expansion plans for Q2 2024 across multiple regions.',
      downloadLink: '#'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-teal-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">{t('press_center')}</h1>
            <p className="text-xl">
              {t('press_description')}
            </p>
          </div>
        </div>
      </div>

      {/* Press Releases */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Latest Press Releases</h2>
            <div className="space-y-6">
              {pressReleases.map((release, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center gap-2 text-teal-600 mb-2">
                    <Calendar size={16} />
                    <span className="text-sm">{release.date}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{release.title}</h3>
                  <p className="text-gray-600 mb-4">{release.excerpt}</p>
                  <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors flex items-center gap-2">
                    <Download size={16} />
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Media Contact */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Media Contact</h2>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Mail className="text-teal-600" size={24} />
                <h3 className="text-xl font-semibold">Press Inquiries</h3>
              </div>
              <p className="text-gray-600 mb-4">
                For media inquiries, interviews, and press materials, please contact our press team.
              </p>
              <p className="text-teal-600 font-semibold">press@souq.com</p>
              <p className="text-gray-600 mt-2">Response time: 24-48 hours</p>
            </div>
          </div>
        </div>
      </div>
      <AuthModal />
      <LoginModal />
      <ForgotPasswordModal />
      <SignUpModal />
    </div>
  );
};

export default Press;


