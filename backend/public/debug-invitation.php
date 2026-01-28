<?php
header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/../vendor/autoload.php';

use App\Core\Database;

$config = require __DIR__ . '/../config/app.php';
$db = new Database($config['database']);

$slug = $_GET['slug'] ?? 'mega-effects-passport-ultimate-test-user-2';

echo "<h1>🔍 Debug Invitation: $slug</h1>";
echo "<pre>";

// Check invitation
$invitation = $db->fetchOne(
    "SELECT * FROM invitations WHERE slug = ?",
    [$slug]
);

if (!$invitation) {
    echo "❌ Invitation NOT FOUND!\n\n";
    
    echo "Available invitations:\n";
    $all = $db->fetchAll("SELECT id, slug, status, visibility FROM invitations ORDER BY id DESC LIMIT 10");
    foreach ($all as $inv) {
        echo "  - {$inv['slug']} (status: {$inv['status']}, visibility: {$inv['visibility']})\n";
    }
    exit;
}

echo "✅ Invitation FOUND!\n\n";
echo "ID: {$invitation['id']}\n";
echo "Title: {$invitation['title']}\n";
echo "Slug: {$invitation['slug']}\n";
echo "Status: {$invitation['status']}\n";
echo "Visibility: {$invitation['visibility']}\n";
echo "Template Type: {$invitation['template_type']}\n";
echo "Groom: {$invitation['groom_name']}\n";
echo "Bride: {$invitation['bride_name']}\n";
echo "Event Date: {$invitation['event_date']}\n";
echo "Event Location: {$invitation['event_location']}\n\n";

echo "--- HTML Content ---\n";
if ($invitation['html_content']) {
    echo "✅ Has HTML content (" . strlen($invitation['html_content']) . " chars)\n";
    echo "First 500 chars:\n";
    echo substr($invitation['html_content'], 0, 500) . "...\n\n";
} else {
    echo "❌ NO HTML content!\n\n";
}

echo "--- Image Data ---\n";
if ($invitation['image_data']) {
    echo "✅ Has image_data\n";
    echo $invitation['image_data'] . "\n\n";
} else {
    echo "⚠️ No image_data\n\n";
}

echo "--- Custom Field Data ---\n";
if ($invitation['custom_field_data']) {
    echo "✅ Has custom_field_data\n";
    echo $invitation['custom_field_data'] . "\n\n";
} else {
    echo "⚠️ No custom_field_data\n\n";
}

echo "--- Public Access Check ---\n";
if ($invitation['status'] === 'published') {
    echo "✅ Status is 'published'\n";
} else {
    echo "❌ Status is '{$invitation['status']}' (must be 'published')\n";
}

if (in_array($invitation['visibility'], ['public', 'password'])) {
    echo "✅ Visibility is '{$invitation['visibility']}'\n";
} else {
    echo "❌ Visibility is '{$invitation['visibility']}' (must be 'public' or 'password')\n";
}

echo "\n--- FIX COMMANDS ---\n";
if ($invitation['status'] !== 'published' || !in_array($invitation['visibility'], ['public', 'password'])) {
    echo "Run this SQL to fix:\n\n";
    echo "UPDATE invitations \n";
    echo "SET status = 'published', visibility = 'public', published_at = NOW() \n";
    echo "WHERE id = {$invitation['id']};\n\n";
}

if (!$invitation['html_content']) {
    echo "⚠️ WARNING: No HTML content! Need to copy from template.\n";
    echo "Check template_id: {$invitation['template_id']}\n";
}

echo "</pre>";

echo "<hr>";
echo "<h2>Quick Actions</h2>";
echo "<a href='?slug=$slug&action=publish' style='padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;'>Publish This Invitation</a> ";
echo "<a href='/invitation/$slug' target='_blank' style='padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-left: 10px;'>View Invitation</a>";

// Handle actions
if (isset($_GET['action']) && $_GET['action'] === 'publish') {
    $db->query(
        "UPDATE invitations SET status = 'published', visibility = 'public', published_at = NOW() WHERE id = ?",
        [$invitation['id']]
    );
    echo "<script>alert('✅ Published!'); window.location.href = '?slug=$slug';</script>";
}
