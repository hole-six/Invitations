-- Insert LUXURY GALLERY WEDDING Template - 6 ẢNH CỰC ĐỈNH!
-- Fixed version with proper escaping

USE `wedding_invitations`;

-- Delete old template if exists
DELETE FROM `templates` WHERE `slug` = 'shop-slay';

-- Insert new template
INSERT INTO `templates` (
    `uuid`, `name`, `slug`, `description`, `thumbnail_url`, `category_id`,
    `is_premium`, `html_content`, `design_data`, `tags`, `is_active`, `created_at`, `updated_at`
) 
SELECT 
    UUID(),
    'Mẫu mới nhất của shop',
    'shop-slay',
    'Thiệp cưới tuyệt đỉnh cung fuuu!',
    'https://cdnphoto.dantri.com.vn/KWF86KWU9ZMHPeqtFrYQlL8ep00=/thumb_w/1020/2023/12/05/damcuoidonggioinvcc-1-1701768116085.jpg',
    2,
    1,
    LOAD_FILE('C:/Users/ACER/Downloads/ThiepCuoiOnLine/ULTIMATE_LUXURY_WEDDING_2000.html'),
    NULL,
    '["luxury", "gallery", "6photos", "elegant", "modern", "premium", "wedding"]',
    1,
    NOW(),
    NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `templates` WHERE `slug` = 'shop-slay');

SELECT '✅ LUXURY GALLERY WEDDING template với 6 ảnh đã được tạo!' as status;
SELECT '🎉 Template siêu đỉnh với hero photo + 2 couple photos + 3 gallery photos!' as message;
