import { Exams, ExamResults, Licenses, Courses, Sessions, Users } from '../models/index.js';
import { AccessService } from '../services/accessService.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class ExamsController {
    /**
     * Student view of exam (Enforces course access + final session restriction)
     */
    static async getExamForStudent(req, res) {
        const userId = req.user?.id;
        const { courseId } = req.params;

        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        const hasAccess = await AccessService.hasCourseAccess(userId, courseId);
        if (!hasAccess) {
            return res.status(403).json({ ok: false, message: 'شما دسترسی فعال به این دوره ندارید' });
        }

        try {
            const exam = await Exams.findOne({ where: { courseId, status: 'published' } });
            if (!exam) {
                return res.status(404).json({ ok: false, message: 'آزمونی برای این دوره تعریف نشده است' });
            }

            // Verify final session rule:
            // Course must have sessions, and student can only access exam if course is active
            const sessionCount = await Sessions.count({ where: { courseId } });
            // If sessions exist, ensure exam is available
            const finalSession = await Sessions.findOne({
                where: { courseId, isFinal: true }
            });

            // Fetch student's result if already submitted
            const result = await ExamResults.findOne({
                where: { examId: exam.id, userId }
            });

            return res.status(200).json({
                ok: true,
                data: {
                    exam: {
                        id: exam.id,
                        courseId: exam.courseId,
                        title: exam.title,
                        description: exam.description,
                        examUrl: exam.examUrl,
                        minPassingScore: exam.minPassingScore,
                        maxScore: exam.maxScore
                    },
                    result: result ? {
                        id: result.id,
                        status: result.status,
                        score: result.published ? result.score : null,
                        published: result.published,
                        passed: result.published ? (result.score >= exam.minPassingScore) : false
                    } : null
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Student submits exam
     */
    static async submitExam(req, res) {
        const userId = req.user?.id;
        const { courseId } = req.params;

        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        const hasAccess = await AccessService.hasCourseAccess(userId, courseId);
        if (!hasAccess) {
            return res.status(403).json({ ok: false, message: 'دسترسی به این دوره مجاز نیست' });
        }

        try {
            const exam = await Exams.findOne({ where: { courseId, status: 'published' } });
            if (!exam) return res.status(404).json({ ok: false, message: 'آزمون یافت نشد' });

            let result = await ExamResults.findOne({ where: { examId: exam.id, userId } });
            if (result) {
                result.status = 'completed';
                await result.save();
            } else {
                result = await ExamResults.create({
                    examId: exam.id,
                    courseId,
                    userId,
                    status: 'completed',
                    published: false
                });
            }

            logSecurityEvent('exam_submitted', { userId, examId: exam.id, courseId });
            return res.status(200).json({
                ok: true,
                message: 'آزمون با موفقیت ثبت شد و در انتظار تصحیح مدرس/مدیر است',
                data: result
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: List exam submissions for a course
     */
    static async listSubmissions(req, res) {
        const { courseId } = req.params;
        try {
            const submissions = await ExamResults.findAll({
                where: { courseId },
                include: [
                    { model: Users, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phoneNumber'] },
                    { model: Exams, as: 'exam', attributes: ['id', 'title', 'minPassingScore', 'maxScore'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            return res.status(200).json({ ok: true, data: submissions });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: Grade and publish exam score (Triggers License creation if passed)
     */
    static async gradeSubmission(req, res) {
        const { id } = req.params; // ExamResult id
        const { score, published = true } = req.body;

        const numScore = Number(score);
        if (!Number.isFinite(numScore) || numScore < 0 || numScore > 100) {
            return res.status(400).json({ ok: false, message: 'نمره باید عددی بین ۰ تا ۱۰۰ باشد' });
        }

        try {
            const result = await ExamResults.findByPk(id, {
                include: [{ model: Exams, as: 'exam' }]
            });
            if (!result) return res.status(404).json({ ok: false, message: 'نتیجه آزمون یافت نشد' });

            const passed = numScore >= (result.exam?.minPassingScore || 70);

            result.score = Math.round(numScore);
            result.status = passed ? 'passed' : 'failed';
            result.published = !!published;
            await result.save();

            let license = null;
            // When score is published and passing, automatically issue license
            if (result.published && passed) {
                license = await Licenses.findOne({
                    where: { userId: result.userId, courseId: result.courseId }
                });

                if (!license) {
                    const licenseNumber = `HRK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
                    license = await Licenses.create({
                        licenseNumber,
                        userId: result.userId,
                        courseId: result.courseId,
                        examResultId: result.id,
                        status: 'available',
                        issueDate: new Date()
                    });
                }
            }

            return res.status(200).json({
                ok: true,
                message: 'نمره با موفقیت ثبت و منتشر شد',
                data: { result, license }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin: Create/update exam for a course
     */
    static async upsertExam(req, res) {
        const { courseId } = req.params;
        const { title, description, examUrl, minPassingScore, maxScore, status } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({ ok: false, message: 'عنوان آزمون الزامی است' });
        }

        try {
            let exam = await Exams.findOne({ where: { courseId } });
            if (exam) {
                exam.title = title.trim();
                if (description !== undefined) exam.description = description?.trim() || null;
                if (examUrl !== undefined) exam.examUrl = examUrl?.trim() || null;
                if (minPassingScore !== undefined) exam.minPassingScore = Number(minPassingScore) || 70;
                if (maxScore !== undefined) exam.maxScore = Number(maxScore) || 100;
                if (status !== undefined) exam.status = status;
                await exam.save();
            } else {
                exam = await Exams.create({
                    courseId,
                    title: title.trim(),
                    description: description?.trim() || null,
                    examUrl: examUrl?.trim() || null,
                    minPassingScore: Number(minPassingScore) || 70,
                    maxScore: Number(maxScore) || 100,
                    status: status || 'published'
                });
            }

            return res.status(200).json({ ok: true, data: exam });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
