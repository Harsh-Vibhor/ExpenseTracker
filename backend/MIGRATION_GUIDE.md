# MySQL to PostgreSQL Migration Guide
## Expense Tracker Backend

This document provides a comprehensive guide for migrating the Expense Tracker backend from MySQL to PostgreSQL (Supabase).

---

## 📋 Migration Summary

### What Changed

✅ **Database Driver**: `mysql2` → `pg` (node-postgres)  
✅ **Query Syntax**: MySQL placeholders (`?`) → PostgreSQL placeholders (`$1, $2, $3`)  
✅ **Date Functions**: `DATE_FORMAT()` → `TO_CHAR()`, `YEAR()` → `EXTRACT(YEAR FROM ...)`  
✅ **UPSERT Syntax**: `ON DUPLICATE KEY UPDATE` → `ON CONFLICT ... DO UPDATE`  
✅ **Result Handling**: `[rows]` destructuring → `result.rows` property  
✅ **Error Codes**: MySQL error codes → PostgreSQL error codes  
✅ **Connection**: Individual params → Connection string with SSL  

### What Stayed the Same

✅ **API Endpoints**: No changes  
✅ **Request/Response Format**: No changes  
✅ **JWT Authentication**: No changes  
✅ **Role-based Authorization**: No changes  
✅ **Controller Logic**: Only database layer changed  
✅ **Route Definitions**: No changes  

---

## 🔧 Files Modified

### Core Database Files

1. **`src/config/db.js`** - Database connection with PostgreSQL Pool
2. **`src/config/env.js`** - Added DATABASE_URL support
3. **`package.json`** - Replaced mysql2 with pg

### Model Files (Query Conversion)

4. **`src/models/User.js`** - User CRUD operations
5. **`src/models/Expense.js`** - Expense CRUD operations
6. **`src/models/Category.js`** - Category CRUD operations

### Controller Files (Query Conversion)

7. **`src/controllers/admin.controller.js`** - Admin operations
8. **`src/controllers/admin.reports.controller.js`** - Admin reports
9. **`src/controllers/category.controller.js`** - Category management
10. **`src/controllers/dashboard.controller.js`** - User dashboard
11. **`src/controllers/report.controller.js`** - User reports

### Configuration Files

12. **`.env.example`** - PostgreSQL environment variables template

---

## 📦 Installation Steps

### 1. Install PostgreSQL Client

```bash
cd backend
npm uninstall mysql2
npm install pg@^8.11.3
```

### 2. Update Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# For Supabase (Recommended)
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# OR for local PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=expense_tracker

# JWT Configuration (unchanged)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### 3. Create PostgreSQL Database

Run the schema from `supabase/schema.sql` in your PostgreSQL database:

```sql
-- Run in PostgreSQL/Supabase SQL Editor
-- 1. Create tables (from supabase/schema.sql)
-- 2. Enable RLS (from supabase/rls-policies.sql)
-- 3. (Optional) Seed data (from supabase/seed-data.sql)
```

---

## 🔄 Query Syntax Changes

### Parameterized Queries

**Before (MySQL):**
```javascript
await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
```

