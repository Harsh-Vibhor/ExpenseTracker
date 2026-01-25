-- ============================================
-- Migration: Add user_id to category_budgets
-- ============================================
-- This migration makes budgets user-specific by adding user_id
-- to the category_budgets table.
--
-- IMPORTANT: This migration is IDEMPOTENT and can be safely re-run.
-- It checks for existing columns and indexes before making changes.
--
-- Usage:
--   mysql -u root -p expense_tracker < backend/database/migrations/add_user_to_budgets.sql
-- ============================================

USE expense_tracker;

-- ============================================
-- Check and Add user_id Column
-- ============================================

-- Check if user_id column exists
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'expense_tracker'
      AND TABLE_NAME = 'category_budgets'
      AND COLUMN_NAME = 'user_id'
);

-- Add user_id column only if it doesn't exist
SET @sql = IF(
    @column_exists = 0,
    'ALTER TABLE category_budgets ADD COLUMN user_id INT NULL AFTER id',
    'SELECT "Column user_id already exists, skipping..." AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Populate user_id for Existing Records
-- ============================================

-- Only update if there are NULL user_id values
UPDATE category_budgets 
SET user_id = (SELECT id FROM users ORDER BY id LIMIT 1)
WHERE user_id IS NULL;

-- ============================================
-- Make user_id NOT NULL
-- ============================================

-- Check if user_id is already NOT NULL
SET @is_nullable = (
    SELECT IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'expense_tracker'
      AND TABLE_NAME = 'category_budgets'
      AND COLUMN_NAME = 'user_id'
);

-- Make user_id NOT NULL only if it's currently nullable
SET @sql = IF(
    @is_nullable = 'YES',
    'ALTER TABLE category_budgets MODIFY COLUMN user_id INT NOT NULL',
    'SELECT "Column user_id is already NOT NULL, skipping..." AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Add Foreign Key Constraint
-- ============================================

-- Check if foreign key constraint exists
SET @fk_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'expense_tracker'
      AND TABLE_NAME = 'category_budgets'
      AND CONSTRAINT_NAME = 'fk_budget_user'
);

-- Add foreign key only if it doesn't exist
SET @sql = IF(
    @fk_exists = 0,
    'ALTER TABLE category_budgets ADD CONSTRAINT fk_budget_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
    'SELECT "Foreign key fk_budget_user already exists, skipping..." AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Update Unique Constraint
-- ============================================

-- Check if old unique constraint exists
SET @old_index_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'expense_tracker'
      AND TABLE_NAME = 'category_budgets'
      AND INDEX_NAME = 'unique_category_month'
);

-- Drop old unique constraint if it exists
SET @sql = IF(
    @old_index_exists > 0,
    'ALTER TABLE category_budgets DROP INDEX unique_category_month',
    'SELECT "Old index unique_category_month does not exist, skipping drop..." AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if new unique constraint exists
SET @new_index_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'expense_tracker'
      AND TABLE_NAME = 'category_budgets'
      AND INDEX_NAME = 'unique_user_category_month'
);

-- Add new unique constraint only if it doesn't exist
SET @sql = IF(
    @new_index_exists = 0,
    'ALTER TABLE category_budgets ADD UNIQUE KEY unique_user_category_month (user_id, category_id, month)',
    'SELECT "Index unique_user_category_month already exists, skipping..." AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Add Index on user_id
-- ============================================

-- Check if user_id index exists
SET @user_index_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = 'expense_tracker'
      AND TABLE_NAME = 'category_budgets'
      AND INDEX_NAME = 'idx_user_id'
);

-- Add index only if it doesn't exist
SET @sql = IF(
    @user_index_exists = 0,
    'ALTER TABLE category_budgets ADD INDEX idx_user_id (user_id)',
    'SELECT "Index idx_user_id already exists, skipping..." AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Verification
-- ============================================

SELECT 'Migration completed successfully!' AS status;

-- Show updated table structure
DESCRIBE category_budgets;

-- Show indexes
SHOW INDEX FROM category_budgets;

-- ============================================
-- Rollback Instructions (Manual)
-- ============================================
-- To rollback this migration, run the following commands manually:
--
-- ALTER TABLE category_budgets DROP FOREIGN KEY fk_budget_user;
-- ALTER TABLE category_budgets DROP INDEX unique_user_category_month;
-- ALTER TABLE category_budgets DROP INDEX idx_user_id;
-- ALTER TABLE category_budgets ADD UNIQUE KEY unique_category_month (category_id, month);
-- ALTER TABLE category_budgets DROP COLUMN user_id;
-- ============================================
