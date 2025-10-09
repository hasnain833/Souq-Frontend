import React from 'react';
import { useTranslation } from 'react-i18next';
import { Cookie, Info, Settings, Clock } from 'lucide-react';
// import AuthModal from '../components/Auth/AuthModal';
import LoginModal from '../components/Auth/LoginModal';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal';
import SignUpModal from '../components/Auth/SignUpModal';

const CookiePolicy = () => {
  const { t } = useTranslation();

  const lastUpdated = "January 15, 2024";

  const cookieTypes = [
    {
      type: "Essential Cookies",
      description: "These cookies are necessary for the website to function and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms.",
      examples: ["Authentication cookies", "Security cookies", "Load balancing cookies"],
      canDisable: false
    },
    {
      type: "Performance Cookies",
      description: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.",
      examples: ["Analytics cookies", "Page load timing cookies"],
      canDisable: true
    },
    {
      type: "Functional Cookies",
      description: "These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.",
      examples: ["Language preference cookies", "Region selection cookies", "User interface customization cookies"],
      canDisable: true
    },
    {
      type: "Targeting Cookies",
      description: "These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other sites.",
      examples: ["Social media cookies", "Advertising cookies", "Retargeting cookies"],
      canDisable: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-teal-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Cookie Policy</h1>
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
                This Cookie Policy explains how Habibi ماركت ("we," "our," or "us") uses cookies and similar technologies
                to recognize you when you visit our website and use our services. It explains what these technologies
                are and why we use them, as well as your rights to control our use of them.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">2. What Are Cookies?</h2>
              <p className="text-gray-600 leading-relaxed">
                Cookies are small data files that are placed on your computer or mobile device when you visit a website.
                Cookies are widely used by website owners to make their websites work, or to work more efficiently,
                as well as to provide reporting information. Cookies set by the website owner (in this case, Habibi ماركت)
                are called "first-party cookies." Cookies set by parties other than the website owner are called
                "third-party cookies." Third-party cookies enable third-party features or functionality to be provided
                on or through the website (e.g., advertising, interactive content, and analytics).
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">3. Why Do We Use Cookies?</h2>
              <p className="text-gray-600 leading-relaxed">
                We use first-party and third-party cookies for several reasons. Some cookies are required for technical
                reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary"
                cookies. Other cookies also enable us to track and target the interests of our users to enhance the
                experience on our website. Third parties serve cookies through our website for advertising, analytics,
                and other purposes.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">4. Types of Cookies We Use</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                The specific types of first and third-party cookies served through our website and the purposes they
                perform are described below:
              </p>

              {cookieTypes.map((cookieType, index) => (
                <div key={index} className="mb-8 bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{cookieType.type}</h3>
                  <p className="text-gray-600 mb-4">{cookieType.description}</p>
                  <div className="mb-3">
                    <span className="font-medium text-gray-700">Examples: </span>
                    <span className="text-gray-600">{cookieType.examples.join(", ")}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 mr-2">Can be disabled: </span>
                    <span className={`px-2 py-1 rounded text-sm ${cookieType.canDisable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {cookieType.canDisable ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              ))}
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">5. How to Control Cookies</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie
                preferences by clicking on the appropriate opt-out links provided in the cookie banner or by setting
                or amending your web browser controls to accept or refuse cookies.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you choose to reject cookies, you may still use our website, but your access to some functionality
                and areas of our website may be restricted. You may also set your browser to block cookies, although
                doing so may affect your ability to use the website and services.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Most web browsers allow some control of most cookies through the browser settings. To find out more
                about cookies, including how to see what cookies have been set, visit <a href="https://www.allaboutcookies.org" className="text-blue-600 hover:text-blue-800">www.allaboutcookies.org</a>.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">6. Cookie Lifespans</h2>
              <p className="text-gray-600 leading-relaxed">
                Cookies can remain on your computer or mobile device for different periods of time. Some cookies are
                "session cookies," which exist only while your browser is open and are deleted automatically once you
                close your browser. Other cookies are "persistent cookies," which survive after your browser is closed
                and can be used by websites to recognize your computer when you re-open your browser later.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">7. Updates to This Cookie Policy</h2>
              <p className="text-gray-600 leading-relaxed">
                We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use
                or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy
                regularly to stay informed about our use of cookies and related technologies.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">8. Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about our use of cookies or other technologies, please contact us at:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <p className="text-gray-700 mb-1">Email: cookies@habibi.com</p>
                <p className="text-gray-700 mb-1">Address: Dubai Internet City, Dubai, UAE</p>
                <p className="text-gray-700">Phone: +971 4 123 4567</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Cookie Management Tools */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Manage Your Cookie Preferences</h2>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="text-gray-700" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Browser Settings</h3>
                  <p className="text-gray-600">Configure cookie preferences directly in your browser settings</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Cookie className="text-gray-700" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Cookie Banner</h3>
                  <p className="text-gray-600">Use our cookie consent banner to manage your preferences</p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Info className="text-gray-700" size={32} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Learn More</h3>
                  <p className="text-gray-600">Visit allaboutcookies.org for detailed information about cookies</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <button className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors">
                  Manage Cookie Preferences
                </button>
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

export default CookiePolicy;











