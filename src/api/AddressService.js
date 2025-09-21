import apiService from './ApiService';
import {
  getAccessToken,
  clearTokens,
} from '../utils/TokenStorage';

const ADDRESS_BASE = '/api/user/addresses';

export const isAuthenticated = () => {
  const token = getAccessToken();
  if (!token) {
    console.log('No token found');
    return false;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    if (payload.exp < currentTime) {
      console.log('Token is expired');
      clearTokens();
      return false;
    }
    console.log('User is logged in with valid token');
    return true;
  } catch (error) {
    console.error('Error parsing token:', error);
    clearTokens();
    return false;
  }
};

export const addAddress = async (addressData, setAsDefault = false) => {
  if (!isAuthenticated()) {
    return { success: false, error: 'User not authenticated. Please log in.' };
  }

  const res = await apiService({
    url: `${ADDRESS_BASE}/add`,
    method: 'POST',
    data: { ...addressData, setAsDefault },
  });
  return res.data;
};

export const getUserAddresses = async () => {
  const res = await apiService({
    url: `${ADDRESS_BASE}/`,
    method: 'GET',
  });
  return res.data;
};

export const getDefaultAddress = async () => {
  const res = await apiService({
    url: `${ADDRESS_BASE}/default`,
    method: 'GET',
  });
  return res.data;
};

export const setDefaultAddress = async (addressId) => {
  const res = await apiService({
    url: `${ADDRESS_BASE}/${addressId}/set-default`,
    method: 'PUT',
  });
  return res.data;
};

export const updateAddress = async (addressId, addressData) => {
  const res = await apiService({
    url: `${ADDRESS_BASE}/${addressId}`,
    method: 'PUT',
    data: addressData,
  });
  return res.data;
};

export const deleteAddress = async (addressId) => {
  const res = await apiService({
    url: `${ADDRESS_BASE}/${addressId}`,
    method: 'DELETE',
  });
  return res.data;
};

export const validateAddress = (addressData) => {
  const errors = {};

  if (!addressData.fullName?.trim()) errors.fullName = 'Full name is required';
  if (!addressData.street1?.trim()) errors.street1 = 'Street address is required';
  if (!addressData.city?.trim()) errors.city = 'City is required';
  if (!addressData.zipCode?.trim()) errors.zipCode = 'ZIP code is required';
  if (!addressData.country?.trim()) errors.country = 'Country is required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const formatAddressDisplay = (address) => {
  if (!address) return '';
  return [address.street1, address.street2, address.city, address.state, address.zipCode, address.country]
    .filter(Boolean)
    .join(', ');
};

export const getAddressTypeDisplayName = (type) => {
  const typeNames = {
    home: 'Home',
    work: 'Work',
    other: 'Other',
  };
  return typeNames[type] || 'Other';
};
