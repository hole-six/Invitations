<?php

namespace App\Middleware;

use App\Core\Request;
use App\Core\Response;
use App\Helpers\JWT;

class AuthMiddleware
{
    public static function handle(): ?array
    {
        $request = new Request();
        $token = $request->bearerToken();
        
        // Debug: Log all headers and token
        error_log('=== AUTH DEBUG ===');
        error_log('All headers: ' . json_encode(getallheaders()));
        error_log('$_SERVER keys with HTTP: ' . json_encode(array_filter(array_keys($_SERVER), fn($k) => strpos($k, 'HTTP') === 0)));
        error_log('Token extracted: ' . ($token ? substr($token, 0, 20) . '...' : 'NULL'));
        
        if (!$token) {
            Response::unauthorized('Token not provided');
            return null;
        }
        
        $config = $GLOBALS['config'] ?? require CONFIG_PATH . '/app.php';
        $payload = JWT::decode($token, $config['jwt']['secret']);
        
        if (!$payload) {
            Response::unauthorized('Invalid or expired token');
            return null;
        }
        
        // Store user data in global for easy access
        $GLOBALS['auth_user'] = $payload;
        
        return $payload;
    }
    
    public static function user(): ?array
    {
        return $GLOBALS['auth_user'] ?? null;
    }
    
    public static function userId(): ?int
    {
        $user = self::user();
        return $user['user_id'] ?? null;
    }
    
    public static function check(): bool
    {
        return self::user() !== null;
    }
}
