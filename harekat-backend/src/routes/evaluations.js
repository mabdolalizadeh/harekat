import { Router } from 'express';
import EvaluationsController from '../controllers/evaluationsController.js';
import { auth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { adminOrTa, checkTaCourseAccess } from '../middleware/rbac.js';

const router = Router();

// Student endpoints
router.get('/course/:courseId/student', auth, EvaluationsController.getEvaluationForStudent);
router.get('/course/:courseId/my', auth, EvaluationsController.getEvaluationForStudent);
router.post('/course/:courseId/submit', auth, EvaluationsController.submitEvaluation);

// Admin & TA endpoints
router.get('/course/:courseId/summary', adminAuth, adminOrTa, checkTaCourseAccess((req) => req.params.courseId), EvaluationsController.getEvaluationAdmin);
router.get('/course/:courseId/admin', adminAuth, adminOrTa, checkTaCourseAccess((req) => req.params.courseId), EvaluationsController.getEvaluationAdmin);
router.put('/course/:courseId/config', adminAuth, adminOrTa, checkTaCourseAccess((req) => req.params.courseId), EvaluationsController.updateEvaluationAdmin);
router.put('/course/:courseId', adminAuth, adminOrTa, checkTaCourseAccess((req) => req.params.courseId), EvaluationsController.updateEvaluationAdmin);

export default router;
