-- Insert Admin User for Testing
USE `wedding_invitations`;

-- First, make sure role column exists
-- Run add_user_role.sql first if you haven't!

-- Insert Admin User
-- Email: admin@admin.com
-- Password: admin123
-- Password hash generated with: password_hash('admin123', PASSWORD_BCRYPT)
INSERT INTO `users` (
    `uuid`, 
    `email`, 
    `password`, 
    `full_name`, 
    `phone`, 
    `role`,
    `status`, 
    `created_at`, 
    `updated_at`
) VALUES (
    UUID(), 
    'admin1@admin.com', 
    '$2y$10$DEDH/zMEl9vUHqMjM29GOuCn5SYiWUiE8DZAGLJ2a2xll4oNFopBK', -- admin123 (FRESH HASH)
    'Admin User', 
    '0999999999',
    'admin',
    'active', 
    NOW(), 
    NOW()
);


SELECT '✅ Admin and Test users created successfully!' as status;
SELECT '📧 Admin Login: admin@admin.com / admin123' as admin_credentials;
SELECT '📧 User Login: test@test.com / test123' as user_credentials;
