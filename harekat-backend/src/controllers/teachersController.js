import { Teachers, Courses, Categories } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

const teacherInclude = [
    { model: Courses, as: 'courses' },
    { model: Categories, as: 'categories', through: { attributes: [] } }
];

export default class TeachersController {
    static async createTeacher(req, res) {
        const { firstName, lastName, email, resume, resumeFile, avatar, categoryIds, showOnLanding } = req.body;

        try {
            const teacher = await Teachers.create({ firstName, lastName, email, resume, resumeFile: resumeFile || null, avatar, showOnLanding: showOnLanding ?? false });
            if (Array.isArray(categoryIds) && categoryIds.length) {
                const cats = await Categories.findAll({ where: { id: categoryIds } });
                await teacher.setCategories(cats);
            }
            const created = await Teachers.findByPk(teacher.id, { include: teacherInclude });
            logSecurityEvent('teacher_created', { teacherId: teacher.id, requesterId: req.user?.id, ip: req.ip });
            return res.status(201).json({ ok: true, data: created });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getTeachers(req, res) {
        try {
            const teachers = await Teachers.findAll({ include: teacherInclude });
            return res.status(200).json({ ok: true, data: teachers });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getTeacherById(req, res) {
        const { id } = req.params;
        try {
            const teacher = await Teachers.findByPk(id, { include: teacherInclude });
            if (!teacher) {
                return res.status(404).json({ ok: false, message: 'teacher not found' });
            }
            return res.status(200).json({ ok: true, data: teacher });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async updateTeacher(req, res) {
        const { id } = req.params;
        const { firstName, lastName, email, resume, resumeFile, avatar, categoryIds, showOnLanding } = req.body;

        try {
            const teacher = await Teachers.findByPk(id);
            if (!teacher) {
                return res.status(404).json({ ok: false, message: 'teacher not found' });
            }

            if (firstName !== undefined) teacher.firstName = firstName;
            if (lastName !== undefined) teacher.lastName = lastName;
            if (email !== undefined) teacher.email = email;
            if (resume !== undefined) teacher.resume = resume;
            if (resumeFile !== undefined) teacher.resumeFile = resumeFile;
            if (avatar !== undefined) teacher.avatar = avatar;
            if (showOnLanding !== undefined) teacher.showOnLanding = showOnLanding;

            await teacher.save();
            if (Array.isArray(categoryIds)) {
                const cats = await Categories.findAll({ where: { id: categoryIds } });
                await teacher.setCategories(cats);
            }
            const updated = await Teachers.findByPk(id, { include: teacherInclude });
            logSecurityEvent('teacher_updated', { teacherId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: updated });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async deleteTeacher(req, res) {
        const { id } = req.params;
        try {
            const teacher = await Teachers.findByPk(id);
            if (!teacher) {
                return res.status(404).json({ ok: false, message: 'teacher not found' });
            }
            await teacher.destroy();
            logSecurityEvent('teacher_deleted', { teacherId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, message: 'teacher deleted' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
