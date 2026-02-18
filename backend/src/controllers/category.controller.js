import {
  getCategoriesByUser,
  createCategory,
  deleteCategory,
  findCategoryByNameAndUser,
  findCategoryById,
  getCategoryUsageCount,
  seedDefaultCategoriesIfEmpty,
} from '../models/Category.js';
import { supabase } from '../config/supabase.js';

// ── GET /api/categories ───────────────────────────────────────────────────────
export const listCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    await seedDefaultCategoriesIfEmpty(userId);
    const categories = await getCategoriesByUser(userId);
    return res.json(categories);
  } catch (err) {
    console.error('List categories error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ── POST /api/categories ──────────────────────────────────────────────────────
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    const existing = await findCategoryByNameAndUser(trimmedName, userId);
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await createCategory({ name: trimmedName, userId });
    return res.status(201).json(category);
  } catch (err) {
    console.error('Add category error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ── DELETE /api/categories/:id ────────────────────────────────────────────────
export const removeCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const usageCount = await getCategoryUsageCount(id);
    if (usageCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. It is being used by ${usageCount} expense(s).`,
      });
    }

    const success = await deleteCategory(id);
    if (!success) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Delete category error:', err);
    if (err.message && err.message.includes('being used by expenses')) {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /api/categories/:id/expenses?month=YYYY-MM ────────────────────────────
export const getCategoryExpenses = async (req, res) => {
  try {
    const { id } = req.params;
    const { month } = req.query;
    const userId = req.user.id;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Valid month (YYYY-MM) is required' });
    }

    const [year, mon] = month.split('-').map(Number);
    const from = `${month}-01`;
    const lastDay = new Date(year, mon, 0).getDate();
    const to = `${month}-${String(lastDay).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('expenses')
      .select('id, amount, description, date')
      .eq('user_id', userId)
      .eq('category_id', id)
      .gte('date', from)
      .lte('date', to)
      .order('date', { ascending: false });

    if (error) throw error;

    const total = data.reduce((s, e) => s + Number(e.amount), 0);

    return res.json({
      expenses: data.map((e) => ({ id: e.id, amount: e.amount, description: e.description, date: e.date })),
      total,
      month,
      categoryId: id,
    });
  } catch (err) {
    console.error('Get category expenses error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /api/categories/:id/budget?month=YYYY-MM ──────────────────────────────
export const getCategoryBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { month } = req.query;
    const userId = req.user.id;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Valid month (YYYY-MM) is required' });
    }

    const { data, error } = await supabase
      .from('category_budgets')
      .select('id, budget_amount, month')
      .eq('user_id', userId)
      .eq('category_id', id)
      .eq('month', month)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.json({ budget: null, month, categoryId: id });
    }

    return res.json({
      budget: { id: data.id, amount: Number(data.budget_amount), month: data.month },
      month,
      categoryId: id,
    });
  } catch (err) {
    console.error('Get category budget error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ── POST /api/categories/:id/budget ───────────────────────────────────────────
export const setCategoryBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, amount } = req.body;
    const userId = req.user.id;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: 'Valid month (YYYY-MM) is required' });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const category = await findCategoryById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // UPSERT — schema has UNIQUE(user_id, category_id, month)
    const { error: upsertErr } = await supabase
      .from('category_budgets')
      .upsert(
        { user_id: userId, category_id: id, month, budget_amount: amount },
        { onConflict: 'user_id,category_id,month' }
      );

    if (upsertErr) throw upsertErr;

    // Fetch the saved record
    const { data, error: fetchErr } = await supabase
      .from('category_budgets')
      .select('id, budget_amount, month')
      .eq('user_id', userId)
      .eq('category_id', id)
      .eq('month', month)
      .single();

    if (fetchErr) throw fetchErr;

    return res.json({
      budget: { id: data.id, amount: Number(data.budget_amount), month: data.month },
      message: 'Budget updated successfully',
    });
  } catch (err) {
    console.error('Set category budget error:', err);
    return res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};
