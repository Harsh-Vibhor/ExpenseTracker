import { getAllUsers } from '../models/User.js';
import { getDb } from '../config/db.js';

export const getAllUsersAdmin = async (req, res) => {
  try {
    const users = await getAllUsers();
    return res.json(users);
  } catch (err) {
    console.error('Admin get users error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllExpensesAdmin = async (req, res) => {
  try {
    const pool = getDb();
    const [rows] = await pool.execute(
      'SELECT e.id, e.user_id, e.category_id, e.amount, e.description, e.expense_date as date, e.created_at, u.name AS user_name, u.email AS user_email, c.name AS category_name FROM expenses e LEFT JOIN users u ON e.user_id = u.id LEFT JOIN categories c ON e.category_id = c.id ORDER BY e.expense_date DESC'
    );
    return res.json(rows);
  } catch (err) {
    console.error('Admin get expenses error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAdminSummary = async (req, res) => {
  try {
    const pool = getDb();

    // Total users
    const [[userCount]] = await pool.execute('SELECT COUNT(*) AS totalUsers FROM users');

    // Total expenses amount
    const [[expenseTotal]] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM expenses'
    );

    // Total transactions count
    const [[transactionCount]] = await pool.execute(
      'SELECT COUNT(*) AS totalTransactions FROM expenses'
    );

    return res.json({
      totalUsers: Number(userCount.totalUsers || 0),
      totalExpenses: Number(expenseTotal.totalExpenses || 0),
      totalTransactions: Number(transactionCount.totalTransactions || 0),
    });
  } catch (err) {
    console.error('Admin summary error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAdminCategories = async (req, res) => {
  try {
    const pool = getDb();

    // Category-wise global expense totals
    const [categoryRows] = await pool.execute(
      `SELECT c.id, c.name, COALESCE(SUM(e.amount), 0) AS total
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id
       GROUP BY c.id, c.name
       ORDER BY total DESC, c.name ASC`
    );

    return res.json({
      categories: categoryRows.map((row) => ({
        id: row.id,
        name: row.name,
        total: Number(row.total || 0),
      })),
    });
  } catch (err) {
    console.error('Admin categories error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
