import { useState, useEffect } from 'react';
import apiClient from '../api/axios.js';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());

  const [monthlyData, setMonthlyData] = useState(null);
  const [budgetData, setBudgetData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllReports();
  }, [selectedMonth, selectedYear]);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const [monthlyRes, budgetRes, yearlyRes] = await Promise.all([
        apiClient.get(`/reports/monthly?month=${selectedMonth}`),
        apiClient.get(`/reports/budget-vs-actual?month=${selectedMonth}`),
        apiClient.get(`/reports/yearly?year=${selectedYear}`),
      ]);

      setMonthlyData(monthlyRes.data);
      setBudgetData(budgetRes.data);
      setYearlyData(yearlyRes.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatMonthLabel = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatYearMonthLabel = (monthStr) => {
    const [, month] = monthStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[parseInt(month) - 1];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 animate-pulse transition-colors duration-200">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 animate-pulse transition-colors duration-200">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 border border-transparent dark:border-slate-700 p-6 transition-colors duration-200">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const pieColors = [
    '#14B8A6', '#3B82F6', '#8B5CF6', '#F59E0B',
    '#EF4444', '#10B981', '#EC4899', '#6366F1',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 border border-transparent dark:border-slate-700 p-6 transition-colors duration-200">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Reports</h1>
        <p className="text-gray-600 dark:text-gray-200 mt-2">Insights into your spending</p>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Select Month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Select Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-colors duration-200"
            >
              {[2024, 2025, 2026, 2027].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 1: Monthly Expense Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 border border-transparent dark:border-slate-700 p-6 transition-colors duration-200">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Monthly Expense Breakdown
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-200 mb-4">
          {formatMonthLabel(selectedMonth)} - Total: {formatCurrency(monthlyData?.totalSpent || 0)}
        </p>

        {!monthlyData?.categoryBreakdown || monthlyData.categoryBreakdown.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm">No expenses for this month</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={monthlyData.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ categoryName, percent }) => `${categoryName} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalSpent"
                >
                  {monthlyData.categoryBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData.categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="categoryName" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value) => [formatCurrency(value), 'Spent']}
                />
                <Bar dataKey="totalSpent" fill="#14B8A6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Section 2: Budget vs Actual */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 border border-transparent dark:border-slate-700 p-6 transition-colors duration-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Budget vs Actual
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-200 mb-4">{formatMonthLabel(selectedMonth)}</p>

        {!budgetData?.data || budgetData.data.every(cat => cat.budgetAmount === 0 && cat.spentAmount === 0) ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No budgets or expenses for this month</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={budgetData.data.filter(cat => cat.budgetAmount > 0 || cat.spentAmount > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="categoryName" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="budgetAmount" fill="#3B82F6" name="Budget" />
                <Bar dataKey="spentAmount" fill="#14B8A6" name="Actual Spent" />
              </BarChart>
            </ResponsiveContainer>

            {/* Over-budget categories */}
            <div className="mt-4">
              {budgetData.data.filter(cat => cat.remainingAmount < 0).length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">⚠️ Over Budget Categories</h3>
                  <ul className="space-y-1">
                    {budgetData.data
                      .filter(cat => cat.remainingAmount < 0)
                      .map((cat) => (
                        <li key={cat.categoryId} className="text-sm text-red-700">
                          <span className="font-medium">{cat.categoryName}:</span> Over by {formatCurrency(Math.abs(cat.remainingAmount))}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Section 3: Yearly Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 border border-transparent dark:border-slate-700 p-6 transition-colors duration-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Yearly Overview
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-200 mb-4">
          {selectedYear} - Total: {formatCurrency(yearlyData?.data?.reduce((sum, m) => sum + m.totalSpent, 0) || 0)}
        </p>

        {!yearlyData?.data || yearlyData.data.every(m => m.totalSpent === 0) ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <p className="text-sm">No expenses for this year</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={yearlyData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                tickFormatter={formatYearMonthLabel}
              />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} tickFormatter={(value) => `₹${value}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value) => [formatCurrency(value), 'Total Spent']}
                labelFormatter={formatMonthLabel}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="totalSpent"
                stroke="#14B8A6"
                strokeWidth={2}
                name="Total Spent"
                dot={{ fill: '#14B8A6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div >
  );
};

export default Reports;
