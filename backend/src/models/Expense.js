import { getDb } from '../config/db.js';

export const createExpense = async ({ userId, categoryId, amount, description, date }) => {
  const pool = getDb();
  const result = await pool.query(
    'INSERT INTO expenses (user_id, category_id, amount, description, expense_date) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, category_id, amount, description, expense_date',
    [userId, categoryId, amount, description || null, date]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    user_id: row.user_id,
    category_id: row.category_id,
    amount: row.amount,
    description: row.description,
    expense_date: row.expense_date
  };
};

export const getExpensesByUser = async (userId) => {
  const pool = getDb();
  const result = await pool.query(
    'SELECT e.id, e.user_id, e.category_id, e.amount, e.description, e.expense_date as date, e.created_at, c.name AS category_name FROM expenses e LEFT JOIN categories c ON e.category_id = c.id WHERE e.user_id = $1 ORDER BY e.expense_date DESC',
    [userId]
  );
  return result.rows;
};

export const getExpenseById = async ({ id, userId }) => {
  const pool = getDb();
  const result = await pool.query(
    'SELECT e.id, e.user_id, e.category_id, e.amount, e.description, e.expense_date as date, e.created_at, c.name AS category_name FROM expenses e LEFT JOIN categories c ON e.category_id = c.id WHERE e.id = $1 AND e.user_id = $2 LIMIT 1',
    [id, userId]
  );
  return result.rows[0] || null;
};

export const updateExpense = async ({ id, userId, categoryId, amount, description, date }) => {
  const pool = getDb();
  const updates = [];
  const values = [];
  let paramIndex = 1;

  if (categoryId !== undefined) {
    updates.push(`category_id = $${paramIndex++}`);
    values.push(categoryId);
  }
  if (amount !== undefined) {
    updates.push(`amount = $${paramIndex++}`);
    values.push(amount);
  }
  if (description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    values.push(description);
  }
  if (date !== undefined) {
    updates.push(`expense_date = $${paramIndex++}`);
    values.push(date);
  }

  if (updates.length === 0) {
    return getExpenseById({ id, userId });
  }

  values.push(id, userId);
  await pool.query(
    `UPDATE expenses SET ${updates.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}`,
    values
  );

  return getExpenseById({ id, userId });
};

export const deleteExpense = async ({ id, userId }) => {
  const pool = getDb();
  const result = await pool.query('DELETE FROM expenses WHERE id = $1 AND user_id = $2', [id, userId]);
  return result.rowCount > 0;
};
