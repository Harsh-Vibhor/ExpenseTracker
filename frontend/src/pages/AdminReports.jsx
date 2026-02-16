import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import apiClient from '../api/axios.js';
import AdminChartTooltip from '../components/AdminChartTooltip.jsx';
import AdminChartEmptyState from '../components/AdminChartEmptyState.jsx';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overview, setOverview] = useState({
    totalUsers: 0,
    totalExpenses: 0,
    totalTransactions: 0,
    avgExpensePerUser: 0,
  });
  const [categoryData, setCategoryData] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [topUsersLimit, setTopUsersLimit] = useState(5);

  useEffect(() => {
    fetchReportsData();
  }, [topUsersLimit]);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, categoryRes, topUsersRes] = await Promise.all([
        apiClient.get('/admin/reports/overview'),
        apiClient.get('/admin/reports/category-wise'),
        apiClient.get(`/admin/reports/top-users?limit=${topUsersLimit}`),
      ]);

      setOverview(overviewRes.data);
      setCategoryData(categoryRes.data.categories || []);
      setTopUsers(topUsersRes.data.users || []);
    } catch (err) {
      console.error('Failed to fetch reports data:', err);
      setError(err.response?.data?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 animate-pulse transition-colors duration-200">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 animate-pulse transition-colors duration-200">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error Loading Reports</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchReportsData}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 transition-colors duration-200">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Admin Reports</h2>
        <p className="text-gray-600 dark:text-gray-200">Comprehensive analytics across all users and expenses</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-200">Total Users</h3>
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{overview.totalUsers}</p>
          <p className="text-sm text-gray-500 dark:text-gray-200 mt-1">Registered users</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-200">Total Expenses</h3>
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{formatCurrency(overview.totalExpenses)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-200 mt-1">Total tracked</p>
        </div>

        {/* Total Transactions */}
        <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-200">Total Transactions</h3>
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{overview.totalTransactions}</p>
          <p className="text-sm text-gray-500 dark:text-gray-200 mt-1">All time</p>
        </div>

        {/* Avg Expense Per User */}
        <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-200">Avg / User</h3>
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{formatCurrency(overview.avgExpensePerUser)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-200 mt-1">Average spending</p>
        </div>
      </div>

      {/* Category-wise Spending Chart */}
      <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Category-wise Spending (All Users)</h3>
        {categoryData.filter(cat => cat.totalSpent > 0).length === 0 ? (
          <AdminChartEmptyState
            title="No category spending data"
            subtitle="Expense data will appear here once users add expenses"
          />
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={categoryData.filter(cat => cat.totalSpent > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" className="dark:stroke-slate-700" />
              <XAxis
                dataKey="categoryName"
                stroke="#9CA3AF"
                className="dark:stroke-white"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#9CA3AF"
                className="dark:stroke-white"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<AdminChartTooltip />} />
              <Bar dataKey="totalSpent" radius={[8, 8, 0, 0]}>
                {categoryData.filter(cat => cat.totalSpent > 0).map((_entry, index) => {
                  const colors = [
                    '#14B8A6', '#3B82F6', '#8B5CF6', '#F59E0B',
                    '#EF4444', '#10B981', '#EC4899', '#6366F1',
                  ];
                  return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Users by Spending */}
      <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Top Spending Users</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Excludes admin accounts</p>
            </div>
            <select
              value={topUsersLimit}
              onChange={(e) => setTopUsersLimit(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
            </select>
          </div>
        </div>
        {topUsers.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-400 dark:text-gray-300">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p className="text-sm">No users found</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-white">Rank</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-white">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-white">Email</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-white">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((user, index) => (
                  <tr
                    key={user.userId}
                    className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-150"
                  >
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-white font-medium">
                      #{index + 1}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-white font-medium">
                      {user.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-200">
                      {user.email}
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-semibold text-gray-800 dark:text-white">
                      {formatCurrency(user.totalSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
