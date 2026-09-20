import { Admins } from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { configs } from '../config/config.js';
import { logSecurityEvent } from '../utils/logger.js';

const validatePassword = (password) => {
    if (!password || password.length < 8) {
        return 'رمز عبور باید حداقل ۸ کاراکتر باشد';
    }
    if (!/[A-Z]/.test(password)) {
        return 'رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد';
    }
    if (!/[a-z]/.test(password)) {
        return 'رمز عبور باید حداقل یک حرف کوچک انگلیسی داشته باشد';
    }
    if (!/[0-9]/.test(password)) {
        return 'رمز عبور باید حداقل یک عدد داشته باشد';
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        return 'رمز عبور باید حداقل یک کاراکتر ویژه داشته باشد';
    }
    return null;
};

export function generateRsaKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem'
        }
    });

    const fingerprint = computeKeyFingerprint(publicKey);
    return { publicKey, privateKey, fingerprint };
}

export function computeKeyFingerprint(publicKeyPem) {
    if (!publicKeyPem) return null;
    const clean = publicKeyPem.replace(/\r?\n|\r/g, '').trim();
    const hash = crypto.createHash('sha256').update(clean).digest('hex');
    return hash.match(/.{1,2}/g)?.slice(0, 16).join(':') || hash;
}

export function generateChallengeNonce(username) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    const raw = `${username}:${timestamp}:${random}`;
    const hmac = crypto.createHmac('sha256', configs.jwtKey).update(raw).digest('hex');
    return `${raw}:${hmac}`;
}

export function verifyChallengeNonce(challenge, username) {
    if (!challenge || typeof challenge !== 'string') return false;
    const parts = challenge.split(':');
    if (parts.length !== 4) return false;
    const [cUser, timestampStr, random, hmac] = parts;
    if (cUser !== username) return false;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;
    // Challenge valid for 5 minutes (300,000 ms)
    if (Date.now() - timestamp > 300000 || timestamp > Date.now() + 60000) return false;

    const raw = `${cUser}:${timestampStr}:${random}`;
    const expectedHmac = crypto.createHmac('sha256', configs.jwtKey).update(raw).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac));
}

