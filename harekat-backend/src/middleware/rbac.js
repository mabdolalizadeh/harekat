import { TACourses, Admins, Sessions, Assignments, AssignmentSubmissions, Quizzes, QuizAttempts, Exams, ExamResults, CourseEvaluations } from '../models/index.js';
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
                return res.status(400).json({ ok: false, message: 'شناسه دوره الزامی است' });
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

/**
 * Middleware to enforce TA course restriction when accessing a session by its ID
 */
export function checkTaSessionAccess() {
    return async (req, res, next) => {
        const role = req.user?.role;
        if (role === 'admin' || role === 'superadmin') {
            return next();
        }

        if (role === 'ta') {
            const sessionId = req.params.id || req.params.sessionId;
            if (!sessionId) {
                return res.status(400).json({ ok: false, message: 'session ID required' });
            }

            const session = await Sessions.findByPk(sessionId);
            if (!session) {
                return res.status(404).json({ ok: false, message: 'session not found' });
            }

            const assignment = await TACourses.findOne({
                where: { adminId: req.user.id, courseId: session.courseId }
            });

            if (assignment) {
                req.assignedCourseId = session.courseId;
                req.targetSession = session;
                return next();
            }

            logSecurityEvent('ta_unauthorized_session_access', { taId: req.user.id, courseId: session.courseId, sessionId, path: req.path, ip: req.ip });
            return res.status(403).json({
                ok: false,
                message: 'دسترسی به این جلسه برای حساب شما مجاز نیست'
            });
        }

        return res.status(403).json({ ok: false, message: 'forbidden' });
    };
}

/**
 * Middleware to enforce TA course restriction when accessing an Assignment by ID
 */
export function checkTaAssignmentAccess() {
    return async (req, res, next) => {
        const role = req.user?.role;
        if (role === 'admin' || role === 'superadmin') {
            return next();
        }

        if (role === 'ta') {
            const assignmentId = req.params.id || req.params.assignmentId;
            if (!assignmentId) {
                return res.status(400).json({ ok: false, message: 'شناسه تکلیف الزامی است' });
            }

            const item = await Assignments.findByPk(assignmentId);
            if (!item) {
                return res.status(404).json({ ok: false, message: 'تکلیف یافت نشد' });
            }

            const assignment = await TACourses.findOne({
                where: { adminId: req.user.id, courseId: item.courseId }
            });

            if (assignment) {
                req.assignedCourseId = item.courseId;
                req.targetAssignment = item;
                return next();
            }

            logSecurityEvent('ta_unauthorized_assignment_access', { taId: req.user.id, courseId: item.courseId, assignmentId, path: req.path, ip: req.ip });
            return res.status(403).json({
                ok: false,
                message: 'دسترسی به تکالیف این دوره برای حساب شما مجاز نیست'
            });
        }

        return res.status(403).json({ ok: false, message: 'forbidden' });
    };
}

/**
 * Middleware to enforce TA course restriction when accessing a Quiz by ID
 */
export function checkTaQuizAccess() {
    return async (req, res, next) => {
        const role = req.user?.role;
        if (role === 'admin' || role === 'superadmin') {
            return next();
        }

        if (role === 'ta') {
            const quizId = req.params.id || req.params.quizId;
            if (!quizId) {
                return res.status(400).json({ ok: false, message: 'شناسه آزمونک الزامی است' });
            }

            const quiz = await Quizzes.findByPk(quizId);
            if (!quiz) {
                return res.status(404).json({ ok: false, message: 'آزمونک یافت نشد' });
            }

            const assignment = await TACourses.findOne({
                where: { adminId: req.user.id, courseId: quiz.courseId }
            });

            if (assignment) {
                req.assignedCourseId = quiz.courseId;
                req.targetQuiz = quiz;
                return next();
            }

            logSecurityEvent('ta_unauthorized_quiz_access', { taId: req.user.id, courseId: quiz.courseId, quizId, path: req.path, ip: req.ip });
            return res.status(403).json({
                ok: false,
                message: 'دسترسی به آزمونک‌های این دوره برای حساب شما مجاز نیست'
            });
        }

        return res.status(403).json({ ok: false, message: 'forbidden' });
    };
}
