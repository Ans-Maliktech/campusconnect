import API from './api';

/**
 * Authentication service
 * Handles login, signup, verification, password recovery, and token management
 */

// Register user
export const signup = async (userData) => {
  const response = await API.post('/auth/signup', userData);
  return response.data;
};

// Login user
export const login = async (userData) => {
  const response = await API.post('/auth/login', userData);
  
  if (response.data.token) {
    // 1. Save Token for API calls
    localStorage.setItem('token', response.data.token);
    // 2. Save User Data for UI (Welcome message, etc.)
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Verify Email Function
export const verifyEmail = async (data) => {
  const response = await API.post('/auth/verify', data);
  
  // If verification is successful, log the user in immediately
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user (Clears both keys)
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get current user from localStorage (Used by AuthContext)
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

// 🟢 NEW: Request Password Reset Code
export const forgotPassword = async (email) => {
  // Sends { email: "user@example.com" } to backend
  const response = await API.post('/auth/forgot-password', { email });
  return response.data;
};

// 🟢 NEW: Submit New Password with Code
export const resetPassword = async (data) => {
  // Sends { email, code, newPassword } to backend
  const response = await API.post('/auth/reset-password', data);
  return response.data;
};