**After (PostgreSQL):**
```javascript
await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### INSERT with RETURNING

**Before (MySQL):**
```javascript
const [result] = await pool.execute(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  [name, email]
);
return { id: result.insertId, name, email };
```

**After (PostgreSQL):**
```javascript
const result = await pool.query(
  'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email',
  [name, email]
);
return result.rows[0];
```

### Date Formatting

**Before (MySQL):**
```javascript
DATE_FORMAT(expense_date, '%Y-%m')
YEAR(expense_date)
MONTH(expense_date)
```

**After (PostgreSQL):**
```javascript
TO_CHAR(expense_date, 'YYYY-MM')
EXTRACT(YEAR FROM expense_date)
EXTRACT(MONTH FROM expense_date)
```

### UPSERT Operations

**Before (MySQL):**
```javascript
INSERT INTO category_budgets (user_id, category_id, month, amount)
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE amount = VALUES(amount)
```

**After (PostgreSQL):**
```javascript
INSERT INTO category_budgets (user_id, category_id, month, amount)
VALUES ($1, $2, $3, $4)
ON CONFLICT (user_id, category_id, month)
DO UPDATE SET amount = EXCLUDED.amount
```

### Result Handling

**Before (MySQL):**
```javascript
const [rows] = await pool.execute('SELECT * FROM users');
const [[singleRow]] = await pool.execute('SELECT COUNT(*) as count FROM users');
return rows;
```

**After (PostgreSQL):**
```javascript
const result = await pool.query('SELECT * FROM users');
const countResult = await pool.query('SELECT COUNT(*) as count FROM users');
return result.rows;
```

### Affected Rows

**Before (MySQL):**
```javascript
const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
return result.affectedRows > 0;
```

**After (PostgreSQL):**
```javascript
const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
return result.rowCount > 0;
```

### Error Codes

**Before (MySQL):**
```javascript
if (err.code === 'ER_ROW_IS_REFERENCED_2') {
  // Foreign key constraint
}
```

**After (PostgreSQL):**
```javascript
if (err.code === '23503') {
  // Foreign key constraint
}
```

---

## 🗄️ PostgreSQL-Specific Features

### Connection Pooling

```javascript
const pool = new Pool({
  connectionString: env.db.url,
  ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Date/Time Functions

```sql
-- Current date/time
CURRENT_DATE
CURRENT_TIMESTAMP
NOW()

-- Date arithmetic
DATE_TRUNC('month', CURRENT_DATE)
CURRENT_DATE - INTERVAL '5 months'

-- Date formatting
TO_CHAR(date_column, 'YYYY-MM-DD')
TO_CHAR(date_column, 'Mon YYYY')
```

### Aggregation Functions

```sql
-- Same as MySQL
COUNT(*), SUM(amount), AVG(amount), MAX(amount), MIN(amount)

-- NULL handling
COALESCE(SUM(amount), 0)
```

---

## 🚀 Deployment Guide

### Render Deployment

1. **Create PostgreSQL Database** on Render or use Supabase
2. **Set Environment Variables**:
   ```
   DATABASE_URL=postgresql://...
   NODE_ENV=production
   JWT_SECRET=your-secret
   ```
3. **Deploy Backend**: Render auto-detects Node.js and runs `npm install` + `npm start`

### Supabase Setup

1. **Create Supabase Project**
2. **Run SQL Scripts**:
   - `supabase/schema.sql`
   - `supabase/rls-policies.sql`
3. **Get Connection String**: Dashboard → Settings → Database
4. **Set DATABASE_URL** in your deployment platform

### Local Testing

```bash
# Install dependencies
npm install

# Update .env with local PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=expense_tracker

# Start server
npm run dev
```

---

## ✅ Testing Checklist

### Authentication
- [ ] User registration works
- [ ] User login works
- [ ] JWT token generation works
- [ ] Protected routes require authentication

### User Operations
- [ ] Create expense
- [ ] List expenses
- [ ] Update expense
- [ ] Delete expense
- [ ] View dashboard
- [ ] View reports

### Category Operations
- [ ] List categories
- [ ] Create category
- [ ] Delete category
- [ ] Set budget
- [ ] View category details

### Admin Operations
- [ ] View all users
- [ ] View all expenses
- [ ] View admin dashboard
- [ ] View admin reports

### Reports
- [ ] Monthly summary
- [ ] Budget vs actual
- [ ] Yearly overview
- [ ] Category-wise spending

---

## 🐛 Common Issues & Solutions

### Issue 1: Connection Refused

**Error**: `ECONNREFUSED`

**Solution**:
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Check firewall settings
- For Supabase, ensure IP is whitelisted

### Issue 2: SSL Required

**Error**: `no pg_hba.conf entry for host`

**Solution**:
```javascript
ssl: { rejectUnauthorized: false }
```

### Issue 3: Column Names Case Sensitivity

**Error**: Column not found

**Solution**: PostgreSQL returns lowercase column names by default
```javascript
// Use lowercase
result.rows[0].totalusers  // ✅
result.rows[0].totalUsers  // ❌
```

### Issue 4: Date Format Issues

**Error**: Invalid date format

**Solution**: Use PostgreSQL date functions
```sql
-- ✅ Correct
TO_CHAR(expense_date, 'YYYY-MM')

-- ❌ Wrong
DATE_FORMAT(expense_date, '%Y-%m')
```

---

## 📊 Performance Considerations

### Indexes (Already in schema.sql)

```sql
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category_id ON expenses(category_id);
CREATE INDEX idx_expenses_date ON expenses(date);
```

### Connection Pool Settings

```javascript
max: 10,                      // Maximum pool size
idleTimeoutMillis: 30000,     // Close idle connections after 30s
connectionTimeoutMillis: 2000 // Timeout for new connections
```

### Query Optimization

- Use `LIMIT` for pagination
- Use indexes for frequently queried columns
- Use `EXPLAIN ANALYZE` to check query performance

---

## 🔒 Security Notes

1. **SSL in Production**: Automatically enabled when `NODE_ENV=production`
2. **Parameterized Queries**: All queries use `$1, $2, $3` to prevent SQL injection
3. **Environment Variables**: Never commit `.env` file
4. **JWT Secret**: Use strong random secret in production
5. **RLS Policies**: Supabase RLS provides additional security layer

---

## 📝 Migration Verification

### Before Starting Server

```bash
# 1. Install pg package
npm install pg

# 2. Update .env
cp .env.example .env
# Edit .env with your DATABASE_URL

# 3. Verify database schema exists
# Run supabase/schema.sql in PostgreSQL
```

### After Starting Server

```bash
# Start server
npm run dev

# Check logs for:
# ✅ "Database connection test passed"
# ✅ "Server running on port 4000"
```

### Test API Endpoints

```bash
# Test registration
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Test login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🎯 Next Steps

1. ✅ **Install pg package**: `npm install pg`
2. ✅ **Update .env**: Configure DATABASE_URL
3. ✅ **Run schema**: Execute `supabase/schema.sql`
4. ✅ **Test locally**: `npm run dev`
5. ✅ **Test all endpoints**: Use Postman/Thunder Client
6. ✅ **Deploy to production**: Render/Vercel/Railway
7. ✅ **Monitor logs**: Check for errors
8. ✅ **Update frontend**: Ensure API_URL is correct

---

## 📞 Support

If you encounter issues:

1. Check PostgreSQL connection string format
2. Verify all SQL scripts ran successfully
3. Check server logs for specific errors
4. Ensure all environment variables are set
5. Test with a simple query: `SELECT 1`

---

**Migration completed successfully! 🎉**

All API endpoints remain unchanged. Only the database layer has been migrated from MySQL to PostgreSQL.
