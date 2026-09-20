import { Sessions, Courses, Exams, ExamResults, Licenses, UserLessonProgress, Users } from '../models/index.js';
import { AccessService } from '../services/accessService.js';
import { logSecurityEvent } from '../utils/logger.js';

export default class SessionsController {
    /**
     * Student view of course sessions (Enforces course access + Porsline from Session 4 + Exam on final session)
     */
    static async getCourseSessionsStudent(req, res) {
        const userId = req.user?.id;
        const { courseId } = req.params;

        if (!userId) {
            return res.status(401).json({ ok: false, message: 'authentication required' });
        }

        // 1. Verify student has valid course access
        const hasAccess = await AccessService.hasCourseAccess(userId, courseId);
        if (!hasAccess) {
            logSecurityEvent('unauthorized_course_sessions_view', { userId, courseId, ip: req.ip });
            return res.status(403).json({
                ok: false,
                message: 'شما دسترسی فعال به این دوره ندارید'
            });
        }

        try {
            const course = await Courses.findByPk(courseId);
            if (!course) {
                return res.status(404).json({ ok: false, message: 'course not found' });
            }

            const sessions = await Sessions.findAll({
                where: { courseId },
                order: [['sessionNumber', 'ASC'], ['sortOrder', 'ASC']]
            });

            // Fetch student progress for all sessions of this course
            const progressList = await UserLessonProgress.findAll({
                where: { userId, courseId }
            });
            const progressMap = new Map();
            progressList.forEach(p => progressMap.set(p.sessionId, p));

            // Check if final exam exists and if student has taken it
            const exam = await Exams.findOne({ where: { courseId, status: 'published' } });
            let examStatus = null;
            let license = null;

            if (exam) {
                const examResult = await ExamResults.findOne({
                    where: { examId: exam.id, userId }
                });
                examStatus = {
                    id: exam.id,
                    title: exam.title,
                    description: exam.description,
                    minPassingScore: exam.minPassingScore,
                    maxScore: exam.maxScore,
                    hasTaken: !!examResult,
                    score: examResult?.published ? examResult.score : null,
                    resultPublished: examResult?.published || false,
                    passed: examResult?.published ? (examResult.score >= exam.minPassingScore) : false,
                    status: examResult?.status || 'pending'
                };

                if (examResult?.published && examResult.score >= exam.minPassingScore) {
                    license = await Licenses.findOne({
                        where: { courseId, userId, status: 'available' }
                    });
                }
            }

            // Server-side enforcement:
            // Porsline only available from session 4 onwards
            const sanitizedSessions = sessions.map((s, index) => {
                const sessionNum = s.sessionNumber || (index + 1);
                const isPorslineAvailable = sessionNum >= 4 && !!s.porslineLink;
                const isFinalSession = s.isFinal || index === sessions.length - 1;
                const userProg = progressMap.get(s.id);

                return {
                    id: s.id,
                    courseId: s.courseId,
                    sessionNumber: sessionNum,
                    title: s.title,
                    description: s.description,
                    sessionLink: s.sessionLink || null,
                    videoLink: s.videoLink || null,
                    googleDriveLink: s.googleDriveLink || null,
                    groupLink: s.groupLink || null,
                    // Redact porslineLink if session < 4
                    porslineLink: isPorslineAvailable ? s.porslineLink : null,
                    porslineAvailable: isPorslineAvailable,
                    porslineRule: sessionNum < 4 ? 'پرس‌لاین از جلسه ۴ به بعد فعال می‌شود' : null,
                    isFinal: isFinalSession,
                    sortOrder: s.sortOrder,
                    isCompleted: userProg ? !!userProg.isCompleted : false,
                    progressPercent: userProg ? (userProg.progressPercent || 0) : 0,
                    lastWatchedAt: userProg ? userProg.lastWatchedAt : null
                };
            });

            const totalSessions = sanitizedSessions.length;
            const completedSessions = sanitizedSessions.filter(s => s.isCompleted).length;
            const completionPercentage = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

            return res.status(200).json({
                ok: true,
                data: {
                    course: {
                        id: course.id,
                        name: course.name,
                        description: course.description,
                        image: course.image,
                        duration: course.duration,
                        typeOfAttendence: course.typeOfAttendence,
                        level: course.level,
                        videoUrl: course.videoUrl,
                        longDescription: course.longDescription
                    },
                    sessions: sanitizedSessions,
                    stats: {
                        totalSessions,
                        completedSessions,
                        completionPercentage
                    },
                    exam: examStatus,
                    license: license ? {
                        id: license.id,
                        licenseNumber: license.licenseNumber,
                        issueDate: license.issueDate,
                        status: license.status,
                        certificateUrl: license.certificateUrl || null
                    } : null
                }
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Student: update progress / toggle completion for a session
     */
    static async updateLessonProgress(req, res) {
        const userId = req.user?.id;
        const { sessionId } = req.params;
        const { isCompleted, progressPercent } = req.body;

        if (!userId) {
            return res.status(401).json({ ok: false, message: 'authentication required' });
        }

        try {
            const session = await Sessions.findByPk(sessionId);
            if (!session) {
                return res.status(404).json({ ok: false, message: 'session not found' });
            }

            // Verify student has access to the course of this session
            const hasAccess = await AccessService.hasCourseAccess(userId, session.courseId);
            if (!hasAccess) {
                logSecurityEvent('unauthorized_session_progress_update', { userId, sessionId, courseId: session.courseId, ip: req.ip });
                return res.status(403).json({ ok: false, message: 'شما دسترسی به این دوره ندارید' });
            }

            let [progress, created] = await UserLessonProgress.findOrCreate({
                where: { userId, sessionId: session.id },
                defaults: {
                    userId,
                    courseId: session.courseId,
                    sessionId: session.id,
                    isCompleted: isCompleted !== undefined ? !!isCompleted : false,
                    progressPercent: progressPercent !== undefined ? Math.min(100, Math.max(0, Number(progressPercent))) : 0,
                    lastWatchedAt: new Date()
                }
            });

            if (!created) {
                if (isCompleted !== undefined) {
                    progress.isCompleted = !!isCompleted;
                }
                if (progressPercent !== undefined) {
                    progress.progressPercent = Math.min(100, Math.max(0, Number(progressPercent)));
                }
                progress.lastWatchedAt = new Date();
                await progress.save();
            }

            return res.status(200).json({
                ok: true,
                data: progress
            });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }


    /**
     * Admin/TA view: all sessions for a course
     */
    static async getCourseSessionsAdmin(req, res) {
        const { courseId } = req.params;
        try {
            const sessions = await Sessions.findAll({
                where: { courseId },
                order: [['sessionNumber', 'ASC'], ['sortOrder', 'ASC']]
            });
            return res.status(200).json({ ok: true, data: sessions });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Create a new session (Admin or assigned TA)
     */
    static async createSession(req, res) {
        const { courseId } = req.params;
        const {
            sessionNumber,
            title,
            description,
            sessionLink,
            videoLink,
            googleDriveLink,
            groupLink,
            porslineLink,
            isFinal,
            sortOrder
        } = req.body;

        if (!title?.trim()) {
            return res.status(400).json({ ok: false, message: 'عنوان جلسه الزامی است' });
        }

        try {
            const course = await Courses.findByPk(courseId);
            if (!course) {
                return res.status(404).json({ ok: false, message: 'course not found' });
            }

            const existingCount = await Sessions.count({ where: { courseId } });
            const sNum = Number(sessionNumber) || (existingCount + 1);

            const session = await Sessions.create({
                courseId,
                sessionNumber: sNum,
                title: title.trim(),
                description: description?.trim() || null,
                sessionLink: sessionLink?.trim() || null,
                videoLink: videoLink?.trim() || null,
                googleDriveLink: googleDriveLink?.trim() || null,
                groupLink: groupLink?.trim() || null,
                porslineLink: porslineLink?.trim() || null,
                isFinal: !!isFinal,
                sortOrder: Number(sortOrder) || 0
            });

            return res.status(201).json({ ok: true, data: session });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Update an existing session
     */
    static async updateSession(req, res) {
        const { id } = req.params;
        try {
            const session = await Sessions.findByPk(id);
            if (!session) {
                return res.status(404).json({ ok: false, message: 'session not found' });
            }

            const {
                sessionNumber,
                title,
                description,
                sessionLink,
                videoLink,
                googleDriveLink,
                groupLink,
                porslineLink,
                isFinal,
                sortOrder
            } = req.body;

            if (sessionNumber !== undefined) session.sessionNumber = Number(sessionNumber);
            if (title !== undefined) session.title = title.trim();
            if (description !== undefined) session.description = description?.trim() || null;
            if (sessionLink !== undefined) session.sessionLink = sessionLink?.trim() || null;
            if (videoLink !== undefined) session.videoLink = videoLink?.trim() || null;
            if (googleDriveLink !== undefined) session.googleDriveLink = googleDriveLink?.trim() || null;
            if (groupLink !== undefined) session.groupLink = groupLink?.trim() || null;
            if (porslineLink !== undefined) session.porslineLink = porslineLink?.trim() || null;
            if (isFinal !== undefined) session.isFinal = !!isFinal;
            if (sortOrder !== undefined) session.sortOrder = Number(sortOrder) || 0;

            await session.save();
            return res.status(200).json({ ok: true, data: session });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }

    /**
     * Delete a session
     */
    static async deleteSession(req, res) {
        const { id } = req.params;
        try {
            const session = await Sessions.findByPk(id);
            if (!session) {
                return res.status(404).json({ ok: false, message: 'session not found' });
            }
            await session.destroy();
            return res.status(200).json({ ok: true, message: 'session deleted' });
        } catch (err) {
            return res.status(500).json({ ok: false, message: err.message });
        }
    }
}
