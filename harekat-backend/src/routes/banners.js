import { Router } from 'express';
import BannersController from '../controllers/bannersController.js';
import { auth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/ownerCheck.js';

const router = Router();
const admin = [auth, adminOnly];

router.get('/', (req, _res, next) => { req.adminView = false; next(); }, BannersController.list);
router.get('/admin', ...admin, (req, _res, next) => { req.adminView = true; next(); }, BannersController.list);
router.post('/', ...admin, BannersController.create);
router.put('/:id', ...admin, BannersController.update);
router.delete('/:id', ...admin, BannersController.remove);

export default router;
