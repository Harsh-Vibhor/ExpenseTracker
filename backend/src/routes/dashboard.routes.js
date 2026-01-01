import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getUserMonthly, getUserSummary } from '../controllers/dashboard.controller.js';

const router = Router();

router.use(authenticate);

router.get('/summary', getUserSummary);
router.get('/monthly', getUserMonthly);

export default router;
