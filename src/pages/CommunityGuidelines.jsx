import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Heart, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import AuthModal from '../components/Auth/AuthModal';
import LoginModal from '../components/Auth/LoginModal';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal';
import SignUpModal from '../components/Auth/SignUpModal';

const CommunityGuidelines = () => {
  const { t } = useTranslation();

  const guidelines = [
    {
      icon: Heart,
      title: 'Be Respectful',
      description: 'Treat all community members with kindness and respect',
      dos: [
        'Use polite and professional language',
        'Respect different opinions and perspectives',
        'Be patient with new users'
      ],
      donts: [
        'Use offensive or discriminatory language',
        'Harass or bully other users',
        'Make personal attacks'
      ]
    },
    {
      icon: Shield,
      title: 'Stay Safe',
      description: 'Protect yourself and others in the community',
      dos: [
        'Use Habibi ماركت\'s secure payment system',
        'Report suspicious activity',
        'Verify items before purchasing'
      ],
      donts: [
        'Share personal information publicly',
        'Meet strangers in unsafe locations',
        'Ignore safety warnings'
      ]
    },
    {
      icon: Users,
      title: 'Build Trust',
      description: 'Help create a trustworthy marketplace for everyone',
      dos: [
        'Provide accurate item descriptions',
        'Respond promptly to messages',
        'Leave honest reviews'
      ],
      donts: [
        'Create fake listings',
        'Leave misleading reviews',
        'Misrepresent item conditions'
      ]
    }
  ];

  const prohibitedItems = [
    'Counterfeit or replica items',
    'Damaged items not disclosed as such',
    'Items that violate intellectual property rights',
    'Inappropriate or offensive content',
    'Items prohibited by local laws',
    'Personal information or contact details in listings'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Community Guidelines</h1>
            <p className="text-xl md:text-2xl opacity-90">
              Building a safe and respectful community together
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Community Values</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Habibi ماركت is more than just a marketplace - it's a community of fashion enthusiasts who believe in
              sustainable shopping and selling. These guidelines help ensure that everyone has a positive
              and safe experience on our platform.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              By using Habibi ماركت, you agree to follow these community guidelines. Violations may result in
              warnings, temporary suspensions, or permanent account closure.
            </p>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Community Guidelines</h2>
            <div className="space-y-12">
              {guidelines.map((guideline, index) => {
                const IconComponent = guideline.icon;
                return (
                  <div key={index} className="bg-white rounded-lg p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center">
                        <IconComponent className="text-purple-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-800">{guideline.title}</h3>
                        <p className="text-gray-600">{guideline.description}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="text-green-500" size={20} />
                          <h4 className="font-semibold text-green-800">Do:</h4>
                        </div>
                        <ul className="space-y-2">
                          {guideline.dos.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-2">
                              <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                              <span className="text-gray-600">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <XCircle className="text-red-500" size={20} />
                          <h4 className="font-semibold text-red-800">Don't:</h4>
                        </div>
                        <ul className="space-y-2">
                          {guideline.donts.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-2">
                              <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                              <span className="text-gray-600">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Prohibited Items */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Prohibited Items & Content</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="text-red-600" size={24} />
                <h3 className="text-xl font-semibold text-red-800">The following are not allowed on Habibi ماركت:</h3>
              </div>
              <ul className="space-y-2">
                {prohibitedItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-red-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Reporting */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Help Us Maintain Our Community</h2>
            <p className="text-lg text-gray-600 mb-8">
              If you see content or behavior that violates our community guidelines, please report it.
              Your reports help us keep Habibi ماركت safe for everyone.
            </p>
            <button className="bg-purple-600 text-white px-8 py-3 rounded-md hover:bg-purple-700 transition-colors">
              Report a Violation
            </button>
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

export default CommunityGuidelines;