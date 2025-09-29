import React from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Recycle, Globe, TrendingDown } from 'lucide-react';
// import AuthModal from '../components/Auth/AuthModal';
import LoginModal from '../components/Auth/LoginModal';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal';
import SignUpModal from '../components/Auth/SignUpModal';

const Sustainability = () => {
  const { t } = useTranslation();

  const impactStats = [
    { icon: Recycle, value: '2.5M', label: 'Items Given Second Life', color: 'text-green-600' },
    { icon: TrendingDown, value: '75%', label: 'Reduction in Textile Waste', color: 'text-blue-600' },
    { icon: Globe, value: '1.2M', label: 'Tons CO2 Saved', color: 'text-purple-600' },
    { icon: Leaf, value: '500K', label: 'Liters Water Saved', color: 'text-teal-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Sustainability at Habibi ماركت</h1>
            <p className="text-xl md:text-2xl opacity-90">
              Building a circular fashion economy for a better tomorrow
            </p>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Environmental Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              The fashion industry is one of the world's largest polluters, responsible for 10% of global carbon emissions
              and 20% of wastewater. At Habibi ماركت, we're committed to changing this narrative by promoting circular fashion
              and extending the lifecycle of clothing items.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Every item sold on our platform represents a step towards a more sustainable future, reducing the need
              for new production and keeping textiles out of landfills.
            </p>
          </div>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Our Environmental Impact</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {impactStats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="text-center bg-white rounded-lg p-6 shadow-sm">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${stat.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                      <IconComponent className={`${stat.color}`} size={32} />
                    </div>
                    <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                    <p className="text-gray-600">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Initiatives */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Our Sustainability Initiatives</h2>
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <Recycle className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Circular Fashion Marketplace</h3>
                  <p className="text-gray-600">
                    Our platform enables the circular economy by connecting sellers of pre-loved items with conscious buyers,
                    extending the lifecycle of fashion items and reducing waste.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <Globe className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Carbon Neutral Shipping</h3>
                  <p className="text-gray-600">
                    We partner with eco-friendly shipping providers and offset carbon emissions from all deliveries
                    through verified environmental projects.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                  <Leaf className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Sustainable Packaging</h3>
                  <p className="text-gray-600">
                    All our packaging materials are recyclable or biodegradable, and we encourage sellers to use
                    eco-friendly packaging options.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Join the Sustainable Fashion Movement</h2>
            <p className="text-lg text-gray-600 mb-8">
              Every purchase and sale on Habibi ماركت contributes to a more sustainable fashion industry.
              Together, we can make a difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-green-600 text-white px-8 py-3 rounded-md hover:bg-green-700 transition-colors">
                Start Selling
              </button>
              <button className="bg-white text-green-600 border border-green-600 px-8 py-3 rounded-md hover:bg-green-50 transition-colors">
                Shop Sustainably
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

export default Sustainability;