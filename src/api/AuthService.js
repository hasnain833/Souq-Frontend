// src/api/authService.js
import apiService from './ApiService';

// Login (no token needed)
export const login = (credentials) =>
  apiService({
    url: '/api/user/auth/login',
    method: 'POST',
    data: credentials,
    withAuth: false,
  });

export const forgotPassword = (credentials) =>
  apiService({
    url: '/api/user/auth/forgot-password',
    method: 'POST',
    data: credentials,
    withAuth: false,
  });

export const changePassword = (credentials) =>
  apiService({
    url: '/api/user/auth/change-password',
    method: 'POST',
    data: credentials,
    withAuth: false,
  });


export const resetPassword = (token, credentials) =>
  apiService({
    url: `/api/user/auth/reset-password/${token}`, // token in the URL
    method: 'POST',
    data: credentials,
    withAuth: false,
  });

// Register (no token needed)
export const register = (userData) =>
  apiService({
    url: '/api/user/auth/signup',
    method: 'POST',
    data: userData,
    withAuth: false,
  });

export const emailChange = (userData) =>
  apiService({
    url: '/api/user/auth/resend-verification',
    method: 'POST',
    data: userData,
    withAuth: false,
  });

export const verifyEmail = (payload) =>
  apiService({
    url: '/api/user/auth/verify-email',
    method: 'POST',
    data: payload,
    withAuth: true, // ✅ Access token required
  });

export const sendPhoneOtp = (payload) =>
  apiService({
    url: '/api/user/auth/verify-phone',
    method: 'POST',
    data: payload,
    withAuth: true, // ✅ Access token required
  });

export const verifyPhoneOtp = (payload) =>
  apiService({
    url: '/api/user/auth/verify-phone/otp',
    method: 'POST',
    data: payload,
    withAuth: true, // ✅ Access token required
  });

// Get user profile (token required)
export const getProfile = () =>
  apiService({
    url: '/api/user/profile',
    method: 'GET',
    withAuth: true,
    credentials: 'include',
  });

export const getProfileById = (id) =>
  apiService({
    url: `/api/user/profile/${id}`,
    method: 'GET',
    // withAuth: true,
    credentials: 'include',
  });


export const updateProfile = (payload) =>
  apiService({
    url: '/api/user/profile/update-profile',
    method: 'PUT',
    data: payload,
    withAuth: true,
  });

export const uploadProfile = (payload) =>
  apiService({
    url: '/api/user/profile/upload-profile',
    method: 'POST',
    data: payload,
    withAuth: true,
  });

export const deleteUserProfile = () =>
  apiService({
    url: '/api/user/profile/delete-Profile',
    method: 'DELETE',
    withAuth: true,
  });

// Logout (token required)
export const logout = () =>
  apiService({
    url: '/api/user/auth/logout',
    method: 'POST',
    withAuth: true,
  });

// Optional: Refresh token
export const refreshToken = () =>
  apiService({
    url: '/auth/refresh-token',
    method: 'POST',
    data: {
      refreshToken: localStorage.getItem('refreshToken'),
    },
    withAuth: false,
  });
