import axios from 'axios';

const LOCAL_API = 'http://127.0.0.1:5001';
const PROD_API = 'https://ecommerceagent-app.onrender.com';

function isLocalHost() {
  if (typeof window === 'undefined') return true;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

function isLocalUrl(url) {
  return !url || url.includes('127.0.0.1') || url.includes('localhost');
}

export function getApiUrl() {
  const envUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '');

  if (isLocalHost()) {
    return envUrl || LOCAL_API;
  }

  // On Render/production — never call localhost from the browser
  if (envUrl && !isLocalUrl(envUrl)) {
    return envUrl;
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

export function sanitizeCartItems(cart) {
  return cart.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    qty: item.qty || 1,
    image: item.image,
    category: item.category,
  }));
}

export async function placeOrder(orderData, retries = 2) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      if (attempt > 0) {
        await wakeBackend();
      }
      const response = await api.post('/place-order', {
        ...orderData,
        items: sanitizeCartItems(orderData.items || []),
      });
      return response.data;
    } catch (err) {
      lastError = err;
      const retryable = !err.response || err.response.status >= 500;
      if (!retryable || attempt === retries - 1) {
        throw err;
      }
    }
  }
  throw lastError;
}

export default api;
