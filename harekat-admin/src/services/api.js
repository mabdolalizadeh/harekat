// Central API/service layer — all backend communication goes through here.
// Do NOT scatter raw fetch() calls in components.

const API_BASE =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
    'http://localhost:3000/api/v1';

function getToken(kind = 'token') {
    try {
        return localStorage.getItem(kind);
    } catch {
        return null;
    }
}

async function request(path, { method = 'GET', body, tokenKind = 'token', auth = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
        const token = getToken(tokenKind);
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let data;
    try {
        data = await res.json();
    } catch {
        throw new Error('خطای ارتباط با سرور');
    }
    if (!res.ok || data?.ok === false) {
        const details = Array.isArray(data?.errors)
            ? `: ${data.errors.map((item) => `${item.field}: ${item.message}`).join('، ')}`
            : '';
        const err = new Error((data?.message || `خطای سرور (${res.status})`) + details);
        err.status = res.status;
        err.data = data?.data ?? null;
        throw err;
    }
    return data;
}

function assetUrl(imageUrl) {
    if (!imageUrl || /^(data:|https?:\/\/)/i.test(imageUrl)) return imageUrl;
    const base = API_BASE.startsWith('http')
        ? new URL(API_BASE).origin
        : (typeof window !== 'undefined' ? window.location.origin : '');
    return `${base}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
}

async function uploadImage(file) {
    if (!file || !file.type.startsWith('image/')) {
        throw new Error('فقط فایل تصویری مجاز است');
    }
    const headers = { 'Content-Type': file.type };
    const token = getToken('adminToken');
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/uploads/image`, { method: 'POST', headers, body: file });
    let data;
    try { data = await res.json(); } catch { throw new Error('خطای ارتباط با سرور'); }
    if (!res.ok || data?.ok === false) {
        const err = new Error(data?.message || `خطای سرور (${res.status})`);
        err.status = res.status;
        throw err;
    }
    return assetUrl(data.data.imageUrl);
}

