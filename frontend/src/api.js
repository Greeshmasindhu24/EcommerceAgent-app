import axios from 'axios';

const LOCAL_API = 'http://127.0.0.1:5001';
const PROD_API = 'https://ecommerceagent-app.onrender.com';

export function getApiUrl() {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return LOCAL_API;
    }
  }
  return PROD_API;
}

function getStoredToken() {
  const raw = localStorage.getItem('token');
  if (!raw) return null;
  return raw.trim().replace(/^Bearer\s+/i, '');
}

const api = axios.create({
  timeout: 90000,
});

api.interceptors.request.use((config) => {
  config.baseURL = getApiUrl();
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function wakeBackend() {
  try {
    await api.get('/', { timeout: 90000 });
    return true;
  } catch {
    return false;
  }
}

export const placeOrder = (orderData) => api.post('/place-order', orderData);

export default api;
