import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
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

const SALT_ROUNDS = 10;

// Default users
const defaultUsers = [
  {
    name: 'Admin User',
    email: 'admin@expensetracker.com',
    password: 'admin123',
    role: 'ADMIN',
  },
  {
    name: 'Demo User',
    email: 'user@expensetracker.com',
    password: 'user123',
    role: 'USER',
  },
];

async function seedUsers() {
  let connection;

  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    console.log('\n👥 Seeding default users...\n');

    for (const user of defaultUsers) {
      // Check if user already exists
      const [existing] = await connection.query(
        'SELECT id, email FROM users WHERE email = ?',
        [user.email]
      );

      if (existing.length > 0) {
        console.log(`⏭️  User '${user.email}' already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

      // Insert user
      await connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, hashedPassword, user.role]
      );

      console.log(`✅ Created ${user.role} user: ${user.email}`);
    }

    console.log('\n🎉 User seeding completed successfully!\n');
    console.log('📊 Default Credentials:\n');
    console.log('👑 ADMIN:');
    console.log('   Email:    admin@expensetracker.com');
    console.log('   Password: admin123\n');
    console.log('👤 USER:');
    console.log('   Email:    user@expensetracker.com');
    console.log('   Password: user123\n');
    console.log('⚠️  IMPORTANT: Change these passwords in production!\n');

  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the seeding
seedUsers();

