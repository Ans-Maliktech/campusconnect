import API from './api';

// Safe storage wrapper
const storage = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('Storage blocked, using memory fallback:', error);
      window._memoryStorage = window._memoryStorage || {};
      window._memoryStorage[key] = value;
    }
  },
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Storage blocked, using memory fallback:', error);
      return window._memoryStorage?.[key] || null;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Storage blocked, using memory fallback:', error);
      if (window._memoryStorage) delete window._memoryStorage[key];
    }
  }
};

export const signup = async (userData) => {
  const response = await API.post('/auth/signup', userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  if (response.data.token) {
    storage.setItem('token', response.data.token);
    storage.setItem('user', JSON.stringify(response.data.user || response.data)); 
  }
  return response.data;
};

export const verifyEmail = async (data) => {
  const response = await API.post('/auth/verify-email', data);
  if (response.data.token) {
    storage.setItem('token', response.data.token);
    storage.setItem('user', JSON.stringify(response.data));
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
  storage.removeItem('token');
  storage.removeItem('user');
};

export const getCurrentUser = () => {
  const user = storage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const updateUserProfile = async (updatedData) => {
  try {
    const response = await API.put('/auth/profile', updatedData);
    const currentUser = getCurrentUser();
    const mergedUser = { ...currentUser, ...response.data };
    storage.setItem('user', JSON.stringify(mergedUser));
    return mergedUser;
  } catch (error) {
    console.warn("Backend update failed, falling back to local update.");
    const currentUser = getCurrentUser();
    const mergedUser = { ...currentUser, ...updatedData };
    await new Promise(resolve => setTimeout(resolve, 500));
    storage.setItem('user', JSON.stringify(mergedUser));
    return mergedUser;
  }
};