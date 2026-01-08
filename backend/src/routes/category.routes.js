import express from 'express';
import { listCategories, addCategory, removeCategory } from '../controllers/category.controller.js';
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

export default router;
