import { Router } from 'express';
import NotificationsController from '../controllers/notificationsController.js';
import adminAuth from '../middleware/adminAuth.js';
import { adminOrTa } from '../middleware/rbac.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Student routes
router.get('/my', auth, NotificationsController.getMyNotifications);
router.post('/:id/read', auth, NotificationsController.markAsRead);
router.post('/read-all', auth, NotificationsController.markAllAsRead);

// Admin & TA routes
router.post('/', adminAuth, adminOrTa, NotificationsController.createNotification);
router.get('/sent', adminAuth, adminOrTa, NotificationsController.getSentNotifications);
router.delete('/:id', adminAuth, adminOrTa, NotificationsController.deleteNotification);

export default router;
