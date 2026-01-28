-- ============================================
-- RESET FULL DATABASE - WEDDING INVITATIONS
-- Chạy file này trong phpMyAdmin để reset toàn bộ
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

-- Insert test user (password: 123456)
INSERT INTO `users` (`uuid`, `email`, `password`, `full_name`, `phone`, `status`, `created_at`, `updated_at`) VALUES
(UUID(), 'test@test.com', '$2y$10$gPld1xlWL76NRBqbvEcpXehaSn0pac6.wuvUbFeQwAWQx4ecTbHiK', 'Test User', '0123456789', 'active', NOW(), NOW());

-- Insert categories
INSERT INTO `categories` (`name`, `slug`, `description`, `icon`, `display_order`, `is_active`) VALUES
('Cổ Điển', 'co-dien', 'Thiệp cưới phong cách cổ điển, sang trọng', 'auto_awesome', 1, 1),
('Hiện Đại', 'hien-dai', 'Thiệp cưới phong cách hiện đại, tối giản', 'style', 2, 1),
('Lãng Mạn', 'lang-man', 'Thiệp cưới phong cách lãng mạn, ngọt ngào', 'favorite', 3, 1),
('Sang Trọng', 'sang-trong', 'Thiệp cưới phong cách sang trọng, đẳng cấp', 'diamond', 4, 1);

-- ============================================
-- INSERT ULTRA PREMIUM TEMPLATES
-- ============================================

-- Template 1: Luxury Gold Rose
INSERT INTO `templates` (
    `uuid`, `name`, `slug`, `description`, `thumbnail_url`, `category_id`,
    `is_premium`, `design_data`, `tags`, `is_active`, `created_at`, `updated_at`
) VALUES (
    UUID(),
    'Luxury Gold Rose',
    'luxury-gold-rose',
    'Thiệp cưới sang trọng với vàng hồng, nhiều hình ảnh và hiệu ứng',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    4,
    1,
    '{"canvas":{"width":450,"height":2400,"background":"linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"},"elements":[{"id":"header-bg","type":"shape","shapeType":"rectangle","x":0,"y":0,"width":450,"height":600,"fill":"rgba(212, 175, 55, 0.3)","stroke":"","strokeWidth":0,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":0},{"id":"title","type":"text","content":"WEDDING INVITATION","x":25,"y":80,"width":400,"height":60,"fontSize":24,"fontFamily":"Playfair Display","color":"#d4af37","fontWeight":"bold","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":8,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2},{"id":"names","type":"text","content":"Alexander & Isabella","x":25,"y":200,"width":400,"height":120,"fontSize":48,"fontFamily":"Great Vibes","color":"#d4af37","fontWeight":"normal","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.3,"letterSpacing":2,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2},{"id":"divider-1","type":"shape","shapeType":"rectangle","x":150,"y":350,"width":150,"height":2,"fill":"#d4af37","stroke":"","strokeWidth":0,"rotation":0,"opacity":0.6,"visible":true,"locked":false,"zIndex":1},{"id":"date-label","type":"text","content":"Save The Date","x":25,"y":400,"width":400,"height":40,"fontSize":18,"fontFamily":"Montserrat","color":"#8b7355","fontWeight":"normal","fontStyle":"italic","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":2,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2},{"id":"date","type":"text","content":"25 December 2025","x":25,"y":1100,"width":400,"height":80,"fontSize":32,"fontFamily":"Playfair Display","color":"#d4af37","fontWeight":"bold","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":1,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2},{"id":"time","type":"text","content":"2:00 PM","x":25,"y":1200,"width":400,"height":50,"fontSize":24,"fontFamily":"Montserrat","color":"#8b7355","fontWeight":"normal","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":1,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2},{"id":"location","type":"text","content":"Grand Ballroom","x":25,"y":1700,"width":400,"height":80,"fontSize":36,"fontFamily":"Playfair Display","color":"#d4af37","fontWeight":"bold","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":1,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2},{"id":"address","type":"text","content":"123 Luxury Avenue, City Center","x":25,"y":1800,"width":400,"height":60,"fontSize":16,"fontFamily":"Montserrat","color":"#8b7355","fontWeight":"normal","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.4,"letterSpacing":0,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2}]}',
    '[]',
    1,
    NOW(),
    NOW()
);

