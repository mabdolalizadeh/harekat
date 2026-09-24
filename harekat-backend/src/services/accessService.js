import { Op } from 'sequelize';
import { CourseAccess, Courses, PackageCourses, SubscriptionCourses, Subscriptions, UserSubscriptions, Users, sequelize } from '../models/index.js';

export class AccessService {
    /**
     * Synchronize and clean expired accesses for a given user (or all users)
     */
    static async syncUserAccess(userId, options = {}) {
        const { transaction } = options;
        const now = new Date();
        // 1. Expire past user subscriptions
        await UserSubscriptions.update(
            { status: 'expired' },
            {
                where: {
                    userId,
                    status: 'active',
                    expiresAt: { [Op.lte]: now }
                },
                transaction
            }
        );

        // 2. Expire past course accesses
        await CourseAccess.update(
            { status: 'expired' },
            {
                where: {
                    userId,
                    status: 'active',
                    expiresAt: { [Op.lte]: now }
                },
                transaction
            }
        );

        // 3. Resync UserCourses table for legacy/joined queries
        const activeAccesses = await CourseAccess.findAll({
            where: {
                userId,
                status: 'active',
                [Op.or]: [
                    { expiresAt: null },
                    { expiresAt: { [Op.gt]: now } }
                ]
            },
            attributes: ['courseId'],
            transaction
        });

        const activeCourseIds = [...new Set(activeAccesses.map((a) => a.courseId))];

        const user = await Users.findByPk(userId, { transaction });
        if (user && activeCourseIds.length > 0) {
            const courses = await Courses.findAll({ where: { id: activeCourseIds }, transaction });
            await user.setCourses(courses, { transaction });
        } else if (user) {
            await user.setCourses([], { transaction });
        }

        return activeCourseIds;
    }

    /**
     * Check if a student currently has valid access to a course
     */
    static async hasCourseAccess(userId, courseId, options = {}) {
        if (!userId || !courseId) return false;
        await this.syncUserAccess(userId, options);

        const now = new Date();
        const activeRecord = await CourseAccess.findOne({
            where: {
                userId,
                courseId,
                status: 'active',
                [Op.or]: [
                    { expiresAt: null },
                    { expiresAt: { [Op.gt]: now } }
                ]
            },
            transaction: options.transaction
        });

        return !!activeRecord;
    }

    /**
     * Get list of all course IDs that a user has active access to
     */
    static async getUserActiveCourseIds(userId, options = {}) {
        if (!userId) return [];
        return await this.syncUserAccess(userId, options);
    }

    /**
     * Grant access to an individual course from any source
     */
    static async grantCourseAccess({ userId, courseId, sourceType = 'direct', sourceId = null, expiresAt = null }, options = {}) {
        if (!userId || !courseId) throw new Error('userId and courseId are required');
        const { transaction } = options;

        // Look for existing access from this specific source
        let access = await CourseAccess.findOne({
            where: { userId, courseId, sourceType, sourceId: sourceId || null },
            transaction
        });

        if (access) {
            access.status = 'active';
            access.expiresAt = expiresAt;
            await access.save({ transaction });
        } else {
            access = await CourseAccess.create({
                userId,
                courseId,
                sourceType,
                sourceId: sourceId || null,
                status: 'active',
                expiresAt
            }, { transaction });
        }

        await this.syncUserAccess(userId, { transaction });
        return access;
    }

    /**
     * Revoke access from a specific source (or all sources if unspecified)
     */
    static async revokeCourseAccess({ userId, courseId, sourceType = null, sourceId = null }, options = {}) {
        const { transaction } = options;
        const whereClause = { userId, courseId };
        if (sourceType) whereClause.sourceType = sourceType;
        if (sourceId) whereClause.sourceId = sourceId;

        await CourseAccess.update({ status: 'revoked' }, { where: whereClause, transaction });
        await this.syncUserAccess(userId, { transaction });
        return true;
    }

    /**
     * Grant access via a Package (grants package itself + all included courses)
     */
    static async grantPackageAccess({ userId, packageId, orderId = null }, options = {}) {
        const { transaction } = options;
        const packageCourse = await Courses.findByPk(packageId, {
            include: [{ model: Courses, as: 'packageIncludedCourses' }],
            transaction
        });

        if (!packageCourse) throw new Error('Package course not found');

        // Grant access to the package course itself
        await this.grantCourseAccess({
            userId,
            courseId: packageId,
            sourceType: 'direct',
            sourceId: orderId,
            expiresAt: null
        }, { transaction });

        // Grant access to all included courses
        const included = packageCourse.packageIncludedCourses || [];
        for (const incCourse of included) {
            await this.grantCourseAccess({
                userId,
                courseId: incCourse.id,
                sourceType: 'package',
                sourceId: packageId,
                expiresAt: null
            }, { transaction });
        }

        return true;
    }

