-- ============================================
-- ExpenseTracker Database Schema
-- ============================================
-- This file contains the complete database schema
-- for the ExpenseTracker application.
-- 
-- Usage:
--   1. Create database: CREATE DATABASE expense_tracker;
--   2. Use database: USE expense_tracker;
--   3. Run this file: SOURCE backend/database/schema.sql;
-- ============================================

-- Use the expense_tracker database
USE expense_tracker;

-- ============================================
-- TABLE: users
-- ============================================
-- Stores user accounts with authentication details
-- Supports two roles: USER and ADMIN

DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: categories
-- ============================================
-- Stores expense categories for classification

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: expenses
-- ============================================
-- Stores individual expense records
-- Links to users and categories via foreign keys

CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    description VARCHAR(500),
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_expenses_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_expenses_category 
        FOREIGN KEY (category_id) 
        REFERENCES categories(id) 
        ON DELETE RESTRICT,
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    INDEX idx_expense_date (expense_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED DATA: Default Categories
-- ============================================
-- Insert default expense categories

INSERT INTO categories (name) VALUES
    ('Food'),
    ('Travel'),
    ('Rent'),
    ('Shopping'),
    ('Utilities'),
    ('Healthcare'),
    ('Entertainment'),
    ('Education'),
    ('Transportation'),
    ('Other');

-- ============================================
-- SEED DATA: Default Users
-- ============================================
-- Insert default admin and user accounts
-- 
-- ADMIN CREDENTIALS:
--   Email: admin@expensetracker.com
--   Password: admin123
--
-- USER CREDENTIALS:
--   Email: user@expensetracker.com
--   Password: user123
--
-- WARNING: Change these passwords in production!

INSERT INTO users (name, email, password, role) VALUES
    (
        'Admin',
        'admin@expensetracker.com',
        '$2b$10$V0yQJIdtzYGVy7xvcfMzLOuVJmEEnmF/SJqyW3eL9Wv2fWca.KtpK',
        'ADMIN'
    ),
    (
        'Test User',
        'user@expensetracker.com',
        '$2b$10$jY5diCN3He93MmBu50vygOWHGTkVKLQ8VAg2yPXk2VFQyWrd0npnW',
        'USER'
    );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the setup

-- Check tables
SHOW TABLES;

-- Check users
SELECT id, name, email, role, created_at FROM users;

-- Check categories
SELECT id, name, created_at FROM categories;

-- Check table structure
DESCRIBE users;
DESCRIBE categories;
DESCRIBE expenses;

-- ============================================
-- END OF SCHEMA
-- ============================================

