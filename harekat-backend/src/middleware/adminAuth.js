import jwt from 'jsonwebtoken';
import { configs } from '../config/config.js';
import { logSecurityEvent } from '../utils/logger.js';

export default function adminAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logSecurityEvent('admin_auth_missing_header', { path: req.path, ip: req.ip });
        return res.status(401).json({ ok: false, message: 'missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, configs.jwtKey);
        if (decoded.role !== 'admin') {
            logSecurityEvent('admin_auth_forbidden', { path: req.path, ip: req.ip, userId: decoded.id });
            return res.status(403).json({ ok: false, message: 'admin access required' });
        }
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (err) {
        logSecurityEvent('admin_auth_invalid_token', { path: req.path, ip: req.ip, error: err.message });
        return res.status(401).json({ ok: false, message: 'invalid or expired token' });
    }
}
