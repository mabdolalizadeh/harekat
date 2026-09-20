import { Router } from 'express';
import QuizzesController from '../controllers/quizzesController.js';
import { auth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { adminOrTa, checkTaCourseAccess, checkTaQuizAccess } from '../middleware/rbac.js';

const router = Router();

// Student endpoints
router.get('/course/:courseId/student', auth, QuizzesController.getQuizzesForStudent);
router.get('/course/:courseId/my', auth, QuizzesController.getQuizzesForStudent);
router.get('/:id/take', auth, QuizzesController.getQuizForAttempt);
router.get('/:id', auth, QuizzesController.getQuizForAttempt);
router.post('/:id/submit', auth, QuizzesController.submitQuiz);

// Admin & TA endpoints
router.get('/course/:courseId/admin', adminAuth, adminOrTa, checkTaCourseAccess((req) => req.params.courseId), QuizzesController.listQuizzesForCourse);
router.get('/course/:courseId', adminAuth, adminOrTa, checkTaCourseAccess((req) => req.params.courseId), QuizzesController.listQuizzesForCourse);
router.post('/course/:courseId', adminAuth, adminOrTa, checkTaCourseAccess((req) => req.params.courseId), QuizzesController.createQuiz);
router.put('/:id', adminAuth, adminOrTa, checkTaQuizAccess(), QuizzesController.updateQuiz);
router.delete('/:id', adminAuth, adminOrTa, checkTaQuizAccess(), QuizzesController.deleteQuiz);
router.get('/:id/attempts', adminAuth, adminOrTa, checkTaQuizAccess(), QuizzesController.listAttempts);

export default router;
