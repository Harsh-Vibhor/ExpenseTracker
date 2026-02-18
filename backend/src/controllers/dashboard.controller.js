import { supabase } from '../config/supabase.js';

// ── GET /api/dashboard/summary ────────────────────────────────────────────────
export const getUserSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // All expenses for this user
    const { data: expenses, error: expErr } = await supabase
      .from('expenses')
      .select('id, amount, description, date, category_id, categories ( name )')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (expErr) throw expErr;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-based

    let totalExpense = 0;
    let monthlyExpense = 0;

    for (const e of expenses) {
      const amount = Number(e.amount);
      totalExpense += amount;

      const d = new Date(e.date);
      if (d.getFullYear() === currentYear && d.getMonth() + 1 === currentMonth) {
        monthlyExpense += amount;
      }
    }

    // Category breakdown
    const categoryMap = new Map();
    for (const e of expenses) {
      const catId = e.category_id;
      const catName = e.categories?.name ?? 'Uncategorised';
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, { id: catId, name: catName, total: 0 });
      }
      categoryMap.get(catId).total += Number(e.amount);
    }
    const categoryBreakdown = [...categoryMap.values()]
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

    // Recent 5 expenses
    const recentExpenses = expenses.slice(0, 5).map((e) => ({
      id: e.id,
      amount: e.amount,
      description: e.description,
      expense_date: e.date,
      category_name: e.categories?.name ?? null,
    }));

    return res.json({ totalExpense, monthlyExpense, categoryBreakdown, recentExpenses });
  } catch (err) {
    console.error('User dashboard summary error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GET /api/dashboard/monthly ────────────────────────────────────────────────
export const getUserMonthly = async (req, res) => {
  try {
    const userId = req.user.id;

    // Last 6 calendar months (inclusive of current)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const fromDate = sixMonthsAgo.toISOString().slice(0, 10); // YYYY-MM-DD

    const { data, error } = await supabase
      .from('expenses')
      .select('amount, date')
      .eq('user_id', userId)
      .gte('date', fromDate)
      .order('date', { ascending: true });

    if (error) throw error;

    // Aggregate by YYYY-MM
    const monthMap = new Map();
    for (const e of data) {
      const key = e.date.slice(0, 7); // "YYYY-MM"
      monthMap.set(key, (monthMap.get(key) ?? 0) + Number(e.amount));
    }

    // Build ordered 6-month array with labels
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      months.push({
        month: `${key}-01`,
        label,
        total: monthMap.get(key) ?? 0,
      });
    }

    return res.json({ months });
  } catch (err) {
    console.error('User monthly dashboard error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
