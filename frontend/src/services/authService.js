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

/**
 * Update User Profile
 * Updates user information and syncs with backend + localStorage
 */
export const updateUserProfile = async (updatedData) => {
  try {
    console.log('📤 Updating profile on backend:', updatedData);
    
    // Call backend API
    const response = await API.put('/auth/profile', updatedData);
    
    console.log('✅ Backend response:', response.data);
    
    // 🟢 CRITICAL: Backend returns complete user object with NEW token
    const updatedUser = response.data;
    
    // 🟢 Update localStorage with fresh token and data
    if (updatedUser.token) {
      localStorage.setItem('token', updatedUser.token);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    console.log('✅ Profile updated and synced');
    return updatedUser;
    
  } catch (error) {
    console.error('❌ Profile update failed:', error);
    
    // If backend fails, update locally as fallback
    console.warn('⚠️ Backend update failed, using local fallback');
    
    const currentUser = getCurrentUser();
    const mergedUser = { 
      ...currentUser, 
      ...updatedData,
      // Keep the existing token if backend failed
      token: currentUser.token 
    };
    
    localStorage.setItem('user', JSON.stringify(mergedUser));
    
    // Throw error so frontend can show appropriate message
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};