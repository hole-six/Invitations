-- Add ERP SSO columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS erp_user_id VARCHAR(255) NULL COMMENT 'ERP system user ID',
ADD COLUMN IF NOT EXISTS erp_token TEXT NULL COMMENT 'ERP authentication token',
ADD COLUMN IF NOT EXISTS erp_data JSON NULL COMMENT 'Full ERP user data backup',
ADD INDEX idx_erp_user_id (erp_user_id);

-- Make password nullable for SSO users (they don't need password)
ALTER TABLE users 
MODIFY COLUMN password VARCHAR(255) NULL;

-- Update existing users to have NULL password if they are SSO users
UPDATE users SET password = NULL WHERE erp_user_id IS NOT NULL;
