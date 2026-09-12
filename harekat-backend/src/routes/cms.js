import { Router } from 'express';
import CmsController from '../controllers/cmsController.js';
import { auth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/ownerCheck.js';

const router = Router();

function publicView(req, _res, next) { req.adminView = false; next(); }
function adminView(req, _res, next) { req.adminView = true; next(); }

// Public storefront reads
router.get('/header-menu', publicView, CmsController.getMenu);
router.get('/content', publicView, CmsController.getContent);
router.get('/content/:key', publicView, CmsController.getContentByKey);

// Admin reads (include inactive) + writes
router.get('/admin/header-menu', auth, adminOnly, adminView, CmsController.getMenu);
router.post('/admin/header-menu', auth, adminOnly, CmsController.createMenuItem);
router.put('/admin/header-menu/:id', auth, adminOnly, CmsController.updateMenuItem);
router.delete('/admin/header-menu/:id', auth, adminOnly, CmsController.deleteMenuItem);

router.get('/admin/content', auth, adminOnly, adminView, CmsController.getContent);
router.post('/admin/content', auth, adminOnly, CmsController.upsertContent);
router.delete('/admin/content/:key', auth, adminOnly, CmsController.deleteContent);

export default router;
