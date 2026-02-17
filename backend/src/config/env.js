import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../..', '.env') });

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  db: {
    url: process.env.DATABASE_URL, // PostgreSQL connection string (for Supabase/Render)
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'expense_tracker',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_key_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};
