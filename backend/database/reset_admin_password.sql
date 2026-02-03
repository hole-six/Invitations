-- ============================================
-- RESET ADMIN PASSWORD
-- Reset password cho admin users về 123456
-- Password hash: $2y$10$gPld1xlWL76NRBqbvEcpXehaSn0pac6.wuvUbFeQwAWQx4ecTbHiK
-- ============================================

USE `wedding_invitations`;

-- Xem danh sách users hiện có
SELECT id, email, full_name, role FROM users;

-- Reset password cho tất cả admin users về 123456
UPDATE users 
SET password = '$2y$10$gPld1xlWL76NRBqbvEcpXehaSn0pac6.wuvUbFeQwAWQx4ecTbHiK'
WHERE role = 'admin';

-- Reset password cho test user
UPDATE users 
SET password = '$2y$10$gPld1xlWL76NRBqbvEcpXehaSn0pac6.wuvUbFeQwAWQx4ecTbHiK',
    role = 'admin'
WHERE email = 'test@test.com';

-- Kiểm tra lại
SELECT id, email, full_name, role, 
       SUBSTRING(password, 1, 20) as password_hash
FROM users 
WHERE role = 'admin' OR email = 'test@test.com';

SELECT '✅ Password đã được reset về 123456 cho tất cả admin!' as status;
