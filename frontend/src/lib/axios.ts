// Performance: Singleton axios instance - base URL configured once, credentials always sent
// Keep in sync with backend CORS config
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '';

if (!baseURL) {
  console.warn('⚠️ VITE_API_BASE_URL is not defined! Requests might fail if not proxying.');
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Increased to 60s to allow Render free tier to wake up
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('🛑 [API Error]', error.message);
    if (error.response) {
      console.error('Data:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      console.error('No response received (Possible CORS or Network issue):', error.request);
    }
    
    if (error.response?.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
