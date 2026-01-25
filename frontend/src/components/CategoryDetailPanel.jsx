import { useEffect, useState } from 'react';
import apiClient from '../api/axios.js';
import PropTypes from 'prop-types';

const CategoryDetailPanel = ({
    isOpen,
    onClose,
    category,
    month,
    onMonthChange,
    onAddExpense
}) => {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [budget, setBudget] = useState(null);
    const [showBudgetInput, setShowBudgetInput] = useState(false);
    const [budgetAmount, setBudgetAmount] = useState('');
    const [savingBudget, setSavingBudget] = useState(false);

    useEffect(() => {
        if (isOpen && category && month) {
            fetchCategoryData();
        }
    }, [isOpen, category, month]);

    const fetchCategoryData = async () => {
        try {
            setLoading(true);
            const [expensesRes, budgetRes] = await Promise.all([
                apiClient.get(`/categories/${category.id}/expenses?month=${month}`),
                apiClient.get(`/categories/${category.id}/budget?month=${month}`)
            ]);

            setExpenses(expensesRes.data.expenses || []);
            setTotalSpent(expensesRes.data.total || 0);
            setBudget(budgetRes.data.budget);
        } catch (err) {
            console.error('Failed to fetch category data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSetBudget = async () => {
        if (!budgetAmount || budgetAmount <= 0) {
            alert('Please enter a valid budget amount');
            return;
        }

        try {
            setSavingBudget(true);
            const response = await apiClient.post(`/categories/${category.id}/budget`, {
                month,
                amount: parseFloat(budgetAmount)
            });
            setBudget(response.data.budget);
            setShowBudgetInput(false);
            setBudgetAmount('');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to set budget');
        } finally {
            setSavingBudget(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatMonthLabel = (monthStr) => {
        const [year, monthNum] = monthStr.split('-');
        const date = new Date(year, monthNum - 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Calculate budget progress
    const getBudgetProgress = () => {
        if (!budget) return { percentage: 0, color: 'gray', status: 'No budget' };

        const percentage = (totalSpent / budget.amount) * 100;
        let color = 'green';
        let status = 'On track';

        if (percentage >= 100) {
            color = 'red';
            status = 'Over budget';
        } else if (percentage >= 80) {
            color = 'orange';
            status = 'Near limit';
        }

        return { percentage: Math.min(percentage, 100), color, status };
    };

    const progress = getBudgetProgress();
    const remaining = budget ? budget.amount - totalSpent : 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-800">{category?.name}</h2>
                        <p className="text-sm text-gray-600 mt-1">{formatMonthLabel(month)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => onMonthChange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                        />
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition"
                            title="Close"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="text-gray-600">Loading...</div>
                        </div>
                    ) : (
                        <>
                            {/* Budget Summary Section */}
                            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Budget Summary</h3>

                                {budget ? (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Allocated</p>
                                                <p className="text-xl font-bold text-gray-800">{formatCurrency(budget.amount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Spent</p>
                                                <p className="text-xl font-bold text-gray-800">{formatCurrency(totalSpent)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Remaining</p>
                                                <p className={`text-xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {formatCurrency(remaining)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-gray-700">{progress.status}</span>
                                                <span className="text-sm font-medium text-gray-700">{progress.percentage.toFixed(1)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-300 ${progress.color === 'green' ? 'bg-green-500' :
                                                        progress.color === 'orange' ? 'bg-orange-500' :
                                                            'bg-red-500'
                                                        }`}
                                                    style={{ width: `${progress.percentage}%` }}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setShowBudgetInput(true);
                                                setBudgetAmount(budget.amount.toString());
                                            }}
                                            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                                        >
                                            Update Budget
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-gray-600 mb-4">No budget set for this category this month</p>
                                        {!showBudgetInput ? (
                                            <button
                                                onClick={() => setShowBudgetInput(true)}
                                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition"
                                            >
                                                Set Budget
                                            </button>
                                        ) : null}
                                    </div>
                                )}

                                {/* Budget Input Form */}
                                {showBudgetInput && (
                                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Budget Amount
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={budgetAmount}
                                                onChange={(e) => setBudgetAmount(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                                placeholder="0.00"
                                                disabled={savingBudget}
                                            />
                                            <button
                                                onClick={handleSetBudget}
                                                disabled={savingBudget}
                                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition disabled:opacity-50"
                                            >
                                                {savingBudget ? 'Saving...' : 'Save'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowBudgetInput(false);
                                                    setBudgetAmount('');
                                                }}
                                                disabled={savingBudget}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Expense List Section */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">Expenses</h3>
                                    <button
                                        onClick={() => onAddExpense(category)}
                                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition text-sm"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Expense
                                    </button>
                                </div>

                                {expenses.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <svg
                                            className="w-16 h-16 text-gray-300 mx-auto mb-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                            />
                                        </svg>
                                        <p className="text-gray-500 text-sm">
                                            No expenses in this category for {formatMonthLabel(month)}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Description</th>
                                                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expenses.map((expense) => (
                                                    <tr key={expense.id} className="border-t border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4 text-sm text-gray-700">{formatDate(expense.date)}</td>
                                                        <td className="py-3 px-4 text-sm text-gray-700">{expense.description || '-'}</td>
                                                        <td className="py-3 px-4 text-right text-sm font-semibold text-gray-800">
                                                            {formatCurrency(expense.amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="border-t-2 border-gray-300 bg-gray-50">
                                                    <td colSpan="2" className="py-3 px-4 text-sm font-semibold text-gray-800">Total</td>
                                                    <td className="py-3 px-4 text-right text-sm font-bold text-gray-800">
                                                        {formatCurrency(totalSpent)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

CategoryDetailPanel.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    category: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
    }),
    month: PropTypes.string.isRequired,
    onMonthChange: PropTypes.func.isRequired,
    onAddExpense: PropTypes.func.isRequired,
};

export default CategoryDetailPanel;
