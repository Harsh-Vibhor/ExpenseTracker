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
        const totalResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS totalSpent
       FROM expenses
       WHERE user_id = $1
         AND TO_CHAR(expense_date, 'YYYY-MM') = $2`,
            [userId, month]
        );

        // Get category breakdown
        const categoryResult = await pool.query(
            `SELECT 
         c.id AS categoryId,
         c.name AS categoryName,
         COALESCE(SUM(e.amount), 0) AS totalSpent
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id 
         AND e.user_id = $1
         AND TO_CHAR(e.expense_date, 'YYYY-MM') = $2
       GROUP BY c.id, c.name
       HAVING COALESCE(SUM(e.amount), 0) > 0
       ORDER BY totalSpent DESC`,
            [userId, month]
        );

        return res.json({
            month,
            totalSpent: Number(totalResult.rows[0].totalspent),
            categoryBreakdown: categoryResult.rows.map(row => ({
                categoryId: row.categoryid,
                categoryName: row.categoryname,
                totalSpent: Number(row.totalspent),
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
        const result = await pool.query(
            `SELECT 
         c.id AS categoryId,
         c.name AS categoryName,
         COALESCE(cb.amount, 0) AS budgetAmount,
         COALESCE(SUM(e.amount), 0) AS spentAmount
       FROM categories c
       LEFT JOIN category_budgets cb ON cb.category_id = c.id 
         AND cb.user_id = $1
         AND cb.month = $2
       LEFT JOIN expenses e ON e.category_id = c.id 
         AND e.user_id = $3
         AND TO_CHAR(e.expense_date, 'YYYY-MM') = $4
       GROUP BY c.id, c.name, cb.amount
       ORDER BY c.name ASC`,
            [userId, month, userId, month]
        );

        return res.json({
            month,
            data: result.rows.map(row => ({
                categoryId: row.categoryid,
                categoryName: row.categoryname,
                budgetAmount: Number(row.budgetamount),
                spentAmount: Number(row.spentamount),
                remainingAmount: Number(row.budgetamount) - Number(row.spentamount),
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
        const result = await pool.query(
            `SELECT 
         TO_CHAR(expense_date, 'YYYY-MM') AS month,
         SUM(amount) AS totalSpent
       FROM expenses
       WHERE user_id = $1
         AND EXTRACT(YEAR FROM expense_date) = $2
       GROUP BY TO_CHAR(expense_date, 'YYYY-MM')
       ORDER BY month ASC`,
            [userId, year]
        );

        // Fill in missing months with 0
        const monthlyData = [];
        for (let m = 1; m <= 12; m++) {
            const monthStr = `${year}-${String(m).padStart(2, '0')}`;
            const found = result.rows.find(row => row.month === monthStr);
            monthlyData.push({
                month: monthStr,
                totalSpent: found ? Number(found.totalspent) : 0,
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
