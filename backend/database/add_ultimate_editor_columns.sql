-- Add columns for Ultimate HTML Editor
USE `wedding_invitations`;

-- Add image_data and custom_field_data columns
ALTER TABLE `invitations` 
ADD COLUMN IF NOT EXISTS `image_data` LONGTEXT DEFAULT NULL AFTER `html_content`,
ADD COLUMN IF NOT EXISTS `custom_field_data` LONGTEXT DEFAULT NULL AFTER `image_data`;

-- Show result
SELECT '✅ Columns added successfully!' as status;
DESCRIBE `invitations`;
