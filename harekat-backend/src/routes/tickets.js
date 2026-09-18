import { Router } from 'express';
import TicketsController from '../controllers/ticketsController.js';
import { auth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import { adminOrTa } from '../middleware/rbac.js';

const router = Router();

// Student routes
router.get('/my', auth, TicketsController.getMyTickets);
router.post('/', auth, TicketsController.createTicket);

// Shared routes (student or admin/TA)
router.get('/:id', auth, TicketsController.getTicketById);
router.post('/:id/messages', auth, TicketsController.addMessage);

// Admin / TA routes
router.get('/', adminAuth, adminOrTa, TicketsController.listTicketsAdmin);
router.put('/:id', adminAuth, adminOrTa, TicketsController.updateTicketStatus);

export default router;
