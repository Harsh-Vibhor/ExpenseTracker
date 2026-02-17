import { getDb } from '../config/db.js';

// Get admin reports overview
export const getAdminOverview = async (req, res) => {
    try {
        const pool = getDb();

        // Total users (all roles)
        const userCountResult = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');

        // Total expenses amount (all users including admins)
        const expenseTotalResult = await pool.query(
            'SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM expenses'
        );

        // Total transactions count (all users including admins)
        const transactionCountResult = await pool.query(
            'SELECT COUNT(*) AS totalTransactions FROM expenses'
        );

        // Average expense per user (excluding admins for accurate analytics)
        const userOnlyStatsResult = await pool.query(
            `SELECT 
        COUNT(DISTINCT u.id) AS userCount,
        COALESCE(SUM(e.amount), 0) AS userExpenses
       FROM users u
       LEFT JOIN expenses e ON e.user_id = u.id
       WHERE u.role = $1`,
            ['USER']
        );

        const totalUsers = Number(userCountResult.rows[0].totalusers || 0);
        const totalExpenses = Number(expenseTotalResult.rows[0].totalexpenses || 0);
        const totalTransactions = Number(transactionCountResult.rows[0].totaltransactions || 0);
        const userOnlyCount = Number(userOnlyStatsResult.rows[0].usercount || 0);
        const userOnlyExpenses = Number(userOnlyStatsResult.rows[0].userexpenses || 0);
        const avgExpensePerUser = userOnlyCount > 0 ? userOnlyExpenses / userOnlyCount : 0;

        return res.json({
            totalUsers,
            totalExpenses,
            totalTransactions,
            avgExpensePerUser: Number(avgExpensePerUser.toFixed(2)),
        });
    } catch (err) {
        console.error('Admin reports overview error:', err);
        return res.status(500).json({ message: 'Failed to fetch overview data' });
    }
};

// Get category-wise spending across all users
export const getCategoryWiseSpending = async (req, res) => {
    try {
        const pool = getDb();

        const categoryDataResult = await pool.query(
            `SELECT 
        c.id AS categoryId,
        c.name AS categoryName,
        COALESCE(SUM(e.amount), 0) AS totalSpent
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id
       GROUP BY c.id, c.name
       ORDER BY totalSpent DESC, c.name ASC`
        );

        const formattedData = categoryDataResult.rows.map((row) => ({
            categoryId: row.categoryid,
            categoryName: row.categoryname,
            totalSpent: Number(row.totalspent || 0),
        }));

        return res.json({ categories: formattedData });
    } catch (err) {
        console.error('Admin reports category-wise error:', err);
        return res.status(500).json({ message: 'Failed to fetch category-wise data' });
    }
};

// Get top users by spending
export const getTopUsersBySpending = async (req, res) => {
    try {
        const pool = getDb();
        const limit = parseInt(req.query.limit) || 5;

        // Validate limit
        if (limit < 1 || limit > 50) {
            return res.status(400).json({ message: 'Limit must be between 1 and 50' });
        }

        // Exclude admin users from rankings for accurate user analytics
        const topUsersResult = await pool.query(
            `SELECT 
        u.id AS userId,
        u.name,
        u.email,
        COALESCE(SUM(e.amount), 0) AS totalSpent
       FROM users u
       LEFT JOIN expenses e ON e.user_id = u.id
       WHERE u.role = $1
       GROUP BY u.id, u.name, u.email
       ORDER BY totalSpent DESC
       LIMIT $2`,
            ['USER', limit]
        );

        const formattedData = topUsersResult.rows.map((row) => ({
            userId: row.userid,
            name: row.name,
            email: row.email,
            totalSpent: Number(row.totalspent || 0),
        }));

        return res.json({ users: formattedData });
    } catch (err) {
        console.error('Admin reports top users error:', err);
        return res.status(500).json({ message: 'Failed to fetch top users data' });
    }
};
