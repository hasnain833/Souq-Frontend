// src/api/ContactService.js
import apiService from './ApiService';

// Submit contact form
export const submitContactForm = async (contactData) => {
  return await apiService({
    url: '/api/user/general/contact',
    method: 'POST',
    data: contactData,
    withAuth: false, // Contact form doesn't require authentication
  });
};

export default {
  submitContactForm,
};