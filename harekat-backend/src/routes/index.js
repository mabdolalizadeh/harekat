import { Router } from 'express';
import usersRouter from './users.js';
import coursesRouter from './courses.js';
import teachersRouter from './teachers.js';
import paymentsRouter from './payments.js';
import categoriesRouter from './categories.js';
import adminsRouter from './admins.js';
import authRouter from './auth.js';
import couponsRouter from './coupons.js';
import cmsRouter from './cms.js';
import subscriptionsRouter from './subscriptions.js';
import cartRouter from './cart.js';
import ordersRouter from './orders.js';
import bannersRouter from './banners.js';

const router = Router();

router.use('/users', usersRouter);
router.use('/courses', coursesRouter);
router.use('/teachers', teachersRouter);
router.use('/payments', paymentsRouter);
router.use('/categories', categoriesRouter);
router.use('/admins', adminsRouter);
router.use('/auth', authRouter);
router.use('/coupons', couponsRouter);
router.use('/cms', cmsRouter);
router.use('/subscriptions', subscriptionsRouter);
router.use('/cart', cartRouter);
router.use('/orders', ordersRouter);
router.use('/banners', bannersRouter);

export default router;
