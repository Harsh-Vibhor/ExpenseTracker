import { supabase } from '../config/supabase.js';

// ── Column name note ──────────────────────────────────────────────────────────
// The live Supabase table uses the column name `password` (not `password_hash`).
// All queries here use `password` to match the actual deployed schema.
// ─────────────────────────────────────────────────────────────────────────────

/** Normalise an email address: trim whitespace and lowercase. */
const normalizeEmail = (email) => email.trim().toLowerCase();

// ── exports ───────────────────────────────────────────────────────────────────

/**
 * Insert a new user row.
 * Normalizes email before insert so the DB always stores a canonical address.
 */
export const createUser = async ({ name, email, passwordHash, role }) => {
  const { data, error } = await supabase
    .from('users')
    .insert({
      name: name.trim(),
      email: normalizeEmail(email),
      password: passwordHash,   // column is named `password` in the live table
      role,
    })
    .select('id, name, email, role')
    .maybeSingle(); // maybeSingle() returns null on 0 rows; .single() throws

  if (error) {
    // Re-throw with Supabase error metadata attached so callers can inspect
    // error.code (e.g. '23505' for duplicate email) without parsing messages.
    const err = new Error(error.message);
    err.code = error.code;
    err.details = error.details;
    err.hint = error.hint;
    throw err;
  }

  if (!data) {
    // Insert succeeded but returned no row — most likely an RLS policy block.
    throw new Error('User insert returned no data — check Supabase RLS policies');
  }

  return data;
};

/**
 * Find a user by email (case-insensitive).
 * Selects `status` so the login handler can enforce BLOCKED checks.
 */
export const findUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, password, role, status, created_at')
    .eq('email', normalizeEmail(email))
    .maybeSingle();

  if (error) {
    const err = new Error(error.message);
    err.code = error.code;
    err.details = error.details;
    throw err;
  }

  return data ?? null;
};

/**
 * Find a user by primary key.
 */
export const findUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, status, created_at')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    const err = new Error(error.message);
    err.code = error.code;
    err.details = error.details;
    throw err;
  }

  return data ?? null;
};

/**
 * Return all users ordered by creation date (newest first).
 */
export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, status, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    const err = new Error(error.message);
    err.code = error.code;
    err.details = error.details;
    throw err;
  }

  return data ?? [];
};
