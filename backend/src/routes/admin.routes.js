import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import {
  getAllExpensesAdmin,
  getAllUsersAdmin,
  getAdminSummary,
  getAdminCategories,
  getUsersForManagement,
  updateUserStatus,
  getUserActivitySummary,
  getUsersByCategory,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

// User management routes (must come before /users to avoid route conflict)
router.get('/users/management', getUsersForManagement);
router.get('/users/by-category/:categoryId', getUsersByCategory);
router.get('/users/:id/summary', getUserActivitySummary);
router.patch('/users/:id/status', updateUserStatus);

// Other admin routes
router.get('/users', getAllUsersAdmin);
router.get('/expenses', getAllExpensesAdmin);
router.get('/summary', getAdminSummary);
router.get('/categories', getAdminCategories);

export default router;
