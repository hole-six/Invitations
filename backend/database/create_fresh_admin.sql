-- ============================================
-- CREATE FRESH ADMIN USER
-- Tạo admin user mới hoàn toàn
-- Email: myadmin@admin.com
-- Password: 123456
-- ============================================

USE `wedding_invitations`;

-- Xóa admin cũ nếu có
DELETE FROM users WHERE email = 'myadmin@admin.com';

-- Tạo admin mới
INSERT INTO users (uuid, email, password, full_name, phone, role, status, created_at, updated_at)
VALUES (
    UUID(),
    'myadmin@admin.com',
    '$2y$10$gPld1xlWL76NRBqbvEcpXehaSn0pac6.wuvUbFeQwAWQx4ecTbHiK',
    'My Admin',
    '0999999999',
    'admin',
    'active',
    NOW(),
    NOW()
);

-- Kiểm tra
SELECT id, email, full_name, role FROM users WHERE email = 'myadmin@admin.com';

SELECT '✅ Admin user mới đã được tạo!' as status;
SELECT 'Email: myadmin@admin.com' as login_info;
SELECT 'Password: 123456' as password_info;
