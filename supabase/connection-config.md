# Node.js Supabase Connection Configuration

## Installation

```bash
npm install @supabase/supabase-js
```

---

## Basic Setup

### 1. Create Supabase Client

```javascript
// config/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

---

## Authentication Integration

### Register User

```javascript
// controllers/auth.controller.js
import { supabase } from '../config/supabase.js';
import bcrypt from 'bcrypt';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert user into database
    const { data, error } = await supabase
      .from('users')
      .insert([
        { name, email, password_hash: passwordHash, role: 'USER' }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

### Login User

```javascript
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { user_id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

---

## CRUD Operations with RLS

### Create Expense

```javascript
// controllers/expense.controller.js
export const createExpense = async (req, res) => {
  try {
    const { category_id, amount, description, date } = req.body;
    const user_id = req.user.id; // From JWT middleware
    
    const { data, error } = await supabase
      .from('expenses')
      .insert([
        { user_id, category_id, amount, description, date }
      ])
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

### Get User Expenses

```javascript
export const getUserExpenses = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    // RLS automatically filters by user_id
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('user_id', user_id)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

### Update Expense

```javascript
export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, amount, description, date } = req.body;
    const user_id = req.user.id;
    
    const { data, error } = await supabase
      .from('expenses')
      .update({ category_id, amount, description, date })
      .eq('id', id)
      .eq('user_id', user_id) // RLS ensures user owns this record
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

### Delete Expense

```javascript
export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);
    
    if (error) throw error;
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

---

## Admin Queries

### Get All Users (Admin Only)

```javascript
export const getAllUsers = async (req, res) => {
  try {
    // Verify admin role in middleware
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

### Get All Expenses (Admin Only)

```javascript
export const getAllExpenses = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        *,
        users (
          id,
          name,
          email
        ),
        categories (
          id,
          name
        )
      `)
      .order('date', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

---

## Advanced Queries

### Get Expenses with Aggregation

```javascript
export const getExpenseSummary = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { start_date, end_date } = req.query;
    
    let query = supabase
      .from('expenses')
      .select('category_id, categories(name), amount')
      .eq('user_id', user_id);
    
    if (start_date) {
      query = query.gte('date', start_date);
    }
    if (end_date) {
      query = query.lte('date', end_date);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Group by category
    const summary = data.reduce((acc, expense) => {
      const categoryName = expense.categories?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += parseFloat(expense.amount);
      return acc;
    }, {});
    
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

### Get Monthly Budget Status

```javascript
export const getBudgetStatus = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { month } = req.query; // Format: YYYY-MM
    
    // Get budgets
    const { data: budgets, error: budgetError } = await supabase
      .from('category_budgets')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .eq('user_id', user_id)
      .eq('month', month);
    
    if (budgetError) throw budgetError;
    
    // Get expenses for the month
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;
    
    const { data: expenses, error: expenseError } = await supabase
      .from('expenses')
      .select('category_id, amount')
      .eq('user_id', user_id)
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (expenseError) throw expenseError;
    
    // Calculate spent per category
    const spent = expenses.reduce((acc, expense) => {
      if (!acc[expense.category_id]) {
        acc[expense.category_id] = 0;
      }
      acc[expense.category_id] += parseFloat(expense.amount);
      return acc;
    }, {});
    
    // Combine budgets with spent
    const status = budgets.map(budget => ({
      category: budget.categories.name,
      budget: parseFloat(budget.budget_amount),
      spent: spent[budget.category_id] || 0,
      remaining: parseFloat(budget.budget_amount) - (spent[budget.category_id] || 0)
    }));
    
    res.json(status);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

---

## Middleware for JWT Authentication

```javascript
// middleware/auth.middleware.js
import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Set JWT claims for RLS (if using Supabase RLS)
    // This is handled automatically by Supabase client
    
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

---

## Error Handling

```javascript
// utils/supabaseErrorHandler.js
export const handleSupabaseError = (error) => {
  if (error.code === '23505') {
    return { status: 409, message: 'Record already exists' };
  }
  if (error.code === '23503') {
    return { status: 400, message: 'Foreign key constraint violation' };
  }
  if (error.code === 'PGRST116') {
    return { status: 404, message: 'Record not found' };
  }
  return { status: 500, message: 'Database error' };
};
```

---

## Connection String Format

### For Direct PostgreSQL Connection (pg library)

```javascript
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Use pool for queries
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### Connection String Format

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres
```

---

## Best Practices

1. **Always use parameterized queries** to prevent SQL injection
2. **Leverage RLS** for automatic data filtering
3. **Use transactions** for multi-step operations
4. **Handle errors gracefully** with proper status codes
5. **Log errors** for debugging and monitoring
6. **Use connection pooling** for better performance
7. **Validate input** before database operations
8. **Use indexes** for frequently queried fields
9. **Monitor query performance** with EXPLAIN ANALYZE
10. **Keep JWT secret secure** and rotate regularly

---

## Testing Connection

```javascript
// test/connection.test.js
import { supabase } from '../config/supabase.js';

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Supabase connection successful');
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message);
  }
}

testConnection();
```
