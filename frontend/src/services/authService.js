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

// ============================================
// SIGNUP
// ============================================
export const signup = async (userData) => {
  const response = await API.post('/auth/signup', userData);
  return response.data;
};

// ============================================
// LOGIN
// ============================================
export const login = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  const userData = response.data;

  if (userData.token) {
    storage.setItem('token', userData.token);
    storage.setItem('user', JSON.stringify(userData));
  }
  
  return userData;
};

// ============================================
// VERIFY EMAIL (🔴 CRITICAL FIX)
// ============================================
export const verifyEmail = async (data) => {
  console.log('📧 Sending verification request:', {
    email: data.email,
    code: data.code,
    codeType: typeof data.code,
    codeLength: String(data.code).length
  });

  // 🟢 FIX: Ensure code is sent as trimmed string
  const payload = {
    email: data.email.trim(),
    code: String(data.code).trim()
  };

  const response = await API.post('/auth/verify-email', payload);
  
  console.log('✅ Verification response:', response.data);

  // 🟢 Store token and user data after successful verification
  if (response.data.token) {
    storage.setItem('token', response.data.token);
    storage.setItem('user', JSON.stringify(response.data));
    console.log('✅ Token and user data stored successfully');
  }
  
  return response.data;
};

// ============================================
// FORGOT PASSWORD
// ============================================
export const forgotPassword = async (email) => {
  const response = await API.post('/auth/forgot-password', { email });
  return response.data;
};

// ============================================
// RESET PASSWORD
// ============================================
export const resetPassword = async (data) => {
  // 🟢 Ensure code is sent as trimmed string
  const payload = {
    email: data.email.trim(),
    code: String(data.code).trim(),
    newPassword: data.newPassword
  };
  
  const response = await API.post('/auth/reset-password', payload);
  return response.data;
};

// ============================================
// RESEND VERIFICATION CODE
// ============================================
export const resendCode = async (email) => {
  const response = await API.post('/auth/resend-code', { email: email.trim() });
  return response.data;
};

// ============================================
// LOGOUT
// ============================================
export const logout = () => {
  storage.removeItem('token');
  storage.removeItem('user');
};

// ============================================
// GET CURRENT USER
// ============================================
export const getCurrentUser = () => {
  const user = storage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// ============================================
// UPDATE USER PROFILE
// ============================================
export const updateUserProfile = async (updatedData) => {
  try {
    console.log('📤 Updating profile on backend:', updatedData);
    
    const response = await API.put('/auth/profile', updatedData);
    
    console.log('✅ Backend response:', response.data);
    
    const updatedUser = response.data.user;
    
    // 🟢 Update localStorage with fresh data
    const currentToken = storage.getItem('token');
    const userToStore = {
      ...updatedUser,
      token: currentToken
    };
    
    storage.setItem('user', JSON.stringify(userToStore));
    
    console.log('✅ Profile updated and synced');
    return updatedUser;
    
  } catch (error) {
    console.error('❌ Profile update failed:', error);
    
    // Fallback: update locally
    console.warn('⚠️ Backend update failed, using local fallback');
    
    const currentUser = getCurrentUser();
    const mergedUser = { 
      ...currentUser, 
      ...updatedData,
      token: currentUser.token 
    };
    
    storage.setItem('user', JSON.stringify(mergedUser));
    
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};