<?php

namespace App\Middleware;

use App\Services\ErpSsoService;

/**
 * Middleware verify token từ ERP
 * Tất cả request phải có token hợp lệ từ ERP
 */
class ErpAuthMiddleware
{
    private ErpSsoService $erpSsoService;
    
    public function __construct()
    {
        $this->erpSsoService = new ErpSsoService();
    }
    
    public function handle(): bool
    {
        // Lấy token từ header
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
        
        if (!$authHeader) {
            $this->jsonError('No authorization token', 401);
            return false;
        }
        
        // Remove "Bearer " prefix
        $token = str_replace('Bearer ', '', $authHeader);
        
        // Verify token với ERP
        if (!$this->erpSsoService->verifyToken($token)) {
            $this->jsonError('Invalid or expired token', 401);
            return false;
        }
        
        // Lấy user info từ ERP
        $userInfo = $this->erpSsoService->getUserInfo($token);
        
        if (!$userInfo) {
            $this->jsonError('Failed to get user info', 401);
            return false;
        }
        
        // Sync user vào database (tạo mới hoặc update)
        $user = $this->erpSsoService->syncUser($userInfo);
        
        if (!$user) {
            $this->jsonError('Failed to sync user', 500);
            return false;
        }
        
        // Lưu user info vào global để dùng trong controller
        $GLOBALS['current_user'] = $user;
        
        return true;
    }
    
    private function jsonError(string $message, int $code): void
    {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message
        ]);
        exit;
    }
}
