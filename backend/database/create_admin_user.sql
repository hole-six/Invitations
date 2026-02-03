-- ============================================
-- CREATE ADMIN USER
-- Email: admin@admin.com
-- Password: admin123
-- ============================================

USE `wedding_invitations`;

-- Check if admin user already exists
SELECT 'Checking for existing admin user...' as status;

-- Delete existing admin user if exists
DELETE FROM users WHERE email = 'admin@admin.com';

-- Insert new admin user
-- Password hash for 'admin123' using bcrypt
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
    'admin@admin.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'Administrator',
    '0123456789',
    'admin',
    'active',
    NOW(),
    NOW()
);

-- Verify admin user created
SELECT 
    id,
    email,
    full_name,
    role,
    status,
    created_at
FROM users 
WHERE email = 'admin@admin.com';

SELECT '✅ Admin user created successfully!' as status;
SELECT 'Email: admin@admin.com' as credentials;
SELECT 'Password: admin123' as password;
