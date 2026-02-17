import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

let pool;

export const getDb = () => {
  if (!pool) {
    // Use DATABASE_URL if available (for production/Render), otherwise use individual config
    if (env.db.url) {
      pool = new Pool({
        connectionString: env.db.url,
        ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    } else {
      pool = new Pool({
        host: env.db.host,
        port: env.db.port,
        user: env.db.user,
        password: env.db.password,
        database: env.db.database,
        ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    }

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
      process.exit(-1);
    });
  }
  return pool;
};

export const testConnection = async () => {
  try {
    const pool = getDb();
    const result = await pool.query('SELECT 1 AS result');
    return result.rows[0].result === 1;
  } catch (err) {
    console.error('Database connection test failed:', err.message);
    throw err;
  }
};

// Graceful shutdown
export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
  }
};
