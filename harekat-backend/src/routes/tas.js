import { Router } from 'express';
import TAsController from '../controllers/tasController.js';
import adminAuth from '../middleware/adminAuth.js';
import { superAdminOnly, adminOrTa } from '../middleware/rbac.js';

const router = Router();

// Current admin/TA profile with assigned courses
router.get('/me', adminAuth, adminOrTa, TAsController.getMyProfile);

// Super Admin TA management
router.get('/', adminAuth, superAdminOnly, TAsController.listTAs);
router.post('/', adminAuth, superAdminOnly, TAsController.createTA);
router.put('/:id', adminAuth, superAdminOnly, TAsController.updateTA);
router.delete('/:id', adminAuth, superAdminOnly, TAsController.deleteTA);

export default router;
