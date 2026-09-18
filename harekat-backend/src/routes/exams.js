import { Router } from 'express';
import ExamsController from '../controllers/examsController.js';
import { auth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { adminOrTa, checkTaCourseAccess } from '../middleware/rbac.js';

const router = Router();

// Student routes
router.get('/course/:courseId/student', auth, ExamsController.getExamForStudent);
router.post('/course/:courseId/submit', auth, ExamsController.submitExam);

// Admin/TA routes
router.get('/course/:courseId/submissions', adminAuth, adminOrTa, checkTaCourseAccess((req) => req.params.courseId), ExamsController.listSubmissions);
router.post('/submissions/:id/grade', adminAuth, adminOrTa, ExamsController.gradeSubmission);
router.put('/course/:courseId', adminAuth, adminOrTa, checkTaCourseAccess((req) => req.params.courseId), ExamsController.upsertExam);

export default router;
