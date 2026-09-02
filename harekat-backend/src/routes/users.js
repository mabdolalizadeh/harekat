import { Router } from 'express';
import UsersController from '../controllers/usersController.js';
import auth from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { ownerOrAdmin, adminOnly } from '../middleware/ownerCheck.js';

const router = Router();

router.post('/', UsersController.createUser);
router.get('/', adminAuth, adminOnly, UsersController.getUsers);
router.get('/:id', auth, ownerOrAdmin, UsersController.getUserById);
router.put('/:id', auth, ownerOrAdmin, UsersController.updateUser);
router.delete('/:id', auth, ownerOrAdmin, UsersController.deleteUser);

export default router;
