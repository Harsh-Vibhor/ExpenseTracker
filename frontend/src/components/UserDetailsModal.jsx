import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios.js';

const UserDetailsModal = ({ isOpen, onClose, user }) => {
    const [activityData, setActivityData] = useState(null);
    const [loadingActivity, setLoadingActivity] = useState(false);
    const [activityError, setActivityError] = useState(null);

    useEffect(() => {
        if (isOpen && user) {
            fetchUserActivity();
        }
    }, [isOpen, user]);

    const fetchUserActivity = async () => {
        if (!user) return;

        try {
            setLoadingActivity(true);
            setActivityError(null);
            const response = await apiClient.get(`/admin/users/${user.id}/summary`);
            setActivityData(response.data.activity);
        } catch (err) {
            console.error('Failed to fetch user activity:', err);
            setActivityError('Failed to load activity data');
        } finally {
            setLoadingActivity(false);
        }
    };

    if (!isOpen || !user) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    React.useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            return () => document.removeEventListener('keydown', handleEscapeKey);
        }
    }, [isOpen]);

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200"
            onClick={handleOverlayClick}
        >
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Details</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                            Basic Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Name</label>
                                <p className="text-base font-medium text-gray-900 dark:text-white">{user.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Email</label>
                                <p className="text-base font-medium text-gray-900 dark:text-white">{user.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Role</label>
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'
                                        }`}
                                >
                                    {user.role}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Status</label>
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                        }`}
                                >
                                    {user.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                            Account Information
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Created At</label>
                                <p className="text-base font-medium text-gray-900 dark:text-white">
                                    {formatDate(user.created_at)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">User ID</label>
                                <p className="text-base font-medium text-gray-900 dark:text-white font-mono">#{user.id}</p>
                            </div>
                        </div>
                    </div>

                    {/* Activity Summary */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">
                            Activity Summary
                        </h4>
                        {loadingActivity ? (
                            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6 space-y-3 animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
                            </div>
                        ) : activityError ? (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <p className="text-sm text-red-700 dark:text-red-300">{activityError}</p>
                            </div>
                        ) : activityData ? (
                            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Total Expenses</label>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {activityData.total_expenses_count}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">transactions</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Total Spent</label>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {formatCurrency(activityData.total_amount_spent)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">all time</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">Last Expense</label>
                                        <p className="text-base font-medium text-gray-900 dark:text-white">
                                            {activityData.last_expense_date
                                                ? new Date(activityData.last_expense_date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })
                                                : '—'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {activityData.total_expenses_count === 0 ? 'No expenses yet' : 'most recent'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">No activity data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-900 rounded-b-lg flex justify-end sticky bottom-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;
