import { Router } from 'express';
import CartController from '../controllers/cartController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Cart routes work with both authenticated users (via JWT) and anonymous users (via sessionId header)
// For authenticated users, the optionalAuth middleware will attach req.user
// For anonymous, we rely on x-session-id header

router.get('/', optionalAuth, CartController.getOrCreateCart);
router.post('/add', optionalAuth, CartController.addToCart);
router.put('/item/:itemId', optionalAuth, CartController.updateCartItem);
router.delete('/item/:itemId', optionalAuth, CartController.removeFromCart);
router.delete('/clear', optionalAuth, CartController.clearCart);

export default router;