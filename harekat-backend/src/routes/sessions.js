import { Router } from 'express';
import SessionsController from '../controllers/sessionsController.js';
import { auth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { adminOrTa, checkTaCourseAccess, checkTaSessionAccess } from '../middleware/rbac.js';

const router = Router();

// Student: get sessions for an accessible course (enforces course access + Porsline from session 4 + Exam on final session)
router.get('/course/:courseId/student', auth, SessionsController.getCourseSessionsStudent);

// Student: update session progress / completion
router.post('/:sessionId/progress', auth, SessionsController.updateLessonProgress);

// Admin/TA: get sessions for a course (restricted by TA assigned courses)
router.get('/course/:courseId/admin', adminAuth, adminOrTa, checkTaCourseAccess((req) => req.params.courseId), SessionsController.getCourseSessionsAdmin);

// Admin/TA: create session
router.post('/course/:courseId', adminAuth, adminOrTa, checkTaCourseAccess((req) => req.params.courseId), SessionsController.createSession);

// Admin/TA: update session
router.put('/:id', adminAuth, adminOrTa, checkTaSessionAccess(), SessionsController.updateSession);

// Admin/TA: delete session
router.delete('/:id', adminAuth, adminOrTa, checkTaSessionAccess(), SessionsController.deleteSession);

export default router;

