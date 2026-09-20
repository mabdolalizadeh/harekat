const API_BASE = import.meta.env?.VITE_API_BASE || (import.meta.env?.DEV ? 'http://localhost:3000/api/v1' : '/api/v1');

function getCookie(name) {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

export function token(kind = 'token') {
    try {
        if (typeof window !== 'undefined' && window.location.search) {
            const params = new URLSearchParams(window.location.search);
            const queryToken = params.get('auth_token') || params.get('token');
            if (queryToken) {
                setToken(queryToken, kind);
                params.delete('auth_token');
                params.delete('token');
                const newSearch = params.toString() ? `?${params.toString()}` : '';
                window.history.replaceState({}, '', `${window.location.pathname}${newSearch}${window.location.hash}`);
                return queryToken;
            }
        }

        const local = localStorage.getItem(kind);
        if (local) return local;
        const cookieToken = getCookie('auth_token') || getCookie('token');
        if (cookieToken) {
            localStorage.setItem(kind, cookieToken);
            return cookieToken;
        }
        return null;
    } catch { return null; }
}

export function setToken(val, kind = 'token') {
    try {
        if (val) {
            localStorage.setItem(kind, val);
            document.cookie = `auth_token=${encodeURIComponent(val)}; path=/; max-age=${30*24*60*60}; SameSite=Lax`;
        } else {
            localStorage.removeItem(kind);
            document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax';
        }
    } catch {}
}

export function sessionId() {
    try {
        let value = localStorage.getItem('cartSessionId');
        if (!value) {
            value = crypto.randomUUID();
            localStorage.setItem('cartSessionId', value);
        }
        return value;
    } catch { return null; }
}

async function request(path, { method = 'GET', body, auth = false, tokenKind = 'token' } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    const jwt = token(tokenKind);
    if (jwt) {
        headers.Authorization = `Bearer ${jwt}`;
    }
    if (path.startsWith('/cart')) {
        const id = sessionId();
        if (id) headers['x-session-id'] = id;
    }

    const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        credentials: 'include',
        body: body === undefined ? undefined : JSON.stringify(body)
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || data?.ok === false) {
        throw new Error(data?.message || `خطای سرور (${response.status})`);
    }
    return data;
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

export const storeApi = {
    getCourses: () => get('/courses'),
    getCourse: async (id) => {
        const response = await get(`/courses/${id}`);
        return {
            ...response,
            data: response.data ? { ...response.data, image: assetUrl(response.data.image) } : response.data
        };
    },
    getCategories: () => get('/categories'),
    getTeachers: () => get('/teachers'),
    getTeacher: async (id) => {
        const response = await get(`/teachers/${id}`);
        return {
            ...response,
            data: response.data ? {
                ...response.data,
                avatar: assetUrl(response.data.avatar),
                resumeFile: assetUrl(response.data.resumeFile)
            } : response.data
        };
    },
    getHeaderMenu: () => get('/cms/header-menu'),
    getSiteContent: () => get('/cms/content'),
    getSubscriptions: async () => {
        const response = await get('/subscriptions');
        return {
            ...response,
            data: (response.data ?? []).map((item) => ({ ...item, image: assetUrl(item.image) }))
        };
    },
    getPackages: () => get('/packages'),
    getBanners: async () => {
        const response = await get('/banners');
        return {
            ...response,
            data: (response.data ?? []).map((banner) => ({
                ...banner,
                imageUrl: assetUrl(banner.imageUrl),
                tabletImageUrl: assetUrl(banner.tabletImageUrl),
                mobileImageUrl: assetUrl(banner.mobileImageUrl),
            }))
        };
    },
    validateCoupon: (code, orderAmount) => post('/coupons/validate', { code, orderAmount }),
};

export const customerApi = {
    getCart: () => get('/cart', { auth: false }),
    addToCart: (productId, productType, quantity = 1, price) => post('/cart/add', { productId, productType, quantity, price }, { auth: false }),
    updateCartItem: (itemId, quantity) => put(`/cart/item/${itemId}`, { quantity }, { auth: false }),
    removeFromCart: (itemId) => del(`/cart/item/${itemId}`, { auth: false }),
    clearCart: () => del('/cart/clear', { auth: false }),
    createOrder: (couponCode) => post('/orders', { couponCode }, { auth: true }),
    getOrders: () => get('/orders', { auth: true }),
    getOrder: (id) => get(`/orders/${id}`, { auth: true }),
};

export const authApi = {
    requestOtp: (phoneNumber) => post('/auth', { phoneNumber }),
    validateOtp: (phoneNumber, otp) => post('/auth/validate-otp', { phoneNumber, otp }),
    getMe: () => get('/auth/me', { auth: true }),
    logout: () => {
        setToken(null);
        localStorage.removeItem('user');
    }
};

export { API_BASE };
