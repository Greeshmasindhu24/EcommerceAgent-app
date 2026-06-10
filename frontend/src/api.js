import axios from 'axios';

const DEFAULT_RENDER_API = 'https://ecommercesingleagentapp.onrender.com';
const LOCAL_PORT = 5001;

function isPrivateLanHost(hostname) {
  return (
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)
    || /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
    || /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname)
  );
}

function isLocalUrl(url) {
  return !url || url.includes('127.0.0.1') || url.includes('localhost');
}

/** Pick API base URL for laptop, phone on Wi‑Fi, or live Render deployment. */
export function getApiUrl() {
  const envUrl = (process.env.REACT_APP_API_URL || '').trim().replace(/\/$/, '');
  const { protocol, hostname } = window.location;

  if (envUrl && !isLocalUrl(envUrl)) {
    return envUrl;
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return envUrl || `http://127.0.0.1:${LOCAL_PORT}`;
  }

  if (isPrivateLanHost(hostname)) {
    return `${protocol}//${hostname}:${LOCAL_PORT}`;
  }

  return DEFAULT_RENDER_API;
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
