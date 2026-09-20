import jwt from 'jsonwebtoken';
import { configs } from '../config/config.js';
import { logSecurityEvent } from '../utils/logger.js';

function extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.split(' ')[1];
    }
    if (req.headers.cookie) {
        const match = req.headers.cookie.match(/(?:^|;\s*)(?:auth_token|token)=([^;]+)/);
        if (match) return decodeURIComponent(match[1]);
    }
    return null;
}

export function auth(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        logSecurityEvent('auth_missing_header', { path: req.path, ip: req.ip });
        return res.status(401).json({ ok: false, message: 'missing or invalid authorization header' });
    }

    try {
        const decoded = jwt.verify(token, configs.jwtKey);
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (err) {
        logSecurityEvent('auth_invalid_token', { path: req.path, ip: req.ip, error: err.message });
        return res.status(401).json({ ok: false, message: 'invalid or expired token' });
    }
}

export function optionalAuth(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, configs.jwtKey);
        req.user = { id: decoded.id, role: decoded.role };
    } catch (err) {
        // Invalid token, continue without user
    }
    next();
}