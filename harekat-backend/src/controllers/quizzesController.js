import { Quizzes, QuizAttempts, Courses, Users, Sessions } from '../models/index.js';
import { AccessService } from '../services/accessService.js';
import { logSecurityEvent } from '../utils/logger.js';

function parseQuestions(raw) {
    try {
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string') return JSON.parse(raw);
        return [];
    } catch {
        return [];
    }
}

export default class QuizzesController {
    /**
     * Student: List quizzes for enrolled course
     */
    static async getQuizzesForStudent(req, res) {
        const userId = req.user?.id;
        const { courseId } = req.params;

        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        const hasAccess = await AccessService.hasCourseAccess(userId, courseId);
        if (!hasAccess) {
            return res.status(403).json({ ok: false, message: 'شما دسترسی فعال به این دوره ندارید' });
        }

        try {
            const quizzes = await Quizzes.findAll({
                where: { courseId, status: 'published' },
                include: [
                    {
                        model: QuizAttempts,
                        as: 'attempts',
                        where: { userId },
                        required: false
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            const data = quizzes.map((q) => {
                const myAttempts = q.attempts || [];
                const latestAttempt = myAttempts[myAttempts.length - 1] || null;
                const questions = parseQuestions(q.questions);

                return {
                    id: q.id,
                    courseId: q.courseId,
                    sessionId: q.sessionId,
                    title: q.title,
                    description: q.description,
                    timeLimitMinutes: q.timeLimitMinutes,
                    passingScore: q.passingScore,
                    maxScore: q.maxScore,
                    questionsCount: questions.length,
                    totalAttempts: myAttempts.length,
                    latestAttempt: latestAttempt ? {
                        id: latestAttempt.id,
                        score: latestAttempt.score,
                        passed: latestAttempt.passed,
                        status: latestAttempt.status,
                        completedAt: latestAttempt.completedAt
                    } : null
                };
            });

            return res.status(200).json({ ok: true, data });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Student: Get single quiz to attempt (correct answer keys hidden server-side!)
     */
    static async getQuizForAttempt(req, res) {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        try {
            const quiz = await Quizzes.findByPk(id);
            if (!quiz || quiz.status !== 'published') {
                return res.status(404).json({ ok: false, message: 'آزمونک یافت نشد یا در دسترس نیست' });
            }

            const hasAccess = await AccessService.hasCourseAccess(userId, quiz.courseId);
            if (!hasAccess) {
                return res.status(403).json({ ok: false, message: 'شما به این دوره دسترسی ندارید' });
            }

            const rawQuestions = parseQuestions(quiz.questions);
            // Hide correct answers from student payload
            const sanitizedQuestions = rawQuestions.map((q, idx) => ({
                id: q.id || `q_${idx}`,
                question: q.question,
                options: q.options || [],
                score: q.score || 1
            }));

            return res.status(200).json({
                ok: true,
                data: {
                    id: quiz.id,
                    courseId: quiz.courseId,
                    title: quiz.title,
                    description: quiz.description,
                    timeLimitMinutes: quiz.timeLimitMinutes,
                    passingScore: quiz.passingScore,
                    maxScore: quiz.maxScore,
                    questions: sanitizedQuestions
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Student: Submit quiz answers & auto-grade server-side
     */
    static async submitQuiz(req, res) {
        const userId = req.user?.id;
        const { id } = req.params; // quizId
        const { answers } = req.body; // { [questionId or index]: selectedOptionIndex }

        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        try {
            const quiz = await Quizzes.findByPk(id);
            if (!quiz || quiz.status !== 'published') {
                return res.status(404).json({ ok: false, message: 'آزمونک یافت نشد' });
            }

            const hasAccess = await AccessService.hasCourseAccess(userId, quiz.courseId);
            if (!hasAccess) {
                return res.status(403).json({ ok: false, message: 'دسترسی غیرمجاز' });
            }

            const questions = parseQuestions(quiz.questions);
            let earnedScore = 0;
            let totalPossibleScore = 0;

            const submittedAnswers = answers || {};

            questions.forEach((q, idx) => {
                const qId = q.id || `q_${idx}`;
                const qScore = Number(q.score) || 1;
                totalPossibleScore += qScore;

                const selected = submittedAnswers[qId] !== undefined ? submittedAnswers[qId] : submittedAnswers[idx];
                if (selected !== undefined && Number(selected) === Number(q.correctAnswerIndex)) {
                    earnedScore += qScore;
                }
            });

            // Normalize score to maxScore scale
            const finalScore = totalPossibleScore > 0
                ? Math.round((earnedScore / totalPossibleScore) * (quiz.maxScore || 100))
                : earnedScore;

            const passed = finalScore >= (quiz.passingScore || 60);

            // Count previous attempts
            const attemptCount = await QuizAttempts.count({ where: { quizId: id, userId } });

            const attempt = await QuizAttempts.create({
                quizId: id,
                courseId: quiz.courseId,
                userId,
                answers: JSON.stringify(submittedAnswers),
                score: finalScore,
                passed,
                status: 'completed',
                attemptNumber: attemptCount + 1,
                completedAt: new Date()
            });

            logSecurityEvent('quiz_submitted', { userId, quizId: id, score: finalScore, passed });
            return res.status(200).json({
                ok: true,
                message: passed ? 'آفرین! آزمونک را با موفقیت پشت سر گذاشتید' : 'آزمونک ثبت شد اما نمره قبولی کسب نشد',
                data: {
                    attemptId: attempt.id,
                    score: finalScore,
                    passed,
                    passingScore: quiz.passingScore,
                    maxScore: quiz.maxScore,
                    attemptNumber: attempt.attemptNumber
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: List quizzes for course
     */
    static async listQuizzesForCourse(req, res) {
        const { courseId } = req.params;
        try {
            const quizzes = await Quizzes.findAll({
                where: { courseId },
                include: [
                    {
                        model: QuizAttempts,
                        as: 'attempts',
                        attributes: ['id', 'score', 'passed']
                    },
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['id', 'title', 'sessionNumber']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            const data = quizzes.map(q => {
                const attempts = q.attempts || [];
                const passedCount = attempts.filter(a => a.passed).length;
                return {
                    id: q.id,
                    courseId: q.courseId,
                    sessionId: q.sessionId,
                    session: q.session,
                    title: q.title,
                    description: q.description,
                    timeLimitMinutes: q.timeLimitMinutes,
                    passingScore: q.passingScore,
                    maxScore: q.maxScore,
                    questions: parseQuestions(q.questions),
                    status: q.status,
                    totalAttempts: attempts.length,
                    passedAttemptsCount: passedCount,
                    createdAt: q.createdAt,
                    updatedAt: q.updatedAt
                };
            });

            return res.status(200).json({ ok: true, data });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: Create quiz
     */
    static async createQuiz(req, res) {
        const { courseId } = req.params;
        const { title, description, sessionId, timeLimitMinutes = 15, passingScore = 60, maxScore = 100, questions = [], status = 'published' } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({ ok: false, message: 'عنوان آزمونک الزامی است' });
        }

        try {
            const quiz = await Quizzes.create({
                courseId,
                sessionId: sessionId || null,
                title: title.trim(),
                description: description?.trim() || null,
                timeLimitMinutes: Number(timeLimitMinutes) || 15,
                passingScore: Number(passingScore) || 60,
                maxScore: Number(maxScore) || 100,
                questions: JSON.stringify(questions || []),
                status: ['draft', 'published', 'archived'].includes(status) ? status : 'published'
            });

            logSecurityEvent('quiz_created', { quizId: quiz.id, courseId, creatorId: req.user?.id });
            return res.status(201).json({ ok: true, message: 'آزمونک با موفقیت ایجاد شد', data: quiz });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: Update quiz
     */
    static async updateQuiz(req, res) {
        const { id } = req.params;
        const { title, description, sessionId, timeLimitMinutes, passingScore, maxScore, questions, status } = req.body;

        try {
            const quiz = req.targetQuiz || await Quizzes.findByPk(id);
            if (!quiz) return res.status(404).json({ ok: false, message: 'آزمونک یافت نشد' });

            if (title !== undefined) quiz.title = title.trim();
            if (description !== undefined) quiz.description = description?.trim() || null;
            if (sessionId !== undefined) quiz.sessionId = sessionId || null;
            if (timeLimitMinutes !== undefined) quiz.timeLimitMinutes = Number(timeLimitMinutes) || 15;
            if (passingScore !== undefined) quiz.passingScore = Number(passingScore) || 60;
            if (maxScore !== undefined) quiz.maxScore = Number(maxScore) || 100;
            if (questions !== undefined) quiz.questions = JSON.stringify(questions || []);
            if (status !== undefined && ['draft', 'published', 'archived'].includes(status)) quiz.status = status;

            await quiz.save();
            return res.status(200).json({ ok: true, message: 'آزمونک با موفقیت بروزرسانی شد', data: quiz });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: Delete quiz
     */
    static async deleteQuiz(req, res) {
        const { id } = req.params;
        try {
            const quiz = req.targetQuiz || await Quizzes.findByPk(id);
            if (!quiz) return res.status(404).json({ ok: false, message: 'آزمونک یافت نشد' });

            await quiz.destroy();
            logSecurityEvent('quiz_deleted', { quizId: id, deleterId: req.user?.id });
            return res.status(200).json({ ok: true, message: 'آزمونک با موفقیت حذف شد' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: List student attempts for a quiz
     */
    static async listAttempts(req, res) {
        const { id } = req.params; // quizId
        try {
            const quiz = req.targetQuiz || await Quizzes.findByPk(id);
            if (!quiz) return res.status(404).json({ ok: false, message: 'آزمونک یافت نشد' });

            const attempts = await QuizAttempts.findAll({
                where: { quizId: id },
                include: [
                    { model: Users, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'avatar'] }
                ],
                order: [['completedAt', 'DESC']]
            });

            return res.status(200).json({
                ok: true,
                data: {
                    quiz: {
                        id: quiz.id,
                        title: quiz.title,
                        passingScore: quiz.passingScore,
                        maxScore: quiz.maxScore
                    },
                    attempts
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
