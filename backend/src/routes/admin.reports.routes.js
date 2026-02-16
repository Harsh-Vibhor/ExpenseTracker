import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import {
    getAdminOverview,
    getCategoryWiseSpending,
    getTopUsersBySpending,
} from '../controllers/admin.reports.controller.js';

const router = Router();

// Apply authentication and admin authorization to all routes
router.use(authenticate);
router.use(authorizeRoles('ADMIN'));

// Admin reports endpoints
router.get('/overview', getAdminOverview);
router.get('/category-wise', getCategoryWiseSpending);
router.get('/top-users', getTopUsersBySpending);

export default router;
