import { Courses, Teachers, Categories } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

function validatePricing(price, salePrice) {
    if (price !== undefined && price !== null && price !== '') {
        const p = Number(String(price).replace(/[,٬]/g, ''));
        if (!Number.isFinite(p) || p < 0) return 'price must be a non-negative number';
    }
    if (salePrice !== undefined && salePrice !== null && salePrice !== '') {
        const s = Number(String(salePrice).replace(/[,٬]/g, ''));
        if (!Number.isFinite(s) || s < 0) return 'salePrice must be a non-negative number';
        if (price !== undefined && price !== null && price !== '') {
            const p = Number(String(price).replace(/[,٬]/g, ''));
            if (Number.isFinite(p) && s > p) return 'salePrice must not exceed price';
        }
    }
    return null;
}

function normalizePrice(v) {
    if (v === undefined) return undefined;
    if (v === null || v === '') return null;
    return String(v);
}

function normalizeMarkdown(value) {
    if (value === undefined || value === null || value === '') return null;
    if (typeof value !== 'string') return undefined;
    // Store Markdown exactly as text, while making line endings consistent.
    return value.replace(/\r\n?/g, '\n');
}

function validationResponse(res, fields) {
    return res.status(400).json({ ok: false, message: 'validation error', errors: fields });
}

function normalizeTeacherIds(teacherIds, teacherId) {
    const ids = Array.isArray(teacherIds) ? teacherIds : (teacherId ? [teacherId] : []);
    return [...new Set(ids.filter(Boolean).map(String))];
}

async function validateTeachers(teacherIds) {
    if (!teacherIds.length) return [];
    const teachers = await Teachers.findAll({ where: { id: teacherIds } });
    if (teachers.length !== teacherIds.length) {
        const found = new Set(teachers.map((teacher) => String(teacher.id)));
        return { missing: teacherIds.filter((id) => !found.has(String(id))) };
    }
    return teachers;
}

export default class CoursesController {
    static async createCourse(req, res) {
        const { name, teacherId, teacherIds, categoryIds, price, salePrice, description, isActive, sortOrder, image, level, duration, typeOfAttendence, statusOfRegistration, videoUrl, longDescription, kind } = req.body;
        if (!name || price === undefined || price === null || price === '') {
            return res.status(400).json({ ok: false, message: 'name and price are required' });
        }
        const markdown = normalizeMarkdown(longDescription);
        if (markdown === undefined) return validationResponse(res, [{ field: 'longDescription', message: 'must be a string' }]);
        const pricingError = validatePricing(price, salePrice);
        if (pricingError) return res.status(400).json({ ok: false, message: pricingError });
        const normalizedTeacherIds = normalizeTeacherIds(teacherIds, teacherId);
        if (kind === 'skill' && normalizedTeacherIds.length === 0) {
            return validationResponse(res, [{ field: 'teacherIds', message: 'a skill package requires at least one teacher' }]);
        }

        try {
            const selectedTeachers = await validateTeachers(normalizedTeacherIds);
            if (selectedTeachers.missing) {
                return validationResponse(res, [{ field: 'teacherIds', message: 'one or more teachers were not found' }]);
            }
            const course = await Courses.create({
                name,
                price,
                salePrice: normalizePrice(salePrice),
                description: description ?? null,
                isActive: isActive ?? true,
                sortOrder: sortOrder ?? 0,
                image: image ?? '',
                level: kind === 'skill' ? '' : (level ?? 'مقدماتی'),
                duration: duration ?? '20 ساعت',
                typeOfAttendence: typeOfAttendence ?? 'آنلاین',
                statusOfRegistration: statusOfRegistration ?? 'open',
                videoUrl: videoUrl ?? null,
                longDescription: markdown,
                kind: kind ?? 'regular',
                teacherId: normalizedTeacherIds[0] ?? null
            });

            if (selectedTeachers.length) await course.setTeachers(selectedTeachers);

            if (Array.isArray(categoryIds)) {
                const categories = await Categories.findAll({ where: { id: categoryIds } });
                await course.setCategories(categories);
            }

            const created = await Courses.findByPk(course.id, { include: courseIncludes() });
            logSecurityEvent('course_created', { courseId: course.id, requesterId: req.user?.id, ip: req.ip });
            return res.status(201).json({ ok: true, data: created });
        } catch (err) {
            if (err?.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    ok: false,
                    message: 'validation error',
                    errors: err.errors?.map((item) => ({ field: item.path, message: item.message })) ?? []
                });
            }
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
        const { name, teacherId, teacherIds, categoryIds, price, salePrice, description, isActive, sortOrder, image, level, duration, typeOfAttendence, statusOfRegistration, videoUrl, longDescription, kind } = req.body;

