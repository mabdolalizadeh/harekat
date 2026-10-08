import { Users, Courses, Payments } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class UsersController {
    static async createUser(req, res) {
        const { phoneNumber, firstName, lastName, rubies } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ ok: false, message: 'phoneNumber is required' });
        }

        try {
            const existing = await Users.findOne({ where: { phoneNumber } });
            if (existing) {
                return res.status(409).json({ ok: false, message: 'user with this phone number already exists' });
            }

            const user = await Users.create({
                phoneNumber,
                firstName: firstName || null,
                lastName: lastName || null,
                rubies: rubies !== undefined ? Number(rubies) : 0
            });
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
                ],
                order: [['createdAt', 'DESC']]
            });
            return res.status(200).json({ ok: true, data: users });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getUserById(req, res) {
        const { id } = req.params;
        const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
        if (!isAdmin && req.user?.id !== id) {
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
        const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
        if (!isAdmin && req.user?.id !== id) {
            return res.status(403).json({ ok: false, message: 'forbidden' });
        }

        const {
            firstName,
            lastName,
            phoneNumber,
            courseIds,
            paymentIds,
            avatar,
            nationalId,
            gradeLevel,
            dateOfBirth,
            schoolName,
            age,
            parentPhone,
            fatherName,
            bio,
            jobTitle,
            education,
            rubies
        } = req.body;

        try {
            const user = await Users.findByPk(id);
            if (!user) {
                return res.status(404).json({ ok: false, message: 'user not found' });
            }

            // Field validation
            if (nationalId !== undefined && nationalId !== null && nationalId !== '') {
                const cleanNationalId = String(nationalId).trim();
                if (!/^\d{10}$/.test(cleanNationalId)) {
                    return res.status(400).json({ ok: false, message: 'nationalId must be exactly 10 digits' });
                }
                user.nationalId = cleanNationalId;
            } else if (nationalId === '' || nationalId === null) {
                user.nationalId = null;
            }

            if (parentPhone !== undefined && parentPhone !== null && parentPhone !== '') {
                const cleanParentPhone = String(parentPhone).trim();
                if (!/^09\d{9}$/.test(cleanParentPhone)) {
                    return res.status(400).json({ ok: false, message: 'parentPhone must be a valid Iranian phone number (e.g. 09123456789)' });
                }
                user.parentPhone = cleanParentPhone;
            } else if (parentPhone === '' || parentPhone === null) {
                user.parentPhone = null;
            }

            if (age !== undefined && age !== null && age !== '') {
                const numAge = parseInt(age, 10);
                if (isNaN(numAge) || numAge < 3 || numAge > 120) {
                    return res.status(400).json({ ok: false, message: 'age must be a valid integer between 3 and 120' });
                }
                user.age = numAge;
            } else if (age === null || age === '') {
                user.age = null;
            }

            if (firstName !== undefined) user.firstName = firstName ? String(firstName).trim() : null;
            if (lastName !== undefined) user.lastName = lastName ? String(lastName).trim() : null;
            if (gradeLevel !== undefined) user.gradeLevel = gradeLevel ? String(gradeLevel).trim() : null;
            if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth ? String(dateOfBirth).trim() : null;
            if (schoolName !== undefined) user.schoolName = schoolName ? String(schoolName).trim() : null;
            if (fatherName !== undefined) user.fatherName = fatherName ? String(fatherName).trim() : null;
            if (avatar !== undefined) user.avatar = avatar;
            if (bio !== undefined) user.bio = bio;
            if (jobTitle !== undefined) user.jobTitle = jobTitle;
            if (education !== undefined) user.education = education;
            if (phoneNumber !== undefined && phoneNumber !== user.phoneNumber) {
                const cleanPhone = String(phoneNumber).trim();
                if (!/^09\d{9}$/.test(cleanPhone)) {
                    return res.status(400).json({ ok: false, message: 'phoneNumber must be a valid Iranian phone number' });
                }
                const existing = await Users.findOne({ where: { phoneNumber: cleanPhone } });
                if (existing && existing.id !== id) {
                    return res.status(409).json({ ok: false, message: 'phone number already in use' });
                }
                user.phoneNumber = cleanPhone;
            }

            // Only administrative roles can update rubies, course grants, or payment relations
            if (isAdmin) {
                if (rubies !== undefined) user.rubies = Number(rubies) || 0;
            }

            await user.save();

            if (isAdmin) {
                if (Array.isArray(courseIds)) {
                    const courses = await Courses.findAll({ where: { id: courseIds } });
                    await user.setCourses(courses);
                }
                if (Array.isArray(paymentIds)) {
                    const payments = await Payments.findAll({ where: { id: paymentIds } });
                    await user.setPayments(payments);
                }
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
        const isAdmin = req.user?.role === 'admin' || req.user?.role === 'superadmin';
        if (!isAdmin && req.user?.id !== id) {
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
