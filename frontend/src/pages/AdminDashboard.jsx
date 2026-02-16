import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axios.js';
import { useAuth } from '../auth/AuthContext.jsx';
import AdminChartTooltip from '../components/AdminChartTooltip.jsx';
import AdminChartEmptyState from '../components/AdminChartEmptyState.jsx';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState({
    totalUsers: 0,
    totalAmount: 0,
    totalTransactions: 0,
  });
  const [categoryData, setCategoryData] = useState([]);
  const { role } = useAuth();
  const navigate = useNavigate();

  // Handle category bar click for drilldown
  const handleCategoryClick = (categoryId, categoryName) => {
    if (categoryId && categoryName) {
      navigate(`/admin/users?category=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`);
    }
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both summary and category data
        const [summaryResponse, categoryResponse] = await Promise.all([
          apiClient.get('/admin/summary'),
          apiClient.get('/admin/categories'),
        ]);

        setSummaryData(summaryResponse.data);
        setCategoryData(categoryResponse.data || []);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError(err.response?.data?.message || 'Failed to load admin dashboard data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Access denied check
  if (role !== 'ADMIN' && !loading) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-red-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h3>
              <p className="text-red-700">You do not have permission to view this page.</p>
              <p className="text-sm text-red-600 mt-2">Admin privileges are required.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 animate-pulse transition-colors duration-200">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 animate-pulse transition-colors duration-200">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        {/* Chart Skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 animate-pulse transition-colors duration-200">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="h-80 bg-gray-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-red-600 mr-3"
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
              <h3 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 transition-colors duration-200">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Admin Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-200">Monitor and manage all users and expenses across the platform.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-200">Total Users</h3>
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{summaryData.totalUsers}</p>
          <p className="text-sm text-gray-500 dark:text-gray-200 mt-1">Registered users</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-200">Total Expenses</h3>
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{formatCurrency(summaryData?.totalAmount ?? 0)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-200 mt-1">Total tracked</p>
        </div>

        {/* Total Transactions */}
        <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-200">Total Transactions</h3>
            <svg
              className="w-8 h-8 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white">{summaryData.totalTransactions}</p>
          <p className="text-sm text-gray-500 dark:text-gray-200 mt-1">All time</p>
        </div>
      </div>

      {/* Category Analytics Chart */}
      <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 transition-colors duration-200">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Category-wise Spending</h3>
        {categoryData.filter(cat => cat.total_amount > 0).length === 0 ? (
          <AdminChartEmptyState
            title="No category data available"
            subtitle="Category spending will appear here once expenses are added"
          />
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={categoryData.filter(cat => cat.total_amount > 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip content={<AdminChartTooltip />} />
              <Bar
                dataKey="total_amount"
                radius={[8, 8, 0, 0]}
              >
                {categoryData.filter(cat => cat.total_amount > 0).map((category, index) => {
                  const colors = [
                    '#14B8A6', // teal
                    '#3B82F6', // blue
                    '#8B5CF6', // purple
                    '#F59E0B', // amber
                    '#EF4444', // red
                    '#10B981', // green
                    '#EC4899', // pink
                    '#6366F1', // indigo
                  ];
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                      onClick={() => handleCategoryClick(category.id, category.name)}
                      cursor="pointer"
                      style={{ opacity: 1, transition: 'opacity 0.2s' }}
                      onMouseEnter={(e) => { e.target.style.opacity = 0.8; }}
                      onMouseLeave={(e) => { e.target.style.opacity = 1; }}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
