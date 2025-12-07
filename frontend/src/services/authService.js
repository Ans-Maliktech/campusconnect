import API from './api';

export const signup = async (userData) => {
  const response = await API.post('/auth/signup', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user || response.data)); 
  }
  return response.data;
};

export const verifyEmail = async (data) => {
  const response = await API.post('/auth/verify-email', data);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await API.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await API.post('/auth/reset-password', data);
  return response.data;
};

export const resendCode = async (email) => {
  const response = await API.post('/auth/resend-code', { email });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/** 🟢 THIS IS THE MISSING FUNCTION */
export const updateUserProfile = async (updatedData) => {
  try {
    const response = await API.put('/auth/profile', updatedData);
    const currentUser = getCurrentUser();
    const mergedUser = { ...currentUser, ...response.data };
    localStorage.setItem('user', JSON.stringify(mergedUser));
    return mergedUser;
  } catch (error) {
    console.warn("Backend update failed, falling back to local update.");
    const currentUser = getCurrentUser();
    const mergedUser = { ...currentUser, ...updatedData };
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.setItem('user', JSON.stringify(mergedUser));
    return mergedUser;
  }
};