export default class AdminsController {
    static async listAdmins(req, res) {
        try {
            const admins = await Admins.findAll({
                attributes: { exclude: ['password', 'publicKey'] },
                order: [['createdAt', 'DESC']]
            });
            const enriched = admins.map(a => ({
                id: a.id,
                username: a.username,
                role: a.role,
                name: a.name,
                email: a.email,
                phoneNumber: a.phoneNumber,
                status: a.status,
                keyFingerprint: a.keyFingerprint,
                hasPublicKey: Boolean(a.keyFingerprint),
                createdAt: a.createdAt,
                updatedAt: a.updatedAt
            }));
            return res.status(200).json({ ok: true, data: enriched });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async createSuperAdmin(req, res) {
        const { username, password, name, email, phoneNumber, generateRsaKey: shouldGenKey = true, publicKey: customPublicKey } = req.body;
        
        if (!username || !username.trim()) {
            return res.status(400).json({ ok: false, message: 'نام کاربری الزامی است' });
        }

        // Allow unauthenticated creation only if 0 superadmins exist in database (bootstrap phase)
        const superCount = await Admins.count({ where: { role: 'superadmin' } });
        if (superCount > 0) {
            if (!req.user) {
                const authHeader = req.headers.authorization;
                if (authHeader && authHeader.startsWith('Bearer ')) {
                    try {
                        const token = authHeader.split(' ')[1];
                        const decoded = jwt.verify(token, configs.jwtKey);
                        req.user = decoded;
                    } catch {}
                }
            }
            const requesterRole = req.user?.role;
            if (requesterRole !== 'superadmin' && requesterRole !== 'admin') {
                return res.status(403).json({ ok: false, message: 'فقط مدیران ارشد مجاز به ایجاد مدیر ارشد جدید هستند' });
            }
        }

        // If no password provided, generate a strong random temporary password if key is generated
        let pwd = password;
        if (!pwd) {
            if (shouldGenKey || customPublicKey) {
                pwd = `SA_${crypto.randomBytes(8).toString('hex')}!Aa1`;
            } else {
                return res.status(400).json({ ok: false, message: 'رمز عبور یا کلید RSA الزامی است' });
            }
        }

        const passwordError = validatePassword(pwd);
        if (passwordError) {
            return res.status(400).json({ ok: false, message: passwordError });
        }

        try {
            const existing = await Admins.findOne({ where: { username: username.trim() } });
            if (existing) {
                return res.status(409).json({ ok: false, message: 'کاربری با این نام کاربری قبلاً ایجاد شده است' });
            }

            let finalPublicKey = null;
            let finalPrivateKey = null;
            let keyFingerprint = null;

            if (shouldGenKey) {
                const pair = generateRsaKeyPair();
                finalPublicKey = pair.publicKey;
                finalPrivateKey = pair.privateKey;
                keyFingerprint = pair.fingerprint;
            } else if (customPublicKey) {
                finalPublicKey = customPublicKey.trim();
                keyFingerprint = computeKeyFingerprint(finalPublicKey);
            }

            const admin = await Admins.create({
                username: username.trim(),
                password: pwd,
                role: 'superadmin',
                name: name?.trim() || null,
                email: email?.trim() || null,
                phoneNumber: phoneNumber?.trim() || null,
                status: 'active',
                publicKey: finalPublicKey,
                keyFingerprint: keyFingerprint
            });

            logSecurityEvent('superadmin_created_with_rsa', {
                adminId: admin.id,
                username: admin.username,
                hasKey: Boolean(finalPublicKey),
                fingerprint: keyFingerprint
            });

            return res.status(201).json({
                ok: true,
                message: 'مدیر ارشد با موفقیت ایجاد شد',
                data: {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role,
                    name: admin.name,
                    email: admin.email,
                    phoneNumber: admin.phoneNumber,
                    status: admin.status,
                    keyFingerprint: admin.keyFingerprint,
                    publicKey: finalPublicKey,
                    privateKey: finalPrivateKey // returned once on creation for download/storage
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async createAdmin(req, res) {
        const { username, password, role = 'superadmin', name, email, phoneNumber, status = 'active', generateRsaKey: shouldGenKey, publicKey: customPublicKey } = req.body;
        if (!username || !password) {
            return res.status(400).json({ ok: false, message: 'username and password are required' });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ ok: false, message: passwordError });
        }

        try {
            const existing = await Admins.findOne({ where: { username: username.trim() } });
            if (existing) {
                return res.status(409).json({ ok: false, message: 'admin with this username already exists' });
            }

            let finalPublicKey = null;
            let finalPrivateKey = null;
            let keyFingerprint = null;

            if (shouldGenKey) {
                const pair = generateRsaKeyPair();
                finalPublicKey = pair.publicKey;
                finalPrivateKey = pair.privateKey;
                keyFingerprint = pair.fingerprint;
            } else if (customPublicKey) {
                finalPublicKey = customPublicKey.trim();
                keyFingerprint = computeKeyFingerprint(finalPublicKey);
            }

            const admin = await Admins.create({
                username: username.trim(),
                password,
                role: ['superadmin', 'ta'].includes(role) ? role : 'superadmin',
                name: name || null,
                email: email || null,
                phoneNumber: phoneNumber || null,
                status: ['active', 'inactive'].includes(status) ? status : 'active',
                publicKey: finalPublicKey,
                keyFingerprint
            });

            logSecurityEvent('admin_created', { adminId: admin.id, username: admin.username, role: admin.role });
            return res.status(201).json({
                ok: true,
                data: {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role,
                    name: admin.name,
                    email: admin.email,
                    phoneNumber: admin.phoneNumber,
                    status: admin.status,
                    keyFingerprint: admin.keyFingerprint,
                    publicKey: finalPublicKey,
                    privateKey: finalPrivateKey
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async generateKeyForAdmin(req, res) {
        const { id } = req.params;
        const requester = req.user;
        const isSuper = requester?.role === 'superadmin' || requester?.role === 'admin';
        const isSelf = requester?.id === id;

        if (!isSuper && !isSelf) {
            return res.status(403).json({ ok: false, message: 'forbidden' });
        }

        try {
            const admin = await Admins.findByPk(id);
            if (!admin) {
                return res.status(404).json({ ok: false, message: 'admin not found' });
            }

            const { publicKey, privateKey, fingerprint } = generateRsaKeyPair();
            admin.publicKey = publicKey;
            admin.keyFingerprint = fingerprint;
            await admin.save();

            logSecurityEvent('admin_rsa_key_regenerated', { adminId: admin.id, requesterId: requester?.id });
            return res.status(200).json({
                ok: true,
                message: 'کلید اختصاصی RSA جدید با موفقیت تولید شد',
                data: {
                    id: admin.id,
                    username: admin.username,
                    keyFingerprint: fingerprint,
                    publicKey,
                    privateKey
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getAdminById(req, res) {
        const { id } = req.params;
        const requester = req.user;
        if (requester?.role !== 'superadmin' && requester?.role !== 'admin' && requester?.id !== id) {
            return res.status(403).json({ ok: false, message: 'forbidden' });
        }

        try {
            const admin = await Admins.findByPk(id, {
                attributes: { exclude: ['password', 'publicKey'] }
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
        const requester = req.user;
        const isSuper = requester?.role === 'superadmin' || requester?.role === 'admin';
        const isSelf = requester?.id === id;

        if (!isSuper && !isSelf) {
            return res.status(403).json({ ok: false, message: 'forbidden' });
        }

        const { username, password, currentPassword, role, name, email, phoneNumber, status, publicKey } = req.body;

        try {
            const admin = await Admins.findByPk(id);
            if (!admin) {
                return res.status(404).json({ ok: false, message: 'admin not found' });
            }

            if (username !== undefined && username !== admin.username) {
                const existing = await Admins.findOne({ where: { username: username.trim() } });
                if (existing && existing.id !== id) {
                    return res.status(409).json({ ok: false, message: 'username already in use' });
                }
                admin.username = username.trim();
            }

            if (name !== undefined) admin.name = name;
            if (email !== undefined) admin.email = email;
            if (phoneNumber !== undefined) admin.phoneNumber = phoneNumber;

            if (publicKey !== undefined) {
                admin.publicKey = publicKey ? publicKey.trim() : null;
                admin.keyFingerprint = publicKey ? computeKeyFingerprint(publicKey) : null;
            }

            if (isSuper) {
                if (role !== undefined && ['superadmin', 'ta'].includes(role)) {
                    admin.role = role;
                }
                if (status !== undefined && ['active', 'inactive'].includes(status)) {
                    admin.status = status;
                }
            }

            if (password !== undefined) {
                if (isSelf) {
                    if (!currentPassword || !(await bcrypt.compare(currentPassword, admin.password))) {
                        return res.status(401).json({ ok: false, message: 'current password is incorrect' });
                    }
                }
                const passwordError = validatePassword(password);
                if (passwordError) {
                    return res.status(400).json({ ok: false, message: passwordError });
                }
                admin.password = password;
            }

            await admin.save();
            logSecurityEvent('admin_updated', { adminId: admin.id, requesterId: requester?.id });
            return res.status(200).json({
                ok: true,
                data: {
                    id: admin.id,
                    username: admin.username,
                    role: admin.role,
                    name: admin.name,
                    email: admin.email,
                    phoneNumber: admin.phoneNumber,
                    status: admin.status,
                    keyFingerprint: admin.keyFingerprint
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async deleteAdmin(req, res) {
        const { id } = req.params;
        const requester = req.user;

        if (requester?.id === id) {
            return res.status(400).json({ ok: false, message: 'امکان حذف حساب کاربری خودتان وجود ندارد' });
        }

        try {
            const admin = await Admins.findByPk(id);
            if (!admin) {
                return res.status(404).json({ ok: false, message: 'admin not found' });
            }
            await admin.destroy();
            logSecurityEvent('admin_deleted', { adminId: id });
            return res.status(200).json({ ok: true, message: 'مدیر با موفقیت حذف شد' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async authAdmin(req, res) {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ ok: false, message: 'نام کاربری و رمز عبور الزامی است' });
        }

        try {
            const admin = await Admins.findOne({ where: { username: username.trim() } });
            if (!admin || !(await bcrypt.compare(password, admin.password))) {
                logSecurityEvent('admin_auth_failed', { username, ip: req.ip });
                return res.status(401).json({ ok: false, message: 'نام کاربری یا رمز عبور اشتباه است' });
            }

            if (admin.status === 'inactive') {
                return res.status(403).json({ ok: false, message: 'حساب کاربری شما غیرفعال شده است' });
            }

            const role = admin.role || 'superadmin';
            const token = jwt.sign(
                { id: admin.id, role, username: admin.username },
                configs.jwtKey,
                { expiresIn: configs.jwtExpiry }
            );
            logSecurityEvent('admin_auth_success', { adminId: admin.id, role, ip: req.ip });
            return res.status(200).json({
                ok: true,
                data: {
                    token,
                    admin: {
                        id: admin.id,
                        username: admin.username,
                        role,
                        name: admin.name || admin.username,
                        email: admin.email || null,
                        phoneNumber: admin.phoneNumber || null,
                        keyFingerprint: admin.keyFingerprint
                    }
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getAuthChallenge(req, res) {
        const { username } = req.body;
        if (!username || !username.trim()) {
            return res.status(400).json({ ok: false, message: 'نام کاربری الزامی است' });
        }

        try {
            const admin = await Admins.findOne({ where: { username: username.trim() } });
            if (!admin) {
                return res.status(404).json({ ok: false, message: 'حساب مدیریتی یافت نشد' });
            }

            if (admin.status === 'inactive') {
                return res.status(403).json({ ok: false, message: 'حساب کاربری غیرفعال است' });
            }

            if (!admin.publicKey) {
                return res.status(400).json({ ok: false, message: 'برای این حساب کلید RSA ثبت نشده است. لطفاً ابتدا با رمز عبور وارد شوید.' });
            }

            const challenge = generateChallengeNonce(admin.username);
            return res.status(200).json({
                ok: true,
                data: {
                    challenge,
                    expiresIn: 300,
                    keyFingerprint: admin.keyFingerprint
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async authAdminWithRsaKey(req, res) {
        const { username, challenge, signature } = req.body;
        if (!username || !challenge || !signature) {
            return res.status(400).json({ ok: false, message: 'نام کاربری، چالش و امضای RSA الزامی هستند' });
        }

        try {
            const admin = await Admins.findOne({ where: { username: username.trim() } });
            if (!admin) {
                return res.status(404).json({ ok: false, message: 'حساب مدیریتی یافت نشد' });
            }

            if (admin.status === 'inactive') {
                return res.status(403).json({ ok: false, message: 'حساب کاربری غیرفعال است' });
            }

            if (!admin.publicKey) {
                return res.status(400).json({ ok: false, message: 'کلید RSA برای این حساب ثبت نشده است' });
            }

            const isValidChallenge = verifyChallengeNonce(challenge, admin.username);
            if (!isValidChallenge) {
                logSecurityEvent('admin_rsa_challenge_invalid', { username: admin.username, ip: req.ip });
                return res.status(400).json({ ok: false, message: 'چالش امنیتی منقضی یا نامعتبر است. لطفاً مجدداً تلاش کنید.' });
            }

            // Verify RSA-SHA256 signature using public key
            try {
                const verify = crypto.createVerify('SHA256');
                verify.update(challenge);
                verify.end();
                const isSignatureValid = verify.verify(admin.publicKey, signature, 'base64');
                if (!isSignatureValid) {
                    logSecurityEvent('admin_rsa_signature_invalid', { username: admin.username, ip: req.ip });
                    return res.status(401).json({ ok: false, message: 'امضای کلید خصوصی RSA نامعتبر است' });
                }
            } catch (sigErr) {
                logSecurityEvent('admin_rsa_verify_error', { username: admin.username, error: sigErr.message, ip: req.ip });
                return res.status(401).json({ ok: false, message: 'خطا در ارزیابی امضای کلید RSA' });
            }

            const role = admin.role || 'superadmin';
            const token = jwt.sign(
                { id: admin.id, role, username: admin.username, authMethod: 'rsa' },
                configs.jwtKey,
                { expiresIn: configs.jwtExpiry }
            );

            logSecurityEvent('admin_rsa_auth_success', { adminId: admin.id, role, ip: req.ip });
            return res.status(200).json({
                ok: true,
                message: 'ورود امن با کلید RSA با موفقیت انجام شد',
                data: {
                    token,
                    admin: {
                        id: admin.id,
                        username: admin.username,
                        role,
                        name: admin.name || admin.username,
                        email: admin.email || null,
                        phoneNumber: admin.phoneNumber || null,
                        keyFingerprint: admin.keyFingerprint
                    }
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async authAdminWithRsaDirectKey(req, res) {
        const { username } = req.body;
        const privateKey = req.body.privateKey || req.body.privateKeyPem;
        if (!username || !privateKey) {
            return res.status(400).json({ ok: false, message: 'نام کاربری و کلید خصوصی الزامی هستند' });
        }

        try {
            const admin = await Admins.findOne({ where: { username: username.trim() } });
            if (!admin) {
                return res.status(404).json({ ok: false, message: 'حساب مدیریتی یافت نشد' });
            }

            if (admin.status === 'inactive') {
                return res.status(403).json({ ok: false, message: 'حساب کاربری غیرفعال است' });
            }

            if (!admin.publicKey) {
                return res.status(400).json({ ok: false, message: 'کلید RSA برای این حساب ثبت نشده است' });
            }

            // Test signing a test nonce with provided privateKey and verifying with admin.publicKey
            try {
                const testNonce = `test-auth-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
                const sign = crypto.createSign('SHA256');
                sign.update(testNonce);
                sign.end();
                const signature = sign.sign(privateKey.trim(), 'base64');

                const verify = crypto.createVerify('SHA256');
                verify.update(testNonce);
                verify.end();
                const isMatch = verify.verify(admin.publicKey, signature, 'base64');
                if (!isMatch) {
                    logSecurityEvent('admin_rsa_direct_mismatch', { username: admin.username, ip: req.ip });
                    return res.status(401).json({ ok: false, message: 'کلید خصوصی با کلید عمومی ثبت‌شده تطابق ندارد' });
                }
            } catch (kErr) {
                logSecurityEvent('admin_rsa_direct_invalid_key', { username: admin.username, error: kErr.message, ip: req.ip });
                return res.status(400).json({ ok: false, message: 'فرمت کلید خصوصی نامعتبر است' });
            }

            const role = admin.role || 'superadmin';
            const token = jwt.sign(
                { id: admin.id, role, username: admin.username, authMethod: 'rsa' },
                configs.jwtKey,
                { expiresIn: configs.jwtExpiry }
            );

            logSecurityEvent('admin_rsa_direct_auth_success', { adminId: admin.id, role, ip: req.ip });
            return res.status(200).json({
                ok: true,
                message: 'ورود امن با کلید RSA با موفقیت انجام شد',
                data: {
                    token,
                    admin: {
                        id: admin.id,
                        username: admin.username,
                        role,
                        name: admin.name || admin.username,
                        email: admin.email || null,
                        phoneNumber: admin.phoneNumber || null,
                        keyFingerprint: admin.keyFingerprint
                    }
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async registerAdmin(req, res) {
        return AdminsController.createAdmin(req, res);
    }
}
