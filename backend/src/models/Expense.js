import { supabase } from '../config/supabase.js';

// NOTE: The Supabase schema uses `date` (not `expense_date`).
// We alias it back to `expense_date` in select statements so the rest of the
// app (controllers, frontend) continues to receive the same field name.

export const createExpense = async ({ userId, categoryId, amount, description, date }) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      user_id: userId,
      category_id: categoryId || null,
      amount,
      description: description || null,
      date,
    })
    .select('id, user_id, category_id, amount, description, date')
    .single();

  if (error) throw error;

  return {
    id: data.id,
    user_id: data.user_id,
    category_id: data.category_id,
    amount: data.amount,
    description: data.description,
    expense_date: data.date,   // alias for API compatibility
  };
};

export const getExpensesByUser = async (userId) => {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      id,
      user_id,
      category_id,
      amount,
      description,
      date,
      created_at,
      categories ( name )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    category_id: row.category_id,
    amount: row.amount,
    description: row.description,
    date: row.date,
    expense_date: row.date,          // alias for API compatibility
    created_at: row.created_at,
    category_name: row.categories?.name ?? null,
  }));
};

export const getExpenseById = async ({ id, userId }) => {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      id,
      user_id,
      category_id,
      amount,
      description,
      date,
      created_at,
      categories ( name )
    `)
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    user_id: data.user_id,
    category_id: data.category_id,
    amount: data.amount,
    description: data.description,
    date: data.date,
    expense_date: data.date,
    created_at: data.created_at,
    category_name: data.categories?.name ?? null,
  };
};

export const updateExpense = async ({ id, userId, categoryId, amount, description, date }) => {
  const updates = {};
  if (categoryId !== undefined) updates.category_id = categoryId;
  if (amount !== undefined) updates.amount = amount;
  if (description !== undefined) updates.description = description;
  if (date !== undefined) updates.date = date;

  if (Object.keys(updates).length === 0) {
    return getExpenseById({ id, userId });
  }

  const { error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;

  return getExpenseById({ id, userId });
};

export const deleteExpense = async ({ id, userId }) => {
  const { error, count } = await supabase
    .from('expenses')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
  return count > 0;
};
