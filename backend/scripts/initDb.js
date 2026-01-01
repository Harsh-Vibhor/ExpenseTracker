import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'expense_tracker',
};

async function initializeDatabase() {
  let connection;

  try {
    console.log('🔌 Connecting to MySQL...');
    
    // Connect without database first to create it if needed
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    console.log('✅ Connected to MySQL');

    // Create database if it doesn't exist
    console.log(`📦 Creating database '${dbConfig.database}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    console.log(`✅ Database '${dbConfig.database}' ready`);

    // Use the database
    await connection.query(`USE \`${dbConfig.database}\``);

    // Create users table
    console.log('📋 Creating users table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Users table created');

    // Create categories table
    console.log('📋 Creating categories table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        user_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_name (name),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Categories table created');

    // Create expenses table
    console.log('📋 Creating expenses table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        category_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        expense_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
        INDEX idx_user_id (user_id),
        INDEX idx_category_id (category_id),
        INDEX idx_date (date),
        INDEX idx_expense_date (expense_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Expenses table created');

    // Insert default categories if table is empty
    console.log('📋 Checking for default categories...');
    const [categories] = await connection.query('SELECT COUNT(*) as count FROM categories');
    
    if (categories[0].count === 0) {
      console.log('📋 Inserting default categories...');
      await connection.query(`
        INSERT INTO categories (name, description, user_id) VALUES
        ('Food & Dining', 'Groceries, restaurants, and food delivery', NULL),
        ('Transportation', 'Gas, public transit, ride-sharing', NULL),
        ('Shopping', 'Clothing, electronics, and general shopping', NULL),
        ('Entertainment', 'Movies, games, hobbies, and leisure', NULL),
        ('Bills & Utilities', 'Rent, electricity, water, internet', NULL),
        ('Healthcare', 'Medical expenses, pharmacy, insurance', NULL),
        ('Education', 'Courses, books, tuition', NULL),
        ('Travel', 'Flights, hotels, vacation expenses', NULL),
        ('Personal Care', 'Haircuts, gym, beauty products', NULL),
        ('Other', 'Miscellaneous expenses', NULL)
      `);
      console.log('✅ Default categories inserted');
    } else {
      console.log('✅ Categories already exist, skipping...');
    }

    console.log('\n🎉 Database initialization completed successfully!\n');
    console.log('📊 Summary:');
    console.log('  ✓ Database created');
    console.log('  ✓ Users table created');
    console.log('  ✓ Categories table created');
    console.log('  ✓ Expenses table created');
    console.log('  ✓ Default categories inserted\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the initialization
initializeDatabase();

