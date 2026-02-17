-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures users can only access their own data
-- Admins can read all data
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_budgets ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Get current user ID from JWT
-- =====================================================
CREATE OR REPLACE FUNCTION auth.user_id() 
RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'user_id', '')::UUID;
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- HELPER FUNCTION: Get current user role from JWT
-- =====================================================
CREATE OR REPLACE FUNCTION auth.user_role() 
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'role', '')::TEXT;
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- HELPER FUNCTION: Check if current user is admin
-- =====================================================
CREATE OR REPLACE FUNCTION auth.is_admin() 
RETURNS BOOLEAN AS $$
  SELECT auth.user_role() = 'ADMIN';
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- RLS POLICIES: users
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (id = auth.user_id());

-- Admins can view all users
CREATE POLICY "Admins can view all users"
ON users FOR SELECT
USING (auth.is_admin());

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (id = auth.user_id())
WITH CHECK (id = auth.user_id() AND role = (SELECT role FROM users WHERE id = auth.user_id()));

-- Allow user registration (INSERT without authentication)
CREATE POLICY "Allow public user registration"
ON users FOR INSERT
WITH CHECK (true);

-- Admins can update any user
CREATE POLICY "Admins can update any user"
ON users FOR UPDATE
USING (auth.is_admin());

-- =====================================================
-- RLS POLICIES: categories
-- =====================================================

-- Users can view their own categories
CREATE POLICY "Users can view own categories"
ON categories FOR SELECT
USING (user_id = auth.user_id());

-- Admins can view all categories
CREATE POLICY "Admins can view all categories"
ON categories FOR SELECT
USING (auth.is_admin());

-- Users can create their own categories
CREATE POLICY "Users can create own categories"
ON categories FOR INSERT
WITH CHECK (user_id = auth.user_id());

-- Users can update their own categories
CREATE POLICY "Users can update own categories"
ON categories FOR UPDATE
USING (user_id = auth.user_id())
WITH CHECK (user_id = auth.user_id());

-- Users can delete their own categories
CREATE POLICY "Users can delete own categories"
ON categories FOR DELETE
USING (user_id = auth.user_id());

-- =====================================================
-- RLS POLICIES: expenses
-- =====================================================

-- Users can view their own expenses
CREATE POLICY "Users can view own expenses"
ON expenses FOR SELECT
USING (user_id = auth.user_id());

-- Admins can view all expenses
CREATE POLICY "Admins can view all expenses"
ON expenses FOR SELECT
USING (auth.is_admin());

-- Users can create their own expenses
CREATE POLICY "Users can create own expenses"
ON expenses FOR INSERT
WITH CHECK (user_id = auth.user_id());

-- Users can update their own expenses
CREATE POLICY "Users can update own expenses"
ON expenses FOR UPDATE
USING (user_id = auth.user_id())
WITH CHECK (user_id = auth.user_id());

-- Users can delete their own expenses
CREATE POLICY "Users can delete own expenses"
ON expenses FOR DELETE
USING (user_id = auth.user_id());

-- =====================================================
-- RLS POLICIES: category_budgets
-- =====================================================

-- Users can view their own budgets
CREATE POLICY "Users can view own budgets"
ON category_budgets FOR SELECT
USING (user_id = auth.user_id());

-- Admins can view all budgets
CREATE POLICY "Admins can view all budgets"
ON category_budgets FOR SELECT
USING (auth.is_admin());

-- Users can create their own budgets
CREATE POLICY "Users can create own budgets"
ON category_budgets FOR INSERT
WITH CHECK (user_id = auth.user_id());

-- Users can update their own budgets
CREATE POLICY "Users can update own budgets"
ON category_budgets FOR UPDATE
USING (user_id = auth.user_id())
WITH CHECK (user_id = auth.user_id());

-- Users can delete their own budgets
CREATE POLICY "Users can delete own budgets"
ON category_budgets FOR DELETE
USING (user_id = auth.user_id());

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON category_budgets TO authenticated;

-- Grant sequence permissions (for auto-increment if needed)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
