<?php
// Generate password hash for admin users

$passwords = [
    'admin123' => password_hash('admin123', PASSWORD_BCRYPT),
    'test123' => password_hash('test123', PASSWORD_BCRYPT),
];

echo "=== PASSWORD HASHES ===\n\n";

foreach ($passwords as $plain => $hash) {
    echo "Password: $plain\n";
    echo "Hash: $hash\n";
    echo "Verify: " . (password_verify($plain, $hash) ? 'OK' : 'FAILED') . "\n";
    echo "\n";
}

echo "=== SQL STATEMENTS ===\n\n";

echo "-- Admin User (admin@admin.com / admin123)\n";
echo "INSERT INTO `users` (`uuid`, `email`, `password`, `full_name`, `phone`, `role`, `status`, `created_at`, `updated_at`)\n";
echo "VALUES (UUID(), 'admin@admin.com', '{$passwords['admin123']}', 'Admin User', '0999999999', 'admin', 'active', NOW(), NOW());\n\n";

echo "-- Test User (test@test.com / test123)\n";
echo "INSERT INTO `users` (`uuid`, `email`, `password`, `full_name`, `phone`, `role`, `status`, `created_at`, `updated_at`)\n";
echo "VALUES (UUID(), 'test@test.com', '{$passwords['test123']}', 'Test User', '0123456789', 'user', 'active', NOW(), NOW());\n\n";

echo "Done!\n";
?>
