import { Teachers, Courses } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class TeachersController {
    static async createTeacher(req, res) {
        const { firstName, lastName, email, resume, avatar } = req.body;

        try {
            const teacher = await Teachers.create({ firstName, lastName, email, resume, avatar });
            logSecurityEvent('teacher_created', { teacherId: teacher.id, requesterId: req.user?.id, ip: req.ip });
            return res.status(201).json({ ok: true, data: teacher });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getTeachers(req, res) {
        try {
            const teachers = await Teachers.findAll({
                include: { model: Courses, as: 'courses' }
            });
            return res.status(200).json({ ok: true, data: teachers });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getTeacherById(req, res) {
        const { id } = req.params;
        try {
            const teacher = await Teachers.findByPk(id, {
                include: { model: Courses, as: 'courses' }
            });
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
        const { firstName, lastName, email, resume, avatar } = req.body;

        try {
            const teacher = await Teachers.findByPk(id);
            if (!teacher) {
                return res.status(404).json({ ok: false, message: 'teacher not found' });
            }

            if (firstName !== undefined) teacher.firstName = firstName;
            if (lastName !== undefined) teacher.lastName = lastName;
            if (email !== undefined) teacher.email = email;
            if (resume !== undefined) teacher.resume = resume;
            if (avatar !== undefined) teacher.avatar = avatar;

            await teacher.save();
            logSecurityEvent('teacher_updated', { teacherId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: teacher });
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
