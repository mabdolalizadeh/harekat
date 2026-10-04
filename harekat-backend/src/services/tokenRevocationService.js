import crypto from 'crypto';
import { Op } from 'sequelize';
import RevokedTokens from '../models/revokedTokens.js';
import Users from '../models/users.js';

class TokenRevocationService {
    constructor() {
        this.revokedHashes = new Set();
        this.initialized = false;
    }

    hashToken(token) {
        if (!token) return '';
        return crypto.createHash('sha256').update(String(token).trim()).digest('hex');
    }

    async init() {
        if (this.initialized) return;
        try {
            const now = new Date();
            const activeRevocations = await RevokedTokens.findAll({
                where: {
                    expiresAt: { [Op.gt]: now }
                },
                attributes: ['tokenHash']
            });
            for (const r of activeRevocations) {
                if (r.tokenHash) {
                    this.revokedHashes.add(r.tokenHash);
                }
            }
            this.initialized = true;
        } catch (err) {
            console.warn('[TokenRevocationService] init warning:', err.message);
        }
    }

    async isTokenRevoked(token) {
        if (!token) return true;
        const hash = this.hashToken(token);
        if (this.revokedHashes.has(hash)) {
            return true;
        }
        // Fallback DB check in case another cluster worker added it
        try {
            const record = await RevokedTokens.findOne({
                where: { tokenHash: hash }
            });
            if (record) {
                this.revokedHashes.add(hash);
                return true;
            }
        } catch (_) {}
        return false;
    }

    async revokeToken(token, { userId = null, expiresAt = null, reason = 'logout' } = {}) {
        if (!token) return false;
        const hash = this.hashToken(token);
        this.revokedHashes.add(hash);

        const effectiveExpiresAt = expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        try {
            await RevokedTokens.findOrCreate({
                where: { tokenHash: hash },
                defaults: {
                    token: String(token),
                    tokenHash: hash,
                    userId,
                    expiresAt: effectiveExpiresAt,
                    revokedAt: new Date(),
                    reason
                }
            });
        } catch (err) {
            console.warn('[TokenRevocationService] revokeToken DB warning:', err.message);
        }
        return true;
    }

    async revokeAllUserTokens(userId, reason = 'user_logout_all') {
        if (!userId) return false;
        try {
            const user = await Users.findByPk(userId);
            if (user) {
                user.tokenVersion = (user.tokenVersion || 1) + 1;
                user.tokensRevokedAt = new Date();
                await user.save();
                return true;
            }
        } catch (err) {
            console.warn('[TokenRevocationService] revokeAllUserTokens warning:', err.message);
        }
        return false;
    }

    async cleanupExpiredTokens() {
        try {
            const now = new Date();
            await RevokedTokens.destroy({
                where: {
                    expiresAt: { [Op.lt]: now }
                }
            });
        } catch (err) {
            console.warn('[TokenRevocationService] cleanupExpiredTokens warning:', err.message);
        }
    }
}

export const tokenRevocationService = new TokenRevocationService();
export default tokenRevocationService;
