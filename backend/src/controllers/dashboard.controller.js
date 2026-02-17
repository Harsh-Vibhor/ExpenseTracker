import { getDb } from '../config/db.js';

export const getUserSummary = async (req, res) => {
  try {
    const pool = getDb();
    const userId = req.user.id;

    // Total expense for user
    const totalResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS totalExpense FROM expenses WHERE user_id = $1',
      [userId]
    );

    // Monthly expense for current month
    const monthlyResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) AS monthlyExpense
       FROM expenses
       WHERE user_id = $1
         AND EXTRACT(YEAR FROM expense_date) = EXTRACT(YEAR FROM CURRENT_DATE)
         AND EXTRACT(MONTH FROM expense_date) = EXTRACT(MONTH FROM CURRENT_DATE)`,
      [userId]
    );

    // Category breakdown (per category for this user)
    const categoryResult = await pool.query(
      `SELECT c.id, c.name, COALESCE(SUM(e.amount), 0) AS total
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id AND e.user_id = $1
       GROUP BY c.id, c.name
       ORDER BY total DESC, c.name ASC`,
      [userId]
    );

    // Recent expenses (last 5)
    const recentResult = await pool.query(
      `SELECT e.id, e.amount, e.description, e.expense_date, c.name AS category_name
       FROM expenses e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.user_id = $1
       ORDER BY e.expense_date DESC, e.id DESC
       LIMIT 5`,
      [userId]
    );

    return res.json({
      totalExpense: Number(totalResult.rows[0].totalexpense || 0),
      monthlyExpense: Number(monthlyResult.rows[0].monthlyexpense || 0),
      categoryBreakdown: categoryResult.rows.map((row) => ({
        id: row.id,
        name: row.name,
        total: Number(row.total || 0),
      })),
      recentExpenses: recentResult.rows,
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
    const result = await pool.query(
      `SELECT 
              TO_CHAR(expense_date, 'YYYY-MM-01') AS month,
              TO_CHAR(expense_date, 'Mon YYYY') AS label,
              COALESCE(SUM(amount), 0) AS total
       FROM expenses
       WHERE user_id = $1
         AND expense_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
       GROUP BY TO_CHAR(expense_date, 'YYYY-MM-01'), TO_CHAR(expense_date, 'Mon YYYY')
       ORDER BY month ASC`,
      [userId]
    );

    const data = result.rows.map((row) => ({
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
