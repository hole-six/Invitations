-- ============================================
-- QUICK ADMIN ACCOUNT SETUP
-- Copy và paste vào phpMyAdmin
-- ============================================

USE `wedding_invitations`;

-- Bước 1: Thêm cột role (nếu chưa có)
ALTER TABLE `users` 
ADD COLUMN `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER `phone`;

-- Bước 2: Tạo Admin Account
-- Email: admin@admin.com
-- Password: admin123
INSERT INTO `users` (`uuid`, `email`, `password`, `full_name`, `phone`, `role`, `status`, `created_at`, `updated_at`)
VALUES (
    UUID(), 
    'admin@admin.com', 
    '$2y$10$DEDH/zMEl9vUHqMjM29GOuCn5SYiWUiE8DZAGLJ2a2xll4oNFopBK',
    'Admin User', 
    '0999999999',
    'admin',
    'active', 
    NOW(), 
    NOW()
);

-- Kiểm tra
SELECT id, email, full_name, role, status FROM users WHERE email = 'admin@admin.com';

-- ============================================
-- DONE! Đăng nhập với:
-- Email: admin@admin.com
-- Password: admin123
-- URL: http://localhost:3000/admin/templates
-- ============================================
