<?php
/**
 * Script to insert Luxury Gallery Wedding Template
 * Run: php backend/insert_luxury_template.php
 */

require_once __DIR__ . '/vendor/autoload.php';

use App\Core\Database;

try {
    // Read HTML file
    $htmlContent = file_get_contents(__DIR__ . '/../ULTIMATE_LUXURY_WEDDING_2000.html');
    
    if ($htmlContent === false) {
        throw new Exception('Cannot read HTML file');
    }
    
    // Get database connection
    $db = Database::getInstance()->getConnection();
    
    // Delete old template if exists
    $deleteStmt = $db->prepare("DELETE FROM templates WHERE slug = ?");
    $deleteStmt->execute(['shop-slay']);
    
    // Prepare insert statement
    $sql = "INSERT INTO templates (
        uuid, name, slug, description, thumbnail_url, category_id,
        is_premium, html_content, design_data, tags, is_active, created_at, updated_at
    ) VALUES (
        UUID(), ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, NOW(), NOW()
    )";
    
    $stmt = $db->prepare($sql);
    
    // Execute insert
    $result = $stmt->execute([
        'Mẫu mới nhất của shop',
        'shop-slay',
        'Thiệp cưới tuyệt đỉnh cung fuuu!',
        'https://cdnphoto.dantri.com.vn/KWF86KWU9ZMHPeqtFrYQlL8ep00=/thumb_w/1020/2023/12/05/damcuoidonggioinvcc-1-1701768116085.jpg',
        2,
        1,
        $htmlContent,
        null,
        '["luxury", "gallery", "6photos", "elegant", "modern", "premium", "wedding"]',
        1
    ]);
    
    if ($result) {
        echo "✅ SUCCESS: Luxury Gallery Wedding template đã được tạo!\n";
        echo "🎉 Template có " . strlen($htmlContent) . " characters\n";
        echo "📊 Template ID: " . $db->lastInsertId() . "\n";
    } else {
        echo "❌ ERROR: Không thể insert template\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
