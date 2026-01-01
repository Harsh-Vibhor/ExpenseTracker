import mysql from 'mysql2/promise';
import { env } from './env.js';

let pool;

export const getDb = () => {
  if (!pool) {
    pool = mysql.createPool({
      host: env.db.host,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
};

export const testConnection = async () => {
  try {
    const pool = getDb();
    const [rows] = await pool.query('SELECT 1 AS result');
    return rows[0].result === 1;
  } catch (err) {
    console.error('Database connection test failed:', err.message);
    throw err;
  }
};
