-- Insert LUXURY GALLERY WEDDING Template - SAFE VERSION
-- Sử dụng file này để import an toàn

USE `wedding_invitations`;

-- Delete old template if exists
DELETE FROM `templates` WHERE `slug` = 'shop-slay';

-- Insert new template with minimal HTML (will be updated via PHP)
INSERT INTO `templates` (
    `uuid`, `name`, `slug`, `description`, `thumbnail_url`, `category_id`,
    `is_premium`, `template_type`, `html_content`, `design_data`, `tags`, `is_active`, `created_at`, `updated_at`
) VALUES (
    UUID(),
    'Mẫu mới nhất của shop',
    'shop-slay',
    'Thiệp cưới tuyệt đỉnh cung fuuu!',
    'https://cdnphoto.dantri.com.vn/KWF86KWU9ZMHPeqtFrYQlL8ep00=/thumb_w/1020/2023/12/05/damcuoidonggioinvcc-1-1701768116085.jpg',
    2,
    1,
    'html',
    '<!DOCTYPE html><html><head><title>{{title}}</title></head><body><h1>{{groom_name}} & {{bride_name}}</h1><p>{{event_date}} - {{event_location}}</p></body></html>',
    NULL,
    '["luxury", "gallery", "6photos", "elegant", "modern", "premium", "wedding"]',
    1,
    NOW(),
    NOW()
);

-- Get the template ID
SET @template_id = LAST_INSERT_ID();

SELECT '✅ Template cơ bản đã được tạo!' as status;
SELECT CONCAT('📊 Template ID: ', @template_id) as template_info;
SELECT '⚠️ Cần chạy PHP script để update HTML content đầy đủ!' as next_step;
SELECT 'Chạy: php backend/insert_luxury_template.php' as command;