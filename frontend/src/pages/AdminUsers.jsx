import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../api/axios.js';
import { useAuth } from '../auth/AuthContext.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import UserDetailsModal from '../components/UserDetailsModal.jsx';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Category filter from URL
  const categoryId = searchParams.get('category');
  const categoryName = searchParams.get('categoryName');

  // Modal states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    userId: null,
    action: null,
    currentStatus: null,
  });
  const [detailsModal, setDetailsModal] = useState({
    isOpen: false,
    user: null,
  });

  // Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, [categoryId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (categoryId) {
        // Fetch users filtered by category — returns { category, users: [] }
        response = await apiClient.get(`/admin/users/by-category/${categoryId}`);
        setUsers(response.data.users || []);
      } else {
        // Fetch all users for management — returns a plain array
        response = await apiClient.get('/admin/users/management');
        setUsers(Array.isArray(response.data) ? response.data : response.data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Clear category filter
  const clearCategoryFilter = () => {
    setSearchParams({});
  };

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handle view user details
  const handleViewUser = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setDetailsModal({ isOpen: true, user });
    }
  };

  // Handle block/unblock button click (opens confirmation modal)
  const handleToggleStatusClick = (userId, currentStatus) => {
    setConfirmModal({
      isOpen: true,
      userId,
      action: currentStatus === 'ACTIVE' ? 'block' : 'unblock',
      currentStatus,
    });
  };

  // Handle confirmed status toggle
  const handleConfirmStatusToggle = async () => {
    const { userId, currentStatus } = confirmModal;

    try {
      setUpdatingUserId(userId);
      const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';

      const response = await apiClient.patch(`/admin/users/${userId}/status`, {
        status: newStatus,
      });

      // Update user in local state
      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));

      // Close modal
      setConfirmModal({ isOpen: false, userId: null, action: null, currentStatus: null });

      console.log(response.data.message);
    } catch (err) {
      console.error('Failed to update user status:', err);
      alert(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 animate-pulse transition-colors duration-200">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 animate-pulse transition-colors duration-200">
          <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded"></div>
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
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error Loading Users</h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchUsers}
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
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">User Management</h2>
        <p className="text-gray-600 dark:text-gray-200">Manage all registered users and their permissions</p>
      </div>

      {/* Category Filter Badge */}
      {categoryId && categoryName && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Filtered by category: <span className="font-bold">{decodeURIComponent(categoryName)}</span>
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">
                  Showing users with expenses in this category
                </p>
              </div>
            </div>
            <button
              onClick={clearCategoryFilter}
              className="px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 bg-blue-100 dark:bg-blue-800/50 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-lg transition-colors"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 p-6 transition-colors duration-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Search Users
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors duration-200"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
              Filter by Role
            </label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors duration-200"
            >
              <option value="ALL">All Roles</option>
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-gray-200">
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 overflow-hidden transition-colors duration-200">
        {filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-gray-400 dark:text-gray-300">
            <div className="text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4"
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
              <p className="text-sm">No users found</p>
              <p className="text-xs mt-1 dark:text-gray-400">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-white">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-white">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-white">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-white">Created At</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-150"
                  >
                    <td className="py-3 px-4 text-sm text-gray-800 dark:text-white font-medium">
                      {user.name}
                      {user.id === currentUser?.id && (
                        <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(You)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-200">
                      {user.email}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN'
                          ? 'bg-purple-600 text-white'
                          : 'bg-blue-600 text-white'
                          }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'ACTIVE'
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white'
                          }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-200">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 transition-colors"
                          title="View user details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>

                        {/* Block/Unblock Button - Disabled for current user and other admins */}
                        <button
                          onClick={() => handleToggleStatusClick(user.id, user.status)}
                          disabled={user.id === currentUser?.id || user.role === 'ADMIN' || updatingUserId === user.id}
                          className={`p-1 transition-colors ${user.id === currentUser?.id || user.role === 'ADMIN'
                            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            : user.status === 'ACTIVE'
                              ? 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300'
                              : 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300'
                            } ${updatingUserId === user.id ? 'opacity-50 cursor-wait' : ''}`}
                          title={
                            user.id === currentUser?.id
                              ? 'Cannot change your own status'
                              : user.role === 'ADMIN'
                                ? 'Cannot change admin status'
                                : user.status === 'ACTIVE'
                                  ? 'Block user'
                                  : 'Unblock user'
                          }
                        >
                          {updatingUserId === user.id ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : user.status === 'ACTIVE' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                              />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Block/Unblock */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, userId: null, action: null, currentStatus: null })}
        onConfirm={handleConfirmStatusToggle}
        title={confirmModal.action === 'block' ? 'Block User' : 'Unblock User'}
        message={
          confirmModal.action === 'block'
            ? 'Blocking this user will prevent them from logging in and creating expenses. This action requires admin intervention to reverse.'
            : 'This user will regain full access to the platform and can log in and create expenses.'
        }
        confirmText={confirmModal.action === 'block' ? 'Block User' : 'Unblock User'}
        confirmStyle={confirmModal.action === 'block' ? 'danger' : 'success'}
        isLoading={updatingUserId !== null}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, user: null })}
        user={detailsModal.user}
      />
    </div>
  );
};

export default AdminUsers;
