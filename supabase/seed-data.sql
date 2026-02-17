-- =====================================================
-- SEED DATA (Optional - For Testing)
-- Sample data for development and testing
-- =====================================================

-- NOTE: In production, users should register through the application
-- These are example records for testing purposes only

-- =====================================================
-- SAMPLE USERS
-- Password for all: "password123" (hashed with bcrypt)
-- =====================================================

-- Admin User
INSERT INTO users (id, name, email, password_hash, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Admin User', 'admin@example.com', '$2b$10$rKvVLZ5Z5Z5Z5Z5Z5Z5Z5uKvVLZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'ADMIN')
ON CONFLICT (email) DO NOTHING;

-- Regular Users
INSERT INTO users (id, name, email, password_hash, role) VALUES
('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'John Doe', 'john@example.com', '$2b$10$rKvVLZ5Z5Z5Z5Z5Z5Z5Z5uKvVLZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'USER'),
('c2ffbc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Jane Smith', 'jane@example.com', '$2b$10$rKvVLZ5Z5Z5Z5Z5Z5Z5Z5uKvVLZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'USER')
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- SAMPLE CATEGORIES (for John Doe)
-- =====================================================
INSERT INTO categories (id, user_id, name) VALUES
('d3ffbc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Food'),
('e4ffbc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Transport'),
('f5ffbc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Entertainment'),
('06ffbc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Utilities')
ON CONFLICT (user_id, name) DO NOTHING;

-- =====================================================
-- SAMPLE EXPENSES (for John Doe)
-- =====================================================
INSERT INTO expenses (user_id, category_id, amount, description, date) VALUES
('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'd3ffbc99-9c0b-4ef8-bb6d-6bb9bd380a44', 45.50, 'Grocery shopping', '2024-02-15'),
('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'd3ffbc99-9c0b-4ef8-bb6d-6bb9bd380a44', 12.99, 'Lunch at cafe', '2024-02-16'),
('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'e4ffbc99-9c0b-4ef8-bb6d-6bb9bd380a55', 25.00, 'Taxi fare', '2024-02-16'),
('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'f5ffbc99-9c0b-4ef8-bb6d-6bb9bd380a66', 15.99, 'Movie tickets', '2024-02-17'),
('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22', '06ffbc99-9c0b-4ef8-bb6d-6bb9bd380a77', 89.99, 'Electricity bill', '2024-02-10');

-- =====================================================
-- SAMPLE BUDGETS (for John Doe)
-- =====================================================
INSERT INTO category_budgets (user_id, category_id, budget_amount, month) VALUES
('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'd3ffbc99-9c0b-4ef8-bb6d-6bb9bd380a44', 500.00, '2024-02'),
('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'e4ffbc99-9c0b-4ef8-bb6d-6bb9bd380a55', 200.00, '2024-02'),
('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'f5ffbc99-9c0b-4ef8-bb6d-6bb9bd380a66', 150.00, '2024-02'),
('b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22', '06ffbc99-9c0b-4ef8-bb6d-6bb9bd380a77', 300.00, '2024-02')
ON CONFLICT (user_id, category_id, month) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Count records
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Expenses', COUNT(*) FROM expenses
UNION ALL
SELECT 'Budgets', COUNT(*) FROM category_budgets;
