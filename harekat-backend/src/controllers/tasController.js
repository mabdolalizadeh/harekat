import { Admins, TACourses, Courses } from '../models/index.js';
import bcrypt from 'bcrypt';
import { logSecurityEvent } from '../utils/logger.js';

export default class TAsController {
    /**
     * Super Admin: List all TAs with their assigned courses
     */
    static async listTAs(req, res) {
        try {
            const tas = await Admins.findAll({
                where: { role: 'ta' },
                attributes: { exclude: ['password'] },
                include: [
                    {
                        model: Courses,
                        as: 'taAssignedCourses',
                        through: { attributes: [] },
                        attributes: ['id', 'name', 'level', 'typeOfAttendence']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            return res.status(200).json({ ok: true, data: tas });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Super Admin: Create a new TA
     */
    static async createTA(req, res) {
        const { username, password, name, email, phoneNumber, status, permissions, courseIds } = req.body;

        if (!username?.trim() || !password) {
            return res.status(400).json({ ok: false, message: 'نام کاربری و رمز عبور الزامی است' });
        }

        try {
            const existing = await Admins.findOne({ where: { username: username.trim() } });
            if (existing) {
                return res.status(409).json({ ok: false, message: 'این نام کاربری قبلاً ثبت شده است' });
            }

            const ta = await Admins.create({
                username: username.trim(),
                password,
                role: 'ta',
                name: name?.trim() || null,
                email: email?.trim() || null,
                phoneNumber: phoneNumber?.trim() || null,
                status: status || 'active',
                permissions: permissions ? JSON.stringify(permissions) : null
            });

            if (Array.isArray(courseIds) && courseIds.length > 0) {
                for (const cId of courseIds) {
                    await TACourses.create({ adminId: ta.id, courseId: cId });
                }
            }

            const created = await Admins.findByPk(ta.id, {
                attributes: { exclude: ['password'] },
                include: [{ model: Courses, as: 'taAssignedCourses', through: { attributes: [] } }]
            });

            logSecurityEvent('ta_created', { taId: ta.id, username: ta.username, createdBy: req.user?.id });
            return res.status(201).json({ ok: true, data: created });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Super Admin: Update TA information & course assignments
     */
    static async updateTA(req, res) {
        const { id } = req.params;
        const { username, password, name, email, phoneNumber, status, permissions, courseIds } = req.body;

        try {
            const ta = await Admins.findOne({ where: { id, role: 'ta' } });
            if (!ta) return res.status(404).json({ ok: false, message: 'دستیار آموزشی یافت نشد' });

            if (username !== undefined) {
                const existing = await Admins.findOne({ where: { username: username.trim() } });
                if (existing && existing.id !== id) {
                    return res.status(409).json({ ok: false, message: 'نام کاربری تکراری است' });
                }
                ta.username = username.trim();
            }

            if (password) {
                ta.password = password; // Hook handles bcrypt
            }

            if (name !== undefined) ta.name = name?.trim() || null;
            if (email !== undefined) ta.email = email?.trim() || null;
            if (phoneNumber !== undefined) ta.phoneNumber = phoneNumber?.trim() || null;
            if (status !== undefined) ta.status = status;
            if (permissions !== undefined) ta.permissions = permissions ? JSON.stringify(permissions) : null;

            await ta.save();

            // Update assigned courses
            if (Array.isArray(courseIds)) {
                await TACourses.destroy({ where: { adminId: id } });
                for (const cId of courseIds) {
                    await TACourses.create({ adminId: id, courseId: cId });
                }
            }

            const updated = await Admins.findByPk(id, {
                attributes: { exclude: ['password'] },
                include: [{ model: Courses, as: 'taAssignedCourses', through: { attributes: [] } }]
            });

            logSecurityEvent('ta_updated', { taId: id, updatedBy: req.user?.id });
            return res.status(200).json({ ok: true, data: updated });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Super Admin: Delete a TA
     */
    static async deleteTA(req, res) {
        const { id } = req.params;
        try {
            const ta = await Admins.findOne({ where: { id, role: 'ta' } });
            if (!ta) return res.status(404).json({ ok: false, message: 'دستیار آموزشی یافت نشد' });

            await TACourses.destroy({ where: { adminId: id } });
            await ta.destroy();

            logSecurityEvent('ta_deleted', { taId: id, deletedBy: req.user?.id });
            return res.status(200).json({ ok: true, message: 'دستیار آموزشی با موفقیت حذف شد' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Get current TA profile with assigned course IDs
     */
    static async getMyProfile(req, res) {
        const adminId = req.user?.id;
        try {
            const admin = await Admins.findByPk(adminId, {
                attributes: { exclude: ['password'] },
                include: [{ model: Courses, as: 'taAssignedCourses', through: { attributes: [] } }]
            });
            if (!admin) return res.status(404).json({ ok: false, message: 'حساب کاربری یافت نشد' });
            return res.status(200).json({ ok: true, data: admin });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
