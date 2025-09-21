import React, { useState } from 'react';
import CountrySelector from '../components/Location/CountrySelector';
import CitySelector from '../components/Location/CitySelector';

const LocationTest = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const handleCountrySelect = (country) => {
    console.log('Selected country:', country);
    setSelectedCountry(country);
    setSelectedCity(null); // Clear city when country changes
  };

  const handleCitySelect = (city) => {
    console.log('Selected city:', city);
    setSelectedCity(city);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🌍 Country & City Selector Test
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Country Selector */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Select Country</h2>
              <CountrySelector
                selectedCountry={selectedCountry}
                onCountrySelect={handleCountrySelect}
                placeholder="Choose your country"
                className="w-full"
              />
              
              {selectedCountry && (
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                  <h3 className="font-medium text-teal-800 mb-2">Selected Country:</h3>
                  <div className="text-sm text-teal-700">
                    <p><strong>Name:</strong> {selectedCountry.name}</p>
                    <p><strong>Code:</strong> {selectedCountry.code}</p>
                    <p><strong>Dial Code:</strong> {selectedCountry.dialCode}</p>
                    <p><strong>Flag:</strong> {selectedCountry.flag}</p>
                    <p><strong>Currency:</strong> {selectedCountry.currency?.name} ({selectedCountry.currency?.symbol})</p>
                  </div>
                </div>
              )}
            </div>

            {/* City Selector */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Select City</h2>
              <CitySelector
                selectedCountry={selectedCountry}
                selectedCity={selectedCity}
                onCitySelect={handleCitySelect}
                placeholder="Choose your city"
                className="w-full"
              />
              
              {selectedCity && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2">Selected City:</h3>
                  <div className="text-sm text-blue-700">
                    <p><strong>Name:</strong> {selectedCity.name}</p>
                    {selectedCity.state && <p><strong>State:</strong> {selectedCity.state}</p>}
                    <p><strong>Full Location:</strong> {selectedCity.fullLocation}</p>
                    {selectedCity.isCapital && (
                      <p><strong>Capital:</strong> <span className="text-yellow-600">Yes</span></p>
                    )}
                    {selectedCity.population > 0 && (
                      <p><strong>Population:</strong> {selectedCity.population.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Combined Result */}
          {selectedCountry && selectedCity && (
            <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                🎉 Complete Location Selected
              </h3>
              <div className="text-green-700">
                <p className="text-lg">
                  <strong>Full Address:</strong> {selectedCity.fullLocation}, {selectedCountry.flag} {selectedCountry.name}
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Country Code:</strong> {selectedCountry.code}</p>
                    <p><strong>Dial Code:</strong> {selectedCountry.dialCode}</p>
                    <p><strong>Currency:</strong> {selectedCountry.currency?.code}</p>
                  </div>
                  <div>
                    <p><strong>City ID:</strong> {selectedCity._id}</p>
                    <p><strong>Country ID:</strong> {selectedCountry._id}</p>
                    {selectedCity.isCapital && <p><strong>Type:</strong> Capital City</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-800 mb-2">Instructions:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• First select a country from the dropdown</li>
              <li>• Then select a city from the available cities in that country</li>
              <li>• You can search for countries and cities using the search boxes</li>
              <li>• The components support keyboard navigation and are fully accessible</li>
              <li>• Check the browser console for detailed selection logs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationTest;
