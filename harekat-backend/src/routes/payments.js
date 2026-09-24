import { Router } from 'express';
import PaymentsController from '../controllers/paymentsController.js';
import { auth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { superAdminOnly } from '../middleware/rbac.js';

const router = Router();

// Public Gateway Callback endpoints (Zibal redirects here after payment)
router.get('/zibal/callback', PaymentsController.handleZibalCallback);
router.post('/zibal/callback', PaymentsController.handleZibalCallback);

// Public / Student Payment Status Check (for result page)
router.get('/:id/status', PaymentsController.getPaymentStatus);

// Student routes
router.post('/initiate', auth, PaymentsController.initiatePayment);
router.post('/fake/process', auth, PaymentsController.processFakePayment);
router.get('/my', auth, PaymentsController.getMyPayments);
router.post('/:id/verify', auth, PaymentsController.verifyPayment);

// Admin routes
router.get('/', adminAuth, superAdminOnly, PaymentsController.getPayments);
router.get('/:id', adminAuth, superAdminOnly, PaymentsController.getPaymentById);
router.post('/', adminAuth, superAdminOnly, PaymentsController.createPayment);
router.put('/:id', adminAuth, superAdminOnly, PaymentsController.updatePayment);
router.delete('/:id', adminAuth, superAdminOnly, PaymentsController.deletePayment);

export default router;
