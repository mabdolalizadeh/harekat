import { Router } from 'express';
import ContactMessagesController from '../controllers/contactMessagesController.js';
import adminAuth from '../middleware/adminAuth.js';
import { adminOrTa } from '../middleware/rbac.js';

const router = Router();

// Public: Submit message
router.post('/', ContactMessagesController.createMessage);

// Admin: Manage messages
router.get('/', adminAuth, adminOrTa, ContactMessagesController.listMessages);
router.put('/:id/read', adminAuth, adminOrTa, ContactMessagesController.markAsRead);
router.delete('/:id', adminAuth, adminOrTa, ContactMessagesController.deleteMessage);

export default router;
