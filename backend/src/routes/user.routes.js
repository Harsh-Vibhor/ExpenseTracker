import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createUserCategory,
  createUserExpense,
  getProfile,
  listUserCategories,
  listUserExpenses,
  removeUserExpense,
  updateUserExpense,
} from '../controllers/user.controller.js';

const router = Router();

router.use(authenticate);

router.get('/me', getProfile);

router.post('/expenses', createUserExpense);
router.get('/expenses', listUserExpenses);
router.put('/expenses/:id', updateUserExpense);
router.delete('/expenses/:id', removeUserExpense);

router.post('/categories', createUserCategory);
router.get('/categories', listUserCategories);

export default router;
