import {
  getAllCategories,
  createCategory,
  deleteCategory,
  findCategoryByName,
  getCategoryUsageCount,
  seedDefaultCategoriesIfEmpty,
} from '../models/Category.js';

export const listCategories = async (req, res) => {
  try {
    await seedDefaultCategoriesIfEmpty();
    const categories = await getAllCategories();
    return res.json(categories);
  } catch (err) {
    console.error('List categories error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    // Check if category already exists
    const existing = await findCategoryByName(trimmedName);
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await createCategory({ name: trimmedName });
    return res.status(201).json(category);
  } catch (err) {
    console.error('Add category error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const removeCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category is being used by any expenses
    const usageCount = await getCategoryUsageCount(id);
    if (usageCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It is being used by ${usageCount} expense(s).` 
      });
    }

    const success = await deleteCategory(id);
    if (!success) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Delete category error:', err);
    
    // Handle foreign key constraint error
    if (err.message && err.message.includes('being used by expenses')) {
      return res.status(400).json({ message: err.message });
    }
    
    return res.status(500).json({ message: 'Internal server error' });
  }
};
