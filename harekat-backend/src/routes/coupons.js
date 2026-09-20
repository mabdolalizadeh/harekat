import { Router } from 'express';
import CouponsController from '../controllers/couponsController.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { adminOnly } from '../middleware/ownerCheck.js';

const router = Router();

// Customer-facing validation: public / optionalAuth so authenticated students/users have access to targeted coupons.
router.post('/validate', optionalAuth, CouponsController.validateCoupon);
router.post('/redeem', auth, CouponsController.redeemCoupon);

// Admin CRUD (protected) — keep after /validate so 'validate' isn't captured by /:id
router.post('/', auth, adminOnly, CouponsController.createCoupon);
router.get('/', auth, adminOnly, CouponsController.getCoupons);
router.get('/:id', auth, adminOnly, CouponsController.getCouponById);
router.put('/:id', auth, adminOnly, CouponsController.updateCoupon);
router.delete('/:id', auth, adminOnly, CouponsController.deleteCoupon);

export default router;
