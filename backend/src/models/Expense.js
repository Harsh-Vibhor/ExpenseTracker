import { getDb } from '../config/db.js';

export const createExpense = async ({ userId, categoryId, amount, description, date }) => {
  const pool = getDb();
  const [result] = await pool.execute(
    'INSERT INTO expenses (user_id, category_id, amount, description, expense_date) VALUES (?, ?, ?, ?, ?)',
    [userId, categoryId, amount, description || null, date]
  );
  return { id: result.insertId, user_id: userId, category_id: categoryId, amount, description, expense_date: date };
};

export const getExpensesByUser = async (userId) => {
  const pool = getDb();
  const [rows] = await pool.execute(
    'SELECT e.id, e.user_id, e.category_id, e.amount, e.description, e.expense_date as date, e.created_at, c.name AS category_name FROM expenses e LEFT JOIN categories c ON e.category_id = c.id WHERE e.user_id = ? ORDER BY e.expense_date DESC',
    [userId]
  );
  return rows;
};

export const getExpenseById = async ({ id, userId }) => {
  const pool = getDb();
  const [rows] = await pool.execute(
    'SELECT e.id, e.user_id, e.category_id, e.amount, e.description, e.expense_date as date, e.created_at, c.name AS category_name FROM expenses e LEFT JOIN categories c ON e.category_id = c.id WHERE e.id = ? AND e.user_id = ? LIMIT 1',
    [id, userId]
  );
  return rows[0] || null;
};

export const updateExpense = async ({ id, userId, categoryId, amount, description, date }) => {
  const pool = getDb();
  const updates = [];
  const values = [];

  if (categoryId !== undefined) {
    updates.push('category_id = ?');
    values.push(categoryId);
  }
  if (amount !== undefined) {
    updates.push('amount = ?');
    values.push(amount);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (date !== undefined) {
    updates.push('expense_date = ?');
    values.push(date);
  }

  if (updates.length === 0) {
    return getExpenseById({ id, userId });
  }

  values.push(id, userId);
  await pool.execute(
    `UPDATE expenses SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
    values
  );

  return getExpenseById({ id, userId });
};

export const deleteExpense = async ({ id, userId }) => {
  const pool = getDb();
  const [result] = await pool.execute('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows > 0;
};
