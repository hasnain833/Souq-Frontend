import apiService from './ApiService';

const LOCATION_BASE = '/api/user/location';

// Countries
export const getCountries = async () => {
  const res = await apiService({
    url: `${LOCATION_BASE}/countries`,
    method: 'GET',
  });
  return res.data;
};

export const getCountryById = async (countryId) => {
  const res = await apiService({
    url: `${LOCATION_BASE}/countries/${countryId}`,
    method: 'GET',
  });
  return res.data;
};

export const getCountryByCode = async (countryCode) => {
  const res = await apiService({
    url: `${LOCATION_BASE}/countries/code/${countryCode}`,
    method: 'GET',
  });
  return res.data;
};

export const searchCountries = async (query) => {
  const res = await apiService({
    url: `${LOCATION_BASE}/countries/search`,
    method: 'GET',
    params: { q: query },
  });
  return res.data;
};

// Cities
export const getCitiesByCountry = async (countryId) => {
  const res = await apiService({
    url: `${LOCATION_BASE}/cities/country/${countryId}`,
    method: 'GET',
  });
  return res.data;
};

export const getCitiesByCountryCode = async (countryCode) => {
  const res = await apiService({
    url: `${LOCATION_BASE}/cities/country-code/${countryCode}`,
    method: 'GET',
  });
  return res.data;
};

export const searchCities = async (query, countryId = null) => {
  const params = { q: query };
  if (countryId) params.countryId = countryId;

  const res = await apiService({
    url: `${LOCATION_BASE}/cities/search`,
    method: 'GET',
    params,
  });
  return res.data;
};

export const getCityById = async (cityId) => {
  const res = await apiService({
    url: `${LOCATION_BASE}/cities/${cityId}`,
    method: 'GET',
  });
  return res.data;
};

// Display helpers
export const formatCountryDisplay = (country) => {
  if (!country) return '';
  return country.flag ? ` ${country.name}` : country.name;
};

export const formatCityDisplay = (city) => {
  if (!city) return '';
  return city.state ? `${city.name}, ${city.state}` : city.name;
};

export const formatFullLocationDisplay = (city, country) => {
  if (!city || !country) return '';
  const cityDisplay = formatCityDisplay(city);
  const countryDisplay = formatCountryDisplay(country);
  return `${cityDisplay}, ${countryDisplay}`;
};

// Exporting all functions
const LocationService = {
  getCountries,
  getCountryById,
  getCountryByCode,
  searchCountries,
  getCitiesByCountry,
  getCitiesByCountryCode,
  searchCities,
  getCityById,
  formatCountryDisplay,
  formatCityDisplay,
  formatFullLocationDisplay,
};

export default LocationService;
