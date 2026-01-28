-- Tạo Super Admin User
USE `wedding_invitations`;

-- Xóa admin cũ nếu có
DELETE FROM `users` WHERE `email` = 'superadmin@admin.com';

-- Tạo Super Admin mới
-- Email: superadmin@admin.com
-- Password: 123456 (giống như các user khác để dễ nhớ)
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
    'superadmin@admin.com', 
    '$2y$10$gPld1xlWL76NRBqbvEcpXehaSn0pac6.wuvUbFeQwAWQx4ecTbHiK', -- 123456
    'Super Administrator', 
    '0999888777',
    'admin',
    'active', 
    NOW(), 
    NOW()
);

-- Kiểm tra kết quả
SELECT '✅ Super Admin đã được tạo!' as status;
SELECT '👨‍💼 Email: superadmin@admin.com' as email;
SELECT '🔑 Password: 123456' as password;
SELECT '🎯 Role: admin' as role;

-- Hiển thị tất cả admin users
SELECT 
    id, 
    email, 
    full_name, 
    role, 
    status,
    created_at
FROM users 
WHERE role = 'admin'
ORDER BY created_at DESC;