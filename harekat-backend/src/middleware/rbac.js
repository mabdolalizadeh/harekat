import { TACourses, Admins, Sessions } from '../models/index.js';
import { logSecurityEvent } from '../utils/logger.js';

/**
 * Ensures user is a Super Admin
 */
export function superAdminOnly(req, res, next) {
    const role = req.user?.role;
    if (role === 'admin' || role === 'superadmin') {
        return next();
    }
    logSecurityEvent('rbac_forbidden_superadmin', { userId: req.user?.id, role, path: req.path, ip: req.ip });
    return res.status(403).json({ ok: false, message: 'super admin access required' });
}

/**
 * Ensures user is either a Super Admin or TA
 */
export function adminOrTa(req, res, next) {
    const role = req.user?.role;
    if (role === 'admin' || role === 'superadmin' || role === 'ta') {
        return next();
    }
    logSecurityEvent('rbac_forbidden_admin_or_ta', { userId: req.user?.id, role, path: req.path, ip: req.ip });
    return res.status(403).json({ ok: false, message: 'administrative access required' });
}

/**
 * Middleware factory to enforce TA course restriction
 */
export function checkTaCourseAccess(courseIdGetter = (req) => req.params.courseId || req.params.id || req.body.courseId) {
    return async (req, res, next) => {
        const role = req.user?.role;
        // Super admin has full access to all courses
        if (role === 'admin' || role === 'superadmin') {
            return next();
        }

        if (role === 'ta') {
            let courseId = courseIdGetter(req);

            // If param is sessionId, find courseId from session
            if (!courseId && req.params.sessionId) {
                const session = await Sessions.findByPk(req.params.sessionId);
                courseId = session?.courseId;
            }

            if (!courseId) {
                return res.status(400).json({ ok: false, message: 'course context required' });
            }

            const assignment = await TACourses.findOne({
                where: { adminId: req.user.id, courseId }
            });

            if (assignment) {
                req.assignedCourseId = courseId;
                return next();
            }

            logSecurityEvent('ta_unauthorized_course_access', { taId: req.user.id, courseId, path: req.path, ip: req.ip });
            return res.status(403).json({
                ok: false,
                message: 'دسترسی به این دوره برای حساب شما مجاز نیست'
            });
        }

        return res.status(403).json({ ok: false, message: 'forbidden' });
    };
}
