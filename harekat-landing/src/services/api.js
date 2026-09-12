const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:3000/api/v1';

function token(kind = 'token') {
    try { return localStorage.getItem(kind); } catch { return null; }
}

function sessionId() {
    try {
        let value = localStorage.getItem('cartSessionId');
        if (!value) { value = crypto.randomUUID(); localStorage.setItem('cartSessionId', value); }
        return value;
    } catch { return null; }
}

async function request(path, { method = 'GET', body, auth = false, tokenKind = 'token' } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth && token(tokenKind)) headers.Authorization = `Bearer ${token(tokenKind)}`;
    if (path.startsWith('/cart')) { const id = sessionId(); if (id) headers['x-session-id'] = id; }
    const response = await fetch(`${API_BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.ok === false) throw new Error(data?.message || `خطای سرور (${response.status})`);
    return data;
}

const get = (path, options) => request(path, { ...options, method: 'GET' });
const post = (path, body, options) => request(path, { ...options, method: 'POST', body });
const put = (path, body, options) => request(path, { ...options, method: 'PUT', body });
const del = (path, options) => request(path, { ...options, method: 'DELETE' });

function assetUrl(value) {
    if (!value || /^(data:|https?:\/\/)/i.test(value)) return value;
    const origin = API_BASE.startsWith('http') ? new URL(API_BASE).origin : window.location.origin;
    return `${origin}${value.startsWith('/') ? '' : '/'}${value}`;
}

export const storeApi = {
    getCourses: () => get('/courses'),
    getCourse: async (id) => {
        const response = await get(`/courses/${id}`);
        return { ...response, data: response.data ? { ...response.data, image: assetUrl(response.data.image) } : response.data };
    },
    getCategories: () => get('/categories'),
    getTeachers: () => get('/teachers'),
    getTeacher: async (id) => {
        const response = await get(`/teachers/${id}`);
        return { ...response, data: response.data ? { ...response.data, avatar: assetUrl(response.data.avatar), resumeFile: assetUrl(response.data.resumeFile) } : response.data };
    },
    getHeaderMenu: () => get('/cms/header-menu'),
    getSiteContent: () => get('/cms/content'),
    getSubscriptions: async () => {
        const response = await get('/subscriptions');
        return { ...response, data: (response.data ?? []).map((item) => ({ ...item, image: assetUrl(item.image) })) };
    },
    getBanners: async () => {
        const response = await get('/banners');
        return { ...response, data: (response.data ?? []).map((banner) => ({
            ...banner,
            imageUrl: assetUrl(banner.imageUrl),
            tabletImageUrl: assetUrl(banner.tabletImageUrl),
            mobileImageUrl: assetUrl(banner.mobileImageUrl),
        })) };
    },
    validateCoupon: (code, orderAmount) => post('/coupons/validate', { code, orderAmount }),
};

export const customerApi = {
    getCart: () => get('/cart', { auth: true }),
    addToCart: (productId, productType, quantity, price) => post('/cart/add', { productId, productType, quantity, price }, { auth: true }),
    updateCartItem: (itemId, quantity) => put(`/cart/item/${itemId}`, { quantity }, { auth: true }),
    removeFromCart: (itemId) => del(`/cart/item/${itemId}`, { auth: true }),
    clearCart: () => del('/cart/clear', { auth: true }),
    createOrder: (couponCode) => post('/orders', { couponCode }, { auth: true }),
    getOrders: () => get('/orders', { auth: true }),
    getOrder: (id) => get(`/orders/${id}`, { auth: true }),
};

export const authApi = {
    requestOtp: (phoneNumber) => post('/auth', { phoneNumber }),
    validateOtp: (phoneNumber, otp) => post('/auth/validate-otp', { phoneNumber, otp }),
};

export { API_BASE };
