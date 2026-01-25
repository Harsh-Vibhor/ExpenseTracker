import express from 'express';
import {
    listCategories,
    addCategory,
    removeCategory,
    getCategoryExpenses,
    getCategoryBudget,
    setCategoryBudget
} from '../controllers/category.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All category routes require authentication
router.use(authenticate);

// GET /api/categories - List all categories
router.get('/', listCategories);

// POST /api/categories - Add a new category
router.post('/', addCategory);

// DELETE /api/categories/:id - Delete a category (only if unused)
router.delete('/:id', removeCategory);

// GET /api/categories/:id/expenses?month=YYYY-MM - Get expenses for category and month
router.get('/:id/expenses', getCategoryExpenses);

// GET /api/categories/:id/budget?month=YYYY-MM - Get budget for category and month
router.get('/:id/budget', getCategoryBudget);

// POST /api/categories/:id/budget - Set/update budget for category and month
router.post('/:id/budget', setCategoryBudget);

export default router;
