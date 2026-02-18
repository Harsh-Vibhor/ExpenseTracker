import axios from 'axios';

// VITE_API_BASE_URL must include the /api prefix, e.g.:
//   https://expensetracker-av4a.onrender.com/api
// The fallback below also includes /api so local dev works without a .env file.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://expensetracker-av4a.onrender.com/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-logout on 401 (expired / invalid token)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      // Only redirect if not already on the login page
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
