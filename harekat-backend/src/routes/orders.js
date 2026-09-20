import { Router } from 'express';
import OrdersController from '../controllers/ordersController.js';
import { auth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { superAdminOnly } from '../middleware/rbac.js';

const router = Router();

router.post('/', auth, OrdersController.createOrder);
router.get('/', auth, OrdersController.getOrders);
router.get('/:id', auth, OrdersController.getOrderById);
router.put('/:id/status', adminAuth, superAdminOnly, OrdersController.updateOrderStatus);

export default router;