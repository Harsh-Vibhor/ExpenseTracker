import { findUserById } from '../models/User.js';
import { createExpense, deleteExpense, getExpenseById, getExpensesByUser, updateExpense } from '../models/Expense.js';
import { createCategory, getCategoriesByUser } from '../models/Category.js';

export const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUserExpense = async (req, res) => {
  try {
    const { categoryId, amount, description, date } = req.body;
    if (!categoryId || !amount || !date) {
      return res.status(400).json({ message: 'categoryId, amount and date are required' });
    }

    const expense = await createExpense({
      userId: req.user.id,
      categoryId,
      amount,
      description,
      date,
    });

    return res.status(201).json(expense);
  } catch (err) {
    console.error('Create expense error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const listUserExpenses = async (req, res) => {
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
    const { categoryId, amount, description, date } = req.body;

    const existing = await getExpenseById({ id, userId: req.user.id });
    if (!existing) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const updated = await updateExpense({
      id,
      userId: req.user.id,
      categoryId,
      amount,
      description,
      date,
    });

    return res.json(updated);
  } catch (err) {
    console.error('Update expense error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeUserExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteExpense({ id, userId: req.user.id });
    if (!success) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    return res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error('Delete expense error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createUserCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    const category = await createCategory({ name });
    return res.status(201).json(category);
  } catch (err) {
    console.error('Create category error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const listUserCategories = async (req, res) => {
  try {
    const categories = await getCategoriesByUser();
    return res.json(categories);
  } catch (err) {
    console.error('List categories error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
