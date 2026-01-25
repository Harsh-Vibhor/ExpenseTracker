import {
  getAllCategories,
  createCategory,
  deleteCategory,
  findCategoryByName,
  findCategoryById,
  getCategoryUsageCount,
  seedDefaultCategoriesIfEmpty,
} from '../models/Category.js';

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

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    // Check if category already exists
    const existing = await findCategoryByName(trimmedName);
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await createCategory({ name: trimmedName });
    return res.status(201).json(category);
  } catch (err) {
    console.error('Add category error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category is being used by any expenses
    const usageCount = await getCategoryUsageCount(id);
    if (usageCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It is being used by ${usageCount} expense(s).`
      });
    }

    const success = await deleteCategory(id);
    if (!success) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Delete category error:', err);

    // Handle foreign key constraint error
    if (err.message && err.message.includes('being used by expenses')) {
      return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get expenses for a specific category and month
export const getCategoryExpenses = async (req, res) => {
  try {
    const { id } = req.params;
    const { month } = req.query; // Format: YYYY-MM
    const userId = req.user.id;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Valid month (YYYY-MM) is required' });
    }

    const { getDb } = await import('../config/db.js');
    const pool = getDb();

    // Get expenses for this category and month
    const [expenses] = await pool.execute(
      `SELECT e.id, e.amount, e.description, e.expense_date as date
       FROM expenses e
       WHERE e.user_id = ? 
         AND e.category_id = ?
         AND DATE_FORMAT(e.expense_date, '%Y-%m') = ?
       ORDER BY e.expense_date DESC, e.id DESC`,
      [userId, id, month]
    );

    // Calculate total spent
    const [[totalRow]] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = ? 
         AND category_id = ?
         AND DATE_FORMAT(expense_date, '%Y-%m') = ?`,
      [userId, id, month]
    );

    return res.json({
      expenses,
      total: Number(totalRow.total || 0),
      month,
      categoryId: parseInt(id),
    });
  } catch (err) {
    console.error('Get category expenses error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get budget for a specific category and month
export const getCategoryBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { month } = req.query; // Format: YYYY-MM
    const userId = req.user.id;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Valid month (YYYY-MM) is required' });
    }

    const { getDb } = await import('../config/db.js');
    const pool = getDb();

    const [[budget]] = await pool.execute(
      `SELECT id, amount, month
       FROM category_budgets
       WHERE user_id = ? 
         AND category_id = ?
         AND month = ?`,
      [userId, id, month]
    );

    if (!budget) {
      return res.json({ budget: null, month, categoryId: parseInt(id) });
    }

    return res.json({
      budget: {
        id: budget.id,
        amount: Number(budget.amount),
        month: budget.month,
      },
      month,
      categoryId: parseInt(id),
    });
  } catch (err) {
    console.error('Get category budget error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Set or update budget for a specific category and month
export const setCategoryBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, amount } = req.body;
    const userId = req.user.id;

    console.log('Set budget request:', { userId, categoryId: id, month, amount });

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Valid month (YYYY-MM) is required' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    // Verify category exists
    const category = await findCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const { getDb } = await import('../config/db.js');
    const pool = getDb();

    // UPSERT: Insert or update if exists
    await pool.execute(
      `INSERT INTO category_budgets (user_id, category_id, month, amount)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
      [userId, id, month, amount]
    );

    // Fetch the updated budget
    const [[budget]] = await pool.execute(
      `SELECT id, amount, month
       FROM category_budgets
       WHERE user_id = ? 
         AND category_id = ?
         AND month = ?`,
      [userId, id, month]
    );

    if (!budget) {
      console.error('Budget not found after insert/update');
      return res.status(500).json({ message: 'Failed to save budget' });
    }

    console.log('Budget saved successfully:', budget);

    return res.json({
      budget: {
        id: budget.id,
        amount: Number(budget.amount),
        month: budget.month,
      },
      message: 'Budget updated successfully',
    });
  } catch (err) {
    console.error('Set category budget error:', err);
    console.error('Error details:', {
      message: err.message,
      code: err.code,
      sqlMessage: err.sqlMessage,
    });
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
