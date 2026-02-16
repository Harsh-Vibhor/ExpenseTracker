import { getDb } from '../config/db.js';

// Get admin reports overview
export const getAdminOverview = async (req, res) => {
    try {
        const pool = getDb();

        // Total users (all roles)
        const [[userCount]] = await pool.execute('SELECT COUNT(*) AS totalUsers FROM users');

        // Total expenses amount (all users including admins)
        const [[expenseTotal]] = await pool.execute(
            'SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM expenses'
        );

        // Total transactions count (all users including admins)
        const [[transactionCount]] = await pool.execute(
            'SELECT COUNT(*) AS totalTransactions FROM expenses'
        );

        // Average expense per user (excluding admins for accurate analytics)
        const [[userOnlyStats]] = await pool.execute(
            `SELECT 
        COUNT(DISTINCT u.id) AS userCount,
        COALESCE(SUM(e.amount), 0) AS userExpenses
       FROM users u
       LEFT JOIN expenses e ON e.user_id = u.id
       WHERE u.role = 'USER'`
        );

        const totalUsers = Number(userCount.totalUsers || 0);
        const totalExpenses = Number(expenseTotal.totalExpenses || 0);
        const totalTransactions = Number(transactionCount.totalTransactions || 0);
        const userOnlyCount = Number(userOnlyStats.userCount || 0);
        const userOnlyExpenses = Number(userOnlyStats.userExpenses || 0);
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

        const [categoryData] = await pool.execute(
            `SELECT 
        c.id AS categoryId,
        c.name AS categoryName,
        COALESCE(SUM(e.amount), 0) AS totalSpent
       FROM categories c
       LEFT JOIN expenses e ON e.category_id = c.id
       GROUP BY c.id, c.name
       ORDER BY totalSpent DESC, c.name ASC`
        );

        const formattedData = categoryData.map((row) => ({
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            totalSpent: Number(row.totalSpent || 0),
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
        const [topUsers] = await pool.execute(
            `SELECT 
        u.id AS userId,
        u.name,
        u.email,
        COALESCE(SUM(e.amount), 0) AS totalSpent
       FROM users u
       LEFT JOIN expenses e ON e.user_id = u.id
       WHERE u.role = 'USER'
       GROUP BY u.id, u.name, u.email
       ORDER BY totalSpent DESC
       LIMIT ?`,
            [limit]
        );

        const formattedData = topUsers.map((row) => ({
            userId: row.userId,
            name: row.name,
            email: row.email,
            totalSpent: Number(row.totalSpent || 0),
        }));

        return res.json({ users: formattedData });
    } catch (err) {
        console.error('Admin reports top users error:', err);
        return res.status(500).json({ message: 'Failed to fetch top users data' });
    }
};
