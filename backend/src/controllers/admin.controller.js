import { supabase } from '../config/supabase.js';

// ── GET /api/admin/expenses ───────────────────────────────────────────────────
export const getAllExpensesAdmin = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        id,
        amount,
        description,
        date,
        created_at,
        user_id,
        category_id,
        users ( name ),
        categories ( name )
      `)
      .order('date', { ascending: false });

    if (error) throw error;

    const rows = data.map((e) => ({
      id: e.id,
      user_id: e.user_id,
      category_id: e.category_id,
      amount: e.amount,
      description: e.description,
      expense_date: e.date,
      created_at: e.created_at,
      user_name: e.users?.name ?? null,
      category_name: e.categories?.name ?? null,
    }));

    return res.json(rows);
  } catch (err) {
    console.error('Admin get expenses error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /api/admin/users ──────────────────────────────────────────────────────
export const getAllUsersAdmin = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json(data);
  } catch (err) {
    console.error('Admin get users error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /api/admin/summary ────────────────────────────────────────────────────
export const getAdminSummary = async (req, res) => {
  try {
    const [usersRes, transactionsRes, amountRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('expenses').select('id', { count: 'exact', head: true }),
      supabase.from('expenses').select('amount'),
    ]);

    if (usersRes.error) throw usersRes.error;
    if (transactionsRes.error) throw transactionsRes.error;
    if (amountRes.error) throw amountRes.error;

    const totalAmount = (amountRes.data ?? []).reduce(
      (sum, row) => sum + Number(row.amount),
      0
    );

    return res.json({
      totalUsers: usersRes.count ?? 0,
      totalTransactions: transactionsRes.count ?? 0,
      totalAmount,
    });
  } catch (err) {
    console.error('Admin get summary error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /api/admin/categories ─────────────────────────────────────────────────
export const getAdminCategories = async (req, res) => {
  try {
    // Fetch all categories with their expenses
    const { data, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        expenses ( amount )
      `)
      .order('name', { ascending: true });

    if (error) throw error;

    const rows = data.map((c) => {
      const expenses = c.expenses ?? [];
      const total_amount = expenses.reduce((s, e) => s + Number(e.amount), 0);
      return {
        id: c.id,
        name: c.name,
        expense_count: expenses.length,
        total_amount,
      };
    });

    // Sort by total_amount desc
    rows.sort((a, b) => b.total_amount - a.total_amount);

    return res.json(rows);
  } catch (err) {
    console.error('Admin get categories error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /api/admin/users/management ──────────────────────────────────────────
export const getUsersForManagement = async (req, res) => {
  try {
    // Try to select `status`. If the column doesn't exist yet (error 42703),
    // fall back to a query without it and default status to 'ACTIVE'.
    let data, error, hasStatusColumn = true;

    ({ data, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, created_at, expenses ( amount )')
      .neq('role', 'ADMIN')
      .order('created_at', { ascending: false }));

    if (error && error.code === '42703') {
      // `status` column does not exist yet — retry without it
      hasStatusColumn = false;
      console.warn('[getUsersForManagement] status column missing — run migration. Falling back.');
      ({ data, error } = await supabase
        .from('users')
        .select('id, name, email, role, created_at, expenses ( amount )')
        .neq('role', 'ADMIN')
        .order('created_at', { ascending: false }));
    }

    if (error) {
      console.error('[getUsersForManagement] Supabase error:', { code: error.code, message: error.message });
      throw error;
    }

    const rows = (data ?? []).map((u) => {
      const expenses = u.expenses ?? [];
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        // Default to 'ACTIVE' if column doesn't exist yet
        status: hasStatusColumn ? (u.status ?? 'ACTIVE') : 'ACTIVE',
        created_at: u.created_at,
        expense_count: expenses.length,
        total_spent: expenses.reduce((s, e) => s + Number(e.amount), 0),
      };
    });

    return res.json(rows);
  } catch (err) {
    console.error('[getUsersForManagement] error:', { message: err.message, code: err.code });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ── PATCH /api/admin/users/:id/status ────────────────────────────────────────
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['ACTIVE', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ message: 'status must be ACTIVE or BLOCKED' });
    }

    // Verify user exists and is not an admin
    const { data: existing, error: fetchErr } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!existing) return res.status(404).json({ message: 'User not found' });
    if (existing.role === 'ADMIN') {
      return res.status(403).json({ message: 'Cannot change status of an admin user' });
    }

    // Update status — if the column doesn't exist yet, this will return a Supabase error
    // with code 42703. In that case, run the SQL migration below.
    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', id)
      .select('id, name, email, role, status')
      .maybeSingle();

    if (error) {
      if (error.code === '42703') {
        // Column `status` doesn't exist in the table yet
        return res.status(500).json({
          message: 'status column missing — run migration: ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT \'ACTIVE\';',
        });
      }
      throw error;
    }

    return res.json({ message: `User ${status === 'BLOCKED' ? 'blocked' : 'unblocked'} successfully`, user: data });
  } catch (err) {
    console.error('updateUserStatus error:', { message: err.message, code: err.code });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /api/admin/users/:id/activity ────────────────────────────────────────
export const getUserActivitySummary = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', id)
      .maybeSingle();

    if (userErr) throw userErr;
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { data: expenses, error: expErr } = await supabase
      .from('expenses')
      .select('amount, date')
      .eq('user_id', id);

    if (expErr) throw expErr;

    const total_expenses_count = expenses.length;
    const total_amount_spent = expenses.reduce((s, e) => s + Number(e.amount), 0);
    const dates = expenses.map((e) => e.date).filter(Boolean).sort();
    const last_expense_date = dates.length ? dates[dates.length - 1] : null;

    return res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      activity: { total_expenses_count, total_amount_spent, last_expense_date },
    });
  } catch (err) {
    console.error('Admin get user activity summary error:', err);
    return res.status(500).json({ message: 'Failed to fetch user activity summary' });
  }
};

// ── GET /api/admin/users/by-category/:categoryId ───────────────────────────
export const getUsersByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const { data: category, error: catErr } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', categoryId)
      .maybeSingle();

    if (catErr) throw catErr;
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Fetch expenses with their user data.
    // NOTE: PostgREST does NOT support .neq('users.role', ...) on joined tables —
    // that filter is silently ignored. We filter admins out in JS instead.
    const { data: expenses, error: expErr } = await supabase
      .from('expenses')
      .select('amount, users!inner ( id, name, email, role )')
      .eq('category_id', categoryId);

    if (expErr) throw expErr;

    // Aggregate per user, excluding admins
    const userMap = new Map();
    for (const e of expenses) {
      const u = e.users;
      if (!u || u.role === 'ADMIN') continue;  // filter admins in JS
      if (!userMap.has(u.id)) {
        userMap.set(u.id, { id: u.id, name: u.name, email: u.email, expense_count: 0, total_spent: 0 });
      }
      const entry = userMap.get(u.id);
      entry.expense_count += 1;
      entry.total_spent += Number(e.amount);
    }

    const users = [...userMap.values()].sort((a, b) => b.total_spent - a.total_spent);

    return res.json({ category, users });
  } catch (err) {
    console.error('[getUsersByCategory] error:', { message: err.message, code: err.code });
    return res.status(500).json({ message: 'Failed to fetch users by category' });
  }
};

// ── Helper exports used by admin.reports.controller.js ───────────────────────
export const findCategoryById = async (categoryId) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const getAllCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};
