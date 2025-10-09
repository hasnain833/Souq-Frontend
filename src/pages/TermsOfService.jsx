import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, AlertTriangle, CheckCircle } from 'lucide-react';
// import AuthModal from '../components/Auth/AuthModal';
import LoginModal from '../components/Auth/LoginModal';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal';
import SignUpModal from '../components/Auth/SignUpModal';

const TermsOfService = () => {
  const { t } = useTranslation();

  const lastUpdated = "January 15, 2024";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-teal-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
            <p className="text-xl opacity-90">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Welcome to Habibi ماركت. These Terms of Service ("Terms") govern your access to and use of the Habibi ماركت
                website, mobile applications, and services (collectively, the "Services"). By accessing or using
                our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may
                not access or use the Services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Account Registration</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To use certain features of our Services, you must register for an account. When you register,
                you agree to provide accurate, current, and complete information about yourself and to update
                this information to keep it accurate, current, and complete.
              </p>
              <p className="text-gray-600 leading-relaxed">
                You are responsible for safeguarding your account credentials and for all activities that occur
                under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. User Conduct</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You agree not to engage in any of the following prohibited activities:
              </p>
              <ul className="list-disc pl-6 text-gray-600">
                <li>Violating any applicable laws or regulations</li>
                <li>Infringing on the intellectual property rights of others</li>
                <li>Posting false, misleading, or deceptive content</li>
                <li>Selling counterfeit, stolen, or prohibited items</li>
                <li>Harassing, threatening, or intimidating other users</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Using our Services for any illegal or unauthorized purpose</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Listings and Transactions</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                As a seller, you are responsible for accurately describing your items, setting fair prices,
                and fulfilling orders as promised. You must have the legal right to sell the items you list.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                As a buyer, you are responsible for reading item descriptions carefully, asking questions
                before purchasing, and completing payment for items you agree to buy.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Habibi ماركت facilitates transactions between buyers and sellers but is not a party to any transaction.
                We do not guarantee the quality, safety, or legality of items listed, the truth or accuracy of
                listings, or the ability of sellers to sell items or buyers to pay for items.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. Fees and Payments</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may charge fees for certain aspects of our Services. All fees are described on our website
                and are subject to change with notice. You agree to pay all applicable fees and taxes associated
                with your use of the Services.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Payment processing services are provided by third-party payment processors, and you agree to
                comply with their terms and conditions when using their services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                The Services and all content and materials included on the Services, including text, graphics,
                logos, images, and software, are the property of Habibi ماركت or our licensors and are protected by
                copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By posting content on our Services, you grant us a non-exclusive, worldwide, royalty-free,
                sublicensable, and transferable license to use, reproduce, modify, adapt, publish, translate,
                create derivative works from, distribute, and display such content in connection with providing
                and promoting our Services.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                To the maximum extent permitted by law, Habibi ماركت and its officers, directors, employees, and agents
                shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
                including lost profits, arising out of or in connection with your use of the Services, whether
                based on warranty, contract, tort (including negligence), or any other legal theory, even if
                Habibi ماركت has been informed of the possibility of such damage.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Dispute Resolution</h2>
              <p className="text-gray-600 leading-relaxed">
                Any dispute arising from these Terms or your use of the Services shall be resolved through
                binding arbitration in accordance with the commercial arbitration rules of the Dubai International
                Arbitration Centre. The arbitration shall be conducted in Dubai, UAE, and the language of the
                arbitration shall be English.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">9. Termination</h2>
              <p className="text-gray-600 leading-relaxed">
                We may terminate or suspend your account and access to the Services at any time, without prior
                notice or liability, for any reason, including if you breach these Terms. Upon termination, your
                right to use the Services will immediately cease.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">10. Changes to Terms</h2>
              <p className="text-gray-600 leading-relaxed">
                We may modify these Terms at any time by posting the revised Terms on our website. Your continued
                use of the Services after any such changes constitutes your acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">11. Contact Information</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <p className="text-gray-700 mb-1">Email: legal@souq.com</p>
                <p className="text-gray-700 mb-1">Address: Dubai Internet City, Dubai, UAE</p>
                <p className="text-gray-700">Phone: +971 4 123 4567</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Key Points Summary */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Key Points Summary</h2>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Account Responsibility</h3>
                    <p className="text-gray-600">You are responsible for maintaining the security of your account and all activity under it.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Accurate Listings</h3>
                    <p className="text-gray-600">Sellers must provide accurate descriptions and have the legal right to sell listed items.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <AlertTriangle className="text-amber-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Prohibited Activities</h3>
                    <p className="text-gray-600">Selling counterfeit items, harassment, and fraudulent behavior are not allowed.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <AlertTriangle className="text-amber-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Marketplace Role</h3>
                    <p className="text-gray-600">Habibi ماركت is a platform that facilitates transactions but is not a party to any transaction between users.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600 italic">
                  This summary is for convenience only and does not replace the full Terms of Service.
                  Please read the complete Terms for a comprehensive understanding of your rights and obligations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <AuthModal /> */}
      <LoginModal />
      <ForgotPasswordModal />
      <SignUpModal />
    </div>
  );
};

export default TermsOfService;







