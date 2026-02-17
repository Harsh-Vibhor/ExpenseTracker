# Supabase PostgreSQL Configuration
## Expense Tracker Database Setup

This directory contains production-ready SQL scripts for deploying the Expense Tracker database on Supabase.

---

## 📁 Files

| File | Description |
|------|-------------|
| `schema.sql` | Database schema with tables, indexes, and constraints |
| `rls-policies.sql` | Row Level Security policies for data isolation |
| `seed-data.sql` | Optional sample data for testing |
| `.env.example` | Environment variables template |
| `connection-config.md` | Node.js connection configuration |

---

## 🚀 Deployment Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and API keys

### 2. Run SQL Scripts

Execute in Supabase SQL Editor in this order:

```sql
-- Step 1: Create schema
-- Copy and paste schema.sql

-- Step 2: Enable RLS and create policies
-- Copy and paste rls-policies.sql

-- Step 3 (Optional): Add seed data for testing
-- Copy and paste seed-data.sql
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update with your Supabase credentials:

```bash
cp .env.example .env
```

### 4. Update Backend Configuration

Update your Node.js backend to use Supabase connection string.

---

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- ✅ **Users can only access their own data**
- ✅ **Admins can read all data**
- ✅ **JWT-based authentication**
- ✅ **Automatic user_id extraction from JWT**

### Data Isolation

```sql
-- Users see only their expenses
SELECT * FROM expenses;
-- Returns only expenses where user_id = current_user_id

-- Admins see all expenses
SELECT * FROM expenses;
-- Returns all expenses when role = 'ADMIN'
```

---

## 📊 Database Schema

### Tables

1. **users** - User accounts and authentication
2. **categories** - User-specific expense categories
3. **expenses** - Individual expense transactions
4. **category_budgets** - Monthly budget limits

### Relationships

```
users (1) ──→ (N) categories
users (1) ──→ (N) expenses
users (1) ──→ (N) category_budgets
categories (1) ──→ (N) expenses
categories (1) ──→ (N) category_budgets
```

---

## 🔧 Node.js Integration

### Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### Connection Example

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Query with RLS automatically applied
const { data, error } = await supabase
  .from('expenses')
  .select('*')
  .eq('user_id', userId);
```

### JWT Authentication

```javascript
// Set JWT for RLS
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// All subsequent queries use this user's context
```

---

## 📝 Environment Variables

Required environment variables for production:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration (must match Supabase JWT secret)
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# Database Direct Connection (optional)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
```

---

## 🧪 Testing

### Verify RLS Policies

```sql
-- Test as regular user
SET request.jwt.claims = '{"user_id": "b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22", "role": "USER"}';
SELECT * FROM expenses; -- Should return only user's expenses

-- Test as admin
SET request.jwt.claims = '{"user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "role": "ADMIN"}';
SELECT * FROM expenses; -- Should return all expenses
```

### Verify Indexes

```sql
-- Check index usage
EXPLAIN ANALYZE SELECT * FROM expenses WHERE user_id = 'some-uuid';
-- Should use idx_expenses_user_id
```

---

## 🔄 Migration from MySQL

If migrating from existing MySQL database:

1. Export data from MySQL
2. Convert data types (INT → UUID, etc.)
3. Import using `seed-data.sql` as template
4. Verify foreign key relationships
5. Test RLS policies

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## ⚠️ Important Notes

1. **Never commit `.env` file** - Contains sensitive credentials
2. **Use service role key carefully** - Bypasses RLS
3. **Test RLS policies thoroughly** - Ensure data isolation
4. **Backup regularly** - Use Supabase automatic backups
5. **Monitor performance** - Check slow query logs

---

## 🆘 Troubleshooting

### RLS Blocking Queries

```sql
-- Temporarily disable RLS for debugging (development only)
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;

-- Re-enable after debugging
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
```

### JWT Claims Not Working

```sql
-- Check current JWT claims
SELECT current_setting('request.jwt.claims', true);

-- Verify helper functions
SELECT auth.user_id();
SELECT auth.user_role();
SELECT auth.is_admin();
```

### Foreign Key Violations

```sql
-- Check orphaned records
SELECT e.* FROM expenses e
LEFT JOIN users u ON e.user_id = u.id
WHERE u.id IS NULL;
```

---

## 📞 Support

For issues or questions:
- Check Supabase Dashboard logs
- Review RLS policy definitions
- Verify JWT token structure
- Test with Supabase SQL Editor

---

**Last Updated:** 2024-02-17  
**Database Version:** PostgreSQL 15  
**Supabase Version:** Latest