    /**
     * Grant access via a Subscription (grants subscription + all included courses with duration)
     */
    static async grantSubscriptionAccess({ userId, subscriptionId, durationDays = null, orderId = null }, options = {}) {
        const { transaction } = options;
        const sub = await Subscriptions.findByPk(subscriptionId, {
            include: [{ model: Courses, as: 'includedCourses' }],
            transaction
        });

        if (!sub) throw new Error('Subscription not found');

        const days = durationDays || sub.durationDays || (sub.durationMonths ? sub.durationMonths * 30 : 30);
        const startDate = new Date();
        const expiresAt = new Date(startDate.getTime() + days * 86400000);

        // Record UserSubscription
        const userSub = await UserSubscriptions.create({
            userId,
            subscriptionId,
            startDate,
            expiresAt,
            status: 'active',
            orderId
        }, { transaction });

        // Grant access to all courses included in subscription
        const courses = sub.includedCourses || [];
        for (const course of courses) {
            await this.grantCourseAccess({
                userId,
                courseId: course.id,
                sourceType: 'subscription',
                sourceId: subscriptionId,
                expiresAt
            }, { transaction });
        }

        return userSub;
    }

    /**
     * Get active subscription for a user (with dynamic badge details)
     */
    static async getUserActiveSubscription(userId) {
        if (!userId) return null;
        const now = new Date();
        const activeSub = await UserSubscriptions.findOne({
            where: {
                userId,
                status: 'active',
                expiresAt: { [Op.gt]: now }
            },
            include: [{ model: Subscriptions, as: 'subscription' }],
            order: [['expiresAt', 'DESC']]
        });

        if (!activeSub || !activeSub.subscription) return null;

        return {
            id: activeSub.id,
            subscriptionId: activeSub.subscriptionId,
            name: activeSub.subscription.name,
            badgeLabel: activeSub.subscription.badgeLabel || activeSub.subscription.name,
            badgeIconSvg: activeSub.subscription.badgeIconSvg || null,
            startDate: activeSub.startDate,
            expiresAt: activeSub.expiresAt,
            status: activeSub.status
        };
    }

    /**
     * Detailed inspection of a student's courses and their exact sources
     */
    static async getStudentAccessDetails(userId) {
        await this.syncUserAccess(userId);
        const now = new Date();

        const accesses = await CourseAccess.findAll({
            where: { userId },
            include: [{ model: Courses, as: 'course' }],
            order: [['createdAt', 'DESC']]
        });

        const activeSub = await this.getUserActiveSubscription(userId);

        // Group by courseId
        const courseMap = {};
        for (const a of accesses) {
            if (!a.course) continue;
            const cId = a.courseId;
            if (!courseMap[cId]) {
                courseMap[cId] = {
                    course: a.course,
                    hasActiveAccess: false,
                    sources: []
                };
            }

            const isValid = a.status === 'active' && (!a.expiresAt || new Date(a.expiresAt) > now);
            if (isValid) {
                courseMap[cId].hasActiveAccess = true;
            }

            courseMap[cId].sources.push({
                id: a.id,
                sourceType: a.sourceType,
                sourceId: a.sourceId,
                status: a.status,
                expiresAt: a.expiresAt,
                isValid
            });
        }

        return {
            userId,
            activeSubscription: activeSub,
            accessibleCoursesCount: Object.values(courseMap).filter((c) => c.hasActiveAccess).length,
            courses: Object.values(courseMap)
        };
    }

    /**
     * Centralized authorization and progression gate check (Section 13)
     * Checks enrollment, subscription status, and instructor evaluation gate.
     */
    static async checkCourseProgressAccess(userId, courseId, { targetSessionNumber = null, targetSessionId = null } = {}) {
        if (!userId || !courseId) {
            return { canAccess: false, reason: 'missing_parameters', message: 'اطلاعات کاربری یا دوره نامعتبر است' };
        }

        // 1. Enrollment & Access Check
        const hasAccess = await this.hasCourseAccess(userId, courseId);
        if (!hasAccess) {
            return { canAccess: false, reason: 'no_course_access', message: 'شما دسترسی فعال به این دوره ندارید' };
        }

        const course = await Courses.findByPk(courseId);
        if (!course) {
            return { canAccess: false, reason: 'course_not_found', message: 'دوره یافت نشد' };
        }

        // 2. Instructor Evaluation Gate Check
        // Check CourseEvaluations model as well as Course.evaluationRequired flag
        const { CourseEvaluations, CourseEvaluationResponses } = await import('../models/index.js');
        const evaluation = await CourseEvaluations.findOne({
            where: { courseId, isEnabled: true }
        });

        const isEvaluationRequired = Boolean(course.evaluationRequired || (evaluation && evaluation.isEnabled));
        const triggerSession = evaluation?.triggerSessionNumber || course.evaluationTriggerSession || 4;

        let evaluationCompleted = false;
        if (isEvaluationRequired) {
            const response = await CourseEvaluationResponses.findOne({
                where: { courseId, userId }
            });
            evaluationCompleted = !!response;

            // If evaluation is required, incomplete, and student is attempting to access triggerSession or beyond
            if (!evaluationCompleted && targetSessionNumber !== null && targetSessionNumber >= triggerSession) {
                return {
                    canAccess: false,
                    reason: 'evaluation_required',
                    triggerSessionNumber: triggerSession,
                    evaluationRequired: true,
                    evaluationCompleted: false,
                    message: `برای مشاهده جلسه ${targetSessionNumber} و جلسات بعدی، ابتدا باید فرم ارزیابی مدرس را تکمیل فرمایید.`
                };
            }
        }

        return {
            canAccess: true,
            isEvaluationRequired,
            evaluationCompleted,
            triggerSessionNumber: triggerSession
        };
    }
}

