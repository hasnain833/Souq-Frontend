import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, ArrowLeft, FileX, RefreshCw } from 'lucide-react';
import { isAuthenticated } from '../api/CardService';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userIsAuthenticated = isAuthenticated();
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location.pathname]);

  const handleGoHome = () => {
    if (userIsAuthenticated) {
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSearch = () => {
    navigate('/');
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <FileX className="w-12 h-12 text-teal-600" />
            </div>
            
            {/* 404 Text */}
            <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
            
            {/* Description */}
            <p className="text-gray-500 mb-4 leading-relaxed">
              Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>

            {/* Show current path */}
            {currentPath && (
              <div className="mb-8 p-3 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Requested URL:</span>
                  <code className="ml-2 text-red-600 bg-red-50 px-2 py-1 rounded text-xs">
                    {currentPath}
                  </code>
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Primary Action Button */}
            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              <Home className="w-5 h-5 mr-2" />
              {userIsAuthenticated ? 'Go to Home' : 'Go to Login'}
            </button>

            {/* Secondary Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={handleGoBack}
                className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>

              <button
                onClick={handleSearch}
                className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </button>

              <button
                onClick={handleRefresh}
                className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">
              Need help? Here are some suggestions:
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Check the URL for typos</li>
              <li>• Use the search function to find what you're looking for</li>
              <li>• Browse our categories from the home page</li>
              <li>• Contact support if you think this is an error</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-md mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            Still can't find what you're looking for?{' '}
            <button 
              onClick={() => navigate('/contact')}
              className="text-teal-600 hover:text-teal-700 font-medium underline focus:outline-none"
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
