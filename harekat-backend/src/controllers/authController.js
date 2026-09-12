import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Users } from '../models/index.js';
import { configs } from '../config/config.js';
import { logSecurityEvent } from '../utils/logger.js';

const generateOTP = () => crypto.randomInt(100000, 1000000).toString();

export default class AuthController {
    static async authUser(req, res) {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ ok: false, message: 'phoneNumber is required' });
        }

        try {
            let user = await Users.findOne({ where: { phoneNumber } });
            if (!user) {
                user = await Users.create({ phoneNumber });
            }

            user.otp = generateOTP();
            user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
            await user.save();

            logSecurityEvent('otp_generated', { userId: user.id, phoneNumber, ip: req.ip });
            return res.status(200).json({ ok: true, data: { userId: user.id } });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async validateOtp(req, res) {
        const { phoneNumber, otp } = req.body;
        if (!phoneNumber || !otp) {
            return res.status(400).json({ ok: false, message: 'phoneNumber and otp are required' });
        }

        try {
            const user = await Users.findOne({ where: { phoneNumber } });
            if (!user) {
                logSecurityEvent('otp_validate_failed', { phoneNumber, reason: 'user_not_found', ip: req.ip });
                return res.status(404).json({ ok: false, message: 'user not found' });
            }
            const isDevelopmentBypass = configs.nodeEnv === 'development' && String(otp) === '123456';
            if (!isDevelopmentBypass && (!user.otp || user.otp !== otp)) {
                logSecurityEvent('otp_validate_failed', { userId: user.id, reason: 'invalid_otp', ip: req.ip });
                return res.status(401).json({ ok: false, message: 'invalid otp' });
            }
            if (!isDevelopmentBypass && user.otpExpiresAt && new Date(user.otpExpiresAt) < new Date()) {
                logSecurityEvent('otp_validate_failed', { userId: user.id, reason: 'otp_expired', ip: req.ip });
                return res.status(401).json({ ok: false, message: 'otp expired' });
            }

            user.otp = null;
            user.otpExpiresAt = null;
            await user.save();

            const token = jwt.sign(
                { id: user.id, role: 'user' },
                configs.jwtKey,
                { expiresIn: configs.userJwtExpiry }
            );
            logSecurityEvent('otp_validate_success', { userId: user.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: { token, user } });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async changePhoneNumber(req, res) {
        const { phoneNumber } = req.body;
        const userId = req.user?.id;
        if (!phoneNumber) {
            return res.status(400).json({ ok: false, message: 'phoneNumber is required' });
        }

        try {
            const user = await Users.findByPk(userId);
            if (!user) {
                return res.status(404).json({ ok: false, message: 'user not found' });
            }

            const existing = await Users.findOne({ where: { phoneNumber } });
            if (existing && existing.id !== userId) {
                return res.status(409).json({ ok: false, message: 'phone number already in use' });
            }

            user.phoneNumber = phoneNumber;
            user.otp = generateOTP();
            user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
            await user.save();

            logSecurityEvent('phone_change_otp', { userId, newPhoneNumber: phoneNumber, ip: req.ip });
            return res.status(200).json({
                ok: true,
                data: { userId: user.id, otp: user.otp }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
