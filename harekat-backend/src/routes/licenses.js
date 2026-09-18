import { Router } from 'express';
import LicensesController from '../controllers/licensesController.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { superAdminOnly, adminOrTa } from '../middleware/rbac.js';

const router = Router();

// Student routes
router.get('/my', auth, LicensesController.getMyLicenses);
router.get('/:id', optionalAuth, LicensesController.getLicenseById);

// Admin routes
router.get('/', adminAuth, adminOrTa, LicensesController.listAllLicenses);
router.put('/:id/status', adminAuth, superAdminOnly, LicensesController.updateLicenseStatus);

export default router;
