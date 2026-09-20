import { AccessService } from '../services/accessService.js';
import { Courses, Users, SiteContent, Sessions, UserLessonProgress } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class AccessController {
    /**
     * Student: Get only accessible courses for current student with progress
     */
    static async getMyAccessibleCourses(req, res) {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        try {
            const activeCourseIds = await AccessService.getUserActiveCourseIds(userId);
            const courses = await Courses.findAll({
                where: { id: activeCourseIds },
                order: [['createdAt', 'DESC']]
            });

            const enrichedCourses = await Promise.all(
                courses.map(async (course) => {
                    const totalSessions = await Sessions.count({ where: { courseId: course.id } });
                    const completedSessions = await UserLessonProgress.count({
                        where: { userId, courseId: course.id, isCompleted: true }
                    });
                    const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
                    return {
                        ...course.toJSON(),
                        totalSessions,
                        completedSessions,
                        progress
                    };
                })
            );

            return res.status(200).json({ ok: true, data: enrichedCourses });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }


    /**
     * Student: Get single recommended course that student does NOT have access to
     */
    static async getRecommendedCourse(req, res) {
        const userId = req.user?.id;
        try {
            const userActiveCourseIds = userId
                ? await AccessService.getUserActiveCourseIds(userId)
                : [];

            // Check if Super Admin configured a specific recommended course
            const setting = await SiteContent.findOne({ where: { key: 'recommended_course_id' } });
            let recommendedCourse = null;

            if (setting && setting.body) {
                const configuredCourse = await Courses.findByPk(setting.body.trim());
                if (configuredCourse && !userActiveCourseIds.includes(configuredCourse.id) && configuredCourse.isActive) {
                    recommendedCourse = configuredCourse;
                }
            }

            // Fallback: If configured course is already owned or not set, pick the first active course the student does not have
            if (!recommendedCourse) {
                const allCourses = await Courses.findAll({
                    where: { isActive: true },
                    order: [['sortOrder', 'ASC'], ['createdAt', 'DESC']]
                });

                recommendedCourse = allCourses.find((c) => !userActiveCourseIds.includes(c.id)) || null;
            }

            return res.status(200).json({ ok: true, data: recommendedCourse });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Super Admin: Configure recommended course
     */
    static async setRecommendedCourse(req, res) {
        const { courseId } = req.body;
        try {
            if (courseId) {
                const course = await Courses.findByPk(courseId);
                if (!course) return res.status(404).json({ ok: false, message: 'دوره مورد نظر یافت نشد' });
            }

            let setting = await SiteContent.findOne({ where: { key: 'recommended_course_id' } });
            if (setting) {
                setting.body = courseId || '';
                await setting.save();
            } else {
                setting = await SiteContent.create({
                    key: 'recommended_course_id',
                    title: 'شناسه دوره پیشنهادی داشبورد دانشجو',
                    body: courseId || '',
                    isActive: true,
                    sortOrder: 0
                });
            }

            return res.status(200).json({ ok: true, message: 'دوره پیشنهادی با موفقیت تنظیم شد', data: setting });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Super Admin: Inspect student course access details & sources
     */
    static async inspectStudentAccess(req, res) {
        const { userId } = req.params;
        try {
            const student = await Users.findByPk(userId);
            if (!student) return res.status(404).json({ ok: false, message: 'دانشجو یافت نشد' });

            const details = await AccessService.getStudentAccessDetails(userId);
            return res.status(200).json({ ok: true, data: { student, ...details } });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Super Admin: Manually grant course access
     */
    static async grantAccess(req, res) {
        const { userId, courseId, expiresAt } = req.body;
        if (!userId || !courseId) {
            return res.status(400).json({ ok: false, message: 'userId and courseId are required' });
        }

        try {
            const access = await AccessService.grantCourseAccess({
                userId,
                courseId,
                sourceType: 'admin',
                sourceId: req.user?.id || 'admin',
                expiresAt: expiresAt ? new Date(expiresAt) : null
            });

            logSecurityEvent('admin_grant_access', { userId, courseId, grantedBy: req.user?.id });
            return res.status(200).json({ ok: true, message: 'دسترسی با موفقیت اعطا شد', data: access });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Super Admin: Manually revoke course access
     */
    static async revokeAccess(req, res) {
        const { userId, courseId, sourceType, sourceId } = req.body;
        if (!userId || !courseId) {
            return res.status(400).json({ ok: false, message: 'userId and courseId are required' });
        }

        try {
            await AccessService.revokeCourseAccess({
                userId,
                courseId,
                sourceType: sourceType || null,
                sourceId: sourceId || null
            });

            logSecurityEvent('admin_revoke_access', { userId, courseId, revokedBy: req.user?.id });
            return res.status(200).json({ ok: true, message: 'دسترسی با موفقیت لغو شد' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
