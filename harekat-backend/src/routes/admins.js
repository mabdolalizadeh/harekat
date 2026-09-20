import { Router } from 'express';
import AdminsController from '../controllers/adminsController.js';
import adminAuth from '../middleware/adminAuth.js';
import { superAdminOnly } from '../middleware/rbac.js';

const router = Router();

// Authentication endpoints (public)
router.post('/auth', AdminsController.authAdmin);
router.post('/auth/challenge', AdminsController.getAuthChallenge);
router.post('/auth/rsa-login', AdminsController.authAdminWithRsaKey);
router.post('/auth/rsa-direct-login', AdminsController.authAdminWithRsaDirectKey);

// Super admin & admin creation
// Note: createSuperAdmin handles bootstrap phase if 0 superadmins exist, otherwise enforces superAdminOnly
router.post('/create-superadmin', AdminsController.createSuperAdmin);
router.post('/register', adminAuth, superAdminOnly, AdminsController.registerAdmin);
router.post('/', adminAuth, superAdminOnly, AdminsController.createAdmin);

// Admins listing (superAdminOnly)
router.get('/', adminAuth, superAdminOnly, AdminsController.listAdmins);

// RSA Key generation for admin
router.post('/:id/generate-key', adminAuth, AdminsController.generateKeyForAdmin);

// Individual admin management
router.get('/:id', adminAuth, AdminsController.getAdminById);
router.put('/:id', adminAuth, AdminsController.updateAdmin);
router.delete('/:id', adminAuth, superAdminOnly, AdminsController.deleteAdmin);

export default router;
