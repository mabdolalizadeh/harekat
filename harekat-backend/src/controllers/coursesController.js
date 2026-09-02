import { Courses, Teachers, Categories } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class CoursesController {
    static async createCourse(req, res) {
        const { name, teacherId, categoryIds, price, image, level, duration, typeOfAttendence, statusOfRegistration } = req.body;
        if (!name || !price) {
            return res.status(400).json({ ok: false, message: 'name and price are required' });
        }

        try {
            const course = await Courses.create({
                name,
                price,
                image,
                level,
                duration,
                typeOfAttendence,
                statusOfRegistration,
                teacherId
            });

            if (Array.isArray(categoryIds)) {
                const categories = await Categories.findAll({ where: { id: categoryIds } });
                await course.setCategories(categories);
            }

            const created = await Courses.findByPk(course.id, { include: courseIncludes() });
            logSecurityEvent('course_created', { courseId: course.id, requesterId: req.user?.id, ip: req.ip });
            return res.status(201).json({ ok: true, data: created });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getCourses(req, res) {
        try {
            const courses = await Courses.findAll({ include: courseIncludes() });
            return res.status(200).json({ ok: true, data: courses });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async getCourseById(req, res) {
        const { id } = req.params;
        try {
            const course = await Courses.findByPk(id, { include: courseIncludes() });
            if (!course) {
                return res.status(404).json({ ok: false, message: 'course not found' });
            }
            return res.status(200).json({ ok: true, data: course });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async updateCourse(req, res) {
        const { id } = req.params;
        const { name, teacherId, categoryIds, price, image, level, duration, typeOfAttendence, statusOfRegistration } = req.body;

        try {
            const course = await Courses.findByPk(id);
            if (!course) {
                return res.status(404).json({ ok: false, message: 'course not found' });
            }

            if (name !== undefined) course.name = name;
            if (price !== undefined) course.price = price;
            if (image !== undefined) course.image = image;
            if (level !== undefined) course.level = level;
            if (duration !== undefined) course.duration = duration;
            if (typeOfAttendence !== undefined) course.typeOfAttendence = typeOfAttendence;
            if (statusOfRegistration !== undefined) course.statusOfRegistration = statusOfRegistration;
            if (teacherId !== undefined) course.teacherId = teacherId;

            await course.save();

            if (Array.isArray(categoryIds)) {
                const categories = await Categories.findAll({ where: { id: categoryIds } });
                await course.setCategories(categories);
            }

            const updated = await Courses.findByPk(id, { include: courseIncludes() });
            logSecurityEvent('course_updated', { courseId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: updated });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    static async deleteCourse(req, res) {
        const { id } = req.params;
        try {
            const course = await Courses.findByPk(id);
            if (!course) {
                return res.status(404).json({ ok: false, message: 'course not found' });
            }
            await course.destroy();
            logSecurityEvent('course_deleted', { courseId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, message: 'course deleted' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}

function courseIncludes() {
    return [
        { model: Teachers, as: 'teacher' },
        { model: Categories, as: 'categories', through: { attributes: [] } }
    ];
}
