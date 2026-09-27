import { Router } from 'express';
import jwt from 'jsonwebtoken';
import ArticlesController from '../controllers/articlesController.js';
import adminAuth from '../middleware/adminAuth.js';
import { adminOrTa } from '../middleware/rbac.js';
import { configs } from '../config/config.js';

const router = Router();

function optionalAdminAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, configs.jwtKey);
            req.user = { id: decoded.id, role: decoded.role };
        } catch {
            // Ignore invalid token on optional auth
        }
    }
    next();
}

// Public with optional admin elevation (e.g. previewing drafts)
router.get('/', optionalAdminAuth, ArticlesController.listArticles);
router.get('/:slugOrId', optionalAdminAuth, ArticlesController.getArticleBySlug);

// Admin-only management
router.post('/', adminAuth, adminOrTa, ArticlesController.createArticle);
router.put('/:id', adminAuth, adminOrTa, ArticlesController.updateArticle);
router.delete('/:id', adminAuth, adminOrTa, ArticlesController.deleteArticle);

export default router;
