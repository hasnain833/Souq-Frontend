import React from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import AuthModal from '../components/Auth/AuthModal';
import LoginModal from '../components/Auth/LoginModal';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal';
import SignUpModal from '../components/Auth/SignUpModal';

const SafetyCenter = () => {
  const { t } = useTranslation();

  const safetyFeatures = [
    {
      icon: Shield,
      title: 'Buyer Protection',
      description: 'Every purchase is protected with our comprehensive buyer protection program.'
    },
    {
      icon: Lock,
      title: 'Secure Payments',
      description: 'All payments are processed securely through encrypted payment gateways.'
    },
    {
      icon: Eye,
      title: 'Verified Profiles',
      description: 'User verification helps ensure authentic and trustworthy community members.'
    },
    {
      icon: Users,
      title: 'Community Moderation',
      description: '24/7 monitoring and community reporting to maintain a safe marketplace.'
    }
  ];

  const safetyTips = [
    {
      category: 'For Buyers',
      tips: [
        'Always check seller ratings and reviews before making a purchase',
        'Use SOUQ\'s secure payment system - never pay outside the platform',
        'Read item descriptions carefully and ask questions if needed',
        'Report suspicious listings or behavior immediately'
      ]
    },
    {
      category: 'For Sellers',
      tips: [
        'Provide accurate descriptions and clear photos of your items',
        'Respond promptly to buyer questions and concerns',
        'Ship items promptly and provide tracking information',
        'Never share personal contact information in public listings'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Safety Center</h1>
            <p className="text-xl md:text-2xl opacity-90">
              Your safety and security are our top priorities
            </p>
          </div>
        </div>
      </div>

      {/* Safety Features */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">How We Keep You Safe</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {safetyFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="text-blue-600" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Safety Tips */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Safety Tips</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {safetyTips.map((section, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">{section.category}</h3>
                  <ul className="space-y-3">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-3">
                        <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                        <span className="text-gray-600">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Warning Signs */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Warning Signs to Watch For</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="text-red-600" size={24} />
                <h3 className="text-xl font-semibold text-red-800">Be Cautious If:</h3>
              </div>
              <ul className="space-y-2 text-red-700">
                <li>• Someone asks you to pay outside of SOUQ's platform</li>
                <li>• Prices seem too good to be true</li>
                <li>• Seller refuses to provide additional photos or information</li>
                <li>• Communication seems rushed or pressuring</li>
                <li>• Seller has no reviews or very low ratings</li>
                <li>• You're asked to share personal information unnecessarily</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Report Issues */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Report Safety Concerns</h2>
            <p className="text-lg text-gray-600 mb-8">
              If you encounter any suspicious activity or safety concerns, please report it immediately.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 transition-colors">
                Report an Issue
              </button>
              <button className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-md hover:bg-gray-50 transition-colors">
                Contact Support
              </button>
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

export default SafetyCenter;