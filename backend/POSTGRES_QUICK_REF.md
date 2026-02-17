# PostgreSQL Migration - Quick Reference

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install pg
npm uninstall mysql2
```

### 2. Update .env
```env
DATABASE_URL=postgresql://postgres:password@host:5432/database
# OR
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=expense_tracker
```

### 3. Run Database Schema
Execute `supabase/schema.sql` in PostgreSQL

### 4. Start Server
```bash
npm run dev
```

---

## 📝 Syntax Quick Reference

| Operation | MySQL | PostgreSQL |
|-----------|-------|------------|
| **Placeholders** | `?` | `$1, $2, $3` |
| **Execute Query** | `pool.execute()` | `pool.query()` |
| **Get Results** | `[rows]` | `result.rows` |
| **Get Single Row** | `[[row]]` | `result.rows[0]` |
| **Affected Rows** | `result.affectedRows` | `result.rowCount` |
| **Insert ID** | `result.insertId` | Use `RETURNING id` |
| **Date Format** | `DATE_FORMAT(date, '%Y-%m')` | `TO_CHAR(date, 'YYYY-MM')` |
| **Year Extract** | `YEAR(date)` | `EXTRACT(YEAR FROM date)` |
| **Month Extract** | `MONTH(date)` | `EXTRACT(MONTH FROM date)` |
| **Current Date** | `CURDATE()` | `CURRENT_DATE` |
| **UPSERT** | `ON DUPLICATE KEY UPDATE` | `ON CONFLICT ... DO UPDATE` |
| **FK Error** | `ER_ROW_IS_REFERENCED_2` | `23503` |

---

## 🔄 Common Query Conversions

### SELECT
```javascript
// MySQL
const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);

// PostgreSQL
const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
const rows = result.rows;
```

### INSERT
```javascript
// MySQL
const [result] = await pool.execute(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  [name, email]
);
const id = result.insertId;

// PostgreSQL
const result = await pool.query(
  'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id',
  [name, email]
);
const id = result.rows[0].id;
```

### UPDATE
```javascript
// MySQL
const [result] = await pool.execute(
  'UPDATE users SET name = ? WHERE id = ?',
  [name, id]
);

// PostgreSQL
const result = await pool.query(
  'UPDATE users SET name = $1 WHERE id = $2',
  [name, id]
);
```

### DELETE
```javascript
// MySQL
const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
return result.affectedRows > 0;

// PostgreSQL
const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
return result.rowCount > 0;
```

### COUNT
```javascript
// MySQL
const [[row]] = await pool.execute('SELECT COUNT(*) as count FROM users');
const count = row.count;

// PostgreSQL
const result = await pool.query('SELECT COUNT(*) as count FROM users');
const count = parseInt(result.rows[0].count);
```

---

## 🗓️ Date Functions

### Format Date
```sql
-- MySQL
DATE_FORMAT(expense_date, '%Y-%m')
DATE_FORMAT(expense_date, '%b %Y')

-- PostgreSQL
TO_CHAR(expense_date, 'YYYY-MM')
TO_CHAR(expense_date, 'Mon YYYY')
```

### Extract Parts
```sql
-- MySQL
YEAR(expense_date)
MONTH(expense_date)

-- PostgreSQL
EXTRACT(YEAR FROM expense_date)
EXTRACT(MONTH FROM expense_date)
```

### Date Arithmetic
```sql
-- MySQL
DATE_SUB(CURDATE(), INTERVAL 5 MONTH)

-- PostgreSQL
CURRENT_DATE - INTERVAL '5 months'
DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months'
```

---

## 🔧 Environment Variables

### Supabase
```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
NODE_ENV=production
JWT_SECRET=your-secret-key
```

### Local PostgreSQL
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=expense_tracker
NODE_ENV=development
JWT_SECRET=dev-secret-key
```

### Render
```env
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
JWT_SECRET=production-secret-key
```

---

## ✅ Testing Commands

### Test Connection
```bash
# In PostgreSQL/psql
psql $DATABASE_URL -c "SELECT 1"
```

### Test API
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

---

## 🐛 Common Errors

### Error: `ECONNREFUSED`
**Fix**: Check DATABASE_URL and ensure PostgreSQL is running

### Error: `column "totalUsers" does not exist`
**Fix**: PostgreSQL returns lowercase. Use `totalusers` not `totalUsers`

### Error: `syntax error at or near "?"`
**Fix**: Replace `?` with `$1, $2, $3`

### Error: `no pg_hba.conf entry`
**Fix**: Enable SSL in connection config

---

## 📦 Package Changes

```bash
# Remove MySQL
npm uninstall mysql2

# Install PostgreSQL
npm install pg@^8.11.3
```

---

## 🎯 Deployment Checklist

- [ ] Install `pg` package
- [ ] Update `.env` with DATABASE_URL
- [ ] Run `supabase/schema.sql`
- [ ] Run `supabase/rls-policies.sql`
- [ ] Test locally with `npm run dev`
- [ ] Test all API endpoints
- [ ] Deploy to production
- [ ] Set production environment variables
- [ ] Verify production database connection
- [ ] Test production API

---

**Need help? Check `MIGRATION_GUIDE.md` for detailed documentation.**