-- Template 2: Elegant Floral Dream  
INSERT INTO `templates` (
    `uuid`, `name`, `slug`, `description`, `thumbnail_url`, `category_id`,
    `is_premium`, `design_data`, `tags`, `is_active`, `created_at`, `updated_at`
) VALUES (
    UUID(),
    'Elegant Floral Dream',
    'elegant-floral-dream',
    'Thiệp cưới hoa lá thanh lịch với nhiều chi tiết tinh tế',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
    3,
    1,
    '{"canvas":{"width":450,"height":2200,"background":"linear-gradient(to bottom, #fdfbfb 0%, #ebedee 100%)"},"elements":[{"id":"header","type":"text","content":"Together with their families","x":25,"y":80,"width":400,"height":40,"fontSize":14,"fontFamily":"Montserrat","color":"#8b8b8b","fontWeight":"normal","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":2,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2},{"id":"bride","type":"text","content":"Sophia Rose","x":25,"y":180,"width":400,"height":100,"fontSize":52,"fontFamily":"Great Vibes","color":"#ff69b4","fontWeight":"normal","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":1,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2},{"id":"and","type":"text","content":"&","x":200,"y":280,"width":50,"height":60,"fontSize":40,"fontFamily":"Playfair Display","color":"#c9a0dc","fontWeight":"normal","fontStyle":"italic","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":0,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2},{"id":"groom","type":"text","content":"James William","x":25,"y":350,"width":400,"height":100,"fontSize":52,"fontFamily":"Great Vibes","color":"#ff69b4","fontWeight":"normal","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":1,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2},{"id":"divider","type":"shape","shapeType":"rectangle","x":175,"y":480,"width":100,"height":1,"fill":"#ff69b4","stroke":"","strokeWidth":0,"rotation":0,"opacity":0.5,"visible":true,"locked":false,"zIndex":1},{"id":"invite-text","type":"text","content":"Request the honor of your presence","x":25,"y":520,"width":400,"height":50,"fontSize":16,"fontFamily":"Montserrat","color":"#8b8b8b","fontWeight":"normal","fontStyle":"italic","textAlign":"center","textDecoration":"none","lineHeight":1.4,"letterSpacing":1,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2},{"id":"date","type":"text","content":"December 25, 2025","x":25,"y":700,"width":400,"height":60,"fontSize":28,"fontFamily":"Playfair Display","color":"#ff69b4","fontWeight":"bold","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":1,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2},{"id":"time","type":"text","content":"At 3 o\'clock in the afternoon","x":25,"y":780,"width":400,"height":40,"fontSize":16,"fontFamily":"Montserrat","color":"#8b8b8b","fontWeight":"normal","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":0,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2},{"id":"venue","type":"text","content":"The Garden Estate","x":25,"y":920,"width":400,"height":70,"fontSize":32,"fontFamily":"Playfair Display","color":"#ff69b4","fontWeight":"bold","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":1,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2},{"id":"venue-address","type":"text","content":"456 Blossom Lane, Garden District","x":25,"y":1010,"width":400,"height":50,"fontSize":16,"fontFamily":"Montserrat","color":"#8b8b8b","fontWeight":"normal","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.4,"letterSpacing":0,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":2}]}',
    '[]',
    1,
    NOW(),
    NOW()
);

-- Template 3: Modern Minimalist
INSERT INTO `templates` (
    `uuid`, `name`, `slug`, `description`, `thumbnail_url`, `category_id`,
    `is_premium`, `design_data`, `tags`, `is_active`, `created_at`, `updated_at`
) VALUES (
    UUID(),
    'Modern Minimalist',
    'modern-minimalist',
    'Thiệp cưới tối giản hiện đại, thanh lịch',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
    2,
    0,
    '{"canvas":{"width":450,"height":630,"background":"#ffffff"},"elements":[{"id":"title","type":"text","content":"WEDDING","x":25,"y":50,"width":400,"height":40,"fontSize":20,"fontFamily":"Montserrat","color":"#2c3e50","fontWeight":"bold","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":6,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":1},{"id":"names","type":"text","content":"John & Jane","x":25,"y":150,"width":400,"height":80,"fontSize":42,"fontFamily":"Playfair Display","color":"#2c3e50","fontWeight":"bold","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":2,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":1},{"id":"date","type":"text","content":"01.01.2026","x":25,"y":350,"width":400,"height":50,"fontSize":28,"fontFamily":"Montserrat","color":"#7f8c8d","fontWeight":"normal","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":2,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":1},{"id":"location","type":"text","content":"City Hall","x":25,"y":450,"width":400,"height":40,"fontSize":20,"fontFamily":"Montserrat","color":"#95a5a6","fontWeight":"normal","fontStyle":"normal","textAlign":"center","textDecoration":"none","lineHeight":1.2,"letterSpacing":1,"rotation":0,"opacity":1,"visible":true,"locked":false,"zIndex":1}]}',
    '[]',
    1,
    NOW(),
    NOW()
);

-- ============================================
-- SUMMARY
-- ============================================
SELECT '✅ Database reset complete!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_categories FROM categories;
SELECT COUNT(*) as total_templates FROM templates;
SELECT COUNT(*) as total_invitations FROM invitations;
ALTER TABLE `templates` 
ADD COLUMN `template_type` enum('canvas','html') DEFAULT 'canvas' AFTER `is_premium`,
ADD COLUMN `html_content` longtext DEFAULT NULL AFTER `template_type`;
