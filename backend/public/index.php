<?php
/**
 * Wedding Invitation System - Entry Point
 * Pure PHP - Easy to convert to Golang
 */

declare(strict_types=1);

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', '1');

// CORS Headers
header('Access-Control-Allow-Origin: *'); // Allow all origins temporarily
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Debug: Log all incoming requests
error_log('=== INCOMING REQUEST ===');
error_log('Method: ' . $_SERVER['REQUEST_METHOD']);
error_log('URI: ' . $_SERVER['REQUEST_URI']);
error_log('Headers: ' . json_encode(getallheaders()));
error_log('Body: ' . file_get_contents('php://input'));
error_log('========================');

// Define constants
define('ROOT_PATH', dirname(__DIR__));
define('APP_PATH', ROOT_PATH . '/app');
define('CONFIG_PATH', ROOT_PATH . '/config');
define('STORAGE_PATH', ROOT_PATH . '/storage');

// Autoloader
require_once ROOT_PATH . '/vendor/autoload.php';

// Load configuration
$config = require CONFIG_PATH . '/app.php';

// Initialize application
$app = new \App\Core\Application($config);

// Handle request
$app->run();
