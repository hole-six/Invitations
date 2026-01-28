<?php

return [
    'app' => [
        'name' => 'Wedding Invitation System',
        'env' => getenv('APP_ENV') ?: 'development',
        'debug' => getenv('APP_DEBUG') === 'true',
        'url' => getenv('APP_URL') ?: 'http://localhost',
        'timezone' => 'Asia/Ho_Chi_Minh',
    ],
    
    'database' => [
        'driver' => 'mysql',
        'host' => getenv('DB_HOST') ?: 'localhost',
        'port' => getenv('DB_PORT') ?: '3306',
        'database' => getenv('DB_DATABASE') ?: 'wedding_invitations',
        'username' => getenv('DB_USERNAME') ?: 'root',
        'password' => getenv('DB_PASSWORD') ?: '',
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
    ],
    
    'jwt' => [
        'secret' => getenv('JWT_SECRET') ?: 'your-secret-key-change-in-production',
        'algorithm' => 'HS256',
        'expiration' => 2592000, // 30 days (30 * 24 * 60 * 60)
        'refresh_expiration' => 7776000, // 90 days (90 * 24 * 60 * 60)
    ],
    
    'cors' => [
        'allowed_origins' => ['http://localhost:3000', 'http://localhost:3001','http://localhost:3002','http://localhost:3003','http://localhost3004'],
        'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With'],
        'max_age' => 86400,
    ],
    
    'upload' => [
        'max_size' => 10 * 1024 * 1024, // 10MB
        'allowed_types' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'path' => __DIR__ . '/../storage/uploads',
    ],
    
    'pagination' => [
        'per_page' => 20,
        'max_per_page' => 100,
    ],
];
