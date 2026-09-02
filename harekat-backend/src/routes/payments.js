import { Router } from 'express';
import PaymentsController from '../controllers/paymentsController.js';
import auth from '../middleware/auth.js';
import { adminOnly } from '../middleware/ownerCheck.js';

const router = Router();

router.post('/', auth, adminOnly, PaymentsController.createPayment);
router.get('/', auth, adminOnly, PaymentsController.getPayments);
router.get('/:id', auth, adminOnly, PaymentsController.getPaymentById);
router.put('/:id', auth, adminOnly, PaymentsController.updatePayment);
router.delete('/:id', auth, adminOnly, PaymentsController.deletePayment);

export default router;
