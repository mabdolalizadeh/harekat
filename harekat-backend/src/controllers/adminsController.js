import { Admins } from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { configs } from '../config/config.js';
import { logSecurityEvent } from '../utils/logger.js';

const validatePassword = (password) => {
    if (!password || password.length < 8) {
        return 'password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(password)) {
        return 'password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
        return 'password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
        return 'password must contain at least one number';
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        return 'password must contain at least one special character';
    }
    return null;
};

export default class AdminsController {
    static async createAdmin(req, res) {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ ok: false, message: 'username and password are required' });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ ok: false, message: passwordError });
        }

        try {
            const existing = await Admins.findOne({ where: { username } });
            if (existing) {
                return res.status(409).json({ ok: false, message: 'admin with this username already exists' });
            }

            const admin = await Admins.create({ username, password });
            logSecurityEvent('admin_created', { adminId: admin.id, username: admin.username });
            return res.status(201).json({
                ok: true,
                data: { id: admin.id, username: admin.username }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getAdminById(req, res) {
        const { id } = req.params;
        try {
            const admin = await Admins.findByPk(id, {
                attributes: { exclude: ['password'] }
            });
            if (!admin) {
                return res.status(404).json({ ok: false, message: 'admin not found' });
            }
            return res.status(200).json({ ok: true, data: admin });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async updateAdmin(req, res) {
        const { id } = req.params;
        const { username, password } = req.body;

        try {
            const admin = await Admins.findByPk(id);
            if (!admin) {
                return res.status(404).json({ ok: false, message: 'admin not found' });
            }

            if (username !== undefined) {
                const existing = await Admins.findOne({ where: { username } });
                if (existing && existing.id !== id) {
                    return res.status(409).json({ ok: false, message: 'username already in use' });
                }
                admin.username = username;
            }
            if (password !== undefined) {
                const passwordError = validatePassword(password);
                if (passwordError) {
                    return res.status(400).json({ ok: false, message: passwordError });
                }
                admin.password = password;
            }

            await admin.save();
            logSecurityEvent('admin_updated', { adminId: admin.id });
            return res.status(200).json({
                ok: true,
                data: { id: admin.id, username: admin.username }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async deleteAdmin(req, res) {
        const { id } = req.params;
        try {
            const admin = await Admins.findByPk(id);
            if (!admin) {
                return res.status(404).json({ ok: false, message: 'admin not found' });
            }
            await admin.destroy();
            logSecurityEvent('admin_deleted', { adminId: id });
            return res.status(200).json({ ok: true, message: 'admin deleted' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async authAdmin(req, res) {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ ok: false, message: 'username and password are required' });
        }

        try {
            const admin = await Admins.findOne({ where: { username } });
            if (!admin || !(await bcrypt.compare(password, admin.password))) {
                logSecurityEvent('admin_auth_failed', { username, ip: req.ip });
                return res.status(401).json({ ok: false, message: 'invalid credentials' });
            }

            const token = jwt.sign(
                { id: admin.id, role: 'admin' },
                configs.jwtKey,
                { expiresIn: configs.jwtExpiry }
            );
            logSecurityEvent('admin_auth_success', { adminId: admin.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: { token, admin: { id: admin.id, username: admin.username } } });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async registerAdmin(req, res) {
        return AdminsController.createAdmin(req, res);
    }
}
