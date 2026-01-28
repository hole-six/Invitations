<?php
/**
 * Script to update Luxury Template HTML content
 * Run after importing insert_luxury_safe.sql
 */

// Database configuration
$host = 'localhost';
$dbname = 'wedding_invitations';
$username = 'root';
$password = '';

try {
    // Connect to database
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Read HTML file
    $htmlFile = __DIR__ . '/../ULTIMATE_LUXURY_WEDDING_2000.html';
    
    if (!file_exists($htmlFile)) {
        throw new Exception("HTML file not found: $htmlFile");
    }
    
    $htmlContent = file_get_contents($htmlFile);
    
    if ($htmlContent === false) {
        throw new Exception('Cannot read HTML file');
    }
    
    // Update template with HTML content
    $sql = "UPDATE templates SET html_content = ? WHERE slug = 'shop-slay'";
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute([$htmlContent]);
    
    if ($result) {
        echo "✅ SUCCESS: HTML content updated!\n";
        echo "📊 HTML size: " . number_format(strlen($htmlContent)) . " characters\n";
        echo "🎉 Template 'shop-slay' is ready to use!\n";
        
        // Verify update
        $checkSql = "SELECT id, name, LENGTH(html_content) as html_length FROM templates WHERE slug = 'shop-slay'";
        $checkStmt = $pdo->query($checkSql);
        $template = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($template) {
            echo "\n📋 TEMPLATE INFO:\n";
            echo "ID: " . $template['id'] . "\n";
            echo "Name: " . $template['name'] . "\n";
            echo "HTML Length: " . number_format($template['html_length']) . " characters\n";
        }
        
    } else {
        echo "❌ ERROR: Failed to update HTML content\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>