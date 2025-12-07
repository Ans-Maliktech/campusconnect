import axios from 'axios';

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

export default API;