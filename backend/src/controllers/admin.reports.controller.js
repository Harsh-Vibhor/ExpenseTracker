import { supabase } from '../config/supabase.js';

// ── GET /api/admin/reports/overview ──────────────────────────────────────────
export const getAdminOverview = async (req, res) => {
    try {
        const [usersRes, expensesRes, userOnlyRes] = await Promise.all([
            supabase.from('users').select('id', { count: 'exact', head: true }),
            supabase.from('expenses').select('amount'),
            supabase.from('users')
                .select('id, expenses ( amount )')
                .eq('role', 'USER'),
        ]);

        if (usersRes.error) throw usersRes.error;
        if (expensesRes.error) throw expensesRes.error;
        if (userOnlyRes.error) throw userOnlyRes.error;

        const totalUsers = usersRes.count ?? 0;
        const totalTransactions = (expensesRes.data ?? []).length;
        const totalExpenses = (expensesRes.data ?? []).reduce(
            (s, e) => s + Number(e.amount), 0
        );

        const userOnlyData = userOnlyRes.data ?? [];
        const userOnlyCount = userOnlyData.length;
        const userOnlyExpenses = userOnlyData.reduce(
            (s, u) => s + (u.expenses ?? []).reduce((es, e) => es + Number(e.amount), 0),
            0
        );
        const avgExpensePerUser = userOnlyCount > 0
            ? Number((userOnlyExpenses / userOnlyCount).toFixed(2))
            : 0;

        return res.json({ totalUsers, totalExpenses, totalTransactions, avgExpensePerUser });
    } catch (err) {
        console.error('Admin reports overview error:', err);
        return res.status(500).json({ message: 'Failed to fetch overview data' });
    }
};

// ── GET /api/admin/reports/categories ────────────────────────────────────────
export const getCategoryWiseSpending = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('id, name, expenses ( amount )');

        if (error) throw error;

        const formattedData = (data ?? []).map((c) => ({
            categoryId: c.id,
            categoryName: c.name,
            totalSpent: (c.expenses ?? []).reduce((s, e) => s + Number(e.amount), 0),
        })).sort((a, b) => b.totalSpent - a.totalSpent);

        return res.json({ categories: formattedData });
    } catch (err) {
        console.error('Admin reports category-wise error:', err);
        return res.status(500).json({ message: 'Failed to fetch category-wise data' });
    }
};

// ── GET /api/admin/reports/top-users ─────────────────────────────────────────
export const getTopUsersBySpending = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        if (limit < 1 || limit > 50) {
            return res.status(400).json({ message: 'Limit must be between 1 and 50' });
        }

        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, expenses ( amount )')
            .eq('role', 'USER');

        if (error) throw error;

        const formattedData = (data ?? [])
            .map((u) => ({
                userId: u.id,
                name: u.name,
                email: u.email,
                totalSpent: (u.expenses ?? []).reduce((s, e) => s + Number(e.amount), 0),
            }))
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, limit);

        return res.json({ users: formattedData });
    } catch (err) {
        console.error('Admin reports top users error:', err);
        return res.status(500).json({ message: 'Failed to fetch top users data' });
    }
};
