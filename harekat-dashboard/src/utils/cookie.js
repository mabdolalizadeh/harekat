// Helpers for shared cross-domain cookies and authentication sync
// Allows session synchronization between subdomains (e.g. dashboard.schoolharekat.ir and schoolharekat.ir)
// as well as localhost ports during development.

export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getCookieDomain() {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1' || /^(\d+\.){3}\d+$/.test(hostname)) {
    return '';
  }
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    // Top-level domain and main domain (e.g. schoolharekat.ir or harekat.ir)
    // Works for dashboard.schoolharekat.ir -> .schoolharekat.ir
    const rootDomain = parts.slice(-2).join('.');
    return `; domain=.${rootDomain}`;
  }
  return '';
}

export function setSharedCookie(name, val, maxAgeDays = 30) {
  if (typeof document === 'undefined') return;
  const domainPart = getCookieDomain();
  const maxAge = maxAgeDays > 0 ? maxAgeDays * 24 * 60 * 60 : 0;
  // Write cookie for both current domain and shared root domain
  document.cookie = `${name}=${val ? encodeURIComponent(val) : ''}; path=/; max-age=${maxAge}; SameSite=Lax${domainPart}`;
  if (domainPart) {
    // Also ensure any host-specific cookie is overwritten/cleared if needed
    document.cookie = `${name}=${val ? encodeURIComponent(val) : ''}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
}

export function removeSharedCookie(name) {
  if (typeof document === 'undefined') return;
  const domainPart = getCookieDomain();
  document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${domainPart}`;
  document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}
