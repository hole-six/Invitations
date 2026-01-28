-- Add role column to users table for admin/user permission
USE `wedding_invitations`;

-- Add role column if not exists
ALTER TABLE `users` 
ADD COLUMN `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER `phone`;

-- Update existing user to admin (user_id = 1)
UPDATE `users` SET `role` = 'admin' WHERE `id` = 1;

SELECT '✅ User role column added successfully!' as status;
