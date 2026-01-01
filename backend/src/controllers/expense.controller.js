import { getDb } from '../config/db.js';
import { createExpense, deleteExpense, getExpenseById, getExpensesByUser, updateExpense } from '../models/Expense.js';
import { findCategoryById, getAllCategories, seedDefaultCategoriesIfEmpty } from '../models/Category.js';

export const addExpense = async (req, res) => {
  try {
    const { categoryId, amount, description, expenseDate } = req.body;

    if (!categoryId || !amount || !expenseDate) {
      return res.status(400).json({ message: 'categoryId, amount and expenseDate are required' });
    }

    const category = await findCategoryById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const expense = await createExpense({
      userId: req.user.id,
      categoryId,
      amount,
      description,
      date: expenseDate,
    });

    return res.status(201).json(expense);
  } catch (err) {
    console.error('Add expense error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const listExpenses = async (req, res) => {
  try {
    const expenses = await getExpensesByUser(req.user.id);
    return res.json(expenses);
  } catch (err) {
    console.error('List expenses error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUserExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, amount, description, expenseDate } = req.body;

    const existing = await getExpenseById({ id, userId: req.user.id });
    if (!existing) {
      return res.status(404).json({ message: 'Expense not found or not accessible' });
    }

    if (categoryId) {
      const category = await findCategoryById(categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    const updated = await updateExpense({
      id,
      userId: req.user.id,
      categoryId,
      amount,
      description,
      date: expenseDate,
    });

    return res.json(updated);
  } catch (err) {
    console.error('Update expense error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUserExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteExpense({ id, userId: req.user.id });
    if (!success) {
      return res.status(404).json({ message: 'Expense not found or not accessible' });
    }
    return res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error('Delete expense error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const listCategories = async (req, res) => {
  try {
    await seedDefaultCategoriesIfEmpty();
    const categories = await getAllCategories();
    return res.json(categories);
  } catch (err) {
    console.error('List categories error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
