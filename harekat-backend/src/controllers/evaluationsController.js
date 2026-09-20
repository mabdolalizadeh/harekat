import { CourseEvaluations, CourseEvaluationResponses, Courses, Users, Admins, Sessions } from '../models/index.js';
import { AccessService } from '../services/accessService.js';
import { logSecurityEvent } from '../utils/logger.js';

function parseJsonField(val, fallback = []) {
    try {
        if (Array.isArray(val) || (typeof val === 'object' && val !== null)) return val;
        if (typeof val === 'string') return JSON.parse(val);
        return fallback;
    } catch {
        return fallback;
    }
}

export default class EvaluationsController {
    /**
     * Student: Get course evaluation form & check if submitted
     */
    static async getEvaluationForStudent(req, res) {
        const userId = req.user?.id;
        const { courseId } = req.params;

        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        const hasAccess = await AccessService.hasCourseAccess(userId, courseId);
        if (!hasAccess) {
            return res.status(403).json({ ok: false, message: 'شما دسترسی فعال به این دوره ندارید' });
        }

        try {
            const course = await Courses.findByPk(courseId);
            if (!course) return res.status(404).json({ ok: false, message: 'دوره یافت نشد' });

            let evaluation = await CourseEvaluations.findOne({ where: { courseId } });
            if (!evaluation) {
                // Auto-create default evaluation if course exists
                evaluation = await CourseEvaluations.create({
                    courseId,
                    isEnabled: Boolean(course.evaluationRequired),
                    triggerSessionNumber: course.evaluationTriggerSession || 4
                });
            }

            const existingResponse = await CourseEvaluationResponses.findOne({
                where: { courseId, userId }
            });

            return res.status(200).json({
                ok: true,
                data: {
                    evaluation: {
                        id: evaluation.id,
                        courseId: evaluation.courseId,
                        isEnabled: Boolean(evaluation.isEnabled || course.evaluationRequired),
                        title: evaluation.title,
                        description: evaluation.description,
                        triggerSessionNumber: evaluation.triggerSessionNumber || course.evaluationTriggerSession || 4,
                        questions: parseJsonField(evaluation.questions, [])
                    },
                    hasSubmitted: !!existingResponse,
                    submittedAt: existingResponse?.submittedAt || null
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Student: Submit instructor evaluation (Unlocks evaluation gate!)
     */
    static async submitEvaluation(req, res) {
        const userId = req.user?.id;
        const { courseId } = req.params;
        const { ratings, feedbackText } = req.body;

        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        const hasAccess = await AccessService.hasCourseAccess(userId, courseId);
        if (!hasAccess) {
            return res.status(403).json({ ok: false, message: 'شما دسترسی فعال به این دوره ندارید' });
        }

        try {
            let evaluation = await CourseEvaluations.findOne({ where: { courseId } });
            if (!evaluation) {
                evaluation = await CourseEvaluations.create({ courseId, isEnabled: true });
            }

            let response = await CourseEvaluationResponses.findOne({
                where: { courseId, userId }
            });

            if (response) {
                response.ratings = JSON.stringify(ratings || {});
                response.feedbackText = feedbackText?.trim() || null;
                response.submittedAt = new Date();
                await response.save();
            } else {
                response = await CourseEvaluationResponses.create({
                    evaluationId: evaluation.id,
                    courseId,
                    userId,
                    ratings: JSON.stringify(ratings || {}),
                    feedbackText: feedbackText?.trim() || null,
                    submittedAt: new Date()
                });
            }

            logSecurityEvent('instructor_evaluation_submitted', { userId, courseId, evaluationId: evaluation.id });
            return res.status(200).json({
                ok: true,
                message: 'ارزیابی شما با موفقیت ثبت شد. جلسات بعدی دوره بازگشایی شدند.',
                data: {
                    id: response.id,
                    submittedAt: response.submittedAt
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: Get course evaluation configuration and summary statistics
     */
    static async getEvaluationAdmin(req, res) {
        const { courseId } = req.params;
        try {
            const course = await Courses.findByPk(courseId);
            if (!course) return res.status(404).json({ ok: false, message: 'دوره یافت نشد' });

            let evaluation = await CourseEvaluations.findOne({ where: { courseId } });
            if (!evaluation) {
                evaluation = await CourseEvaluations.create({
                    courseId,
                    isEnabled: Boolean(course.evaluationRequired),
                    triggerSessionNumber: course.evaluationTriggerSession || 4
                });
            }

            const responses = await CourseEvaluationResponses.findAll({
                where: { courseId },
                include: [
                    { model: Users, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phoneNumber'] }
                ],
                order: [['submittedAt', 'DESC']]
            });

            // Calculate aggregate statistics
            const questions = parseJsonField(evaluation.questions, []);
            const stats = {};
            let totalNumericScore = 0;
            let totalRatingCount = 0;

            questions.forEach(q => {
                if (q.type === 'rating') {
                    stats[q.id] = { total: 0, count: 0, average: 0 };
                }
            });

            responses.forEach(r => {
                const rRatings = parseJsonField(r.ratings, {});
                Object.entries(rRatings).forEach(([qId, val]) => {
                    const num = Number(val);
                    if (Number.isFinite(num) && stats[qId]) {
                        stats[qId].total += num;
                        stats[qId].count += 1;
                        totalNumericScore += num;
                        totalRatingCount += 1;
                    }
                });
            });

            Object.keys(stats).forEach(qId => {
                if (stats[qId].count > 0) {
                    stats[qId].average = Number((stats[qId].total / stats[qId].count).toFixed(2));
                }
            });

            const overallAverage = totalRatingCount > 0 ? Number((totalNumericScore / totalRatingCount).toFixed(2)) : 0;

            return res.status(200).json({
                ok: true,
                data: {
                    evaluation: {
                        id: evaluation.id,
                        courseId: evaluation.courseId,
                        isEnabled: Boolean(evaluation.isEnabled),
                        title: evaluation.title,
                        description: evaluation.description,
                        triggerSessionNumber: evaluation.triggerSessionNumber,
                        questions
                    },
                    totalResponses: responses.length,
                    overallAverage,
                    questionStats: stats,
                    responses: responses.map(r => ({
                        id: r.id,
                        user: r.user,
                        ratings: parseJsonField(r.ratings, {}),
                        feedbackText: r.feedbackText,
                        submittedAt: r.submittedAt
                    }))
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: Configure course instructor evaluation
     */
    static async updateEvaluationAdmin(req, res) {
        const { courseId } = req.params;
        const { isEnabled, title, description, triggerSessionNumber, questions } = req.body;

        try {
            const course = await Courses.findByPk(courseId);
            if (!course) return res.status(404).json({ ok: false, message: 'دوره یافت نشد' });

            let evaluation = await CourseEvaluations.findOne({ where: { courseId } });
            if (!evaluation) {
                evaluation = await CourseEvaluations.create({ courseId });
            }

            if (isEnabled !== undefined) {
                evaluation.isEnabled = !!isEnabled;
                course.evaluationRequired = !!isEnabled;
                await course.save();
            }
            if (title !== undefined) evaluation.title = title.trim();
            if (description !== undefined) evaluation.description = description?.trim() || null;
            if (triggerSessionNumber !== undefined) {
                evaluation.triggerSessionNumber = Math.max(1, Number(triggerSessionNumber) || 4);
                course.evaluationTriggerSession = evaluation.triggerSessionNumber;
                await course.save();
            }
            if (questions !== undefined) {
                evaluation.questions = JSON.stringify(questions || []);
            }

            await evaluation.save();
            logSecurityEvent('evaluation_updated', { courseId, updaterId: req.user?.id, isEnabled: evaluation.isEnabled });

            return res.status(200).json({
                ok: true,
                message: 'تنظیمات ارزیابی استاد با موفقیت ذخیره شد',
                data: evaluation
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
