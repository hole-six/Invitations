<?php

namespace App\Controllers;

use App\Core\Request;
use App\Core\Response;
use App\Services\ErpIntegrationService;

class ErpController
{
    private $erpService;

    public function __construct()
    {
        $this->erpService = new ErpIntegrationService();
    }

    /**
     * Sync user từ ERP
     * POST /api/erp/sync-user
     * 
     * Body: {
     *   "erp_uuid": "xxx",
     *   "user_name": "xxx",
     *   "email": "xxx",
     *   "full_name": "xxx",
     *   "phone_number": "xxx",
     *   "avatar_url": "xxx",
     *   "department_id": 1,
     *   "access_token": "xxx"
     * }
     */
    public function syncUser(Request $request)
    {
        try {
            $data = $request->getBody();
            
            // Validate required fields
            $required = ['email', 'full_name'];
            foreach ($required as $field) {
                if (empty($data[$field])) {
                    return Response::json([
                        'success' => false,
                        'message' => "Missing required field: {$field}"
                    ], 400);
                }
            }

            // erp_uuid or uuid is required
            if (empty($data['erp_uuid']) && empty($data['uuid'])) {
                return Response::json([
                    'success' => false,
                    'message' => "Missing required field: erp_uuid or uuid"
                ], 400);
            }

            // Sync user
            $user = $this->erpService->syncUser($data);
            
            if (!$user) {
                return Response::json([
                    'success' => false,
                    'message' => 'Failed to sync user'
                ], 500);
            }

            // Generate JWT token
            $token = $this->erpService->generateToken($user);

            return Response::json([
                'success' => true,
                'message' => 'User synced successfully',
                'data' => [
                    'user' => $user,
                    'token' => $token
                ]
            ]);
        } catch (\Exception $e) {
            error_log("ERP Sync User Error: " . $e->getMessage());
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Auto-login từ ERP với token
     * GET /erp-login?token=xxx
     * 
     * Flow:
     * 1. Verify token với ERP API
     * 2. Sync user vào database
     * 3. Generate token cho hệ thống thiệp cưới
     * 4. Redirect đến frontend với token
     */
    public function autoLogin(Request $request)
    {
        try {
            $token = $request->get('token');
            
            if (empty($token)) {
                $this->redirectToLogin('missing_token', 'Token không được cung cấp');
                return;
            }

            // Verify token với ERP
            $userData = $this->erpService->verifyErpToken($token);
            
            if (!$userData) {
                $this->redirectToLogin('invalid_token', 'Token không hợp lệ hoặc đã hết hạn');
                return;
            }

            // Add access token to user data
            $userData['access_token'] = $token;

            // Sync user
            $user = $this->erpService->syncUser($userData);
            
            if (!$user) {
                $this->redirectToLogin('sync_failed', 'Không thể đồng bộ thông tin người dùng');
                return;
            }

            // Generate JWT token cho hệ thống thiệp cưới
            $appToken = $this->erpService->generateToken($user);

            // Redirect đến frontend với token
            $frontendUrl = getenv('FRONTEND_URL') ?: 'http://localhost:3000';
            $callbackUrl = "{$frontendUrl}/erp-callback?token=" . urlencode($appToken);
            
            header("Location: {$callbackUrl}");
            exit;
            
        } catch (\Exception $e) {
            error_log("ERP Auto-Login Error: " . $e->getMessage());
            $this->redirectToLogin('error', $e->getMessage());
        }
    }

    /**
     * Get user info by ERP UUID
     * GET /api/erp/user/{erp_uuid}
     */
    public function getUserByErpUuid(Request $request, $erpUuid)
    {
        try {
            // Verify API key
            $apiKey = $request->getHeader('X-API-Key');
            if ($apiKey !== getenv('ERP_API_KEY')) {
                return Response::json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            $user = $this->erpService->getUserByErpUuid($erpUuid);
            
            if (!$user) {
                return Response::json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            return Response::json([
                'success' => true,
                'data' => $user
            ]);
        } catch (\Exception $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Webhook để nhận thông báo từ ERP khi user bị xóa/vô hiệu hóa
     * POST /api/erp/webhook/user-status
     * 
     * Body: {
     *   "erp_uuid": "xxx",
     *   "action": "deactivate|activate|delete"
     * }
     */
    public function userStatusWebhook(Request $request)
    {
        try {
            // Verify API key
            $apiKey = $request->getHeader('X-API-Key');
            if ($apiKey !== getenv('ERP_API_KEY')) {
                return Response::json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 401);
            }

            $data = $request->getBody();
            $erpUuid = $data['erp_uuid'] ?? null;
            $action = $data['action'] ?? null;

            if (!$erpUuid || !$action) {
                return Response::json([
                    'success' => false,
                    'message' => 'Missing required fields'
                ], 400);
            }

            $user = $this->erpService->getUserByErpUuid($erpUuid);
            
            if (!$user) {
                return Response::json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // Update user status based on action
            $db = \App\Core\Database::getInstance()->getConnection();
            
            switch ($action) {
                case 'deactivate':
                    $stmt = $db->prepare("UPDATE users SET status = 'inactive' WHERE erp_uuid = ?");
                    $stmt->execute([$erpUuid]);
                    break;
                    
                case 'activate':
                    $stmt = $db->prepare("UPDATE users SET status = 'active' WHERE erp_uuid = ?");
                    $stmt->execute([$erpUuid]);
                    break;
                    
                case 'delete':
                    $stmt = $db->prepare("UPDATE users SET status = 'suspended' WHERE erp_uuid = ?");
                    $stmt->execute([$erpUuid]);
                    break;
                    
                default:
                    return Response::json([
                        'success' => false,
                        'message' => 'Invalid action'
                    ], 400);
            }

            return Response::json([
                'success' => true,
                'message' => 'User status updated successfully'
            ]);
        } catch (\Exception $e) {
            error_log("ERP Webhook Error: " . $e->getMessage());
            return Response::json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper: Redirect to login page with error
     */
    private function redirectToLogin($errorCode, $errorMessage)
    {
        $frontendUrl = getenv('FRONTEND_URL') ?: 'http://localhost:3000';
        $loginUrl = "{$frontendUrl}/login?error=" . urlencode($errorCode) . "&message=" . urlencode($errorMessage);
        
        header("Location: {$loginUrl}");
        exit;
    }
}
