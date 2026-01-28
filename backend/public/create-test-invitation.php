<?php
header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/../vendor/autoload.php';

use App\Core\Database;

$config = require __DIR__ . '/../config/app.php';
$db = new Database($config['database']);

echo "<h1>Tạo Invitation Test</h1>";
echo "<pre>";

// Step 1: Check if template exists
echo "Step 1: Kiểm tra template...\n";
$template = $db->fetchOne("SELECT id, name, slug, html_content FROM templates WHERE slug = 'passport-to-love-html'");

if (!$template) {
    echo "❌ Template 'passport-to-love-html' không tồn tại!\n";
    echo "\nCác template có sẵn:\n";
    $templates = $db->fetchAll("SELECT id, name, slug FROM templates WHERE is_active = 1");
    foreach ($templates as $t) {
        echo "  - {$t['slug']} (ID: {$t['id']})\n";
    }
    echo "\n⚠️ Bạn cần chạy file: backend/database/insert_passport_html_template.sql\n";
    exit;
}

echo "✅ Template tìm thấy: {$template['name']} (ID: {$template['id']})\n\n";

// Step 2: Check if invitation exists
echo "Step 2: Kiểm tra invitation...\n";
$slug = 'passport-to-love-html-test-user-4';
$existing = $db->fetchOne("SELECT id, slug, status FROM invitations WHERE slug = ?", [$slug]);

if ($existing) {
    echo "⚠️ Invitation đã tồn tại (ID: {$existing['id']})\n";
    echo "   Status: {$existing['status']}\n\n";
    
    // Update to published
    echo "Step 3: Cập nhật thành published...\n";
    $db->query(
        "UPDATE invitations SET status = 'published', visibility = 'public', published_at = NOW() WHERE id = ?",
        [$existing['id']]
    );
    echo "✅ Đã cập nhật!\n\n";
    
    $invitationId = $existing['id'];
} else {
    echo "⚠️ Invitation chưa tồn tại, đang tạo mới...\n\n";
    
    // Step 3: Create invitation
    echo "Step 3: Tạo invitation mới...\n";
    
    $data = [
        'uuid' => \App\Helpers\Uuid::generate(),
        'user_id' => 1,
        'template_id' => $template['id'],
        'title' => 'Passport to Love - Test User 4',
        'slug' => $slug,
        'template_type' => 'html',
        'design_data' => null,
        'html_content' => $template['html_content'], // Copy HTML from template
        'status' => 'published',
        'visibility' => 'public',
        'event_type' => 'wedding',
        'event_date' => '2025-12-31 14:00:00',
        'event_location' => 'Grand Ballroom Hotel',
        'event_address' => '123 Wedding Street, City Center',
        'groom_name' => 'Alexander',
        'bride_name' => 'Isabella',
        'published_at' => date('Y-m-d H:i:s'),
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s'),
    ];
    
    $invitationId = $db->insert('invitations', $data);
    echo "✅ Invitation đã tạo (ID: $invitationId)\n\n";
}

// Step 4: Show result
echo "Step 4: Kết quả:\n";
$result = $db->fetchOne("SELECT * FROM invitations WHERE id = ?", [$invitationId]);
echo "  ID: {$result['id']}\n";
echo "  Title: {$result['title']}\n";
echo "  Slug: {$result['slug']}\n";
echo "  Status: {$result['status']}\n";
echo "  Visibility: {$result['visibility']}\n";
echo "  Groom: {$result['groom_name']}\n";
echo "  Bride: {$result['bride_name']}\n";
echo "  Event Date: {$result['event_date']}\n";
echo "  Has HTML Template: " . ($result['html_content'] ? 'Yes' : 'No') . "\n";

echo "\n";
echo "═══════════════════════════════════════════\n";
echo "✅ HOÀN TẤT!\n";
echo "═══════════════════════════════════════════\n";
echo "\nTruy cập ngay:\n";
echo "<a href='http://localhost:5173/invitation/{$slug}' target='_blank'>";
echo "http://localhost:5173/invitation/{$slug}";
echo "</a>\n";

echo "</pre>";
