import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import {
  getAllExpensesAdmin,
  getAllUsersAdmin,
  getAdminSummary,
  getAdminCategories,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

router.get('/users', getAllUsersAdmin);
router.get('/expenses', getAllExpensesAdmin);
router.get('/summary', getAdminSummary);
router.get('/categories', getAdminCategories);

export default router;
