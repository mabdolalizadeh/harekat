import { Router } from 'express';
import CoursesController from '../controllers/coursesController.js';
import { optionalAuth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { superAdminOnly, adminOrTa } from '../middleware/rbac.js';

const router = Router();

// Storefront & public read (with optional auth to detect if TA is requesting courses in admin)
router.get('/', optionalAuth, CoursesController.getCourses);
router.get('/:id', optionalAuth, CoursesController.getCourseById);

// Admin management
router.post('/', adminAuth, superAdminOnly, CoursesController.createCourse);
router.put('/:id', adminAuth, adminOrTa, CoursesController.updateCourse);
router.delete('/:id', adminAuth, superAdminOnly, CoursesController.deleteCourse);

export default router;
