import { useEffect, useState } from 'react';
import apiClient from '../api/axios.js';
import CategoryDetailPanel from '../components/CategoryDetailPanel.jsx';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Detail panel state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Expense modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState({
    categoryId: '',
    amount: '',
    date: '',
    description: '',
  });
  const [expenseFormErrors, setExpenseFormErrors] = useState({});
  const [submittingExpense, setSubmittingExpense] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/categories');
      setCategories(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ name: '' });
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '' });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Category name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await apiClient.post('/categories', { name: formData.name.trim() });
      await fetchCategories();
      closeModal();
    } catch (err) {
      setFormErrors({
        submit: err.response?.data?.message || 'Failed to add category'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await apiClient.delete(`/categories/${id}`);
      await fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  // Detail panel functions
  const openCategoryDetail = (category) => {
    setSelectedCategory(category);
    setShowDetailPanel(true);
  };

  const closeCategoryDetail = () => {
    setShowDetailPanel(false);
    setSelectedCategory(null);
  };

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };

  // Expense modal functions
  const openAddExpenseModal = (category) => {
    setExpenseFormData({
      categoryId: category.id,
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
    setExpenseFormErrors({});
    setShowExpenseModal(true);
    setShowDetailPanel(false); // Close detail panel
  };

  const closeExpenseModal = () => {
    setShowExpenseModal(false);
    setExpenseFormData({ categoryId: '', amount: '', date: '', description: '' });
    setExpenseFormErrors({});
  };

  const validateExpenseForm = () => {
    const errors = {};
    if (!expenseFormData.categoryId) errors.categoryId = 'Category is required';
    if (!expenseFormData.amount || expenseFormData.amount <= 0) errors.amount = 'Valid amount is required';
    if (!expenseFormData.date) errors.date = 'Date is required';
    setExpenseFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!validateExpenseForm()) return;

    try {
      setSubmittingExpense(true);
      await apiClient.post('/user/expenses', expenseFormData);
      closeExpenseModal();
      // Reopen detail panel if it was open
      if (selectedCategory) {
        setShowDetailPanel(true);
      }
    } catch (err) {
      setExpenseFormErrors({ submit: err.response?.data?.message || 'Failed to add expense' });
    } finally {
      setSubmittingExpense(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-lg dark:shadow-black/30 border border-transparent dark:border-slate-700 p-6 transition-colors duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Categories</h2>
          <button
            onClick={openAddModal}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            + Add Category
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {categories.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-200 py-8">
            No categories found. Add your first category!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => openCategoryDetail(category)}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 flex justify-between items-center hover:bg-teal-50 dark:hover:bg-slate-700 hover:border-teal-300 dark:hover:border-teal-500 transition cursor-pointer group"
              >
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-200 mt-1">
                    Click to view details
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(category.id, category.name);
                  }}
                  className="text-red-500 hover:text-red-700 transition opacity-0 group-hover:opacity-100"
                  title="Delete category"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md border border-transparent dark:border-slate-700 shadow-xl dark:shadow-black/40 transition-colors duration-200">
            <h3 className="text-xl font-bold mb-4">Add New Category</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter category name"
                  disabled={submitting}
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              {formErrors.submit && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {formErrors.submit}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Detail Panel */}
      <CategoryDetailPanel
        isOpen={showDetailPanel}
        onClose={closeCategoryDetail}
        category={selectedCategory}
        month={selectedMonth}
        onMonthChange={handleMonthChange}
        onAddExpense={openAddExpenseModal}
      />

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl dark:shadow-black/40 border border-transparent dark:border-slate-700 max-w-md w-full transition-colors duration-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Add Expense</h3>
            </div>

            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
              {expenseFormErrors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">{expenseFormErrors.submit}</p>
                </div>
              )}

              {/* Category (read-only, pre-filled) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <input
                  type="text"
                  value={categories.find(c => c.id === expenseFormData.categoryId)?.name || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  disabled
                />
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="expenseAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
                <input
                  id="expenseAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={expenseFormData.amount}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none ${expenseFormErrors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="0.00"
                  disabled={submittingExpense}
                />
                {expenseFormErrors.amount && <p className="text-sm text-red-600 mt-1">{expenseFormErrors.amount}</p>}
              </div>

              {/* Date */}
              <div>
                <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  id="expenseDate"
                  type="date"
                  value={expenseFormData.date}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none ${expenseFormErrors.date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  disabled={submittingExpense}
                />
                {expenseFormErrors.date && <p className="text-sm text-red-600 mt-1">{expenseFormErrors.date}</p>}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="expenseDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="expenseDescription"
                  value={expenseFormData.description}
                  onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                  rows="3"
                  placeholder="Optional description"
                  disabled={submittingExpense}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeExpenseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={submittingExpense}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={submittingExpense}
                >
                  {submittingExpense ? 'Adding...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;