        try {
            const course = await Courses.findByPk(id);
            if (!course) {
                return res.status(404).json({ ok: false, message: 'course not found' });
            }

            const effectivePrice = price !== undefined ? price : course.price;
            const effectiveSale = salePrice !== undefined ? salePrice : course.salePrice;
            const pricingError = validatePricing(effectivePrice, effectiveSale);
            if (pricingError) return res.status(400).json({ ok: false, message: pricingError });

            const normalizedTeacherIds = teacherIds !== undefined || teacherId !== undefined
                ? normalizeTeacherIds(teacherIds, teacherId)
                : null;
            const effectiveKind = kind ?? course.kind;
            const effectiveTeacherIds = normalizedTeacherIds ?? normalizeTeacherIds(null, course.teacherId);
            if (effectiveKind === 'skill' && effectiveTeacherIds.length === 0) {
                return validationResponse(res, [{ field: 'teacherIds', message: 'a skill package requires at least one teacher' }]);
            }
            if (normalizedTeacherIds?.length) {
                const selectedTeachers = await validateTeachers(normalizedTeacherIds);
                if (selectedTeachers.missing) {
                    return validationResponse(res, [{ field: 'teacherIds', message: 'one or more teachers were not found' }]);
                }
            }

            const markdown = normalizeMarkdown(longDescription);
            if (markdown === undefined) return validationResponse(res, [{ field: 'longDescription', message: 'must be a string' }]);

            if (name !== undefined) course.name = name;
            if (price !== undefined) course.price = price;
            if (salePrice !== undefined) course.salePrice = normalizePrice(salePrice);
            if (description !== undefined) course.description = description;
            if (isActive !== undefined) course.isActive = isActive;
            if (sortOrder !== undefined) course.sortOrder = sortOrder;
            if (image !== undefined) course.image = image;
            if (effectiveKind === 'skill') course.level = '';
            else if (level !== undefined) course.level = level;
            if (duration !== undefined) course.duration = duration;
            if (typeOfAttendence !== undefined) course.typeOfAttendence = typeOfAttendence;
            if (statusOfRegistration !== undefined) course.statusOfRegistration = statusOfRegistration;
            if (videoUrl !== undefined) course.videoUrl = videoUrl;
            if (longDescription !== undefined) course.longDescription = markdown;
            if (kind !== undefined) course.kind = kind;
            if (normalizedTeacherIds !== null) {
                course.teacherId = normalizedTeacherIds[0] ?? null;
            }

            await course.save();

            if (Array.isArray(categoryIds)) {
                const categories = await Categories.findAll({ where: { id: categoryIds } });
                await course.setCategories(categories);
            }

            if (normalizedTeacherIds !== null) {
                const selectedTeachers = await Teachers.findAll({ where: { id: normalizedTeacherIds } });
                await course.setTeachers(selectedTeachers);
            }

            const updated = await Courses.findByPk(id, { include: courseIncludes() });
            logSecurityEvent('course_updated', { courseId: id, requesterId: req.user?.id, ip: req.ip });
            return res.status(200).json({ ok: true, data: updated });
        } catch (err) {
            if (err?.name === 'SequelizeValidationError') {
                return res.status(400).json({
                    ok: false,
                    message: 'validation error',
                    errors: err.errors?.map((item) => ({ field: item.path, message: item.message })) ?? []
                });
            }
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
        { model: Teachers, as: 'teachers', through: { attributes: [] } },
        { model: Categories, as: 'categories', through: { attributes: [] } }
    ];
}
