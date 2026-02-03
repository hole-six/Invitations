-- Fix missing html_template column in templates table

USE `wedding_invitations`;

-- 1. Add html_template column if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = "templates";
SET @columnname = "html_template";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE templates ADD COLUMN html_template LONGTEXT DEFAULT NULL AFTER template_type;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Add template_type column if it doesn't exist
SET @columnname = "template_type";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  "SELECT 1",
  "ALTER TABLE templates ADD COLUMN template_type ENUM('canvas','html') DEFAULT 'canvas' AFTER is_premium;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 3. Check if we need to migrate data from html_content (if it exists and html_template was empty)
SET @columnname = "html_content";
SET @hasHtmlContent = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
);

-- Note: We can't use IF logic easily for complex updates without Stored Procedure in simple script.
-- But generally, we just want to ensure html_template exists.

SELECT '✅ Fix executed successfully. html_template column should be present.' as status;
