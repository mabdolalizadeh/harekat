import { Router } from 'express';
import TeachersController from '../controllers/teachersController.js';
import { auth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/ownerCheck.js';

const router = Router();

router.post('/', auth, adminOnly, TeachersController.createTeacher);
// Public storefront reads (no auth).
router.get('/', TeachersController.getTeachers);
router.get('/:id', TeachersController.getTeacherById);
router.put('/:id', auth, adminOnly, TeachersController.updateTeacher);
router.delete('/:id', auth, adminOnly, TeachersController.deleteTeacher);

export default router;
