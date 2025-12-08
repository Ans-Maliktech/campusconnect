import axios from 'axios';
// 🟢 Import the logout function from authService to clear the client session
import { logout } from './authService'; 

// Read from Create React App environment variable
const API_URL = process.env.REACT_APP_API_URL || 'https://campusconnect-90lr.onrender.com/api';

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 🟢 IMPORTANT: Enables CORS credentials
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🟢 NEW: RESPONSE INTERCEPTOR (Catches expired token and redirects)
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if the server responds with 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.log('JWT Expired/Unauthorized. Forcing logout and redirecting.');
      
      // 1. Clear local storage/session state
      logout(); 
      
      // 2. Force the browser to redirect to /login
      // This immediately updates the browser URL and state
      window.location.href = '/login'; 
      
      // Prevents the expired token error from being processed by components
      return Promise.reject(error);
    }
    
    // For all other errors (400, 500, etc.), pass them through
    return Promise.reject(error);
  }
);

export default API;