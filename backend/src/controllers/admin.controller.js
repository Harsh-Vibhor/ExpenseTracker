import { getDb } from '../config/db.js';

export const getAllExpensesAdmin = async (req, res) => {
  try {
    const pool = getDb();
    const result = await pool.query(
      `SELECT e.*, u.name as user_name, c.name as category_name 
       FROM expenses e 
       LEFT JOIN users u ON e.user_id = u.id 
       LEFT JOIN categories c ON e.category_id = c.id 
       ORDER BY e.expense_date DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error('Admin get expenses error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllUsersAdmin = async (req, res) => {
  try {
    const pool = getDb();
    const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    return res.json(result.rows);
  } catch (err) {
    console.error('Admin get users error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAdminSummary = async (req, res) => {
  try {
    const pool = getDb();

    const usersResult = await pool.query(
      'SELECT COUNT(*) AS totalUsers FROM users'
    );

    const transactionsResult = await pool.query(
      'SELECT COUNT(*) AS totalTransactions FROM expenses'
    );

    const amountResult = await pool.query(
      'SELECT COALESCE(SUM(amount), 0) AS totalAmount FROM expenses'
    );

    return res.json({
      totalUsers: Number(usersResult.rows[0].totalusers),
      totalTransactions: Number(transactionsResult.rows[0].totaltransactions),
      totalAmount: Number(amountResult.rows[0].totalamount),
    });
  } catch (err) {
    console.error('Admin get summary error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const getAdminCategories = async (req, res) => {
  try {
    const pool = getDb();
    const result = await pool.query(
      `SELECT 
         c.id,
         c.name,
         COUNT(e.id) AS expense_count,
         COALESCE(SUM(e.amount), 0) AS total_amount
       FROM categories c
       LEFT JOIN expenses e ON c.id = e.category_id
       GROUP BY c.id, c.name
       ORDER BY total_amount DESC`
    );

    return res.json(result.rows);
  } catch (err) {
    console.error('Admin get categories error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const findCategoryById = async (categoryId) => {
  const pool = getDb();
  const result = await pool.query('SELECT * FROM categories WHERE id = $1 LIMIT 1', [categoryId]);
  return result.rows[0] || null;
};

export const getAllCategories = async () => {
  const pool = getDb();
  const result = await pool.query('SELECT * FROM categories ORDER BY name');
  return result.rows;
};

export const getAllUsers = async () => {
  const pool = getDb();
  const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
  return result.rows;
};

// Get all users for admin management
export const getUsersForManagement = async (req, res) => {
  try {
    const pool = getDb();

    // Get all users except admins
    const usersResult = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        COUNT(e.id) AS expense_count,
        COALESCE(SUM(e.amount), 0) AS total_spent
       FROM users u
       LEFT JOIN expenses e ON u.id = e.user_id
       WHERE u.role != $1
       GROUP BY u.id, u.name, u.email, u.role, u.created_at
       ORDER BY u.created_at DESC`,
      ['ADMIN']
    );

    return res.json(usersResult.rows);
  } catch (err) {
    console.error('Admin get users for management error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user status (disabled for now - requires status column)
export const updateUserStatus = async (req, res) => {
  return res.status(501).json({ message: 'User status management not implemented yet' });
};

// Get user activity summary
export const getUserActivitySummary = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getDb();

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [id]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's expense summary
    const summaryResult = await pool.query(
      `SELECT 
        COUNT(*) AS total_expenses_count,
        COALESCE(SUM(amount), 0) AS total_amount_spent,
        MAX(expense_date) AS last_expense_date
       FROM expenses
       WHERE user_id = $1`,
      [id]
    );

    const summary = summaryResult.rows[0];

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      activity: {
        total_expenses_count: Number(summary.total_expenses_count || 0),
        total_amount_spent: Number(summary.total_amount_spent || 0),
        last_expense_date: summary.last_expense_date || null,
      },
    });
  } catch (err) {
    console.error('Admin get user activity summary error:', err);
    return res.status(500).json({ message: 'Failed to fetch user activity summary' });
  }
};

// Get users by category (for drilldown)
export const getUsersByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const pool = getDb();

    // Verify category exists
    const categoryResult = await pool.query(
      'SELECT id, name FROM categories WHERE id = $1',
      [categoryId]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get users who have expenses in this category (excluding admins)
    const usersResult = await pool.query(
      `SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(e.id) AS expense_count,
        COALESCE(SUM(e.amount), 0) AS total_spent
       FROM users u
       INNER JOIN expenses e ON u.id = e.user_id
       WHERE e.category_id = $1 AND u.role != $2
       GROUP BY u.id, u.name, u.email
       ORDER BY total_spent DESC`,
      [categoryId, 'ADMIN']
    );

    return res.json({
      category: categoryResult.rows[0],
      users: usersResult.rows,
    });
  } catch (err) {
    console.error('Admin get users by category error:', err);
    return res.status(500).json({ message: 'Failed to fetch users by category' });
  }
};
