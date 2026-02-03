-- ============================================
-- INSERT TEST USERS
-- Tạo users test để admin có thể quản lý
-- Password cho tất cả: 123456
-- ============================================

USE `wedding_invitations`;

-- User 1: Test User (đã có sẵn)
-- Email: test@test.com
-- Password: 123456

-- User 2: Nguyễn Văn A
INSERT INTO `users` (`uuid`, `email`, `password`, `full_name`, `phone`, `role`, `status`, `created_at`, `updated_at`) 
VALUES (UUID(), 'nguyenvana@gmail.com', '$2y$10$gPld1xlWL76NRBqbvEcpXehaSn0pac6.wuvUbFeQwAWQx4ecTbHiK', 'Nguyễn Văn A', '0901234567', 'user', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

-- User 3: Trần Thị B
INSERT INTO `users` (`uuid`, `email`, `password`, `full_name`, `phone`, `role`, `status`, `created_at`, `updated_at`) 
VALUES (UUID(), 'tranthib@gmail.com', '$2y$10$gPld1xlWL76NRBqbvEcpXehaSn0pac6.wuvUbFeQwAWQx4ecTbHiK', 'Trần Thị B', '0902345678', 'user', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

-- User 4: Lê Văn C
INSERT INTO `users` (`uuid`, `email`, `password`, `full_name`, `phone`, `role`, `status`, `created_at`, `updated_at`) 
VALUES (UUID(), 'levanc@gmail.com', '$2y$10$gPld1xlWL76NRBqbvEcpXehaSn0pac6.wuvUbFeQwAWQx4ecTbHiK', 'Lê Văn C', '0903456789', 'user', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

-- User 5: Phạm Thị D
INSERT INTO `users` (`uuid`, `email`, `password`, `full_name`, `phone`, `role`, `status`, `created_at`, `updated_at`) 
VALUES (UUID(), 'phamthid@gmail.com', '$2y$10$gPld1xlWL76NRBqbvEcpXehaSn0pac6.wuvUbFeQwAWQx4ecTbHiK', 'Phạm Thị D', '0904567890', 'user', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

-- User 6: Hoàng Văn E
INSERT INTO `users` (`uuid`, `email`, `password`, `full_name`, `phone`, `role`, `status`, `created_at`, `updated_at`) 
VALUES (UUID(), 'hoangvane@gmail.com', '$2y$10$gPld1xlWL76NRBqbvEcpXehaSn0pac6.wuvUbFeQwAWQx4ecTbHiK', 'Hoàng Văn E', '0905678901', 'user', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

-- Admin User (nếu chưa có)
INSERT INTO `users` (`uuid`, `email`, `password`, `full_name`, `phone`, `role`, `status`, `created_at`, `updated_at`) 
VALUES (UUID(), 'admin@admin.com', '$2y$10$gPld1xlWL76NRBqbvEcpXehaSn0pac6.wuvUbFeQwAWQx4ecTbHiK', 'Admin User', '0900000000', 'admin', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE email=email;

-- Tạo invitations test cho các users
-- User 1 (test@test.com) - 3 invitations
INSERT INTO `invitations` (`uuid`, `user_id`, `template_id`, `title`, `slug`, `groom_name`, `bride_name`, `status`, `created_at`) 
SELECT UUID(), u.id, 1, 'Thiệp cưới Test User 1', 'thiep-cuoi-test-1', 'Anh Tú', 'Diệu Nhi', 'published', NOW()
FROM users u WHERE u.email = 'test@test.com' LIMIT 1
ON DUPLICATE KEY UPDATE title=title;

INSERT INTO `invitations` (`uuid`, `user_id`, `template_id`, `title`, `slug`, `groom_name`, `bride_name`, `status`, `created_at`) 
SELECT UUID(), u.id, 2, 'Thiệp cưới Test User 2', 'thiep-cuoi-test-2', 'Minh Tuấn', 'Hương Giang', 'draft', NOW()
FROM users u WHERE u.email = 'test@test.com' LIMIT 1
ON DUPLICATE KEY UPDATE title=title;

-- User 2 (nguyenvana@gmail.com) - 2 invitations
INSERT INTO `invitations` (`uuid`, `user_id`, `template_id`, `title`, `slug`, `groom_name`, `bride_name`, `status`, `created_at`) 
SELECT UUID(), u.id, 1, 'Thiệp cưới Nguyễn Văn A', 'thiep-cuoi-nguyen-van-a', 'Văn A', 'Thị B', 'published', NOW()
FROM users u WHERE u.email = 'nguyenvana@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE title=title;

INSERT INTO `invitations` (`uuid`, `user_id`, `template_id`, `title`, `slug`, `groom_name`, `bride_name`, `status`, `created_at`) 
SELECT UUID(), u.id, 2, 'Thiệp sinh nhật Văn A', 'thiep-sinh-nhat-van-a', '', '', 'draft', NOW()
FROM users u WHERE u.email = 'nguyenvana@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE title=title;

-- User 3 (tranthib@gmail.com) - 4 invitations
INSERT INTO `invitations` (`uuid`, `user_id`, `template_id`, `title`, `slug`, `groom_name`, `bride_name`, `status`, `created_at`) 
SELECT UUID(), u.id, 1, 'Thiệp cưới Trần Thị B', 'thiep-cuoi-tran-thi-b', 'Đức Anh', 'Thị B', 'published', NOW()
FROM users u WHERE u.email = 'tranthib@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE title=title;

INSERT INTO `invitations` (`uuid`, `user_id`, `template_id`, `title`, `slug`, `groom_name`, `bride_name`, `status`, `created_at`) 
SELECT UUID(), u.id, 2, 'Thiệp đính hôn', 'thiep-dinh-hon-b', 'Đức Anh', 'Thị B', 'published', NOW()
FROM users u WHERE u.email = 'tranthib@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE title=title;

INSERT INTO `invitations` (`uuid`, `user_id`, `template_id`, `title`, `slug`, `groom_name`, `bride_name`, `status`, `created_at`) 
SELECT UUID(), u.id, 3, 'Thiệp mời tiệc', 'thiep-moi-tiec-b', '', '', 'draft', NOW()
FROM users u WHERE u.email = 'tranthib@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE title=title;

-- User 4 (levanc@gmail.com) - 1 invitation
INSERT INTO `invitations` (`uuid`, `user_id`, `template_id`, `title`, `slug`, `groom_name`, `bride_name`, `status`, `created_at`) 
SELECT UUID(), u.id, 1, 'Thiệp cưới Lê Văn C', 'thiep-cuoi-le-van-c', 'Văn C', 'Hải Yến', 'published', NOW()
FROM users u WHERE u.email = 'levanc@gmail.com' LIMIT 1
ON DUPLICATE KEY UPDATE title=title;

-- Hiển thị kết quả
SELECT '✅ Đã tạo users và invitations test!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT u.full_name, u.email, COUNT(i.id) as invitation_count 
FROM users u 
LEFT JOIN invitations i ON u.id = i.user_id 
GROUP BY u.id 
ORDER BY u.full_name;
