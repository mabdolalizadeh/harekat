import { Licenses, Courses, Users, ExamResults, Exams, TACourses } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class LicensesController {
    /**
     * Get all licenses belonging to the authenticated student
     */
    static async getMyLicenses(req, res) {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        try {
            const licenses = await Licenses.findAll({
                where: { userId, status: 'available' },
                include: [
                    { model: Courses, as: 'course', attributes: ['id', 'name', 'image', 'duration', 'level'] },
                    { model: ExamResults, as: 'examResult', attributes: ['score', 'published', 'status'] }
                ],
                order: [['issueDate', 'DESC']]
            });

            return res.status(200).json({ ok: true, data: licenses });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Public verification of license by license number
     */
    static async verifyLicense(req, res) {
        const { licenseNumber } = req.params;
        try {
            const license = await Licenses.findOne({
                where: { licenseNumber, status: 'available' },
                include: [
                    { model: Courses, as: 'course', attributes: ['id', 'name', 'duration', 'level'] },
                    { model: Users, as: 'user', attributes: ['firstName', 'lastName'] }
                ]
            });

            if (!license) {
                return res.status(404).json({ ok: false, message: 'مدرک با این شناسه یافت نشد یا معتبر نیست' });
            }

            return res.status(200).json({
                ok: true,
                data: {
                    licenseNumber: license.licenseNumber,
                    studentName: `${license.user?.firstName || ''} ${license.user?.lastName || ''}`.trim() || 'دانشجوی حرکت',
                    courseName: license.course?.name || 'دوره حرکت',
                    issueDate: license.issueDate,
                    status: license.status,
                    certificateUrl: license.certificateUrl
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Get single license by ID (student or admin/TA)
     */
    static async getLicenseById(req, res) {
        const { id } = req.params;
        try {
            const license = await Licenses.findByPk(id, {
                include: [
                    { model: Courses, as: 'course' },
                    { model: Users, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'nationalId'] },
                    { model: ExamResults, as: 'examResult' }
                ]
            });

            if (!license) return res.status(404).json({ ok: false, message: 'مدرک مورد نظر یافت نشد' });

            const requester = req.user;
            const isSuper = requester?.role === 'admin' || requester?.role === 'superadmin';
            const isOwner = requester?.id === license.userId;

            if (!isSuper && !isOwner) {
                if (requester?.role === 'ta') {
                    const isAssigned = await TACourses.findOne({
                        where: { adminId: requester.id, courseId: license.courseId }
                    });
                    if (!isAssigned) {
                        return res.status(403).json({ ok: false, message: 'دسترسی به این مدرک مجاز نیست' });
                    }
                } else {
                    return res.status(403).json({ ok: false, message: 'forbidden' });
                }
            }

            return res.status(200).json({ ok: true, data: license });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: List all licenses (TA is scoped to assigned courses)
     */
    static async listAllLicenses(req, res) {
        const requester = req.user;
        const isSuper = requester?.role === 'admin' || requester?.role === 'superadmin';

        try {
            const whereClause = {};

            if (!isSuper && requester?.role === 'ta') {
                const assigned = await TACourses.findAll({ where: { adminId: requester.id } });
                const assignedCourseIds = assigned.map(a => a.courseId);
                whereClause.courseId = assignedCourseIds;
            }

            const licenses = await Licenses.findAll({
                where: whereClause,
                include: [
                    { model: Courses, as: 'course', attributes: ['id', 'name'] },
                    { model: Users, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'nationalId'] },
                    { model: ExamResults, as: 'examResult', attributes: ['score'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            return res.status(200).json({ ok: true, data: licenses });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: Issue certificate manually for an enrolled student
     */
    static async issueCertificate(req, res) {
        const { userId, courseId, certificateUrl } = req.body;
        const requester = req.user;

        if (!userId || !courseId) {
            return res.status(400).json({ ok: false, message: 'شناسه دانشجو و دوره الزامی است' });
        }

        if (requester?.role === 'ta') {
            const isAssigned = await TACourses.findOne({
                where: { adminId: requester.id, courseId }
            });
            if (!isAssigned) {
                return res.status(403).json({ ok: false, message: 'شما دسترسی صدور مدرک برای این دوره را ندارید' });
            }
        }

        try {
            let license = await Licenses.findOne({ where: { userId, courseId } });
            if (license) {
                license.status = 'available';
                if (certificateUrl) license.certificateUrl = certificateUrl;
                license.issueDate = new Date();
                await license.save();
            } else {
                const licenseNumber = `HRK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                license = await Licenses.create({
                    licenseNumber,
                    userId,
                    courseId,
                    status: 'available',
                    issueDate: new Date(),
                    certificateUrl: certificateUrl || null
                });
            }

            logSecurityEvent('certificate_issued', { licenseId: license.id, userId, courseId, issuerId: requester?.id });
            return res.status(201).json({
                ok: true,
                message: 'گواهینامه پایان دوره با موفقیت صادر شد',
                data: license
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: Update license status (e.g. revoke or available)
     */
    static async updateLicenseStatus(req, res) {
        const { id } = req.params;
        const { status, certificateUrl } = req.body;
        const requester = req.user;

        try {
            const license = await Licenses.findByPk(id);
            if (!license) return res.status(404).json({ ok: false, message: 'مدرک یافت نشد' });

            if (requester?.role === 'ta') {
                const isAssigned = await TACourses.findOne({
                    where: { adminId: requester.id, courseId: license.courseId }
                });
                if (!isAssigned) {
                    return res.status(403).json({ ok: false, message: 'دسترسی تغییر وضعیت این مدرک برای حساب شما مجاز نیست' });
                }
            }

            if (status !== undefined) license.status = status;
            if (certificateUrl !== undefined) license.certificateUrl = certificateUrl;
            await license.save();

            return res.status(200).json({ ok: true, data: license });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
