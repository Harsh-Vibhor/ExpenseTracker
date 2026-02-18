import { supabase } from '../config/supabase.js';

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Supabase schema column: password_hash
 * We expose it as `password` on the returned object so the rest of the app
 * (bcrypt.compare, JWT payload) doesn't need to change.
 */
const normalizeUser = (row) => {
  if (!row) return null;
  const { password_hash, ...rest } = row;
  return { ...rest, password: password_hash };
};

// ── exports ───────────────────────────────────────────────────────────────────

export const createUser = async ({ name, email, passwordHash, role }) => {
  const { data, error } = await supabase
    .from('users')
    .insert({ name, email, password_hash: passwordHash, role })
    .select('id, name, email, role')
    .single();

  if (error) throw error;
  return data;
};

export const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, password_hash, role, created_at')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return normalizeUser(data);
};

export const findUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