async function uploadFile(file) {
    if (!file) throw new Error('فایل انتخاب نشده');
    const headers = { 'Content-Type': file.type || 'application/octet-stream' };
    const token = getToken('adminToken');
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/uploads/file`, { method: 'POST', headers, body: file });
    let data;
    try { data = await res.json(); } catch { throw new Error('خطای ارتباط با سرور'); }
    if (!res.ok || data?.ok === false) {
        const err = new Error(data?.message || `خطای سرور (${res.status})`);
        err.status = res.status;
        throw err;
    }
    return assetUrl(data.data.fileUrl);
}

const get = (path, opts) => request(path, { ...opts, method: 'GET' });
const post = (path, body, opts) => request(path, { ...opts, method: 'POST', body });
const put = (path, body, opts) => request(path, { ...opts, method: 'PUT', body });
const del = (path, opts) => request(path, { ...opts, method: 'DELETE' });

// ---- Storefront (public, no auth) ----
export const storeApi = {
    getCourses: () => get('/courses'),
    getCourse: (id) => get(`/courses/${id}`),
    getCategories: () => get('/categories'),
    getTeachers: () => get('/teachers'),
    getHeaderMenu: () => get('/cms/header-menu'),
    getSiteContent: () => get('/cms/content'),
    validateCoupon: (code, orderAmount) =>
        post('/coupons/validate', { code, orderAmount }),
    getSubscriptions: () => get('/subscriptions'),
};

// ---- Customer API (authenticated user) ----
export const customerApi = {
    getCart: () => get('/cart', { auth: true, tokenKind: 'token' }),
    addToCart: (productId, productType, quantity, price) =>
        post('/cart/add', { productId, productType, quantity, price }, { auth: true, tokenKind: 'token' }),
    updateCartItem: (itemId, quantity) =>
        put(`/cart/item/${itemId}`, { quantity }, { auth: true, tokenKind: 'token' }),
    removeFromCart: (itemId) =>
        del(`/cart/item/${itemId}`, { auth: true, tokenKind: 'token' }),
    clearCart: () =>
        del('/cart/clear', { auth: true, tokenKind: 'token' }),
    createOrder: (couponCode) =>
        post('/orders', { couponCode }, { auth: true, tokenKind: 'token' }),
    getOrders: () => get('/orders', { auth: true, tokenKind: 'token' }),
    getOrder: (id) => get(`/orders/${id}`, { auth: true, tokenKind: 'token' }),
};

// ---- Customer auth (existing OTP flow, kept compatible) ----
export const authApi = {
    requestOtp: (phoneNumber) => post('/auth', { phoneNumber }),
    validateOtp: (phoneNumber, otp) => post('/auth/validate-otp', { phoneNumber, otp }),
};

// ---- Admin ----
export const adminApi = {
    login: (username, password) => post('/admins/auth', { username, password }),
    uploadImage,
    uploadFile,
    // landing banners
    listBanners: () => get('/banners/admin', { auth: true, tokenKind: 'adminToken' }),
    createBanner: (payload) => post('/banners', payload, { auth: true, tokenKind: 'adminToken' }),
    updateBanner: (id, payload) => put(`/banners/${id}`, payload, { auth: true, tokenKind: 'adminToken' }),
    deleteBanner: (id) => del(`/banners/${id}`, { auth: true, tokenKind: 'adminToken' }),
    // products (= courses)
    listCourses: () => get('/courses', { auth: true, tokenKind: 'adminToken' }),
    createCourse: (payload) => post('/courses', payload, { auth: true, tokenKind: 'adminToken' }),
    updateCourse: (id, payload) => put(`/courses/${id}`, payload, { auth: true, tokenKind: 'adminToken' }),
    deleteCourse: (id) => del(`/courses/${id}`, { auth: true, tokenKind: 'adminToken' }),
    // categories
    listCategories: () => get('/categories', { auth: true, tokenKind: 'adminToken' }),
    createCategory: (payload) => post('/categories', payload, { auth: true, tokenKind: 'adminToken' }),
    updateCategory: (id, payload) => put(`/categories/${id}`, payload, { auth: true, tokenKind: 'adminToken' }),
    deleteCategory: (id) => del(`/categories/${id}`, { auth: true, tokenKind: 'adminToken' }),
    // coupons
    listCoupons: () => get('/coupons', { auth: true, tokenKind: 'adminToken' }),
    createCoupon: (payload) => post('/coupons', payload, { auth: true, tokenKind: 'adminToken' }),
    updateCoupon: (id, payload) => put(`/coupons/${id}`, payload, { auth: true, tokenKind: 'adminToken' }),
    deleteCoupon: (id) => del(`/coupons/${id}`, { auth: true, tokenKind: 'adminToken' }),
    // header menu
    listMenu: () => get('/cms/admin/header-menu', { auth: true, tokenKind: 'adminToken' }),
    createMenuItem: (payload) => post('/cms/admin/header-menu', payload, { auth: true, tokenKind: 'adminToken' }),
    updateMenuItem: (id, payload) => put(`/cms/admin/header-menu/${id}`, payload, { auth: true, tokenKind: 'adminToken' }),
    deleteMenuItem: (id) => del(`/cms/admin/header-menu/${id}`, { auth: true, tokenKind: 'adminToken' }),
    // site content
    listContent: () => get('/cms/admin/content', { auth: true, tokenKind: 'adminToken' }),
    upsertContent: (payload) => post('/cms/admin/content', payload, { auth: true, tokenKind: 'adminToken' }),
    deleteContent: (key) => del(`/cms/admin/content/${encodeURIComponent(key)}`, { auth: true, tokenKind: 'adminToken' }),
    // marquee slides (stored as SiteContent blocks keyed `marquee-<n>`)
    listMarqueeSlides: async () => {
        const res = await get('/cms/admin/content', { auth: true, tokenKind: 'adminToken' });
        const slides = (res?.data ?? [])
            .filter((b) => typeof b.key === 'string' && b.key.startsWith('marquee-'))
            .sort((a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key));
        return { ...res, data: slides };
    },
    // teachers
    listTeachers: () => get('/teachers', { auth: true, tokenKind: 'adminToken' }),
    createTeacher: (payload) => post('/teachers', payload, { auth: true, tokenKind: 'adminToken' }),
    updateTeacher: (id, payload) => put(`/teachers/${id}`, payload, { auth: true, tokenKind: 'adminToken' }),
    deleteTeacher: (id) => del(`/teachers/${id}`, { auth: true, tokenKind: 'adminToken' }),
    // subscriptions
    listSubscriptions: () => get('/subscriptions', { auth: true, tokenKind: 'adminToken' }),
    createSubscription: (payload) => post('/subscriptions', payload, { auth: true, tokenKind: 'adminToken' }),
    updateSubscription: (id, payload) => put(`/subscriptions/${id}`, payload, { auth: true, tokenKind: 'adminToken' }),
    deleteSubscription: (id) => del(`/subscriptions/${id}`, { auth: true, tokenKind: 'adminToken' }),
    // overview
    dashboard: async () => {
        const [courses, categories, coupons, menu, content, teachers] = await Promise.all([
            get('/courses').catch(() => ({ data: [] })),
            get('/categories').catch(() => ({ data: [] })),
            get('/coupons', { auth: true, tokenKind: 'adminToken' }).catch(() => ({ data: [] })),
            get('/cms/admin/header-menu', { auth: true, tokenKind: 'adminToken' }).catch(() => ({ data: [] })),
            get('/cms/admin/content', { auth: true, tokenKind: 'adminToken' }).catch(() => ({ data: [] })),
            get('/teachers').catch(() => ({ data: [] })),
        ]);
        return { courses, categories, coupons, menu, content, teachers };
    },
};

export function isAdminLoggedIn() {
    return !!getToken('adminToken');
}

export function adminLogout() {
    try {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    } catch { /* noop */ }
}

export { API_BASE };
