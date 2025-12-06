import axios from 'axios';

// 1. Dynamic URL (Localhost vs Render)
// This ensures it uses the .env file if it exists, otherwise defaults to localhost
const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000');

// 2. Create the Axios Instance
const API = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 3. Add Token to Requests (Interceptor)
API.interceptors.request.use(
  (config) => {
    // 🟢 FIX: Read the token directly from string storage
    // (Matches the logic in authService.js)
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