import { Router } from 'express';
import AuthController from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/', AuthController.authUser);
router.post('/validate-otp', AuthController.validateOtp);
router.get('/me', auth, AuthController.getMe);
router.post('/change-phone-number', auth, AuthController.changePhoneNumber);

export default router;
