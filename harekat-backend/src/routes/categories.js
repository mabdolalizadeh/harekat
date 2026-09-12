import { Router } from 'express';
import CategoriesController from '../controllers/categoriesController.js';
import { auth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/ownerCheck.js';

const router = Router();

router.post('/', auth, adminOnly, CategoriesController.createCategory);
// Public storefront reads (no auth).
router.get('/', CategoriesController.getCategories);
router.get('/:id', CategoriesController.getCategoryById);
router.put('/:id', auth, adminOnly, CategoriesController.updateCategory);
router.delete('/:id', auth, adminOnly, CategoriesController.deleteCategory);

export default router;
