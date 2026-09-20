import { Router } from 'express';
import AdminsController from '../controllers/adminsController.js';
import adminAuth from '../middleware/adminAuth.js';
import { superAdminOnly } from '../middleware/rbac.js';

const router = Router();

router.post('/auth', AdminsController.authAdmin);
router.post('/register', adminAuth, superAdminOnly, AdminsController.registerAdmin);
router.post('/', adminAuth, superAdminOnly, AdminsController.createAdmin);
router.get('/:id', adminAuth, AdminsController.getAdminById);
router.put('/:id', adminAuth, AdminsController.updateAdmin);
router.delete('/:id', adminAuth, superAdminOnly, AdminsController.deleteAdmin);

export default router;
