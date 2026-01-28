<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../vendor/autoload.php';

use App\Core\Database;

$config = require __DIR__ . '/../config/app.php';
$db = new Database($config['database']);

$slug = $_GET['slug'] ?? 'mega-effects-passport-ultimate-test-user-2';

$invitation = $db->fetchOne(
    "SELECT id, slug, status, visibility, template_type, html_content, image_data, custom_field_data, groom_name, bride_name FROM invitations WHERE slug = ?",
    [$slug]
);

if (!$invitation) {
    echo json_encode([
        'found' => false,
        'message' => 'Invitation not found',
        'available' => $db->fetchAll("SELECT slug, status, visibility FROM invitations ORDER BY id DESC LIMIT 5")
    ], JSON_PRETTY_PRINT);
    exit;
}

echo json_encode([
    'found' => true,
    'id' => $invitation['id'],
    'slug' => $invitation['slug'],
    'status' => $invitation['status'],
    'visibility' => $invitation['visibility'],
    'template_type' => $invitation['template_type'],
    'has_html_content' => !empty($invitation['html_content']),
    'html_content_length' => strlen($invitation['html_content'] ?? ''),
    'has_image_data' => !empty($invitation['image_data']),
    'image_data' => $invitation['image_data'],
    'has_custom_field_data' => !empty($invitation['custom_field_data']),
    'custom_field_data' => $invitation['custom_field_data'],
    'groom_name' => $invitation['groom_name'],
    'bride_name' => $invitation['bride_name'],
    'is_accessible' => ($invitation['status'] === 'published' && in_array($invitation['visibility'], ['public', 'password']))
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
