import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, MapPin } from 'lucide-react';
import { getCitiesByCountry, searchCities, formatCityDisplay } from '../../api/LocationService';

const CitySelector = ({ 
  selectedCountry,
  selectedCity, 
  onCitySelect, 
  placeholder = "Select City",
  disabled = false,
  required = false,
  error = null,
  className = ""
}) => {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  // Load cities when country changes
  useEffect(() => {
    if (selectedCountry?._id) {
      loadCities(selectedCountry._id);
    } else {
      setCities([]);
      setFilteredCities([]);
      // Clear selected city if country is cleared
      if (selectedCity) {
        onCitySelect(null);
      }
    }
  }, [selectedCountry]);

  // Filter cities based on search query
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      handleSearch(searchQuery);
    } else {
      setFilteredCities(cities);
    }
  }, [searchQuery, cities]);

  const loadCities = async (countryId) => {
    try {
      setInitialLoading(true);
      const response = await getCitiesByCountry(countryId);
      if (response.success && response.data.cities) {
        setCities(response.data.cities);
        setFilteredCities(response.data.cities);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      setCities([]);
      setFilteredCities([]);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (query.trim().length < 2) {
      setFilteredCities(cities);
      return;
    }

    try {
      setLoading(true);
      const response = await searchCities(query, selectedCountry?._id);
      if (response.success && response.data.cities) {
        setFilteredCities(response.data.cities);
      }
    } catch (error) {
      console.error('Error searching cities:', error);
      // Fallback to local filtering
      const filtered = cities.filter(city =>
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        (city.state && city.state.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredCities(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city) => {
    onCitySelect(city);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleToggle = () => {
    if (!disabled && selectedCountry) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchQuery('');
      }
    }
  };

  const getDisplayValue = () => {
    if (selectedCity) {
      return formatCityDisplay(selectedCity);
    }
    if (!selectedCountry) {
      return "Select country first";
    }
    if (initialLoading) {
      return "Loading cities...";
    }
    return placeholder;
  };

  const isDisabled = disabled || !selectedCountry || initialLoading;

  return (
    <div className={`relative ${className}`}>
      {/* Main Button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={isDisabled}
        className={`
          w-full px-4 py-3 text-left bg-white border rounded flex items-center justify-between
          ${isDisabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-teal-500 focus:border-teal-500'}
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${isOpen ? 'border-teal-500' : ''}
          transition-all duration-200
        `}
      >
        <div className="flex items-center space-x-3">
          {/* <MapPin className="w-5 h-5 text-gray-400" /> */}
          <span className={selectedCity ? 'text-gray-900' : 'text-gray-500'}>
            {getDisplayValue()}
          </span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Error Message */}
      {/* {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )} */}

      {/* Dropdown */}
      {isOpen && selectedCountry && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:border-teal-500 outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Cities List */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Searching...
              </div>
            ) : filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city._id}
                  type="button"
                  onClick={() => handleCitySelect(city)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-teal-50 flex items-center justify-between
                    ${selectedCity?._id === city._id ? 'bg-gray-100 text-teal-900' : 'text-gray-900'}
                    transition-colors duration-150
                  `}
                >
                  <div className="flex-1">
                    <div className="font-medium flex items-center space-x-2">
                      <span>{city.name}</span>
                      {city.isCapital && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Capital
                        </span>
                      )}
                    </div>
                    {city.state && (
                      <div className="text-sm text-gray-500">{city.state}</div>
                    )}
                    {city.population > 0 && (
                      <div className="text-xs text-gray-400">
                        Pop: {city.population.toLocaleString()}
                      </div>
                    )}
                  </div>
                  {selectedCity?._id === city._id && (
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  )}
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? 'No cities found' : 'No cities available'}
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

export default CitySelector;
