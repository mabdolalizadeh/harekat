import { Router } from 'express';
import AssignmentsController from '../controllers/assignmentsController.js';
import { auth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { adminOrTa, checkTaCourseAccess, checkTaAssignmentAccess } from '../middleware/rbac.js';

const router = Router();

// Student endpoints
router.get('/course/:courseId/student', auth, AssignmentsController.getAssignmentsForStudent);
router.get('/course/:courseId/my', auth, AssignmentsController.getAssignmentsForStudent);
router.get('/:id', auth, AssignmentsController.getAssignmentForStudent);
router.post('/:id/submit', auth, AssignmentsController.submitAssignment);

// Admin & TA endpoints
router.get('/course/:courseId/admin', adminAuth, adminOrTa, checkTaCourseAccess((req) => req.params.courseId), AssignmentsController.listAssignmentsForCourse);
router.get('/course/:courseId', adminAuth, adminOrTa, checkTaCourseAccess((req) => req.params.courseId), AssignmentsController.listAssignmentsForCourse);
router.post('/course/:courseId', adminAuth, adminOrTa, checkTaCourseAccess((req) => req.params.courseId), AssignmentsController.createAssignment);
router.put('/:id', adminAuth, adminOrTa, checkTaAssignmentAccess(), AssignmentsController.updateAssignment);
router.delete('/:id', adminAuth, adminOrTa, checkTaAssignmentAccess(), AssignmentsController.deleteAssignment);

// Submissions & Grading
router.get('/:id/submissions', adminAuth, adminOrTa, checkTaAssignmentAccess(), AssignmentsController.listSubmissions);
router.post('/submissions/:submissionId/grade', adminAuth, adminOrTa, AssignmentsController.gradeSubmission);

export default router;
