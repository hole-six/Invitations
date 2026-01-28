-- ============================================
-- RESET CLEAN DATABASE - WEDDING INVITATIONS
-- File clean không có lỗi duplicate
-- ============================================

-- Drop database if exists and recreate
DROP DATABASE IF EXISTS `wedding_invitations`;
CREATE DATABASE `wedding_invitations` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `wedding_invitations`;

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `avatar_url` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `last_login_ip` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `email` (`email`),
  KEY `status` (`status`),
  KEY `role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text,
  `icon` varchar(50) DEFAULT NULL,
  `display_order` int(11) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: templates
-- ============================================
CREATE TABLE `templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `is_premium` tinyint(1) DEFAULT '0',
  `template_type` enum('canvas','html') DEFAULT 'canvas',
  `html_content` longtext DEFAULT NULL,
  `design_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `tags` json DEFAULT NULL,
  `usage_count` int(11) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  UNIQUE KEY `slug` (`slug`),
  KEY `category_id` (`category_id`),
  KEY `is_premium` (`is_premium`),
  KEY `is_active` (`is_active`),
  CONSTRAINT `templates_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `design_data_check` CHECK (json_valid(`design_data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: invitations
-- ============================================
CREATE TABLE `invitations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uuid` varchar(36) NOT NULL,
  `user_id` int(11) NOT NULL,
  `template_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `groom_name` varchar(255) DEFAULT NULL,
  `bride_name` varchar(255) DEFAULT NULL,
  `template_type` varchar(20) DEFAULT 'canvas',
  `html_content` longtext DEFAULT NULL,
  `image_data` longtext DEFAULT NULL,
  `custom_field_data` longtext DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `event_time` time DEFAULT NULL,
  `event_location` varchar(500) DEFAULT NULL,
  `event_address` text,
  `design_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `music_url` varchar(500) DEFAULT NULL,
  `music_autoplay` tinyint(1) DEFAULT '0',
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `visibility` enum('public','private','password') DEFAULT 'public',
  `password` varchar(255) DEFAULT NULL,
  `views_count` int(11) DEFAULT '0',
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uuid` (`uuid`),
  KEY `user_id` (`user_id`),
  KEY `template_id` (`template_id`),
  KEY `slug` (`slug`),
  KEY `status` (`status`),
  CONSTRAINT `invitations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `invitations_ibfk_2` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE SET NULL,
  CONSTRAINT `design_data_invitation_check` CHECK (json_valid(`design_data`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: guests
-- ============================================
CREATE TABLE `guests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `invitation_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `group_name` varchar(100) DEFAULT NULL,
  `rsvp_status` enum('pending','attending','not_attending','maybe') DEFAULT 'pending',
  `guest_count` int(11) DEFAULT '1',
  `message` text,
  `responded_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `invitation_id` (`invitation_id`),
  KEY `rsvp_status` (`rsvp_status`),
  CONSTRAINT `guests_ibfk_1` FOREIGN KEY (`invitation_id`) REFERENCES `invitations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: media
-- ============================================
CREATE TABLE `media` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `size` int(11) NOT NULL,
  `url` varchar(500) NOT NULL,
  `type` enum('image','audio','video','document') DEFAULT 'image',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `type` (`type`),
  CONSTRAINT `media_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert admin user (email: admin@admin.com, password: 123456)
INSERT INTO `users` (`uuid`, `email`, `password`, `full_name`, `phone`, `role`, `status`, `created_at`, `updated_at`) VALUES
(UUID(), 'admin@admin.com', '$2y$10$gPld1xlWL76NRBqbvEcpXehaSn0pac6.wuvUbFeQwAWQx4ecTbHiK', 'Admin User', '0123456789', 'admin', 'active', NOW(), NOW());

-- Insert test user (email: test@test.com, password: 123456)
INSERT INTO `users` (`uuid`, `email`, `password`, `full_name`, `phone`, `role`, `status`, `created_at`, `updated_at`) VALUES
(UUID(), 'test@test.com', '$2y$10$gPld1xlWL76NRBqbvEcpXehaSn0pac6.wuvUbFeQwAWQx4ecTbHiK', 'Test User', '0987654321', 'user', 'active', NOW(), NOW());

-- Insert categories
INSERT INTO `categories` (`name`, `slug`, `description`, `icon`, `display_order`, `is_active`) VALUES
('Cổ Điển', 'co-dien', 'Thiệp cưới phong cách cổ điển, sang trọng', 'auto_awesome', 1, 1),
('Hiện Đại', 'hien-dai', 'Thiệp cưới phong cách hiện đại, tối giản', 'style', 2, 1),
('Lãng Mạn', 'lang-man', 'Thiệp cưới phong cách lãng mạn, ngọt ngào', 'favorite', 3, 1),
('Sang Trọng', 'sang-trong', 'Thiệp cưới phong cách sang trọng, đẳng cấp', 'diamond', 4, 1);

-- ============================================
-- INSERT SAMPLE TEMPLATES
-- ============================================

-- Template 1: Luxury Gold Rose
INSERT INTO `templates` (
    `uuid`, `name`, `slug`, `description`, `thumbnail_url`, `category_id`,
    `is_premium`, `template_type`, `design_data`, `tags`, `is_active`, `created_at`, `updated_at`
) VALUES (
    UUID(),
    'Luxury Gold Rose',
    'luxury-gold-rose',
    'Thiệp cưới sang trọng với vàng hồng, nhiều hình ảnh và hiệu ứng',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    4,
    1,
    'canvas',
    '{"canvas":{"width":450,"height":2400,"background":"linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"},"elements":[{"id":"title","type":"text","content":"WEDDING INVITATION","x":25,"y":80,"width":400,"height":60,"fontSize":24,"fontFamily":"Playfair Display","color":"#d4af37","fontWeight":"bold","textAlign":"center","letterSpacing":8}]}',
    '["luxury", "gold", "rose", "premium"]',
    1,
    NOW(),
    NOW()
);

-- Template 2: Elegant Floral Dream  
INSERT INTO `templates` (
    `uuid`, `name`, `slug`, `description`, `thumbnail_url`, `category_id`,
    `is_premium`, `template_type`, `design_data`, `tags`, `is_active`, `created_at`, `updated_at`
) VALUES (
    UUID(),
    'Elegant Floral Dream',
    'elegant-floral-dream',
    'Thiệp cưới hoa lá thanh lịch với nhiều chi tiết tinh tế',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
    3,
    1,
    'canvas',
    '{"canvas":{"width":450,"height":2200,"background":"linear-gradient(to bottom, #fdfbfb 0%, #ebedee 100%)"},"elements":[{"id":"bride","type":"text","content":"Sophia Rose","x":25,"y":180,"width":400,"height":100,"fontSize":52,"fontFamily":"Great Vibes","color":"#ff69b4","textAlign":"center"}]}',
    '["elegant", "floral", "romantic", "premium"]',
    1,
    NOW(),
    NOW()
);

-- Template 3: Modern Minimalist
INSERT INTO `templates` (
    `uuid`, `name`, `slug`, `description`, `thumbnail_url`, `category_id`,
    `is_premium`, `template_type`, `design_data`, `tags`, `is_active`, `created_at`, `updated_at`
) VALUES (
    UUID(),
    'Modern Minimalist',
    'modern-minimalist',
    'Thiệp cưới tối giản hiện đại, thanh lịch',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
    2,
    0,
    'canvas',
    '{"canvas":{"width":450,"height":630,"background":"#ffffff"},"elements":[{"id":"title","type":"text","content":"WEDDING","x":25,"y":50,"width":400,"height":40,"fontSize":20,"fontFamily":"Montserrat","color":"#2c3e50","fontWeight":"bold","textAlign":"center","letterSpacing":6}]}',
    '["modern", "minimalist", "clean", "free"]',
    1,
    NOW(),
    NOW()
);

-- ============================================
-- SUMMARY
-- ============================================
SELECT '✅ Clean database setup complete!' as status;
SELECT '📊 THỐNG KÊ:' as '';
SELECT CONCAT('👥 Users: ', COUNT(*)) as result FROM users;
SELECT CONCAT('📂 Categories: ', COUNT(*)) as result FROM categories;
SELECT CONCAT('🎨 Templates: ', COUNT(*)) as result FROM templates;
SELECT CONCAT('💌 Invitations: ', COUNT(*)) as result FROM invitations;

SELECT '' as '';
SELECT '🔑 THÔNG TIN ĐĂNG NHẬP:' as '';
SELECT '👨‍💼 Admin: admin@admin.com / 123456' as login_info;
SELECT '👤 User: test@test.com / 123456' as login_info;
SELECT '' as '';
SELECT '✅ Hệ thống sẵn sàng sử dụng!' as final_status;