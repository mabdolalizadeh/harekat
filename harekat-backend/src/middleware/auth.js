import jwt from 'jsonwebtoken';
import { configs } from '../config/config.js';
import { logSecurityEvent } from '../utils/logger.js';

export function auth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logSecurityEvent('auth_missing_header', { path: req.path, ip: req.ip });
        return res.status(401).json({ ok: false, message: 'missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
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
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, configs.jwtKey);
        req.user = { id: decoded.id, role: decoded.role };
    } catch (err) {
        // Invalid token, but we don't fail - just continue without user
    }
    next();
}