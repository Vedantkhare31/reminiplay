import axios from 'axios';

// Dynamically determine backend URL to handle localhost, 127.0.0.1, or custom host
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || 'localhost';
    // If running in development (localhost/127.0.0.1), target backend port 5000 on the same host
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `http://${hostname}:5000`;
    }
  }
  return 'http://localhost:5000';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // Keep baseURL in sync with current window location
    if (!config.baseURL || config.baseURL === 'http://localhost:5000') {
      config.baseURL = getApiBaseUrl();
    }
    const token = localStorage.getItem('reminiplay_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth expiration and network errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      const targetUrl = getApiBaseUrl();
      error.friendlyMessage = `Cannot reach backend server (${targetUrl}). Please check server status or internet connection.`;
    }
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (error.response.data?.message?.includes('expired') || error.response.data?.message?.includes('token')) {
        localStorage.removeItem('reminiplay_token');
        localStorage.removeItem('reminiplay_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
