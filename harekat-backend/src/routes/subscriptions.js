import { Router } from 'express';
import SubscriptionsController from '../controllers/subscriptionsController.js';
import { auth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/ownerCheck.js';

const router = Router();

router.post('/', auth, adminOnly, SubscriptionsController.createSubscription);
// Public storefront reads (no auth) so the landing page loads without login.
router.get('/', SubscriptionsController.getSubscriptions);
router.get('/:id', SubscriptionsController.getSubscriptionById);
router.put('/:id', auth, adminOnly, SubscriptionsController.updateSubscription);
router.delete('/:id', auth, adminOnly, SubscriptionsController.deleteSubscription);

export default router;