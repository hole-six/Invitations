&lt;?php
/**
 * Increase MySQL max_allowed_packet size
 * Run this script once to configure MySQL for large template uploads
 */

require_once '../vendor/autoload.php';

$config = require '../config/app.php';

try {
    $pdo = new PDO(
        "mysql:host={$config['database']['host']};dbname={$config['database']['database']}",
        $config['database']['username'],
        $config['database']['password']
    );
    
    // Set max_allowed_packet to 64MB
    $pdo->exec("SET GLOBAL max_allowed_packet=67108864");
    
    // Verify the change
    $result = $pdo->query("SHOW VARIABLES LIKE 'max_allowed_packet'")->fetch(PDO::FETCH_ASSOC);
    
    echo "✅ MySQL max_allowed_packet updated successfully!\n";
    echo "Current value: " . number_format($result['Value'] / 1024 / 1024, 2) . " MB\n";
    echo "\nNote: This change is temporary. To make it permanent:\n";
    echo "1. Find your MySQL configuration file (my.ini on Windows, my.cnf on Linux/Mac)\n";
    echo "2. Add under [mysqld] section:\n";
    echo "   max_allowed_packet=64M\n";
    echo "3. Restart MySQL server\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "\nIf you get 'Access denied', you need to:\n";
    echo "1. Edit your MySQL config file directly (my.ini or my.cnf)\n";
    echo "2. Add 'max_allowed_packet=64M' under [mysqld]\n";
    echo "3. Restart MySQL service\n";
}
