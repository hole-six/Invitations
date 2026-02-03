-- ============================================
-- MIGRATION: ERP Integration Support
-- Description: Add columns to support ERP user integration
-- Date: 2026-02-02
-- ============================================

-- Add ERP columns to users table
ALTER TABLE `users` 
ADD COLUMN `erp_uuid` VARCHAR(36) NULL COMMENT 'UUID from ERP system' AFTER `uuid`,
ADD COLUMN `erp_user_name` VARCHAR(255) NULL COMMENT 'Username from ERP' AFTER `erp_uuid`,
ADD COLUMN `erp_department_id` INT NULL COMMENT 'Department ID from ERP' AFTER `erp_user_name`,
ADD COLUMN `is_erp_user` TINYINT(1) DEFAULT 0 COMMENT 'Flag if user is from ERP' AFTER `erp_department_id`,
ADD COLUMN `erp_access_token` TEXT NULL COMMENT 'ERP access token' AFTER `is_erp_user`,
ADD COLUMN `erp_token_expires_at` TIMESTAMP NULL COMMENT 'ERP token expiry time' AFTER `erp_access_token`;

-- Add unique constraint for erp_uuid
ALTER TABLE `users`
ADD UNIQUE KEY `erp_uuid` (`erp_uuid`);

-- Allow NULL password for ERP users (they login via ERP)
ALTER TABLE `users` 
MODIFY COLUMN `password` VARCHAR(255) NULL COMMENT 'Password hash (NULL for ERP users)';

-- Add indexes for performance
CREATE INDEX `idx_is_erp_user` ON `users` (`is_erp_user`);
CREATE INDEX `idx_erp_department` ON `users` (`erp_department_id`);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if columns were added successfully
SHOW COLUMNS FROM `users` LIKE 'erp_%';

-- Check indexes
SHOW INDEX FROM `users` WHERE Key_name LIKE '%erp%';

-- ============================================
-- ROLLBACK (if needed)
-- ============================================

/*
-- To rollback this migration, run:

ALTER TABLE `users`
DROP INDEX `idx_erp_department`,
DROP INDEX `idx_is_erp_user`,
DROP INDEX `erp_uuid`,
DROP COLUMN `erp_token_expires_at`,
DROP COLUMN `erp_access_token`,
DROP COLUMN `is_erp_user`,
DROP COLUMN `erp_department_id`,
DROP COLUMN `erp_user_name`,
DROP COLUMN `erp_uuid`;

-- Restore password NOT NULL constraint
ALTER TABLE `users` 
MODIFY COLUMN `password` VARCHAR(255) NOT NULL;
*/
