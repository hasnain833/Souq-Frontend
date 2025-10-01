import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Globe } from 'lucide-react';
import { getCountries, searchCountries, formatCountryDisplay } from '../../api/LocationService';

const CountrySelector = ({ 
  selectedCountry, 
  onCountrySelect, 
  placeholder = "Select Country",
  disabled = false,
  required = false,
  error = null,
  className = ""
}) => {
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Load countries on component mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Filter countries based on search query
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      handleSearch(searchQuery);
    } else {
      setFilteredCountries(countries);
    }
  }, [searchQuery, countries]);

  const loadCountries = async () => {
    try {
      setInitialLoading(true);
      const response = await getCountries();
      if (response.success && response.data.countries) {
        setCountries(response.data.countries);
        setFilteredCountries(response.data.countries);
      }
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (query.trim().length < 2) {
      setFilteredCountries(countries);
      return;
    }

    try {
      setLoading(true);
      const response = await searchCountries(query);
      if (response.success && response.data.countries) {
        setFilteredCountries(response.data.countries);
      }
    } catch (error) {
      console.error('Error searching countries:', error);
      // Fallback to local filtering
      const filtered = countries.filter(country =>
        country.name.toLowerCase().includes(query.toLowerCase()) ||
        country.code.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCountries(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (country) => {
    onCountrySelect(country);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchQuery('');
      }
    }
  };

  const displayValue = selectedCountry ? formatCountryDisplay(selectedCountry) : placeholder;

  return (
    <div className={`relative ${className}`}>
      {/* Main Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled || initialLoading}
        className={`
          w-full px-4 py-3 text-left bg-white border rounded flex items-center justify-between
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-teal-500 focus:border-teal-500'}
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${isOpen ? 'border-teal-500 ' : ''}
          transition-all duration-200
        `}
      >
        <div className="flex items-center space-x-3">
          {/* <Globe className="w-5 h-5 text-gray-400" /> */}
          <span className={selectedCountry ? 'text-gray-900' : 'text-gray-500'}>
            {initialLoading ? 'Loading countries...' : displayValue}
          </span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:border-teal-500 outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Countries List */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Searching...
              </div>
            ) : filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country._id}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-teal-50 flex items-center space-x-3
                    ${selectedCountry?._id === country._id ? 'bg-teal-100 text-teal-900' : 'text-gray-900'}
                    transition-colors duration-150
                  `}
                >
                  <span className="text-xl">{country.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{country.name}</div>
                    <div className="text-sm text-gray-500">{country.code} • {country.dialCode}</div>
                  </div>
                  {selectedCountry?._id === country._id && (
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  )}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? 'No countries found' : 'No countries available'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CountrySelector;
