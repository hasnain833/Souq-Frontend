import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, ChevronRight, MessageCircle, Mail, Phone, Book } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
// import AuthModal from '../components/Auth/AuthModal';
import LoginModal from '../components/Auth/LoginModal';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal';
import SignUpModal from '../components/Auth/SignUpModal';

const Help = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqCategories = [
    {
      title: "Getting Started",
      faqs: [
        {
          question: "How do I create an account?",
          answer: "To create an account, click the 'Sign Up' button in the top right corner of the homepage. Fill in your email, create a password, and verify your email address. You can also sign up using your Google or Facebook account for faster registration."
        },
        {
          question: "How do I verify my account?",
          answer: "After registration, check your email for a verification link from SOUQ. Click the link to verify your account. If you don't receive the email, check your spam folder or request a new verification email from your account settings."
        },
        {
          question: "Is SOUQ free to use?",
          answer: "Creating an account and browsing items on SOUQ is completely free. We charge a small commission fee only when you successfully sell an item. There are no listing fees or monthly charges for basic users."
        }
      ]
    },
    {
      title: "Buying",
      faqs: [
        {
          question: "How do I search for items?",
          answer: "Use the search bar at the top of the page to find items. You can search by keywords, brand names, or item descriptions. Use filters on the left side to narrow down results by price, location, condition, and category."
        },
        {
          question: "How do I contact a seller?",
          answer: "On any item page, you'll find a 'Message Seller' button. Click it to send a direct message to the seller. You can ask questions about the item, negotiate price, or arrange pickup/delivery details."
        },
        {
          question: "What payment methods are accepted?",
          answer: "SOUQ supports various payment methods including credit/debit cards, PayPal, bank transfers, and cash on delivery (where available). The available payment options will be shown during checkout."
        },
        {
          question: "How do I report a suspicious listing?",
          answer: "If you encounter a suspicious listing, click the 'Report' button on the item page. Select the reason for reporting and provide additional details. Our team will review the report and take appropriate action."
        }
      ]
    },
    {
      title: "Selling",
      faqs: [
        {
          question: "How do I list an item for sale?",
          answer: "Click the 'Sell' button in the top navigation. Fill in the item details including title, description, price, and upload clear photos. Choose the appropriate category and location, then publish your listing."
        },
        {
          question: "How much does it cost to sell?",
          answer: "Listing items is free. SOUQ charges a small commission fee (typically 3-5%) only when your item sells successfully. The exact fee depends on the item category and will be clearly shown before you list."
        },
        {
          question: "How do I edit or delete my listing?",
          answer: "Go to 'My Account' > 'My Listings' to view all your active listings. Click on any listing to edit details, update photos, or delete the listing. Changes are reflected immediately on the site."
        },
        {
          question: "What makes a good listing?",
          answer: "Good listings have clear, well-lit photos from multiple angles, detailed descriptions, competitive pricing, and honest condition assessments. Include relevant keywords in your title and respond promptly to buyer inquiries."
        }
      ]
    },
    {
      title: "Account & Safety",
      faqs: [
        {
          question: "How do I change my password?",
          answer: "Go to 'My Account' > 'Settings' > 'Security'. Enter your current password and then your new password twice. Click 'Update Password' to save changes. We recommend using a strong, unique password."
        },
        {
          question: "How do I stay safe while buying/selling?",
          answer: "Meet in public places for item exchanges, verify items before payment, use SOUQ's messaging system for communication, trust your instincts, and report suspicious behavior. Never share personal financial information outside our platform."
        },
        {
          question: "What should I do if I'm scammed?",
          answer: "Report the incident immediately through our 'Report' feature or contact customer support. Provide all relevant details including screenshots, messages, and transaction information. We take fraud seriously and will investigate promptly."
        }
      ]
    }
  ];

  const contactOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      action: "Start Chat",
      available: "24/7"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us a detailed message",
      action: "Send Email",
      available: "Response within 24h"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      action: "Call Now",
      available: "9 AM - 6 PM GST"
    }
  ];

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  const toggleFaq = (categoryIndex, faqIndex) => {
    const key = `${categoryIndex}-${faqIndex}`;
    setExpandedFaq(expandedFaq === key ? null : key);
  };

  return (
    <>
      <Helmet>
        <title>Help Center - Souq</title>
        <meta
          name="description"
          content="Welcome to My Website. We provide the best services for your needs."
        />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-teal-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Help Center</h1>
              <p className="text-xl opacity-90 mb-8">
                Find answers to your questions and get the help you need
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute ltr:left-4 rtl:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 rtl:rotate-90" size={20} />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 rtl:pr-12 py-4 rounded-lg text-gray-800 text-lg focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Frequently Asked Questions</h2>

              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No results found for "{searchQuery}"</p>
                  <p className="text-gray-500 mt-2">Try different keywords or browse our categories below</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredFaqs.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-2xl font-semibold text-gray-800 mb-6">{category.title}</h3>
                      <div className="space-y-4">
                        {category.faqs.map((faq, faqIndex) => {
                          const isExpanded = expandedFaq === `${categoryIndex}-${faqIndex}`;
                          return (
                            <div key={faqIndex} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                              <button
                                onClick={() => toggleFaq(categoryIndex, faqIndex)}
                                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                              >
                                <span className="font-medium text-gray-800">{faq.question}</span>
                                <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                  <ChevronDown className="text-gray-500 flex-shrink-0" size={20} />
                                </div>
                              </button>
                              <div
                                className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded
                                    ? 'max-h-[1000px] opacity-100'
                                    : 'max-h-0 opacity-0'
                                  }`}
                              >
                                <div className="px-6 pb-6 pt-2">
                                  <p className="text-gray-600 leading-relaxed animate-fadeIn">{faq.answer}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Still Need Help?</h2>
              <p className="text-gray-600 text-center mb-12 text-lg">
                Can't find what you're looking for? Our support team is here to help you.
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                {contactOptions.map((option, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm p-8 text-center transform transition-all duration-300 hover:scale-105 hover:shadow-md">
                    <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <option.icon className="text-teal-600" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{option.title}</h3>
                    <p className="text-gray-600 mb-4">{option.description}</p>
                    <p className="text-sm text-gray-500 mb-6">{option.available}</p>
                    <button className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 w-full transform transition-all duration-200 hover:scale-105">
                      {option.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Quick Links</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link
                  to="/terms"
                  className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 text-center"
                >
                  <Book className="mx-auto mb-3 text-gray-600" size={32} />
                  <h3 className="font-semibold text-gray-800 mb-2">Terms of Service</h3>
                  <p className="text-gray-600 text-sm">Read our terms and conditions</p>
                </Link>

                <Link
                  to="/privacy"
                  className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 text-center"
                >
                  <Book className="mx-auto mb-3 text-gray-600" size={32} />
                  <h3 className="font-semibold text-gray-800 mb-2">Privacy Policy</h3>
                  <p className="text-gray-600 text-sm">Learn how we protect your data</p>
                </Link>

                <Link
                  to="/cookies"
                  className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 text-center"
                >
                  <Book className="mx-auto mb-3 text-gray-600" size={32} />
                  <h3 className="font-semibold text-gray-800 mb-2">Cookie Policy</h3>
                  <p className="text-gray-600 text-sm">Understand our cookie usage</p>
                </Link>

                <Link
                  to="/safety-center"
                  className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:-translate-y-1 text-center"
                >
                  <Book className="mx-auto mb-3 text-gray-600" size={32} />
                  <h3 className="font-semibold text-gray-800 mb-2">Safety Tips</h3>
                  <p className="text-gray-600 text-sm">Stay safe while trading</p>
                </Link>
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

export default Help;