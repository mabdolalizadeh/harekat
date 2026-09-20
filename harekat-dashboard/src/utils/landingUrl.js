/**
 * Generates the absolute URL for the public landing website (harekat-landing).
 * In production: <domain>.<tld>
 * In development: http://localhost:5173 or configurable via VITE_LANDING_URL
 */
export function getLandingUrl(path = '') {
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

  if (import.meta.env?.VITE_LANDING_URL) {
    const base = import.meta.env.VITE_LANDING_URL.replace(/\/+$/, '');
    return `${base}${cleanPath}`;
  }

  if (typeof window !== 'undefined') {
    const { hostname, port, protocol } = window.location;

    // Local development handling
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // Landing runs on port 5173 by default
      return `${protocol}//localhost:5173${cleanPath}`;
    }

    // Production hostname resolution (e.g. dashboard.harekat.ir -> harekat.ir)
    const parts = hostname.split('.');
    if (parts[0] === 'dashboard') {
      const domainParts = parts.slice(1);
      return `${protocol}//${domainParts.join('.')}${port ? `:${port}` : ''}${cleanPath}`;
    }

    return `${protocol}//${hostname}${port ? `:${port}` : ''}${cleanPath}`;
  }

  return `https://harekat.ir${cleanPath}`;
}
