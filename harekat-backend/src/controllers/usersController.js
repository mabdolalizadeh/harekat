import { Users, Courses, Payments } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class UsersController {
    static async createUser(req, res) {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ ok: false, message: 'phoneNumber is required' });
        }

        try {
            const existing = await Users.findOne({ where: { phoneNumber } });
            if (existing) {
                return res.status(409).json({ ok: false, message: 'user with this phone number already exists' });
            }

            const user = await Users.create({ phoneNumber });
            logSecurityEvent('user_created', { userId: user.id, ip: req.ip });
            return res.status(201).json({ ok: true, data: user });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getUsers(req, res) {
        try {
            const users = await Users.findAll({
                include: [
                    { model: Courses, as: 'courses', through: { attributes: [] } },
                    { model: Payments, as: 'payments' }
                ]
            });
            return res.status(200).json({ ok: true, data: users });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getUserById(req, res) {
        const { id } = req.params;
        if (req.user?.role !== 'admin' && req.user?.id !== id) {
            return res.status(403).json({ ok: false, message: 'forbidden' });
        }

        try {
            const user = await Users.findByPk(id, {
                include: [
                    { model: Courses, as: 'courses', through: { attributes: [] } },
                    { model: Payments, as: 'payments' }
                ]
            });
            if (!user) {
                return res.status(404).json({ ok: false, message: 'user not found' });
            }
            logSecurityEvent('user_viewed', { userId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: user });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async updateUser(req, res) {
        const { id } = req.params;
        if (req.user?.role !== 'admin' && req.user?.id !== id) {
            return res.status(403).json({ ok: false, message: 'forbidden' });
        }

        const { firstName, lastName, phoneNumber, courseIds, paymentIds, avatar, nationalId, bio, jobTitle, education } = req.body;

        try {
            const user = await Users.findByPk(id);
            if (!user) {
                return res.status(404).json({ ok: false, message: 'user not found' });
            }

            if (firstName !== undefined) user.firstName = firstName;
            if (lastName !== undefined) user.lastName = lastName;
            if (avatar !== undefined) user.avatar = avatar;
            if (nationalId !== undefined) user.nationalId = nationalId;
            if (bio !== undefined) user.bio = bio;
            if (jobTitle !== undefined) user.jobTitle = jobTitle;
            if (education !== undefined) user.education = education;
            if (phoneNumber !== undefined && phoneNumber !== user.phoneNumber) {
                const existing = await Users.findOne({ where: { phoneNumber } });
                if (existing) {
                    return res.status(409).json({ ok: false, message: 'phone number already in use' });
                }
                user.phoneNumber = phoneNumber;
            }

            await user.save();

            if (Array.isArray(courseIds)) {
                const courses = await Courses.findAll({ where: { id: courseIds } });
                await user.setCourses(courses);
            }
            if (Array.isArray(paymentIds)) {
                const payments = await Payments.findAll({ where: { id: paymentIds } });
                await user.setPayments(payments);
            }

            const updated = await Users.findByPk(id, {
                include: [
                    { model: Courses, as: 'courses', through: { attributes: [] } },
                    { model: Payments, as: 'payments' }
                ]
            });
            logSecurityEvent('user_updated', { userId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: updated });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async deleteUser(req, res) {
        const { id } = req.params;
        if (req.user?.role !== 'admin' && req.user?.id !== id) {
            return res.status(403).json({ ok: false, message: 'forbidden' });
        }

        try {
            const user = await Users.findByPk(id);
            if (!user) {
                return res.status(404).json({ ok: false, message: 'user not found' });
            }
            await user.destroy();
            logSecurityEvent('user_deleted', { userId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, message: 'user deleted' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
