import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Users } from '../models/index.js';
import { configs } from '../config/config.js';
import { logSecurityEvent } from '../utils/logger.js';
import { SmsService } from '../services/sms/SmsService.js';
import { SmsIrProvider } from '../services/sms/SmsIrProvider.js';

const generateOTP = () => crypto.randomInt(100000, 1000000).toString();

export default class AuthController {
    static async authUser(req, res) {
        const rawPhone = req.body.phoneNumber;
        if (!rawPhone) {
            return res.status(400).json({ ok: false, message: 'phoneNumber is required' });
        }

        const phoneNumber = SmsIrProvider.normalizeMobile(rawPhone);
        if (!/^09\d{9}$/.test(phoneNumber)) {
            return res.status(400).json({ ok: false, message: 'فرمت شماره موبایل نامعتبر است (مثال: 09121234567)' });
        }

        try {
            let user = await Users.findOne({ where: { phoneNumber } });
            if (!user) {
                user = await Users.create({ phoneNumber });
            }

            // Cooldown protection between OTP requests
            const cooldown = configs.otpResendCooldownSeconds || 60;
            if (user.otpLastRequestedAt) {
                const elapsedSeconds = Math.floor((Date.now() - new Date(user.otpLastRequestedAt).getTime()) / 1000);
                if (elapsedSeconds < cooldown) {
                    const waitTime = cooldown - elapsedSeconds;
                    return res.status(429).json({
                        ok: false,
                        message: `لطفاً قبل از درخواست مجدد کد، ${waitTime} ثانیه صبر کنید.`,
                        data: { retryAfterSeconds: waitTime }
                    });
                }
            }

            const otp = generateOTP();
            const expiresIn = configs.otpExpiresInSeconds || 120;

            user.otp = otp;
            user.otpExpiresAt = new Date(Date.now() + expiresIn * 1000);
            user.otpAttempts = 0;
            user.otpLastRequestedAt = new Date();
            await user.save();

            // Deliver OTP via configured SMS service (mock or smsir)
            try {
                await SmsService.sendOtp({
                    phoneNumber: user.phoneNumber,
                    otp
                });
            } catch (smsErr) {
                // If SMS delivery failed, invalidate pending OTP and return error
                user.otp = null;
                user.otpExpiresAt = null;
                await user.save();

                logSecurityEvent('otp_send_failed', {
                    userId: user.id,
                    phoneNumber,
                    ip: req.ip,
                    error: smsErr.message
                });

                return res.status(502).json({
                    ok: false,
                    message: smsErr.message || 'ارسال پیامک با خطا مواجه شد. لطفاً دوباره تلاش کنید.'
                });
            }

            logSecurityEvent('otp_generated', { userId: user.id, phoneNumber, ip: req.ip });

            // Never leak OTP in API response
            return res.status(200).json({
                ok: true,
                message: 'کد تایید با موفقیت ارسال شد',
                data: {
                    userId: user.id,
                    expiresInSeconds: expiresIn
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async validateOtp(req, res) {
        const { phoneNumber: rawPhone, otp } = req.body;
        if (!rawPhone || !otp) {
            return res.status(400).json({ ok: false, message: 'phoneNumber and otp are required' });
        }

        const phoneNumber = SmsIrProvider.normalizeMobile(rawPhone);

        try {
            const user = await Users.findOne({ where: { phoneNumber } });
            if (!user) {
                logSecurityEvent('otp_validate_failed', { phoneNumber, reason: 'user_not_found', ip: req.ip });
                return res.status(404).json({ ok: false, message: 'کاربری با این شماره یافت نشد' });
            }

            if (!user.otp) {
                return res.status(400).json({ ok: false, message: 'کد تایید منقضی شده یا درخواست نشده است. لطفاً کد جدید دریافت کنید.' });
            }

            const maxAttempts = configs.otpMaxVerifyAttempts || 5;
            user.otpAttempts = (user.otpAttempts || 0) + 1;

            // Brute force protection: Invalidate OTP if exceeded max allowed attempts
            if (user.otpAttempts > maxAttempts) {
                user.otp = null;
                user.otpExpiresAt = null;
                user.otpAttempts = 0;
                await user.save();

                logSecurityEvent('otp_max_attempts_exceeded', { userId: user.id, phoneNumber, ip: req.ip });
                return res.status(429).json({
                    ok: false,
                    message: 'تعداد دفعات ورود اشتباه بیش از حد مجاز است. لطفاً کد جدید درخواست کنید.'
                });
            }

            const isDevelopmentBypass = configs.nodeEnv === 'development' && String(otp) === '123456';

            // Expiration check
            if (!isDevelopmentBypass && user.otpExpiresAt && new Date(user.otpExpiresAt) < new Date()) {
                user.otp = null;
                user.otpExpiresAt = null;
                user.otpAttempts = 0;
                await user.save();

                logSecurityEvent('otp_validate_failed', { userId: user.id, reason: 'otp_expired', ip: req.ip });
                return res.status(401).json({ ok: false, message: 'کد تایید منقضی شده است. لطفاً کد جدید درخواست کنید.' });
            }

            // OTP equality check
            if (!isDevelopmentBypass && user.otp !== String(otp).trim()) {
                await user.save(); // Record failed attempt
                logSecurityEvent('otp_validate_failed', {
                    userId: user.id,
                    reason: 'invalid_otp',
                    attempts: user.otpAttempts,
                    ip: req.ip
                });
                return res.status(401).json({
                    ok: false,
                    message: 'کد تایید وارد شده نامعتبر است'
                });
            }

            // Success: Invalidate OTP immediately (Single-use security)
            user.otp = null;
            user.otpExpiresAt = null;
            user.otpAttempts = 0;
            await user.save();

            const token = jwt.sign(
                { id: user.id, role: 'user' },
                configs.jwtKey,
                { expiresIn: configs.userJwtExpiry }
            );

            const cookieDomain = req.hostname && req.hostname.includes('.') && !req.hostname.includes('localhost') && !req.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)
                ? '.' + req.hostname.split('.').slice(-2).join('.')
                : undefined;

            res.cookie('auth_token', token, {
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: false,
                secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
                sameSite: 'lax',
                domain: cookieDomain,
                path: '/'
            });

            logSecurityEvent('otp_validate_success', { userId: user.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: { token, user } });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getMe(req, res) {
        try {
            const user = await Users.findByPk(req.user.id, {
                attributes: ['id', 'phoneNumber', 'firstName', 'lastName', 'nationalId', 'avatar', 'bio', 'jobTitle', 'education', 'role', 'status', 'createdAt']
            });
            if (!user) {
                return res.status(404).json({ ok: false, message: 'User not found' });
            }
            return res.status(200).json({ ok: true, data: { user } });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async changePhoneNumber(req, res) {
        const rawPhone = req.body.phoneNumber;
        const userId = req.user?.id;
        if (!rawPhone) {
            return res.status(400).json({ ok: false, message: 'phoneNumber is required' });
        }

        const phoneNumber = SmsIrProvider.normalizeMobile(rawPhone);
        if (!/^09\d{9}$/.test(phoneNumber)) {
            return res.status(400).json({ ok: false, message: 'فرمت شماره موبایل نامعتبر است' });
        }

        try {
            const user = await Users.findByPk(userId);
            if (!user) {
                return res.status(404).json({ ok: false, message: 'user not found' });
            }

            const existing = await Users.findOne({ where: { phoneNumber } });
            if (existing && existing.id !== userId) {
                return res.status(409).json({ ok: false, message: 'این شماره موبایل در سیستم ثبت شده است' });
            }

            // Cooldown check
            const cooldown = configs.otpResendCooldownSeconds || 60;
            if (user.otpLastRequestedAt) {
                const elapsedSeconds = Math.floor((Date.now() - new Date(user.otpLastRequestedAt).getTime()) / 1000);
                if (elapsedSeconds < cooldown) {
                    const waitTime = cooldown - elapsedSeconds;
                    return res.status(429).json({
                        ok: false,
                        message: `لطفاً قبل از ارسال مجدد کد، ${waitTime} ثانیه صبر کنید`,
                        data: { retryAfterSeconds: waitTime }
                    });
                }
            }

            const otp = generateOTP();
            const expiresIn = configs.otpExpiresInSeconds || 120;

            user.phoneNumber = phoneNumber;
            user.otp = otp;
            user.otpExpiresAt = new Date(Date.now() + expiresIn * 1000);
            user.otpAttempts = 0;
            user.otpLastRequestedAt = new Date();
            await user.save();

            try {
                await SmsService.sendOtp({
                    phoneNumber,
                    otp
                });
            } catch (smsErr) {
                user.otp = null;
                user.otpExpiresAt = null;
                await user.save();

                logSecurityEvent('phone_change_otp_failed', { userId, newPhoneNumber: phoneNumber, ip: req.ip, error: smsErr.message });
                return res.status(502).json({
                    ok: false,
                    message: smsErr.message || 'ارسال پیامک با خطا مواجه شد'
                });
            }

            logSecurityEvent('phone_change_otp', { userId, newPhoneNumber: phoneNumber, ip: req.ip });
            return res.status(200).json({
                ok: true,
                message: 'کد تایید ارسال شد',
                data: { userId: user.id, expiresInSeconds: expiresIn }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
