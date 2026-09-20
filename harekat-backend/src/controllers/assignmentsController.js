import { Assignments, AssignmentSubmissions, Courses, Users, Admins, Sessions } from '../models/index.js';
import { AccessService } from '../services/accessService.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class AssignmentsController {
    /**
     * Student: List assignments for enrolled course
     */
    static async getAssignmentsForStudent(req, res) {
        const userId = req.user?.id;
        const { courseId } = req.params;

        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        const hasAccess = await AccessService.hasCourseAccess(userId, courseId);
        if (!hasAccess) {
            return res.status(403).json({ ok: false, message: 'شما دسترسی فعال به این دوره ندارید' });
        }

        try {
            const assignments = await Assignments.findAll({
                where: { courseId, status: 'published' },
                include: [
                    {
                        model: AssignmentSubmissions,
                        as: 'submissions',
                        where: { userId },
                        required: false
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            const data = assignments.map((a) => {
                const mySubmission = a.submissions?.[0] || null;
                return {
                    id: a.id,
                    courseId: a.courseId,
                    sessionId: a.sessionId,
                    title: a.title,
                    description: a.description,
                    deadline: a.deadline,
                    maxScore: a.maxScore,
                    attachmentUrl: a.attachmentUrl,
                    status: a.status,
                    mySubmission: mySubmission ? {
                        id: mySubmission.id,
                        submissionText: mySubmission.submissionText,
                        attachmentUrl: mySubmission.attachmentUrl,
                        score: mySubmission.score,
                        feedback: mySubmission.feedback,
                        status: mySubmission.status,
                        submittedAt: mySubmission.submittedAt,
                        gradedAt: mySubmission.gradedAt
                    } : null
                };
            });

            return res.status(200).json({ ok: true, data });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Student: Get single assignment details
     */
    static async getAssignmentForStudent(req, res) {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        try {
            const assignment = await Assignments.findByPk(id, {
                include: [
                    {
                        model: AssignmentSubmissions,
                        as: 'submissions',
                        where: { userId },
                        required: false
                    }
                ]
            });

            if (!assignment || assignment.status !== 'published') {
                return res.status(404).json({ ok: false, message: 'تکلیف یافت نشد' });
            }

            const hasAccess = await AccessService.hasCourseAccess(userId, assignment.courseId);
            if (!hasAccess) {
                return res.status(403).json({ ok: false, message: 'دسترسی غیرمجاز' });
            }

            const mySubmission = assignment.submissions?.[0] || null;
            return res.status(200).json({
                ok: true,
                data: {
                    id: assignment.id,
                    courseId: assignment.courseId,
                    sessionId: assignment.sessionId,
                    title: assignment.title,
                    description: assignment.description,
                    deadline: assignment.deadline,
                    maxScore: assignment.maxScore,
                    attachmentUrl: assignment.attachmentUrl,
                    status: assignment.status,
                    mySubmission: mySubmission ? {
                        id: mySubmission.id,
                        submissionText: mySubmission.submissionText,
                        attachmentUrl: mySubmission.attachmentUrl,
                        score: mySubmission.score,
                        feedback: mySubmission.feedback,
                        status: mySubmission.status,
                        submittedAt: mySubmission.submittedAt,
                        gradedAt: mySubmission.gradedAt
                    } : null
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Student: Submit assignment
     */
    static async submitAssignment(req, res) {
        const userId = req.user?.id;
        const { id } = req.params; // assignmentId
        const { submissionText, attachmentUrl } = req.body;

        if (!userId) return res.status(401).json({ ok: false, message: 'authentication required' });

        if (!submissionText?.trim() && !attachmentUrl?.trim()) {
            return res.status(400).json({ ok: false, message: 'متن پاسخ یا فایل ضمیمه تکلیف الزامی است' });
        }

        try {
            const assignment = await Assignments.findByPk(id);
            if (!assignment || assignment.status !== 'published') {
                return res.status(404).json({ ok: false, message: 'تکلیف یافت نشد یا در دسترس نیست' });
            }

            const hasAccess = await AccessService.hasCourseAccess(userId, assignment.courseId);
            if (!hasAccess) {
                return res.status(403).json({ ok: false, message: 'شما به این دوره دسترسی ندارید' });
            }

            // Create or update submission
            let submission = await AssignmentSubmissions.findOne({
                where: { assignmentId: id, userId }
            });

            if (submission) {
                submission.submissionText = submissionText?.trim() || null;
                submission.attachmentUrl = attachmentUrl?.trim() || null;
                submission.status = 'submitted';
                submission.submittedAt = new Date();
                await submission.save();
            } else {
                submission = await AssignmentSubmissions.create({
                    assignmentId: id,
                    courseId: assignment.courseId,
                    userId,
                    submissionText: submissionText?.trim() || null,
                    attachmentUrl: attachmentUrl?.trim() || null,
                    status: 'submitted',
                    submittedAt: new Date()
                });
            }

            logSecurityEvent('assignment_submitted', { userId, assignmentId: id, courseId: assignment.courseId });
            return res.status(200).json({
                ok: true,
                message: 'پاسخ تکلیف با موفقیت ارسال شد',
                data: submission
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: List assignments for course
     */
    static async listAssignmentsForCourse(req, res) {
        const { courseId } = req.params;
        try {
            const assignments = await Assignments.findAll({
                where: { courseId },
                include: [
                    {
                        model: AssignmentSubmissions,
                        as: 'submissions',
                        attributes: ['id', 'status', 'score']
                    },
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['id', 'title', 'sessionNumber']
                    }
                ],
                order: [['createdAt', 'DESC']]
            });

            const data = assignments.map(a => ({
                id: a.id,
                courseId: a.courseId,
                sessionId: a.sessionId,
                session: a.session,
                title: a.title,
                description: a.description,
                deadline: a.deadline,
                maxScore: a.maxScore,
                attachmentUrl: a.attachmentUrl,
                status: a.status,
                submissionsCount: a.submissions?.length || 0,
                gradedCount: a.submissions?.filter(s => s.status === 'graded').length || 0,
                createdAt: a.createdAt,
                updatedAt: a.updatedAt
            }));

            return res.status(200).json({ ok: true, data });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: Create assignment for course
     */
    static async createAssignment(req, res) {
        const { courseId } = req.params;
        const { title, description, deadline, maxScore = 100, attachmentUrl, sessionId, status = 'published' } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({ ok: false, message: 'عنوان تکلیف الزامی است' });
        }

        try {
            const assignment = await Assignments.create({
                courseId,
                sessionId: sessionId || null,
                title: title.trim(),
                description: description?.trim() || null,
                deadline: deadline ? new Date(deadline) : null,
                maxScore: Number(maxScore) || 100,
                attachmentUrl: attachmentUrl?.trim() || null,
                status: ['draft', 'published', 'archived'].includes(status) ? status : 'published'
            });

            logSecurityEvent('assignment_created', { assignmentId: assignment.id, courseId, creatorId: req.user?.id });
            return res.status(201).json({ ok: true, message: 'تکلیف با موفقیت ایجاد شد', data: assignment });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: Update assignment
     */
    static async updateAssignment(req, res) {
        const { id } = req.params;
        const { title, description, deadline, maxScore, attachmentUrl, sessionId, status } = req.body;

        try {
            const assignment = req.targetAssignment || await Assignments.findByPk(id);
            if (!assignment) return res.status(404).json({ ok: false, message: 'تکلیف یافت نشد' });

            if (title !== undefined) assignment.title = title.trim();
            if (description !== undefined) assignment.description = description?.trim() || null;
            if (deadline !== undefined) assignment.deadline = deadline ? new Date(deadline) : null;
            if (maxScore !== undefined) assignment.maxScore = Number(maxScore) || 100;
            if (attachmentUrl !== undefined) assignment.attachmentUrl = attachmentUrl?.trim() || null;
            if (sessionId !== undefined) assignment.sessionId = sessionId || null;
            if (status !== undefined && ['draft', 'published', 'archived'].includes(status)) assignment.status = status;

            await assignment.save();
            return res.status(200).json({ ok: true, message: 'تکلیف با موفقیت بروزرسانی شد', data: assignment });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: Delete assignment
     */
    static async deleteAssignment(req, res) {
        const { id } = req.params;
        try {
            const assignment = req.targetAssignment || await Assignments.findByPk(id);
            if (!assignment) return res.status(404).json({ ok: false, message: 'تکلیف یافت نشد' });

            await assignment.destroy();
            logSecurityEvent('assignment_deleted', { assignmentId: id, deleterId: req.user?.id });
            return res.status(200).json({ ok: true, message: 'تکلیف با موفقیت حذف شد' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: List submissions for an assignment
     */
    static async listSubmissions(req, res) {
        const { id } = req.params; // assignmentId
        try {
            const assignment = req.targetAssignment || await Assignments.findByPk(id);
            if (!assignment) return res.status(404).json({ ok: false, message: 'تکلیف یافت نشد' });

            const submissions = await AssignmentSubmissions.findAll({
                where: { assignmentId: id },
                include: [
                    { model: Users, as: 'user', attributes: ['id', 'firstName', 'lastName', 'phoneNumber', 'avatar'] },
                    { model: Admins, as: 'grader', attributes: ['id', 'name', 'username'] }
                ],
                order: [['submittedAt', 'DESC']]
            });

            return res.status(200).json({
                ok: true,
                data: {
                    assignment: {
                        id: assignment.id,
                        title: assignment.title,
                        maxScore: assignment.maxScore,
                        deadline: assignment.deadline
                    },
                    submissions
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Admin/TA: Grade assignment submission
     */
    static async gradeSubmission(req, res) {
        const { submissionId } = req.params;
        const { score, feedback } = req.body;
        const graderId = req.user?.id;

        const numScore = Number(score);
        if (!Number.isFinite(numScore) || numScore < 0) {
            return res.status(400).json({ ok: false, message: 'نمره وارد شده نامعتبر است' });
        }

        try {
            const submission = await AssignmentSubmissions.findByPk(submissionId, {
                include: [{ model: Assignments, as: 'assignment' }]
            });
            if (!submission) return res.status(404).json({ ok: false, message: 'ارسال تکلیف یافت نشد' });

            // Verify TA access to course
            if (req.user?.role === 'ta') {
                const { TACourses } = await import('../models/index.js');
                const assignment = await TACourses.findOne({
                    where: { adminId: graderId, courseId: submission.courseId }
                });
                if (!assignment) {
                    return res.status(403).json({ ok: false, message: 'دسترسی تصحیح برای این دوره مجاز نیست' });
                }
            }

            submission.score = Math.round(numScore);
            submission.feedback = feedback?.trim() || null;
            submission.status = 'graded';
            submission.gradedBy = graderId;
            submission.gradedAt = new Date();
            await submission.save();

            logSecurityEvent('assignment_graded', { submissionId, score: submission.score, graderId });
            return res.status(200).json({
                ok: true,
                message: 'نمره و بازخورد با موفقیت ثبت شد',
                data: submission
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
