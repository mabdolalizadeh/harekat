import { Router } from 'express';
import AdminsController from '../controllers/adminsController.js';
import adminAuth from '../middleware/adminAuth.js';

const router = Router();

router.post('/auth', AdminsController.authAdmin);
router.post('/register', AdminsController.registerAdmin);
router.get('/:id', adminAuth, AdminsController.getAdminById);
router.put('/:id', adminAuth, AdminsController.updateAdmin);
router.delete('/:id', adminAuth, AdminsController.deleteAdmin);

export default router;
