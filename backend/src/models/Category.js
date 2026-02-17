import { getDb } from '../config/db.js';

export const createCategory = async ({ name }) => {
  const pool = getDb();
  const result = await pool.query(
    'INSERT INTO categories (name) VALUES ($1) RETURNING id, name',
    [name]
  );
  return result.rows[0];
};

export const getCategoriesByUser = async () => {
  const pool = getDb();
  // Categories are global, not user-specific based on schema
  const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return result.rows;
};

export const getAllCategories = async () => {
  const pool = getDb();
  const result = await pool.query('SELECT * FROM categories ORDER BY name ASC');
  return result.rows;
};

export const findCategoryById = async (categoryId) => {
  const pool = getDb();
  const result = await pool.query('SELECT * FROM categories WHERE id = $1 LIMIT 1', [categoryId]);
  return result.rows[0] || null;
};

export const seedDefaultCategoriesIfEmpty = async () => {
  const pool = getDb();
  const result = await pool.query('SELECT COUNT(*) as count FROM categories');
  const count = parseInt(result.rows[0].count);

  if (count === 0) {
    const defaultCategories = [
      'Food',
      'Transportation',
      'Entertainment',
      'Shopping',
      'Bills',
      'Healthcare',
      'Education',
      'Others'
    ];

    for (const categoryName of defaultCategories) {
      await pool.query('INSERT INTO categories (name) VALUES ($1)', [categoryName]);
    }
  }
};

export const findCategoryByName = async (name) => {
  const pool = getDb();
  const result = await pool.query('SELECT * FROM categories WHERE name = $1 LIMIT 1', [name]);
  return result.rows[0] || null;
};

export const deleteCategory = async (categoryId) => {
  const pool = getDb();
  try {
    const result = await pool.query('DELETE FROM categories WHERE id = $1', [categoryId]);
    return result.rowCount > 0;
  } catch (err) {
    // Check if it's a foreign key constraint error (PostgreSQL error code)
    if (err.code === '23503') {
      throw new Error('Cannot delete category that is being used by expenses');
    }
    throw err;
  }
};

export const getCategoryUsageCount = async (categoryId) => {
  const pool = getDb();
  const result = await pool.query('SELECT COUNT(*) as count FROM expenses WHERE category_id = $1', [categoryId]);
  return parseInt(result.rows[0].count);
};
