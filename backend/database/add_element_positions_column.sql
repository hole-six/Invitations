-- Add element_positions column to store drag & drop positions
-- Run this in phpMyAdmin

USE `wedding_invitations`;

ALTER TABLE invitations 
ADD COLUMN element_positions TEXT NULL 
COMMENT 'JSON data storing element positions for drag & drop'
AFTER custom_field_data;

SELECT '✅ Column element_positions added successfully!' as status;

-- Check the column
DESCRIBE invitations;
