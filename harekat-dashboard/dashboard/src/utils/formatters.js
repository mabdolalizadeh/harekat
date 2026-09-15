const API_BASE = import.meta.env?.VITE_API_BASE || (import.meta.env?.DEV ? 'http://localhost:3000/api/v1' : '/api/v1');

export function assetUrl(value) {
  if (!value || typeof value !== 'string') return '';
  if (/^(data:|https?:\/\/)/i.test(value)) return value;
  const origin = API_BASE.startsWith('http') ? new URL(API_BASE).origin : window.location.origin;
  return `${origin}${value.startsWith('/') ? '' : '/'}${value}`;
}

export function formatPrice(value) {
  if (value === null || value === undefined || value === '') return 'رایگان';
  const numeric = Number(String(value).replace(/[,٬\s]/g, ''));
  if (!Number.isFinite(numeric) || numeric === 0) return 'رایگان';
  return `${numeric.toLocaleString('fa-IR')} تومان`;
}

export function formatDuration(duration) {
  if (!duration) return '—';
  return duration;
}

export function toPersianDigits(num) {
  if (num === null || num === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (w) => farsiDigits[+w]);
}

export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}
