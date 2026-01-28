<?php
// Test public invitation API
header('Content-Type: text/plain; charset=utf-8');

require_once __DIR__ . '/../vendor/autoload.php';

use App\Core\Database;
use App\Repositories\InvitationRepository;
use App\Services\InvitationService;

$config = require __DIR__ . '/../config/app.php';
$db = new Database($config['database']);
$invitationRepo = new InvitationRepository($db);
$invitationService = new InvitationService($invitationRepo);

echo "=== TESTING PUBLIC INVITATION API ===\n\n";

// Get slug from query parameter or use default
$slug = $_GET['slug'] ?? 'passport-to-love-html-test-user';

echo "Testing slug: $slug\n\n";

// Step 1: Check if invitation exists in database
echo "Step 1: Checking database...\n";
$result = $db->fetchOne(
    "SELECT id, title, slug, status, visibility, user_id FROM invitations WHERE slug = ?",
    [$slug]
);

if (!$result) {
    echo "❌ Invitation not found in database!\n\n";
    
    // Show all invitations
    echo "All invitations:\n";
    $all = $db->fetchAll("SELECT id, title, slug, status, visibility FROM invitations ORDER BY id DESC LIMIT 10");
    foreach ($all as $inv) {
        echo "  - {$inv['slug']} (status: {$inv['status']}, visibility: {$inv['visibility']})\n";
    }
    exit;
}

echo "✅ Found invitation:\n";
echo "  ID: {$result['id']}\n";
echo "  Title: {$result['title']}\n";
echo "  Slug: {$result['slug']}\n";
echo "  Status: {$result['status']}\n";
echo "  Visibility: {$result['visibility']}\n";
echo "  User ID: {$result['user_id']}\n\n";

// Step 2: Check if it meets public viewing requirements
echo "Step 2: Checking public viewing requirements...\n";

$canView = false;
$issues = [];

if ($result['status'] !== 'published') {
    $issues[] = "Status is '{$result['status']}' (must be 'published')";
} else {
    echo "✅ Status is 'published'\n";
}

if (!in_array($result['visibility'], ['public', 'password'])) {
    $issues[] = "Visibility is '{$result['visibility']}' (must be 'public' or 'password')";
} else {
    echo "✅ Visibility is '{$result['visibility']}'\n";
}

if (empty($issues)) {
    echo "\n✅ Invitation can be viewed publicly!\n\n";
    $canView = true;
} else {
    echo "\n❌ Invitation CANNOT be viewed publicly:\n";
    foreach ($issues as $issue) {
        echo "  - $issue\n";
    }
    echo "\n";
}

// Step 3: Try to fetch using service
if ($canView) {
    echo "Step 3: Testing service method...\n";
    try {
        $invitation = $invitationService->getPublicInvitation($slug);
        echo "✅ Service returned invitation successfully!\n";
        echo "  Title: {$invitation['title']}\n";
        echo "  Has HTML template: " . (isset($invitation['html_template']) && $invitation['html_template'] ? 'Yes' : 'No') . "\n";
        echo "  Has design_data: " . (isset($invitation['design_data']) ? 'Yes' : 'No') . "\n";
    } catch (Exception $e) {
        echo "❌ Service error: {$e->getMessage()}\n";
    }
} else {
    echo "Step 3: Fixing invitation...\n";
    $db->query(
        "UPDATE invitations SET status = 'published', visibility = 'public', published_at = NOW() WHERE id = ?",
        [$result['id']]
    );
    echo "✅ Updated invitation to published!\n";
    echo "\nNow try accessing: http://localhost:5173/invitation/$slug\n";
}

echo "\n=== TEST COMPLETE ===\n";
