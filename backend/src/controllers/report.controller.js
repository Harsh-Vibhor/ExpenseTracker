import { getDb } from '../config/db.js';

/**
 * Get monthly summary report
 * Returns total spent and category breakdown for a specific month
 * GET /api/reports/monthly?month=YYYY-MM
 */
export const getMonthlySummary = async (req, res) => {
    try {
        const { month } = req.query;
        const userId = req.user.id;

        // Validate month format
        if (!month || !/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({ message: 'Valid month (YYYY-MM) is required' });
        }

        const pool = getDb();

        // Get total spent for the month
        const [[totalRow]] = await pool.execute(
            `SELECT COALESCE(SUM(amount), 0) AS totalSpent
       FROM expenses
       WHERE user_id = ?
         AND DATE_FORMAT(expense_date, '%Y-%m') = ?`,
            [userId, month]
        );

        // Get category breakdown
        const [categoryRows] = await pool.execute(
            `SELECT 
         c.id AS categoryId,
         c.name AS categoryName,
         COALESCE(SUM(e.amount), 0) AS totalSpent
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id 
         AND e.user_id = ?
         AND DATE_FORMAT(e.expense_date, '%Y-%m') = ?
       GROUP BY c.id, c.name
       HAVING totalSpent > 0
       ORDER BY totalSpent DESC`,
            [userId, month]
        );

        return res.json({
            month,
            totalSpent: Number(totalRow.totalSpent),
            categoryBreakdown: categoryRows.map(row => ({
                categoryId: row.categoryId,
                categoryName: row.categoryName,
                totalSpent: Number(row.totalSpent),
            })),
        });
    } catch (err) {
        console.error('Monthly summary report error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get budget vs actual report
 * Returns budget and actual spending comparison for a specific month
 * GET /api/reports/budget-vs-actual?month=YYYY-MM
 */
export const getBudgetVsActual = async (req, res) => {
    try {
        const { month } = req.query;
        const userId = req.user.id;

        // Validate month format
        if (!month || !/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({ message: 'Valid month (YYYY-MM) is required' });
        }

        const pool = getDb();

        // Get budget vs actual for all categories
        const [rows] = await pool.execute(
            `SELECT 
         c.id AS categoryId,
         c.name AS categoryName,
         COALESCE(cb.amount, 0) AS budgetAmount,
         COALESCE(SUM(e.amount), 0) AS spentAmount
       FROM categories c
       LEFT JOIN category_budgets cb ON cb.category_id = c.id 
         AND cb.user_id = ?
         AND cb.month = ?
       LEFT JOIN expenses e ON e.category_id = c.id 
         AND e.user_id = ?
         AND DATE_FORMAT(e.expense_date, '%Y-%m') = ?
       GROUP BY c.id, c.name, cb.amount
       ORDER BY c.name ASC`,
            [userId, month, userId, month]
        );

        return res.json({
            month,
            data: rows.map(row => ({
                categoryId: row.categoryId,
                categoryName: row.categoryName,
                budgetAmount: Number(row.budgetAmount),
                spentAmount: Number(row.spentAmount),
                remainingAmount: Number(row.budgetAmount) - Number(row.spentAmount),
            })),
        });
    } catch (err) {
        console.error('Budget vs actual report error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Get yearly overview report
 * Returns monthly totals for a specific year
 * GET /api/reports/yearly?year=YYYY
 */
export const getYearlyOverview = async (req, res) => {
    try {
        const { year } = req.query;
        const userId = req.user.id;

        // Validate year format
        if (!year || !/^\d{4}$/.test(year)) {
            return res.status(400).json({ message: 'Valid year (YYYY) is required' });
        }

        const pool = getDb();

        // Get monthly totals for the year
        const [rows] = await pool.execute(
            `SELECT 
         DATE_FORMAT(expense_date, '%Y-%m') AS month,
         SUM(amount) AS totalSpent
       FROM expenses
       WHERE user_id = ?
         AND YEAR(expense_date) = ?
       GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
       ORDER BY month ASC`,
            [userId, year]
        );

        // Fill in missing months with 0
        const monthlyData = [];
        for (let m = 1; m <= 12; m++) {
            const monthStr = `${year}-${String(m).padStart(2, '0')}`;
            const found = rows.find(row => row.month === monthStr);
            monthlyData.push({
                month: monthStr,
                totalSpent: found ? Number(found.totalSpent) : 0,
            });
        }

        return res.json({
            year,
            data: monthlyData,
        });
    } catch (err) {
        console.error('Yearly overview report error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
