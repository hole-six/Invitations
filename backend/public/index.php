<?php
/**
 * Wedding Invitation System - Entry Point
 * Pure PHP - Easy to convert to Golang
 */

declare(strict_types=1);

// Error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', '0'); // Don't display errors as HTML
ini_set('log_errors', '1'); // Log errors instead

// Set error handler to return JSON
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error: ' . $errstr,
        'errors' => [
            'file' => $errfile,
            'line' => $errline
        ]
    ]);
    exit;
});

// Set exception handler to return JSON
set_exception_handler(function($exception) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Exception: ' . $exception->getMessage(),
        'errors' => [
            'file' => $exception->getFile(),
            'line' => $exception->getLine(),
            'trace' => $exception->getTraceAsString()
        ]
    ]);
    exit;
});

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

// Apply ERP Auth Middleware to all API routes (except public routes)
$publicRoutes = [
    '/api/health',
    '/api/public/invitations/'
];

$requestUri = $_SERVER['REQUEST_URI'];
$isPublicRoute = false;

foreach ($publicRoutes as $publicRoute) {
    if (strpos($requestUri, $publicRoute) === 0) {
        $isPublicRoute = true;
        break;
    }
}

// Verify ERP token for non-public routes
if (!$isPublicRoute && strpos($requestUri, '/api/') === 0) {
    $erpAuthMiddleware = new \App\Middleware\ErpAuthMiddleware();
    if (!$erpAuthMiddleware->handle()) {
        exit; // Middleware đã trả về error response
    }
}

// Handle request
$app->run();
