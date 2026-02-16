import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
    getMonthlySummary,
    getBudgetVsActual,
    getYearlyOverview,
} from '../controllers/report.controller.js';

const router = express.Router();

// All report routes require authentication
router.use(authenticate);

// GET /api/reports/monthly?month=YYYY-MM
router.get('/monthly', getMonthlySummary);

// GET /api/reports/budget-vs-actual?month=YYYY-MM
router.get('/budget-vs-actual', getBudgetVsActual);

// GET /api/reports/yearly?year=YYYY
router.get('/yearly', getYearlyOverview);

export default router;
