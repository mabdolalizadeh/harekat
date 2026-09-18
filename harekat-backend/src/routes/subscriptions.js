import { Router } from 'express';
import SubscriptionsController from '../controllers/subscriptionsController.js';
import { auth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { superAdminOnly } from '../middleware/rbac.js';

const router = Router();

// Student: get active subscription & dynamic badge
router.get('/my', auth, SubscriptionsController.getMySubscription);

// Public storefront reads
router.get('/', SubscriptionsController.getSubscriptions);
router.get('/:id', SubscriptionsController.getSubscriptionById);

// Admin management
router.post('/', adminAuth, superAdminOnly, SubscriptionsController.createSubscription);
router.put('/:id', adminAuth, superAdminOnly, SubscriptionsController.updateSubscription);
router.delete('/:id', adminAuth, superAdminOnly, SubscriptionsController.deleteSubscription);

export default router;