import { getDb } from '../config/db.js';

export const getAllExpensesAdmin = async (req, res) => {
  try {
    const pool = getDb();
    const [expenses] = await pool.execute(
      `SELECT e.*, u.name as user_name, c.name as category_name 
       FROM expenses e 
       LEFT JOIN users u ON e.user_id = u.id 
       LEFT JOIN categories c ON e.category_id = c.id 
       ORDER BY e.expense_date DESC`
    );
    return res.json(expenses);
  } catch (err) {
    console.error('Admin get expenses error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllUsersAdmin = async (req, res) => {
  try {
    const pool = getDb();
    const [users] = await pool.execute('SELECT id, name, email, role, created_at FROM users');
    return res.json(users);
  } catch (err) {
    console.error('Admin get users error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAdminSummary = async (req, res) => {
  try {
    const pool = getDb();

    const [[users]] = await pool.execute(
      'SELECT COUNT(*) AS totalUsers FROM users'
    );

    const [[transactions]] = await pool.execute(
      'SELECT COUNT(*) AS totalTransactions FROM expenses'
    );

    const [[amount]] = await pool.execute(
      'SELECT COALESCE(SUM(amount), 0) AS totalAmount FROM expenses'
    );

    return res.json({
      totalUsers: Number(users.totalUsers),
      totalTransactions: Number(transactions.totalTransactions),
      totalAmount: Number(amount.totalAmount),
    });
  } catch (err) {
    console.error('Admin get summary error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const getAdminCategories = async (req, res) => {
  try {
    const pool = getDb();
    const [categories] = await pool.execute(
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

    return res.json(categories);
  } catch (err) {
    console.error('Admin get categories error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const findCategoryById = async (categoryId) => {
  const pool = getDb();
  const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ? LIMIT 1', [categoryId]);
  return rows[0] || null;
};

export const getAllCategories = async () => {
  const pool = getDb();
  const [rows] = await pool.execute('SELECT * FROM categories ORDER BY name');
  return rows;
};

export const getAllUsers = async () => {
  const pool = getDb();
  const [rows] = await pool.execute('SELECT id, name, email, role, created_at FROM users');
  return rows;
};

// Get all users for admin management
export const getUsersForManagement = async (req, res) => {
  try {
    const pool = getDb();

    // Fetch all users with relevant fields (excluding password)
    // Note: status column doesn't exist in DB, so we add it virtually
    const [users] = await pool.execute(
      `SELECT id, name, email, role, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );

    // Add virtual status field (all users are ACTIVE for now)
    const usersWithStatus = users.map(user => ({
      ...user,
      status: 'ACTIVE'
    }));

    return res.json({ users: usersWithStatus });
  } catch (err) {
    console.error('Admin get users for management error:', err);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// Update user status (block/unblock)
// NOTE: Disabled temporarily - status column doesn't exist in database
export const updateUserStatus = async (req, res) => {
  try {
    // Status column doesn't exist in database yet
    // This feature will be enabled once the status column is added via migration
    return res.status(501).json({
      message: 'User status management is not available yet. The status column needs to be added to the database.'
    });
  } catch (err) {
    console.error('Admin update user status error:', err);
    return res.status(500).json({ message: 'Failed to update user status' });
  }
};

// Get user activity summary
export const getUserActivitySummary = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getDb();

    // Check if user exists
    const [[user]] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's expense summary
    const [[summary]] = await pool.execute(
      `SELECT 
        COUNT(*) AS total_expenses_count,
        COALESCE(SUM(amount), 0) AS total_amount_spent,
        MAX(expense_date) AS last_expense_date
       FROM expenses
       WHERE user_id = ?`,
      [id]
    );

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

    // Check if category exists
    const [[category]] = await pool.execute(
      'SELECT id, name FROM categories WHERE id = ?',
      [categoryId]
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Get users who have expenses in this category (excluding admins)
    const [users] = await pool.execute(
      `SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        COUNT(e.id) AS expense_count,
        COALESCE(SUM(e.amount), 0) AS total_spent_in_category
       FROM users u
       INNER JOIN expenses e ON e.user_id = u.id
       WHERE e.category_id = ? AND u.role = 'USER'
       GROUP BY u.id, u.name, u.email, u.role, u.created_at
       ORDER BY total_spent_in_category DESC`,
      [categoryId]
    );

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      status: 'ACTIVE', // Virtual field
      expense_count: Number(user.expense_count || 0),
      total_spent_in_category: Number(user.total_spent_in_category || 0),
    }));

    return res.json({
      category: {
        id: category.id,
        name: category.name,
      },
      users: formattedUsers,
    });
  } catch (err) {
    console.error('Admin get users by category error:', err);
    return res.status(500).json({ message: 'Failed to fetch users by category' });
  }
};
