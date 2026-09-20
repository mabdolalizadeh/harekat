/**
 * Generates the absolute URL for the dedicated client dashboard (harekat-dashboard).
 * In production: dashboard.<domain>.<tld>
 * In development: http://localhost:5175 or configurable via VITE_DASHBOARD_URL
 */
export function getDashboardUrl(path = '') {
    const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

    // 1. Explicit environment override
    if (import.meta.env?.VITE_DASHBOARD_URL) {
        const base = import.meta.env.VITE_DASHBOARD_URL.replace(/\/+$/, '');
        return `${base}${cleanPath}`;
    }

    if (typeof window !== 'undefined') {
        const { hostname, port, protocol } = window.location;

        // Local development handling
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // If running Vite dev server for landing (default port 5173), dashboard runs on 5175
            if (port === '5173') {
                return `${protocol}//localhost:5175${cleanPath}`;
            }
            // If served directly through the backend server (e.g. port 3000)
            const portSuffix = port ? `:${port}` : '';
            return `${protocol}//dashboard.localhost${portSuffix}${cleanPath}`;
        }

        // Production hostname resolution (e.g. harekat.ir -> dashboard.harekat.ir)
        const parts = hostname.split('.');
        const domainParts = (parts.length > 2 && parts[0] === 'www') ? parts.slice(1) : parts;

        // If already on dashboard subdomain
        if (domainParts[0] === 'dashboard') {
            return `${protocol}//${hostname}${port ? `:${port}` : ''}${cleanPath}`;
        }

        return `${protocol}//dashboard.${domainParts.join('.')}${port ? `:${port}` : ''}${cleanPath}`;
    }

    return `https://dashboard.domain.tld${cleanPath}`;
}
