import { Router } from 'express';
import AccessController from '../controllers/accessController.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { superAdminOnly } from '../middleware/rbac.js';

const router = Router();

// Student routes
router.get('/my-courses', auth, AccessController.getMyAccessibleCourses);
router.get('/recommended', optionalAuth, AccessController.getRecommendedCourse);

// Super Admin access management routes
router.post('/recommended', adminAuth, superAdminOnly, AccessController.setRecommendedCourse);
router.get('/student/:userId', adminAuth, superAdminOnly, AccessController.inspectStudentAccess);
router.post('/grant', adminAuth, superAdminOnly, AccessController.grantAccess);
router.post('/revoke', adminAuth, superAdminOnly, AccessController.revokeAccess);

export default router;
