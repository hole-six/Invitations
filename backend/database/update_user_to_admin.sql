-- ============================================
-- UPDATE USER TO ADMIN
-- Chuyển user hiện tại thành admin
-- ============================================

USE `wedding_invitations`;

-- Xem danh sách users hiện có
SELECT id, email, full_name, role FROM users;

-- Chuyển Test User thành admin (nếu đang dùng test@test.com)
UPDATE users SET role = 'admin' WHERE email = 'test@test.com';

-- Hoặc chuyển user ID 1 thành admin
UPDATE users SET role = 'admin' WHERE id = 1;

-- Kiểm tra lại
SELECT id, email, full_name, role FROM users WHERE role = 'admin';

SELECT '✅ User đã được chuyển thành admin!' as status;
