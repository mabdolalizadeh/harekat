import { Router } from 'express';
import usersRouter from './users.js';
import coursesRouter from './courses.js';
import teachersRouter from './teachers.js';
import paymentsRouter from './payments.js';
import categoriesRouter from './categories.js';
import adminsRouter from './admins.js';
import authRouter from './auth.js';

const router = Router();

router.use('/users', usersRouter);
router.use('/courses', coursesRouter);
router.use('/teachers', teachersRouter);
router.use('/payments', paymentsRouter);
router.use('/categories', categoriesRouter);
router.use('/admins', adminsRouter);
router.use('/auth', authRouter);

export default router;
