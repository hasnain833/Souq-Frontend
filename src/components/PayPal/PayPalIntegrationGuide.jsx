import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Mail, Shield, Clock, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

const PayPalIntegrationGuide = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = [
    {
      id: 'setup',
      title: 'Setting Up Your PayPal Account',
      icon: <Mail className="w-5 h-5 text-blue-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Requirements</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Active PayPal account (Personal or Business)</li>
              <li>• Verified email address</li>
              <li>• Confirmed bank account or card linked to PayPal</li>
              <li>• Account in good standing with PayPal</li>
            </ul>
          </div>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <div>
                <h5 className="font-medium text-gray-900">Connect Your PayPal Account</h5>
                <p className="text-sm text-gray-600">Click "Connect PayPal Account" and enter your PayPal email address.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <div>
                <h5 className="font-medium text-gray-900">Verify Your Account</h5>
                <p className="text-sm text-gray-600">Complete the verification process to enable withdrawals.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
              <div>
                <h5 className="font-medium text-gray-900">Start Withdrawing</h5>
                <p className="text-sm text-gray-600">Once verified, you can withdraw funds to your PayPal account.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'verification',
      title: 'Account Verification Process',
      icon: <Shield className="w-5 h-5 text-green-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Why Verification is Required</h4>
            <p className="text-sm text-green-800">
              Account verification ensures security and compliance with financial regulations. 
              Only verified PayPal accounts can receive withdrawals.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h5 className="font-medium text-gray-900">Email Verification</h5>
                <p className="text-sm text-gray-600">Confirm your PayPal email address</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h5 className="font-medium text-gray-900">Account Status Check</h5>
                <p className="text-sm text-gray-600">Verify your PayPal account is in good standing</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <h5 className="font-medium text-gray-900">Receiving Capability</h5>
                <p className="text-sm text-gray-600">Confirm your account can receive payments</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'withdrawals',
      title: 'Making Withdrawals',
      icon: <DollarSign className="w-5 h-5 text-purple-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Withdrawal Process</h4>
            <p className="text-sm text-purple-800">
              Withdrawals to PayPal are processed quickly and securely. Funds typically arrive within 1-2 business days.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">Withdrawal Limits</h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Minimum: $10 USD</li>
                <li>• Maximum: $10,000 USD per day</li>
                <li>• Monthly limit: $50,000 USD</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">Processing Times</h5>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Standard: 1-2 business days</li>
                <li>• Weekends: Next business day</li>
                <li>• Holidays: May be delayed</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'fees',
      title: 'Fees and Charges',
      icon: <Clock className="w-5 h-5 text-orange-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 mb-2">Transparent Pricing</h4>
            <p className="text-sm text-orange-800">
              We believe in transparent pricing. Here are all the fees associated with PayPal withdrawals.
            </p>
          </div>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Fee Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">Platform Fee</td>
                    <td className="px-4 py-3 text-sm text-gray-600">2.5% of withdrawal amount</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">PayPal Processing</td>
                    <td className="px-4 py-3 text-sm text-gray-600">$0.50 USD</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">Currency Conversion</td>
                    <td className="px-4 py-3 text-sm text-gray-600">PayPal's standard rates</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-900 mb-2">Common Issues</h4>
            <p className="text-sm text-red-800">
              Having trouble with your PayPal integration? Here are solutions to common problems.
            </p>
          </div>
          <div className="space-y-4">
            <div className="border-l-4 border-yellow-400 pl-4">
              <h5 className="font-medium text-gray-900">Verification Failed</h5>
              <p className="text-sm text-gray-600 mt-1">
                Ensure your PayPal account is verified and in good standing. Check that your email address matches exactly.
              </p>
            </div>
            <div className="border-l-4 border-yellow-400 pl-4">
              <h5 className="font-medium text-gray-900">Withdrawal Declined</h5>
              <p className="text-sm text-gray-600 mt-1">
                Check your PayPal account limits and ensure it can receive payments. Contact PayPal support if needed.
              </p>
            </div>
            <div className="border-l-4 border-yellow-400 pl-4">
              <h5 className="font-medium text-gray-900">Delayed Processing</h5>
              <p className="text-sm text-gray-600 mt-1">
                Withdrawals may be delayed during weekends, holidays, or due to PayPal's internal processing times.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">PayPal Integration Guide</h3>
        <p className="text-gray-600">
          Learn how to connect your PayPal account and start making withdrawals from your wallet.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {section.icon}
                <h4 className="font-medium text-gray-900">{section.title}</h4>
              </div>
              {expandedSections[section.id] ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {expandedSections[section.id] && (
              <div className="px-4 pb-4 border-t border-gray-200">
                <div className="pt-4">
                  {section.content}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <h4 className="font-medium mb-1">Need Help?</h4>
            <p>
              If you encounter any issues or have questions about PayPal integration, 
              please contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayPalIntegrationGuide;