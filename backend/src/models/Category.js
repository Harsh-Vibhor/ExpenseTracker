import { supabase } from '../config/supabase.js';

// NOTE: In the Supabase schema, categories are user-scoped (have a user_id).
// All category operations that are user-facing must filter by user_id.
// Admin operations may read across all users.

export const createCategory = async ({ name, userId }) => {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, user_id: userId })
    .select('id, name, user_id')
    .single();

  if (error) throw error;
  return data;
};

export const getCategoriesByUser = async (userId) => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, user_id, created_at')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
};

// Alias used by some controllers
export const getAllCategories = getCategoriesByUser;

export const findCategoryById = async (categoryId) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const findCategoryByNameAndUser = async (name, userId) => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .eq('name', name)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

// Keep old name as alias so category.controller.js import doesn't break
export const findCategoryByName = findCategoryByNameAndUser;

export const deleteCategory = async (categoryId) => {
  const { error, count } = await supabase
    .from('categories')
    .delete({ count: 'exact' })
    .eq('id', categoryId);

  if (error) {
    // Supabase surfaces FK violations as a 23503 postgres error code
    if (error.code === '23503') {
      throw new Error('Cannot delete category that is being used by expenses');
    }
    throw error;
  }
  return count > 0;
};

export const getCategoryUsageCount = async (categoryId) => {
  const { count, error } = await supabase
    .from('expenses')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId);

  if (error) throw error;
  return count ?? 0;
};

export const seedDefaultCategoriesIfEmpty = async (userId) => {
  const { count, error } = await supabase
    .from('categories')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw error;

  if (count === 0) {
    const defaultCategories = [
      'Food', 'Transportation', 'Entertainment',
      'Shopping', 'Bills', 'Healthcare', 'Education', 'Others',
    ];

    const rows = defaultCategories.map((name) => ({ name, user_id: userId }));
    const { error: insertError } = await supabase.from('categories').insert(rows);
    if (insertError) throw insertError;
  }
};
