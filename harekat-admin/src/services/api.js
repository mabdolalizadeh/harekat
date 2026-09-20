// Central API/service layer — all backend communication goes through here.
// Do NOT scatter raw fetch() calls in components.

const API_BASE =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.DEV ? 'http://localhost:3000/api/v1' : '/api/v1');

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
        if (auth && tokenKind === 'adminToken' && res.status === 401) {
            adminLogout();
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('admin:unauthorized'));
                if (!window.location.pathname.endsWith('/login')) {
                    window.location.replace('/login?expired=1');
                }
            }
        }
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
        if (res.status === 401) {
            adminLogout();
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('admin:unauthorized'));
                if (!window.location.pathname.endsWith('/login')) {
                    window.location.replace('/login?expired=1');
                }
            }
        }
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
        if (res.status === 401) {
            adminLogout();
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('admin:unauthorized'));
                if (!window.location.pathname.endsWith('/login')) {
                    window.location.replace('/login?expired=1');
                }
            }
        }
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
    updateAdmin: (id, payload) => put(`/admins/${id}`, payload, { auth: true, tokenKind: 'adminToken' }),
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
    // packages
    listPackages: () => get('/packages/admin', { auth: true, tokenKind: 'adminToken' }),
    createPackage: (payload) => post('/packages', payload, { auth: true, tokenKind: 'adminToken' }),
    updatePackage: (id, payload) => put(`/packages/${id}`, payload, { auth: true, tokenKind: 'adminToken' }),
    deletePackage: (id) => del(`/packages/${id}`, { auth: true, tokenKind: 'adminToken' }),
    // sessions
    listSessions: (courseId) => get(`/sessions/course/${courseId}/admin`, { auth: true, tokenKind: 'adminToken' }),
    createSession: (courseId, payload) => post(`/sessions/course/${courseId}`, payload, { auth: true, tokenKind: 'adminToken' }),
    updateSession: (id, payload) => put(`/sessions/${id}`, payload, { auth: true, tokenKind: 'adminToken' }),
    deleteSession: (id) => del(`/sessions/${id}`, { auth: true, tokenKind: 'adminToken' }),
    // exams & grading
    getExam: (courseId) => get(`/exams/course/${courseId}/submissions`, { auth: true, tokenKind: 'adminToken' }),
    upsertExam: (courseId, payload) => put(`/exams/course/${courseId}`, payload, { auth: true, tokenKind: 'adminToken' }),
    listSubmissions: (courseId) => get(`/exams/course/${courseId}/submissions`, { auth: true, tokenKind: 'adminToken' }),
    gradeSubmission: (resultId, payload) => post(`/exams/submissions/${resultId}/grade`, payload, { auth: true, tokenKind: 'adminToken' }),
    // licenses & certificates
    listLicenses: () => get('/licenses', { auth: true, tokenKind: 'adminToken' }),
    issueLicense: (payload) => post('/licenses/issue', payload, { auth: true, tokenKind: 'adminToken' }),
    updateLicenseStatus: (id, payload) => put(`/licenses/${id}/status`, payload, { auth: true, tokenKind: 'adminToken' }),
    verifyLicense: (licenseNumber) => get(`/licenses/verify/${licenseNumber}`),
    // assignments
    listAssignments: (courseId) => get(courseId ? `/assignments/course/${courseId}` : '/assignments', { auth: true, tokenKind: 'adminToken' }),
    createAssignment: (courseId, payload) => post(`/assignments/course/${courseId}`, payload, { auth: true, tokenKind: 'adminToken' }),
    updateAssignment: (id, payload) => put(`/assignments/${id}`, payload, { auth: true, tokenKind: 'adminToken' }),
    deleteAssignment: (id) => del(`/assignments/${id}`, { auth: true, tokenKind: 'adminToken' }),
    listAssignmentSubmissions: (assignmentId) => get(`/assignments/${assignmentId}/submissions`, { auth: true, tokenKind: 'adminToken' }),
    gradeAssignmentSubmission: (submissionId, payload) => post(`/assignments/submissions/${submissionId}/grade`, payload, { auth: true, tokenKind: 'adminToken' }),
    // quizzes
    listQuizzes: (courseId) => get(courseId ? `/quizzes/course/${courseId}` : '/quizzes', { auth: true, tokenKind: 'adminToken' }),
    getQuiz: (id) => get(`/quizzes/${id}`, { auth: true, tokenKind: 'adminToken' }),
    createQuiz: (courseId, payload) => post(`/quizzes/course/${courseId}`, payload, { auth: true, tokenKind: 'adminToken' }),
    updateQuiz: (id, payload) => put(`/quizzes/${id}`, payload, { auth: true, tokenKind: 'adminToken' }),
    deleteQuiz: (id) => del(`/quizzes/${id}`, { auth: true, tokenKind: 'adminToken' }),
    listQuizAttempts: (quizId) => get(`/quizzes/${quizId}/attempts`, { auth: true, tokenKind: 'adminToken' }),
    // evaluations
    listEvaluations: () => get('/evaluations', { auth: true, tokenKind: 'adminToken' }),
    getCourseEvaluationSummary: (courseId) => get(`/evaluations/course/${courseId}/summary`, { auth: true, tokenKind: 'adminToken' }),
    configureCourseEvaluation: (courseId, payload) => put(`/evaluations/course/${courseId}/config`, payload, { auth: true, tokenKind: 'adminToken' }),
    // tickets
    listTickets: () => get('/tickets', { auth: true, tokenKind: 'adminToken' }),
    getTicket: (id) => get(`/tickets/${id}`, { auth: true, tokenKind: 'adminToken' }),
    replyTicket: (id, payload) => post(`/tickets/${id}/messages`, payload, { auth: true, tokenKind: 'adminToken' }),
    updateTicket: (id, payload) => put(`/tickets/${id}`, payload, { auth: true, tokenKind: 'adminToken' }),
    // orders & payments
    listOrders: () => get('/orders', { auth: true, tokenKind: 'adminToken' }),
    updateOrderStatus: (id, payload) => put(`/orders/${id}/status`, payload, { auth: true, tokenKind: 'adminToken' }),
    listPayments: () => get('/payments', { auth: true, tokenKind: 'adminToken' }),
    updatePayment: (id, payload) => put(`/payments/${id}`, payload, { auth: true, tokenKind: 'adminToken' }),
    verifyPayment: (id) => post(`/payments/${id}/verify`, {}, { auth: true, tokenKind: 'adminToken' }),
    // TAs management
    listTAs: () => get('/tas', { auth: true, tokenKind: 'adminToken' }),
    createTA: (payload) => post('/tas', payload, { auth: true, tokenKind: 'adminToken' }),
    updateTA: (id, payload) => put(`/tas/${id}`, payload, { auth: true, tokenKind: 'adminToken' }),
    deleteTA: (id) => del(`/tas/${id}`, { auth: true, tokenKind: 'adminToken' }),
    getTaProfile: () => get('/tas/me', { auth: true, tokenKind: 'adminToken' }),
    // Students & Access
    listStudents: () => get('/users', { auth: true, tokenKind: 'adminToken' }),
    inspectStudentAccess: (userId) => get(`/access/student/${userId}`, { auth: true, tokenKind: 'adminToken' }),
    grantAccess: (payload) => post('/access/grant', payload, { auth: true, tokenKind: 'adminToken' }),
    revokeAccess: (payload) => post('/access/revoke', payload, { auth: true, tokenKind: 'adminToken' }),
    getRecommendedCourse: () => get('/access/recommended', { auth: true, tokenKind: 'adminToken' }),
    setRecommendedCourse: (courseId) => post('/access/recommended', { courseId }, { auth: true, tokenKind: 'adminToken' }),
    // notifications
    listNotifications: () => get('/notifications/sent', { auth: true, tokenKind: 'adminToken' }),
    sendNotification: (payload) => post('/notifications', payload, { auth: true, tokenKind: 'adminToken' }),
    deleteNotification: (id) => del(`/notifications/${id}`, { auth: true, tokenKind: 'adminToken' }),
    // admin & superadmin management
    listAdmins: () => get('/admins', { auth: true, tokenKind: 'adminToken' }),
    createAdmin: (payload) => post('/admins', payload, { auth: true, tokenKind: 'adminToken' }),
    createSuperAdmin: (payload) => post('/admins/create-superadmin', payload, { auth: true, tokenKind: 'adminToken' }),
    generateAdminRsaKey: (id) => post(`/admins/${id}/generate-key`, {}, { auth: true, tokenKind: 'adminToken' }),
    deleteAdmin: (id) => del(`/admins/${id}`, { auth: true, tokenKind: 'adminToken' }),
    // RSA Key Authentication
    requestRsaChallenge: (username) => post('/admins/auth/challenge', { username }),
    rsaLogin: (username, challenge, signature) => post('/admins/auth/rsa-login', { username, challenge, signature }),
    directRsaLogin: (username, privateKeyPem) => post('/admins/auth/rsa-direct-login', { username, privateKeyPem }),
    // overview
    dashboard: async () => {
        const [courses, categories, coupons, menu, content, teachers, orders, payments, students, subscriptions, tickets] = await Promise.all([
            get('/courses').catch(() => ({ data: [] })),
            get('/categories').catch(() => ({ data: [] })),
            get('/coupons', { auth: true, tokenKind: 'adminToken' }).catch(() => ({ data: [] })),
            get('/cms/admin/header-menu', { auth: true, tokenKind: 'adminToken' }).catch(() => ({ data: [] })),
            get('/cms/admin/content', { auth: true, tokenKind: 'adminToken' }).catch(() => ({ data: [] })),
            get('/teachers').catch(() => ({ data: [] })),
            get('/orders', { auth: true, tokenKind: 'adminToken' }).catch(() => ({ data: [] })),
            get('/payments', { auth: true, tokenKind: 'adminToken' }).catch(() => ({ data: [] })),
            get('/users', { auth: true, tokenKind: 'adminToken' }).catch(() => ({ data: [] })),
            get('/subscriptions', { auth: true, tokenKind: 'adminToken' }).catch(() => ({ data: [] })),
            get('/tickets', { auth: true, tokenKind: 'adminToken' }).catch(() => ({ data: [] })),
        ]);
        return { courses, categories, coupons, menu, content, teachers, orders, payments, students, subscriptions, tickets };
    },
};

