// Centralized API client for the standalone Harekat dashboard.
// Mirrors the conventions of harekat-landing/src/services/api.js but is
// self-contained to this dashboard. Backend envelope: { ok, data, message }.

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';

export function getStoredToken() {
  try {
    return localStorage.getItem('token') || null;
  } catch {
    return null;
  }
}

export function getSessionId() {
  try {
    let value = localStorage.getItem('cartSessionId');
    if (!value) {
      value = crypto.randomUUID();
      localStorage.setItem('cartSessionId', value);
    }
    return value;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function request(path, options = {}) {
  const { method = 'GET', body, auth = false, sessionId = false } = options;
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  if (sessionId) {
    const id = getSessionId();
    if (id) headers['x-session-id'] = id;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || (data && data.ok === false)) {
    throw new ApiError(data?.message || `Server error (${response.status})`, response.status, data);
  }

  // Unwrap the envelope: return the `data` payload directly.
  return data?.data;
}

const get = (path, options) => request(path, { ...options, method: 'GET' });
const post = (path, body, options) => request(path, { ...options, method: 'POST', body });
const put = (path, body, options) => request(path, { ...options, method: 'PUT', body });
const del = (path, options) => request(path, { ...options, method: 'DELETE' });

export function assetUrl(value) {
  if (!value || /^(data:|https?:\/\/)/i.test(value)) return value;
  const origin = API_BASE.startsWith('http') ? new URL(API_BASE).origin : window.location.origin;
  return `${origin}${value.startsWith('/') ? '' : '/'}${value}`;
}

function formatPrice(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(/[,٬\s]/g, ''));
  if (!Number.isFinite(n)) return value;
  return new Intl.NumberFormat('fa-IR').format(n);
}

export const api = {
  get,
  post,
  put,
  del,
  assetUrl,
  formatPrice,
};

export const authApi = {
  requestOtp: (phoneNumber) => post('/auth', { phoneNumber }),
  validateOtp: (phoneNumber, otp) => post('/auth/validate-otp', { phoneNumber, otp }),
};

export const userApi = {
  getProfile: (id) => get(`/users/${id}`, { auth: true }),
  updateProfile: (id, payload) => put(`/users/${id}`, payload, { auth: true }),
};

export const coursesApi = {
  list: () => get('/courses'),
  get: (id) => get(`/courses/${id}`),
};

export const subscriptionsApi = {
  list: () => get('/subscriptions'),
  get: (id) => get(`/subscriptions/${id}`),
};

export const ordersApi = {
  list: () => get('/orders', { auth: true }),
  get: (id) => get(`/orders/${id}`, { auth: true }),
  create: (couponCode) => post('/orders', { couponCode }, { auth: true, sessionId: false }),
  updateStatus: (id, status, paymentId) => put(`/orders/${id}/status`, { status, paymentId }, { auth: true }),
};

export const cartApi = {
  get: () => get('/cart', { auth: true, sessionId: true }),
  add: (productId, productType, quantity, price) => post('/cart/add', { productId, productType, quantity, price }, { auth: true, sessionId: true }),
  updateItem: (itemId, quantity) => put(`/cart/item/${itemId}`, { quantity }, { auth: true, sessionId: true }),
  removeItem: (itemId) => del(`/cart/item/${itemId}`, { auth: true, sessionId: true }),
  clear: () => del('/cart/clear', { auth: true, sessionId: true }),
};

export const cmsApi = {
  getHeaderMenu: () => get('/cms/header-menu'),
  getContent: (key) => get(key ? `/cms/content?key=${encodeURIComponent(key)}` : '/cms/content'),
};

export const couponApi = {
  validate: (code, orderAmount) => post('/coupons/validate', { code, orderAmount }),
  redeem: (code, orderAmount) => post('/coupons/redeem', { code, orderAmount }, { auth: true, sessionId: false }),
};
