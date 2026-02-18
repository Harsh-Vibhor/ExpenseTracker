import { supabase } from '../config/supabase.js';

// ── GET /api/reports/monthly?month=YYYY-MM ────────────────────────────────────
export const getMonthlySummary = async (req, res) => {
    try {
        const { month } = req.query;
        const userId = req.user.id;

        if (!month || !/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({ message: 'Valid month (YYYY-MM) is required' });
        }

        // Date range for the month
        const [year, mon] = month.split('-').map(Number);
        const from = `${month}-01`;
        const lastDay = new Date(year, mon, 0).getDate();
        const to = `${month}-${String(lastDay).padStart(2, '0')}`;

        const { data: expenses, error } = await supabase
            .from('expenses')
            .select('amount, category_id, categories ( id, name )')
            .eq('user_id', userId)
            .gte('date', from)
            .lte('date', to);

        if (error) throw error;

        const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);

        // Category breakdown
        const catMap = new Map();
        for (const e of expenses) {
            const catId = e.category_id;
            const catName = e.categories?.name ?? 'Uncategorised';
            if (!catMap.has(catId)) {
                catMap.set(catId, { categoryId: catId, categoryName: catName, totalSpent: 0 });
            }
            catMap.get(catId).totalSpent += Number(e.amount);
        }
        const categoryBreakdown = [...catMap.values()]
            .sort((a, b) => b.totalSpent - a.totalSpent);

        return res.json({ month, totalSpent, categoryBreakdown });
    } catch (err) {
        console.error('Monthly summary report error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// ── GET /api/reports/budget-vs-actual?month=YYYY-MM ───────────────────────────
export const getBudgetVsActual = async (req, res) => {
    try {
        const { month } = req.query;
        const userId = req.user.id;

        if (!month || !/^\d{4}-\d{2}$/.test(month)) {
            return res.status(400).json({ message: 'Valid month (YYYY-MM) is required' });
        }

        const [year, mon] = month.split('-').map(Number);
        const from = `${month}-01`;
        const lastDay = new Date(year, mon, 0).getDate();
        const to = `${month}-${String(lastDay).padStart(2, '0')}`;

        // Fetch user's categories, budgets for this month, and expenses for this month
        const [catsRes, budgetsRes, expensesRes] = await Promise.all([
            supabase
                .from('categories')
                .select('id, name')
                .eq('user_id', userId),
            supabase
                .from('category_budgets')
                .select('category_id, budget_amount')
                .eq('user_id', userId)
                .eq('month', month),
            supabase
                .from('expenses')
                .select('category_id, amount')
                .eq('user_id', userId)
                .gte('date', from)
                .lte('date', to),
        ]);

        if (catsRes.error) throw catsRes.error;
        if (budgetsRes.error) throw budgetsRes.error;
        if (expensesRes.error) throw expensesRes.error;

        // Build lookup maps
        const budgetMap = new Map(
            (budgetsRes.data ?? []).map((b) => [b.category_id, Number(b.budget_amount)])
        );
        const spentMap = new Map();
        for (const e of expensesRes.data ?? []) {
            spentMap.set(e.category_id, (spentMap.get(e.category_id) ?? 0) + Number(e.amount));
        }

        const data = (catsRes.data ?? []).map((c) => {
            const budgetAmount = budgetMap.get(c.id) ?? 0;
            const spentAmount = spentMap.get(c.id) ?? 0;
            return {
                categoryId: c.id,
                categoryName: c.name,
                budgetAmount,
                spentAmount,
                remainingAmount: budgetAmount - spentAmount,
            };
        });

        return res.json({ month, data });
    } catch (err) {
        console.error('Budget vs actual report error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// ── GET /api/reports/yearly?year=YYYY ─────────────────────────────────────────
export const getYearlyOverview = async (req, res) => {
    try {
        const { year } = req.query;
        const userId = req.user.id;

        if (!year || !/^\d{4}$/.test(year)) {
            return res.status(400).json({ message: 'Valid year (YYYY) is required' });
        }

        const { data, error } = await supabase
            .from('expenses')
            .select('amount, date')
            .eq('user_id', userId)
            .gte('date', `${year}-01-01`)
            .lte('date', `${year}-12-31`);

        if (error) throw error;

        // Aggregate by month
        const monthMap = new Map();
        for (const e of data) {
            const key = e.date.slice(0, 7); // "YYYY-MM"
            monthMap.set(key, (monthMap.get(key) ?? 0) + Number(e.amount));
        }

        // Fill all 12 months
        const monthlyData = [];
        for (let m = 1; m <= 12; m++) {
            const monthStr = `${year}-${String(m).padStart(2, '0')}`;
            monthlyData.push({ month: monthStr, totalSpent: monthMap.get(monthStr) ?? 0 });
        }

        return res.json({ year, data: monthlyData });
    } catch (err) {
        console.error('Yearly overview report error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
