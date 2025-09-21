import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, TestTube } from 'lucide-react';

const NotFoundTest = () => {
  const navigate = useNavigate();

  const testUrls = [
    '/non-existent-page',
    '/invalid/path/here',
    '/product-details/invalid-id',
    '/product-details/68497b9d588aec0773fc41ff4ee', // Invalid product ID (extra characters)
    '/product-details/123456789', // Invalid product ID (too short)
    '/product-details/invalid-product-id', // Invalid product ID (not ObjectId format)
    '/chat-layout?productId=684fe95c02ddeb449627e0ehhhhhhhhhhh', // Invalid chat product ID (extra characters)
    '/chat-layout?productId=123456789', // Invalid chat product ID (too short)
    '/chat-layout?productId=invalid-product-id', // Invalid chat product ID (not ObjectId format)
    '/profile/non-existent-user',
    '/random-gibberish',
    '/admin/unauthorized',
    '/api/invalid-endpoint',
    '/settings/non-existent-section'
  ];

  const handleTestUrl = (url) => {
    navigate(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <TestTube className="w-6 h-6 text-teal-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">404 Page Test</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Click any of the buttons below to test the 404 Not Found page with different invalid URLs:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {testUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => handleTestUrl(url)}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200 text-left"
            >
              <span className="font-mono text-sm text-gray-700">{url}</span>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Test Instructions:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click any URL above to navigate to a non-existent page</li>
            <li>• The 404 page should display with proper styling</li>
            <li>• Test both authenticated and non-authenticated states</li>
            <li>• Verify the "Go Home" button redirects correctly based on auth status</li>
            <li>• Test the "Go Back", "Search", and "Refresh" buttons</li>
            <li>• <strong>Chat URLs:</strong> Should redirect immediately without showing error messages</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Expected Behavior:</h3>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• <strong>Authenticated users:</strong> "Go Home" button should redirect to "/"</li>
            <li>• <strong>Non-authenticated users:</strong> "Go Home" button should redirect to "/login"</li>
            <li>• Page should display the requested URL that caused the 404</li>
            <li>• All buttons should work correctly</li>
            <li>• Design should match the app's teal theme</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFoundTest;
