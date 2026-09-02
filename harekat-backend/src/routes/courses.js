import { Router } from 'express';
import CoursesController from '../controllers/coursesController.js';
import auth from '../middleware/auth.js';
import { adminOnly } from '../middleware/ownerCheck.js';

const router = Router();

router.post('/', auth, adminOnly, CoursesController.createCourse);
router.get('/', auth, CoursesController.getCourses);
router.get('/:id', auth, CoursesController.getCourseById);
router.put('/:id', auth, adminOnly, CoursesController.updateCourse);
router.delete('/:id', auth, adminOnly, CoursesController.deleteCourse);

export default router;
