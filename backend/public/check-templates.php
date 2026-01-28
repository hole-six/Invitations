<?php
/**
 * Check templates in database
 */

require_once '../vendor/autoload.php';

$config = require '../config/app.php';
$db = new \App\Core\Database($config['database']);

header('Content-Type: application/json');

$templates = $db->fetchAll('SELECT id, name, slug, is_premium, is_featured, is_active FROM templates ORDER BY id');

echo json_encode([
    'count' => count($templates),
    'templates' => $templates
], JSON_PRETTY_PRINT);
