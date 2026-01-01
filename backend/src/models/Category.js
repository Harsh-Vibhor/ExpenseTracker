import { getDb } from '../config/db.js';

export const createCategory = async ({ name }) => {
  const pool = getDb();
  const [result] = await pool.execute(
    'INSERT INTO categories (name) VALUES (?)',
    [name]
  );
  return { id: result.insertId, name };
};

export const getCategoriesByUser = async () => {
  const pool = getDb();
  // Categories are global, not user-specific based on schema
  const [rows] = await pool.execute('SELECT * FROM categories ORDER BY name ASC');
  return rows;
};

export const getAllCategories = async () => {
  const pool = getDb();
  const [rows] = await pool.execute('SELECT * FROM categories ORDER BY name ASC');
  return rows;
};

export const findCategoryById = async (categoryId) => {
  const pool = getDb();
  const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ? LIMIT 1', [categoryId]);
  return rows[0] || null;
};

export const seedDefaultCategoriesIfEmpty = async () => {
  const pool = getDb();
  const [rows] = await pool.execute('SELECT COUNT(*) as count FROM categories');
  const count = rows[0].count;
  
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
      await pool.execute('INSERT INTO categories (name) VALUES (?)', [categoryName]);
    }
  }
};

export const findCategoryByName = async (name) => {
  const pool = getDb();
  const [rows] = await pool.execute('SELECT * FROM categories WHERE name = ? LIMIT 1', [name]);
  return rows[0] || null;
};

export const deleteCategory = async (categoryId) => {
  const pool = getDb();
  try {
    const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [categoryId]);
    return result.affectedRows > 0;
  } catch (err) {
    // Check if it's a foreign key constraint error
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      throw new Error('Cannot delete category that is being used by expenses');
    }
    throw err;
  }
};

export const getCategoryUsageCount = async (categoryId) => {
  const pool = getDb();
  const [rows] = await pool.execute('SELECT COUNT(*) as count FROM expenses WHERE category_id = ?', [categoryId]);
  return rows[0].count;
};
