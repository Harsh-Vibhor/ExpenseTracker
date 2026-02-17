import { getDb } from '../config/db.js';

// User: id, name, email, password, role

export const createUser = async ({ name, email, passwordHash, role }) => {
  const pool = getDb();
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, passwordHash, role]
  );
  return result.rows[0];
};

export const findUserByEmail = async (email) => {
  const pool = getDb();
  const result = await pool.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return result.rows[0] || null;
};

export const findUserById = async (id) => {
  const pool = getDb();
  const result = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] || null;
};

export const getAllUsers = async () => {
  const pool = getDb();
  const result = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
  return result.rows;
};
