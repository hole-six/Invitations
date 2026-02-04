<?php

namespace App\Controllers;

use App\Services\ErpSsoService;
use App\Services\AuthService;

/**
 * Controller xử lý SSO authentication với HiWeb ERP
 */
class SsoAuthController
{
    private ErpSsoService $erpSsoService;
    private AuthService $authService;
    
    public function __construct()
    {
        $this->erpSsoService = new ErpSsoService();
        $this->authService = new AuthService();
    }
    
    /**
     * Redirect user đến ERP login page
     * GET /api/auth/sso/redirect
     */
    public function redirectToErp(): void
    {
        try {
            // Lấy return URL từ query params (optional)
            $returnUrl = $_GET['return_url'] ?? null;
            
            // Tạo login URL và redirect
            $loginUrl = $this->erpSsoService->getLoginUrl($returnUrl);
            
            header('Location: ' . $loginUrl);
            exit;
            
        } catch (\Exception $e) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to redirect to ERP login: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Handle callback từ ERP sau khi user login
     * GET /api/auth/sso/callback?token=xxx&state=xxx
     */
    public function handleCallback(): void
    {
        try {
            // Lấy token và state từ query params
            $token = $_GET['token'] ?? null;
            $state = $_GET['state'] ?? null;
            
            if (!$token) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Missing token from ERP'
                ], 400);
                return;
            }
            
            // Verify state để prevent CSRF
            if ($state && isset($_SESSION['sso_state'])) {
                if ($state !== $_SESSION['sso_state']) {
                    $this->jsonResponse([
                        'success' => false,
                        'message' => 'Invalid state parameter'
                    ], 400);
                    return;
                }
                unset($_SESSION['sso_state']);
            }
            
            // Verify token với ERP
            if (!$this->erpSsoService->verifyToken($token)) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Invalid or expired token'
                ], 401);
                return;
            }
            
            // Lấy thông tin user từ ERP
            $erpUserData = $this->erpSsoService->getUserInfo($token);
            
            if (!$erpUserData) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Failed to get user info from ERP'
                ], 500);
                return;
            }
            
            // Sync user vào Wedding database
            $user = $this->erpSsoService->syncUser($erpUserData);
            
            if (!$user) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Failed to sync user data'
                ], 500);
                return;
            }
            
            // Tạo JWT token cho Wedding system
            $weddingToken = $this->authService->generateToken($user);
            
            // Lấy return URL từ session (nếu có)
            $returnUrl = $_SESSION['sso_return_url'] ?? '/dashboard';
            unset($_SESSION['sso_return_url']);
            
            // Return success response
            $this->jsonResponse([
                'success' => true,
                'message' => 'SSO login successful',
                'data' => [
                    'token' => $weddingToken,
                    'user' => [
                        'id' => $user['id'],
                        'uuid' => $user['uuid'],
                        'email' => $user['email'],
                        'full_name' => $user['full_name'],
                        'role' => $user['role'],
                        'avatar_url' => $user['avatar_url']
                    ],
                    'return_url' => $returnUrl
                ]
            ]);
            
        } catch (\Exception $e) {
            error_log('SSO callback error: ' . $e->getMessage());
            $this->jsonResponse([
                'success' => false,
                'message' => 'SSO authentication failed: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Check SSO status - kiểm tra user đã login qua SSO chưa
     * GET /api/auth/sso/status
     */
    public function checkStatus(): void
    {
        try {
            // Lấy token từ header
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
            
            if (!$authHeader) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'No authorization token provided'
                ], 401);
                return;
            }
            
            // Remove "Bearer " prefix if exists
            $token = str_replace('Bearer ', '', $authHeader);
            
            // Verify token
            $user = $this->authService->verifyToken($token);
            
            if (!$user) {
                $this->jsonResponse([
                    'success' => false,
                    'message' => 'Invalid or expired token'
                ], 401);
                return;
            }
            
            // Check if user logged in via SSO (có erp_user_id)
            $isSsoUser = !empty($user['erp_user_id']);
            
            $this->jsonResponse([
                'success' => true,
                'data' => [
                    'is_sso_user' => $isSsoUser,
                    'user' => [
                        'id' => $user['id'],
                        'email' => $user['email'],
                        'full_name' => $user['full_name'],
                        'role' => $user['role']
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Failed to check SSO status: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Logout SSO user - xóa token khỏi database
     * POST /api/auth/sso/logout
     */
    public function logout(): void
    {
        try {
            // Lấy token từ header
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
            
            if (!$authHeader) {
                $this->jsonResponse([
                    'success' => true,
                    'message' => 'Already logged out'
                ]);
                return;
            }
            
            $token = str_replace('Bearer ', '', $authHeader);
            $user = $this->authService->verifyToken($token);
            
            if ($user) {
                // Clear ERP token from database
                $db = \App\Core\Database::getInstance()->getConnection();
                $stmt = $db->prepare("UPDATE users SET erp_token = NULL WHERE id = :id");
                $stmt->execute(['id' => $user['id']]);
            }
            
            $this->jsonResponse([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);
            
        } catch (\Exception $e) {
            $this->jsonResponse([
                'success' => false,
                'message' => 'Logout failed: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Helper method to send JSON response
     */
    private function jsonResponse(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
}
