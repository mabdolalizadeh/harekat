const API_BASE = import.meta.env?.VITE_API_BASE || (import.meta.env?.DEV ? 'http://localhost:3000/api/v1' : '/api/v1');

function getToken() {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

export function getSessionId() {
  try {
    let id = localStorage.getItem('cartSessionId');
    if (!id) {
      id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cartSessionId', id);
    }
    return id;
  } catch {
    return 'default-session-id';
  }
}

export async function apiClient(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-session-id': getSessionId()
  };

  const token = getToken();
  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || (data && data.ok === false)) {
    const errorMsg = data?.message || `خطای سرور (${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const get = (path, options) => apiClient(path, { ...options, method: 'GET' });
export const post = (path, body, options) => apiClient(path, { ...options, method: 'POST', body });
export const put = (path, body, options) => apiClient(path, { ...options, method: 'PUT', body });
export const del = (path, options) => apiClient(path, { ...options, method: 'DELETE' });

export async function uploadImage(file) {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('فقط فایل‌های تصویری مجاز هستند');
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('حجم تصویر نباید بیشتر از ۱۵ مگابایت باشد');
  }

  const token = getToken();
  if (!token) {
    // In preview mode without real JWT token, read file locally as Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({ ok: true, data: { imageUrl: reader.result } });
      };
      reader.onerror = () => reject(new Error('خطا در خواندن فایل'));
      reader.readAsDataURL(file);
    });
  }

  const headers = {
    'Content-Type': file.type,
    'x-session-id': getSessionId(),
    Authorization: `Bearer ${token}`
  };

  const url = `${API_BASE}/uploads/image`;
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: file
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || (data && data.ok === false)) {
    const errorMsg = data?.message || `خطای آپلود تصویر (${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export default apiClient;

