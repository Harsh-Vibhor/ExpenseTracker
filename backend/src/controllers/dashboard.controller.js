import { getDb } from '../config/db.js';

export const getUserSummary = async (req, res) => {
  try {
    const pool = getDb();
    const userId = req.user.id;

    // Total expense for user
    const [[totalRow]] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) AS totalExpense FROM expenses WHERE user_id = ?',
      [userId]
    );

    // Monthly expense for current month
    const [[monthlyRow]] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) AS monthlyExpense
       FROM expenses
       WHERE user_id = ?
         AND YEAR(expense_date) = YEAR(CURDATE())
         AND MONTH(expense_date) = MONTH(CURDATE())`,
      [userId]
    );

    // Category breakdown (per category for this user)
    const [categoryRows] = await pool.execute(
      `SELECT c.id, c.name, COALESCE(SUM(e.amount), 0) AS total
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id AND e.user_id = ?
       GROUP BY c.id, c.name
       ORDER BY total DESC, c.name ASC`,
      [userId]
    );

    // Recent expenses (last 5)
    const [recentRows] = await pool.execute(
      `SELECT e.id, e.amount, e.description, e.expense_date, c.name AS category_name
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = ?
       ORDER BY e.expense_date DESC, e.id DESC
       LIMIT 5`,
      [userId]
    );

    return res.json({
      totalExpense: Number(totalRow.totalExpense || 0),
      monthlyExpense: Number(monthlyRow.monthlyExpense || 0),
      categoryBreakdown: categoryRows.map((row) => ({
        id: row.id,
        name: row.name,
        total: Number(row.total || 0),
      })),
      recentExpenses: recentRows,
    });
  } catch (err) {
    console.error('User dashboard summary error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserMonthly = async (req, res) => {
  try {
    const pool = getDb();
    const userId = req.user.id;

    // Last 6 months including current
    const [rows] = await pool.execute(
      `SELECT DATE_FORMAT(expense_date, '%Y-%m-01') AS month,
              DATE_FORMAT(expense_date, '%b %Y') AS label,
              COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = ?
         AND expense_date >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 5 MONTH)
       GROUP BY month, label
       ORDER BY month ASC`,
      [userId]
    );

    const data = rows.map((row) => ({
      month: row.month,
      label: row.label,
      total: Number(row.total || 0),
    }));

    return res.json({ months: data });
  } catch (err) {
    console.error('User monthly dashboard error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
