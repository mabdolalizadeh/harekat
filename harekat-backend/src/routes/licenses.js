import { Router } from 'express';
import LicensesController from '../controllers/licensesController.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { superAdminOnly, adminOrTa } from '../middleware/rbac.js';

const router = Router();

// Public verification
router.get('/verify/:licenseNumber', LicensesController.verifyLicense);

// Student routes
router.get('/my', auth, LicensesController.getMyLicenses);
router.get('/:id', optionalAuth, LicensesController.getLicenseById);

// Admin / TA routes
router.get('/', adminAuth, adminOrTa, LicensesController.listAllLicenses);
router.post('/issue', adminAuth, adminOrTa, LicensesController.issueCertificate);
router.put('/:id/status', adminAuth, adminOrTa, LicensesController.updateLicenseStatus);

export default router;
