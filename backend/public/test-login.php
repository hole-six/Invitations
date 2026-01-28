<?php
/**
 * Test Login API
 */

header('Content-Type: application/json');

// Simulate POST request
$_SERVER['REQUEST_METHOD'] = 'POST';
$_POST = [
    'email' => 'test@test.com',
    'password' => '123456'
];

// Set request body
file_put_contents('php://input', json_encode($_POST));

// Include index.php to process request
$_SERVER['REQUEST_URI'] = '/api/auth/login';

try {
    require_once __DIR__ . '/index.php';
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}
