import jwt from 'jsonwebtoken';
import { configs } from '../config/config.js';
import { logSecurityEvent } from '../utils/logger.js';
import { tokenRevocationService } from '../services/tokenRevocationService.js';
import Users from '../models/users.js';

export function extractToken(req) {
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

export async function auth(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        logSecurityEvent('auth_missing_header', { path: req.path, ip: req.ip });
        return res.status(401).json({ ok: false, message: 'missing or invalid authorization header' });
    }

    try {
        const decoded = jwt.verify(token, configs.jwtKey);

        const isRevoked = await tokenRevocationService.isTokenRevoked(token);
        if (isRevoked) {
            logSecurityEvent('auth_revoked_token', { path: req.path, ip: req.ip, userId: decoded.id });
            return res.status(401).json({ ok: false, code: 'TOKEN_REVOKED', message: 'این نشست منقضی شده است. لطفاً مجدداً وارد شوید.' });
        }

        if (decoded.role === 'user' || !decoded.role) {
            const user = await Users.findByPk(decoded.id, { attributes: ['id', 'tokenVersion', 'tokensRevokedAt'] });
            if (!user) {
                return res.status(401).json({ ok: false, message: 'کاربر یافت نشد' });
            }

            if (decoded.tokenVersion !== undefined && decoded.tokenVersion < (user.tokenVersion || 1)) {
                logSecurityEvent('auth_stale_token_version', { path: req.path, ip: req.ip, userId: decoded.id });
                return res.status(401).json({ ok: false, code: 'SESSION_REVOKED', message: 'نشست کاربری شما پایان یافته است. لطفاً مجدداً وارد شوید.' });
            }

            if (decoded.tokenVersion === undefined && user.tokensRevokedAt && decoded.iat && (decoded.iat * 1000 <= new Date(user.tokensRevokedAt).getTime())) {
                logSecurityEvent('auth_token_issued_before_revocation', { path: req.path, ip: req.ip, userId: decoded.id });
                return res.status(401).json({ ok: false, code: 'SESSION_REVOKED', message: 'نشست کاربری شما پایان یافته است. لطفاً مجدداً وارد شوید.' });
            }
        }

        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (err) {
        logSecurityEvent('auth_invalid_token', { path: req.path, ip: req.ip, error: err.message });
        return res.status(401).json({ ok: false, message: 'invalid or expired token' });
    }
}

export async function optionalAuth(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, configs.jwtKey);
        const isRevoked = await tokenRevocationService.isTokenRevoked(token);
        if (isRevoked) {
            return next();
        }

        if (decoded.role === 'user' || !decoded.role) {
            const user = await Users.findByPk(decoded.id, { attributes: ['id', 'tokenVersion', 'tokensRevokedAt'] });
            if (!user) return next();
            if (decoded.tokenVersion !== undefined && decoded.tokenVersion < (user.tokenVersion || 1)) return next();
            if (decoded.tokenVersion === undefined && user.tokensRevokedAt && decoded.iat && (decoded.iat * 1000 <= new Date(user.tokensRevokedAt).getTime())) return next();
        }

        req.user = { id: decoded.id, role: decoded.role };
    } catch (err) {
        // Invalid token, continue without user
    }
    next();
}