import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  addExpense,
  listExpenses,
  updateUserExpense,
  deleteUserExpense,
  listCategories,
} from '../controllers/expense.controller.js';

const router = express.Router();

// All expense routes require authentication
router.get('/', authenticate, listExpenses);
router.post('/', authenticate, addExpense);
router.put('/:id', authenticate, updateUserExpense);
router.delete('/:id', authenticate, deleteUserExpense);

// Categories endpoint
router.get('/categories', authenticate, listCategories);

export default router;