export async function signChallengeWithRsaKey(privateKeyPem, challengeText) {
    if (!privateKeyPem || typeof privateKeyPem !== 'string') {
        throw new Error('کلید خصوصی معتبر وارد نشده است');
    }
    const cleanPem = privateKeyPem
        .replace(/-----BEGIN [^-]+-----/g, '')
        .replace(/-----END [^-]+-----/g, '')
        .replace(/\s+/g, '');

    const binaryDerString = window.atob(cleanPem);
    const binaryDer = new Uint8Array(binaryDerString.length);
    for (let i = 0; i < binaryDerString.length; i++) {
        binaryDer[i] = binaryDerString.charCodeAt(i);
    }

    const importedKey = await window.crypto.subtle.importKey(
        'pkcs8',
        binaryDer.buffer,
        {
            name: 'RSASSA-PKCS1-v1_5',
            hash: 'SHA-256',
        },
        false,
        ['sign']
    );

    const encoder = new TextEncoder();
    const data = encoder.encode(challengeText);
    const signatureBuffer = await window.crypto.subtle.sign(
        'RSASSA-PKCS1-v1_5',
        importedKey,
        data
    );

    const bytes = new Uint8Array(signatureBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export function parseJwt(token) {
    try {
        if (!token || typeof token !== 'string') return null;
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

export function isTokenExpired(token) {
    if (!token) return true;
    const payload = parseJwt(token);
    if (!payload || typeof payload.exp !== 'number') return true;
    const nowInSec = Math.floor(Date.now() / 1000);
    return payload.exp <= nowInSec;
}

export function getTokenExpiry(kind = 'adminToken') {
    const token = getToken(kind);
    if (!token) return 0;
    const payload = parseJwt(token);
    if (!payload || typeof payload.exp !== 'number') return 0;
    const msLeft = payload.exp * 1000 - Date.now();
    return msLeft > 0 ? msLeft : 0;
}

export function isAdminAuthenticated() {
    const token = getToken('adminToken');
    return Boolean(token && !isTokenExpired(token));
}

export function getAdminUser() {
    try {
        const raw = localStorage.getItem('adminUser');
        if (raw) return JSON.parse(raw);
        const token = getToken('adminToken');
        if (!token || isTokenExpired(token)) return null;
        const payload = parseJwt(token);
        if (payload) {
            return {
                id: payload.id,
                role: payload.role || 'superadmin',
                username: payload.username || 'admin',
                name: payload.name || payload.username || 'مدیر سامانه'
            };
        }
        return null;
    } catch {
        return null;
    }
}

export function isTA() {
    const u = getAdminUser();
    return u?.role === 'ta';
}

export function isSuperAdmin() {
    const u = getAdminUser();
    return u?.role === 'superadmin' || u?.role === 'admin';
}

export function isAdminLoggedIn() {
    return isAdminAuthenticated();
}

export function adminLogout() {
    try {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
    } catch { /* noop */ }
}

export { API_BASE };
