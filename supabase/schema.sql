-- =====================================================
-- EXPENSE TRACKER - SUPABASE POSTGRESQL SCHEMA
-- Production-Ready Database Configuration
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: users
-- Stores user account information
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_role CHECK (role IN ('USER', 'ADMIN')),
    CONSTRAINT valid_status CHECK (status IN ('ACTIVE', 'BLOCKED'))
);

-- =====================================================
-- MIGRATION: Add status column if table already exists
-- Run this once in Supabase SQL Editor if the table
-- was created without the status column.
-- =====================================================
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'ACTIVE';
-- ALTER TABLE users ADD CONSTRAINT valid_status CHECK (status IN ('ACTIVE', 'BLOCKED'));

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- =====================================================
-- TABLE: categories
-- Stores expense categories per user
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_category_per_user UNIQUE(user_id, name)
);

-- Index for faster user_id lookups
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- =====================================================
-- TABLE: expenses
-- Stores individual expense records
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category_id ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date);

-- =====================================================
-- TABLE: category_budgets
-- Stores monthly budget limits per category
-- =====================================================
CREATE TABLE IF NOT EXISTS category_budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    budget_amount NUMERIC(12, 2) NOT NULL CHECK (budget_amount >= 0),
    month TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_budget_per_category_month UNIQUE(user_id, category_id, month),
    CONSTRAINT valid_month_format CHECK (month ~ '^\d{4}-(0[1-9]|1[0-2])$')
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_category_budgets_user_id ON category_budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_category_budgets_category_id ON category_budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_category_budgets_month ON category_budgets(month);

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================
COMMENT ON TABLE users IS 'User accounts with authentication and role information';
COMMENT ON TABLE categories IS 'User-specific expense categories';
COMMENT ON TABLE expenses IS 'Individual expense transactions';
COMMENT ON TABLE category_budgets IS 'Monthly budget limits for categories';

COMMENT ON COLUMN users.role IS 'User role: USER or ADMIN';
COMMENT ON COLUMN expenses.amount IS 'Expense amount in currency (2 decimal places)';
COMMENT ON COLUMN category_budgets.month IS 'Budget month in YYYY-MM format';
