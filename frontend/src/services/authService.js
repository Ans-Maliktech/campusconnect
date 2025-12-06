import API from './api';

/**
 * Authentication service
 * Handles login, signup, verification, password recovery, and token management
 */

// ============================================
// REGISTER USER
// ============================================
export const signup = async (userData) => {
  const response = await API.post('/auth/signup', userData);
  // Returns: { message: "Verification code sent", email: "user@example.com" }
  return response.data;
};

// ============================================
// LOGIN USER
// ============================================
export const login = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  
  // If login successful, save token and user data
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// ============================================
// VERIFY EMAIL (FIXED ENDPOINT)
// ============================================
export const verifyEmail = async (data) => {
  // 🟢 CRITICAL FIX: Correct endpoint
  const response = await API.post('/auth/verify-email', data);
  
  // If verification successful, save token and user data
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  
  return response.data;
};

// ============================================
// FORGOT PASSWORD
// ============================================
export const forgotPassword = async (email) => {
  const response = await API.post('/auth/forgot-password', { email });
  // Returns: { message: "Reset code sent", email: "user@example.com" }
  return response.data;
};

// ============================================
// RESET PASSWORD
// ============================================
export const resetPassword = async (data) => {
  const response = await API.post('/auth/reset-password', data);
  // Returns: { message: "Password reset successfully" }
  return response.data;
};

// ============================================
// RESEND VERIFICATION CODE
// ============================================
export const resendVerificationCode = async (email) => {
  const response = await API.post('/auth/resend-code', { email });
  return response.data;
};

// ============================================
// LOGOUT USER
// ============================================
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// ============================================
// GET CURRENT USER FROM LOCALSTORAGE
// ============================================
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};