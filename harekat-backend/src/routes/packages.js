import { Router } from 'express';
import PackagesController from '../controllers/packagesController.js';
import { auth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { superAdminOnly, adminOrTa } from '../middleware/rbac.js';

const router = Router();

// Public & Student routes
router.get('/', PackagesController.listPackages);
router.get('/my', auth, PackagesController.getMyPackages);

// Admin routes
router.get('/admin', adminAuth, adminOrTa, PackagesController.listPackagesAdmin);
router.post('/', adminAuth, superAdminOnly, PackagesController.createPackage);
router.put('/:id', adminAuth, superAdminOnly, PackagesController.updatePackage);
router.delete('/:id', adminAuth, superAdminOnly, PackagesController.deletePackage);

export default router;
