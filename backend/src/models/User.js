import { getDb } from '../config/db.js';

// User: id, name, email, password, role

export const createUser = async ({ name, email, passwordHash, role }) => {
  const pool = getDb();
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, role]
  );
  return { id: result.insertId, name, email, role };
};

export const findUserByEmail = async (email) => {
  const pool = getDb();
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const pool = getDb();
  const [rows] = await pool.execute('SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

export const getAllUsers = async () => {
  const pool = getDb();
  const [rows] = await pool.execute('SELECT id, name, email, role, created_at FROM users');
  return rows;
};
