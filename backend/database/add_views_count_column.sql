-- Add views_count column to templates table if not exists
USE `wedding_invitations`;

-- Check if column exists, if not add it
SET @dbname = DATABASE();
SET @tablename = 'templates';
SET @columnname = 'views_count';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' INT(11) DEFAULT 0 AFTER usage_count')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SELECT '✅ views_count column checked/added successfully!' as status;
