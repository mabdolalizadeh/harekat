import { Licenses, Courses, Users, ExamResults, Exams } from '../models/index.js';

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
     * Get single license by ID (student or admin)
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

            // Only owner or admin can view
            if (req.user?.role !== 'admin' && req.user?.role !== 'superadmin' && req.user?.id !== license.userId) {
                return res.status(403).json({ ok: false, message: 'forbidden' });
            }

            return res.status(200).json({ ok: true, data: license });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin: List all licenses
     */
    static async listAllLicenses(req, res) {
        try {
            const licenses = await Licenses.findAll({
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
     * Admin: Update license status (e.g. revoke or available)
     */
    static async updateLicenseStatus(req, res) {
        const { id } = req.params;
        const { status, certificateUrl } = req.body;
        try {
            const license = await Licenses.findByPk(id);
            if (!license) return res.status(404).json({ ok: false, message: 'مدرک یافت نشد' });

            if (status !== undefined) license.status = status;
            if (certificateUrl !== undefined) license.certificateUrl = certificateUrl;
            await license.save();

            return res.status(200).json({ ok: true, data: license });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
