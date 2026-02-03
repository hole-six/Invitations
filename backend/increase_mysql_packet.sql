-- Increase MySQL max_allowed_packet to handle large templates
-- Run this SQL in your MySQL database

-- Set for current session (temporary)
SET GLOBAL max_allowed_packet=67108864; -- 64MB

-- To make it permanent, add this to your MySQL configuration file (my.ini or my.cnf):
-- [mysqld]
-- max_allowed_packet=64M

-- Verify the change
SHOW VARIABLES LIKE 'max_allowed_packet';
