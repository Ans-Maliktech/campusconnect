import API from './api';

/**
 * Authentication service
 * Handles login, signup, and token management
 */

// Sign up new user
export const signup = async (userData) => {
  const response = await API.post('/auth/signup', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Login user
export const login = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user
export const logout = () => {
  localStorage.removeItem('user');
};

// Get current user from localStorage
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};  