-- Increase max_allowed_packet for large HTML content
SET GLOBAL max_allowed_packet=67108864; -- 64MB

-- Show current value
SHOW VARIABLES LIKE 'max_allowed_packet';

SELECT '✅ max_allowed_packet increased to 64MB' as status;
