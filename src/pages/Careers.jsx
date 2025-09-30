import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Users } from 'lucide-react';
import AuthModal from '../components/Auth/AuthModal';
import LoginModal from '../components/Auth/LoginModal';
import ForgotPasswordModal from '../components/Auth/ForgotPasswordModal';
import SignUpModal from '../components/Auth/SignUpModal';

const Careers = () => {
  const { t } = useTranslation();

  const jobOpenings = [
    {
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: 'Join our frontend team to build amazing user experiences for our marketplace.'
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'Dubai, UAE',
      type: 'Full-time',
      description: 'Lead product strategy and development for our core marketplace features.'
    },
    {
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Remote',
      type: 'Full-time',
      description: 'Help our users succeed on the SOUQ platform and drive customer satisfaction.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-teal-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Join Our Team</h1>
            <p className="text-xl md:text-2xl opacity-90">
              Help us build the future of sustainable fashion
            </p>
          </div>
        </div>
      </div>

      {/* Why Work With Us */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Why Work With Us?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-teal-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Great Team</h3>
                <p className="text-gray-600">Work with passionate people who care about making a difference</p>
              </div>
              <div className="text-center">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="text-teal-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Work-Life Balance</h3>
                <p className="text-gray-600">Flexible working hours and remote-friendly culture</p>
              </div>
              <div className="text-center">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-teal-600" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Global Impact</h3>
                <p className="text-gray-600">Make a positive impact on fashion sustainability worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Openings */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Current Openings</h2>
            <div className="space-y-6">
              {jobOpenings.map((job, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded">{job.department}</span>
                        <span className="flex items-center gap-1">
                          <MapPin size={16} />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={16} />
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors">
                      Apply Now
                    </button>
                  </div>
                  <p className="text-gray-600">{job.description}</p>
                </div>
              ))}
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

export default Careers;