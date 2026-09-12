import { Router } from 'express';
import CouponsController from '../controllers/couponsController.js';
import { auth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { adminOnly } from '../middleware/ownerCheck.js';

const router = Router();

// Customer-facing validation: public but rate-limited at app level via /api/v1.
// Requires no auth so guests can check coupons at checkout; calculation is server-side.
router.post('/validate', CouponsController.validateCoupon);
router.post('/redeem', auth, CouponsController.redeemCoupon);

// Admin CRUD (protected) — keep after /validate so 'validate' isn't captured by /:id
router.post('/', auth, adminOnly, CouponsController.createCoupon);
router.get('/', auth, adminOnly, CouponsController.getCoupons);
router.get('/:id', auth, adminOnly, CouponsController.getCouponById);
router.put('/:id', auth, adminOnly, CouponsController.updateCoupon);
router.delete('/:id', auth, adminOnly, CouponsController.deleteCoupon);

export default router;
