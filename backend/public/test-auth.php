<?php
/**
 * Test Authentication Header
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

echo json_encode([
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers' => getallheaders(),
    'auth_header' => $_SERVER['HTTP_AUTHORIZATION'] ?? 'NOT SET',
    'all_server_keys' => array_filter(array_keys($_SERVER), fn($k) => strpos($k, 'HTTP') === 0 || strpos($k, 'AUTH') !== false),
]);
