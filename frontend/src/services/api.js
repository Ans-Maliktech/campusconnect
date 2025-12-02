import axios from 'axios';

/**
 * Base API configuration
 * Automatically adds JWT token to requests if available
 */
const API = axios.create({
  baseURL: 'https://campusconnect-90lr.onrender.com/api', // Added /api
});

// Add token to requests automatically
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default API;