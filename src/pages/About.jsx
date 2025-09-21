import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Target, Award, Globe, Heart, Shield } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/Auth/AuthModal';
import LoginModal from '../components/Auth/LoginModal';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal';
import SignUpModal from '../components/Auth/SignUpModal';

const About = () => {
  const navigate = useNavigate()
  const { t } = useTranslation();
  const isAuthenticated = localStorage.getItem("user");
  const { setIsAuthModalOpen, setAuthMode } = useAppContext();

  const handleLogin = () => {
    if (isAuthenticated) {
      navigate("/sell-now");
    } else {
      setAuthMode('login');
      setIsAuthModalOpen(true);
    }
  };

  const stats = [
    { number: "1M+", label: "Active Users" },
    { number: "500K+", label: "Items Sold" },
    { number: "50+", label: "Cities Covered" },
    { number: "99%", label: "Customer Satisfaction" }
  ];

  const values = [
    {
      icon: Heart,
      title: "Community First",
      description: "We believe in building a strong, supportive community where everyone can thrive and succeed together."
    },
    {
      icon: Shield,
      title: "Trust & Safety",
      description: "Your security is our priority. We implement robust measures to ensure safe and secure transactions."
    },
    {
      icon: Globe,
      title: "Accessibility",
      description: "Making online marketplace accessible to everyone, regardless of their technical expertise or background."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in everything we do, continuously improving our platform and services."
    }
  ];

  const teamMembers = [
    {
      name: 'Ahmed Al-Rashid',
      role: 'CEO & Founder',
      description: 'Visionary leader with 15+ years in e-commerce and marketplace development.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face&auto=format'
    },
    {
      name: 'Sarah Johnson',
      role: 'CTO',
      description: 'Technology expert passionate about creating scalable and user-friendly platforms.',
      image: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      name: 'Omar Hassan',
      role: 'Head of Operations',
      description: 'Operations specialist focused on optimizing user experience and platform efficiency.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face&auto=format'
    },
    {
      name: 'Fatima Al-Zahra',
      role: 'Head of Marketing',
      description: 'Marketing strategist dedicated to connecting communities and growing our user base.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face&auto=format'
    }
  ];

  return (
    <>
      <Helmet>
        <title>About - Souq</title>
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
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About SOUQ</h1>
              <p className="text-xl opacity-90 leading-relaxed">
                Connecting communities through a trusted marketplace where everyone can buy, sell, and discover amazing items with confidence.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">{stat.number}</div>
                    <div className="text-gray-600 text-lg">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Story</h2>
              <div className="prose prose-lg mx-auto">
                <p className="text-gray-600 leading-relaxed mb-6">
                  SOUQ was born from a simple idea: to create a marketplace where people can easily connect, trade, and build meaningful relationships within their communities. Founded in 2020 in Dubai, we started as a small team passionate about bringing the traditional marketplace experience into the digital age.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  What began as a local platform has grown into a thriving marketplace serving millions of users across the Middle East and beyond. We've maintained our core values of trust, community, and accessibility while continuously innovating to meet the evolving needs of our users.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Today, SOUQ is more than just a marketplace – it's a community where people discover unique items, support local businesses, and contribute to a more sustainable economy through the reuse and resale of goods.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="text-center">
                  <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="text-gray-700" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To empower individuals and communities by providing a safe, accessible, and user-friendly platform where anyone can buy, sell, and discover unique items while building meaningful connections.
                  </p>
                </div>
                <div className="text-center">
                  <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="text-gray-700" size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Vision</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To become the most trusted and beloved marketplace platform globally, fostering sustainable commerce and strengthening communities through the power of peer-to-peer trading.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-teal-600 mb-8 text-center">Our Values</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => (
                  <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm">
                    <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="text-gray-700" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-teal-600 mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-teal-600 mb-8 text-center">Our Team</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member, index) => (
                  <div key={index} className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-teal-100 overflow-hidden">
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{member.name}</h3>
                    <p className="text-teal-600 font-medium mb-3">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Join Us Section */}
        <div className="py-16 bg-gray-800 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Join Our Journey</h2>
              <p className="text-xl opacity-90 mb-8">
                Be part of a community that's reshaping how people connect and trade. Whether you're buying, selling, or just exploring, SOUQ is here to support your journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-teal-600 text-white px-8 py-3 rounded-lg hover:bg-teal-700 transition-colors" onClick={handleLogin}>
                  Start Selling
                </button>
                <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-800 transition-colors" onClick={() => navigate("/")}>
                  Explore Items
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
    </>
  );
};

export default About;






















