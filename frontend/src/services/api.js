import axios from 'axios';
import { logout } from './authService'; 

// Read from Create React App environment variable
const API_URL = process.env.REACT_APP_API_URL || 'https://campusconnect-90lr.onrender.com/api';

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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

// 🟢 RESPONSE INTERCEPTOR (Fixed)
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if the server responds with 401 Unauthorized
    if (error.response && error.response.status === 401) {
      
      // 🟢 CRITICAL FIX: If we are ALREADY on the login page, 
      // DO NOT force a reload/redirect. Just return the error 
      // so the Login component can display "Invalid Credentials".
      if (window.location.pathname === '/login') {
        return Promise.reject(error);
      }

      console.log('JWT Expired/Unauthorized. Redirecting to Login.');
      
      logout(); 
      window.location.href = '/login'; 
      
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default API;