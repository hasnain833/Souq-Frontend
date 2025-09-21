import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, ChevronRight, MessageCircle, Mail, Phone } from 'lucide-react';
import AuthModal from '../components/Auth/AuthModal';
import LoginModal from '../components/Auth/LoginModal';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal';
import SignUpModal from '../components/Auth/SignUpModal';

const HelpCenter = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    { title: 'Getting Started', icon: '🚀', articles: 12 },
    { title: 'Buying', icon: '🛒', articles: 18 },
    { title: 'Selling', icon: '💰', articles: 15 },
    { title: 'Payments', icon: '💳', articles: 10 },
    { title: 'Shipping', icon: '📦', articles: 14 },
    { title: 'Account & Profile', icon: '👤', articles: 8 }
  ];

  const faqs = [
    {
      question: 'How do I create an account on SOUQ?',
      answer: 'You can create an account by clicking the "Sign Up" button and filling in your details, or by using Google/Facebook login for quick registration.'
    },
    {
      question: 'Is it safe to buy on SOUQ?',
      answer: 'Yes, SOUQ provides buyer protection, secure payment processing, and verified seller profiles to ensure safe transactions.'
    },
    {
      question: 'How do I list an item for sale?',
      answer: 'Click "Sell Now", upload photos of your item, add a description, set your price, and publish your listing. It\'s that simple!'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept major credit cards, PayPal, and local payment methods depending on your region.'
    },
    {
      question: 'How does shipping work?',
      answer: 'Sellers arrange shipping directly with buyers. We provide shipping guidelines and partner with reliable courier services.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-teal-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Help Center</h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              How can we help you today?
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-800 text-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Browse by Category</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className="text-xl font-semibold text-gray-800">{category.title}</h3>
                  </div>
                  <p className="text-gray-600">{category.articles} articles</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border">
                  <button
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  >
                    <span className="font-semibold text-gray-800">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronDown className="text-gray-500" size={20} />
                    ) : (
                      <ChevronRight className="text-gray-500" size={20} />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Still Need Help?</h2>
            <p className="text-lg text-gray-600 mb-12">
              Can't find what you're looking for? Our support team is here to help.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="text-teal-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Live Chat</h3>
                <p className="text-gray-600 mb-4">Chat with our support team</p>
                <button className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors">
                  Start Chat
                </button>
              </div>

              <div className="text-center">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="text-teal-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Email Support</h3>
                <p className="text-gray-600 mb-4">Get help via email</p>
                <button className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors">
                  Send Email
                </button>
              </div>

              <div className="text-center">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="text-teal-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Phone Support</h3>
                <p className="text-gray-600 mb-4">Call us directly</p>
                <button className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700 transition-colors">
                  Call Now
                </button>
              </div>
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

export default HelpCenter;